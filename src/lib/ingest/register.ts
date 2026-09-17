/**
 * The register of licensed sponsors: workers. Published on GOV.UK as a CSV,
 * replaced most working days. We read it, compare it with what we hold, and
 * write one register event for every change.
 */
import { eq, notInArray, sql } from "drizzle-orm";
import { schema, type Db } from "@/db/client";
import { titleCase } from "@/lib/format";
import { normaliseName } from "@/lib/names";

const { sponsors, registerEvents, ingestionRuns } = schema;

export const REGISTER_PAGE = "https://www.gov.uk/api/content/government/publications/register-of-licensed-sponsors-workers";

export type RegisterEntry = {
  rawName: string;
  normalisedName: string;
  town: string | null;
  routes: string[];
  rating: string | null;
};

/** RFC 4180-style CSV. Handles quoted fields with commas and doubled quotes. Exported for tests. */
export function parseCsv(textIn: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const text = textIn.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

function ratingFrom(typeAndRating: string): { worker: boolean; rating: string | null } {
  const worker = /^Worker\b/i.test(typeAndRating.trim());
  const m = /\(([AB]) rating\)/i.exec(typeAndRating);
  if (m) return { worker, rating: m[1]!.toUpperCase() };
  if (/provisional/i.test(typeAndRating)) return { worker, rating: "Provisional" };
  return { worker, rating: null };
}

/**
 * Group the CSV rows by organisation. One organisation has one row per route;
 * a few names contain unquoted commas, so the last four columns are read from
 * the right. Exported for tests.
 */
export function entriesFromCsv(rows: string[][]): RegisterEntry[] {
  const byName = new Map<string, RegisterEntry & { workerRating: string | null; tempRating: string | null }>();
  for (const r of rows.slice(1)) {
    if (r.length < 5) continue;
    const route = (r[r.length - 1] ?? "").trim();
    const typeAndRating = (r[r.length - 2] ?? "").trim();
    const town = (r[r.length - 4] ?? "").trim();
    const rawName = r.slice(0, r.length - 4).join(", ").replace(/\s+/g, " ").trim();
    if (!rawName || !/rating|provisional/i.test(typeAndRating)) continue;
    if (!route || /rating\)/i.test(route)) continue;
    const key = normaliseName(rawName);
    if (!key) continue;
    const { worker, rating } = ratingFrom(typeAndRating);
    let e = byName.get(key);
    if (!e) {
      e = { rawName, normalisedName: key, town: town ? titleCase(town) : null, routes: [], rating: null, workerRating: null, tempRating: null };
      byName.set(key, e);
    }
    if (!e.routes.includes(route)) e.routes.push(route);
    if (worker) e.workerRating = e.workerRating ?? rating;
    else e.tempRating = e.tempRating ?? rating;
    if (!e.town && town) e.town = titleCase(town);
  }
  return [...byName.values()].map(({ workerRating, tempRating, ...e }) => ({ ...e, routes: e.routes.sort(), rating: workerRating ?? tempRating }));
}

/** The current CSV link and the date in its file name. */
export async function currentRegisterFile(): Promise<{ url: string; date: string | null }> {
  const res = await fetch(REGISTER_PAGE, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${REGISTER_PAGE}`);
  const j = (await res.json()) as { details: unknown; public_updated_at: string };
  const m = /https:\/\/assets\.publishing\.service\.gov\.uk\/[^"\\]+\.csv/.exec(JSON.stringify(j.details));
  if (!m) throw new Error("No CSV link on the register page");
  const url = m[0];
  const date = /(\d{4}-\d{2}-\d{2})\.csv$/.exec(url)?.[1] ?? j.public_updated_at.slice(0, 10);
  return { url, date };
}

export type RegisterSummary = {
  fileDate: string | null;
  entries: number;
  added: number;
  removed: number;
  changed: number;
  initial: boolean;
};

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export async function importRegister(d: Db, log: (s: string) => void = () => {}, source?: { csv: string; date: string | null }): Promise<RegisterSummary> {
  const [run] = await d.insert(ingestionRuns).values({ source: "register" }).returning({ id: ingestionRuns.id });
  const now = new Date();

  let csv: string;
  let fileDate: string | null;
  if (source) ({ csv, date: fileDate } = source);
  else {
    const file = await currentRegisterFile();
    fileDate = file.date;
    log(`register: downloading ${file.url}`);
    const res = await fetch(file.url);
    if (!res.ok) throw new Error(`${res.status} ${file.url}`);
    csv = await res.text();
  }
  const entries = entriesFromCsv(parseCsv(csv));
  log(`register: ${entries.length} organisations in the file dated ${fileDate ?? "unknown"}`);

  const [{ n: priorRuns }] = await d
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(ingestionRuns)
    .where(sql`${ingestionRuns.source} = 'register' and ${ingestionRuns.finishedAt} is not null`);
  const initial = priorRuns === 0;
  const firstSeen = initial && fileDate ? new Date(`${fileDate}T06:00:00Z`) : now;

  const existing = await d
    .select({ id: sponsors.id, rawName: sponsors.rawName, normalisedName: sponsors.normalisedName, town: sponsors.town, routes: sponsors.routes, rating: sponsors.rating, isActive: sponsors.isActive })
    .from(sponsors);
  const byKey = new Map(existing.map((s) => [s.normalisedName, s]));

  type Event = typeof registerEvents.$inferInsert;
  const events: Event[] = [];
  const toInsert: (typeof sponsors.$inferInsert)[] = [];
  let changed = 0;
  const seenIds = new Set<string>();

  for (const e of entries) {
    const cur = byKey.get(e.normalisedName);
    if (!cur) {
      toInsert.push({
        rawName: e.rawName,
        normalisedName: e.normalisedName,
        town: e.town,
        routes: e.routes,
        rating: e.rating,
        firstSeenAt: firstSeen,
        lastSeenAt: now,
        isActive: true,
        licenceSinceKnown: !initial,
      });
      continue;
    }
    seenIds.add(cur.id);
    const set: Partial<typeof sponsors.$inferInsert> = {};
    if (!cur.isActive) {
      set.isActive = true;
      set.firstSeenAt = now;
      set.licenceSinceKnown = true;
      events.push({ sponsorId: cur.id, eventType: "ADDED", oldValue: null, newValue: e.rating, detectedAt: now });
    }
    if (cur.rating !== e.rating) {
      set.rating = e.rating;
      if (cur.isActive) events.push({ sponsorId: cur.id, eventType: "RATING_CHANGED", oldValue: cur.rating, newValue: e.rating, detectedAt: now });
    }
    const oldRoutes = new Set(cur.routes);
    const newRoutes = new Set(e.routes);
    if (cur.isActive) {
      for (const r of e.routes) if (!oldRoutes.has(r)) events.push({ sponsorId: cur.id, eventType: "ROUTE_ADDED", oldValue: null, newValue: r, detectedAt: now });
      for (const r of cur.routes) if (!newRoutes.has(r)) events.push({ sponsorId: cur.id, eventType: "ROUTE_REMOVED", oldValue: r, newValue: null, detectedAt: now });
    }
    if (oldRoutes.size !== newRoutes.size || [...newRoutes].some((r) => !oldRoutes.has(r))) set.routes = e.routes;
    if (cur.rawName !== e.rawName) {
      set.rawName = e.rawName;
      if (cur.isActive) events.push({ sponsorId: cur.id, eventType: "NAME_CHANGED", oldValue: cur.rawName, newValue: e.rawName, detectedAt: now });
    }
    if ((cur.town ?? null) !== (e.town ?? null) && e.town) {
      set.town = e.town;
      if (cur.isActive && cur.town) events.push({ sponsorId: cur.id, eventType: "TOWN_CHANGED", oldValue: cur.town, newValue: e.town, detectedAt: now });
    }
    if (Object.keys(set).length) {
      changed++;
      await d.update(sponsors).set(set).where(eq(sponsors.id, cur.id));
    }
  }

  // Everyone in the file was seen now. Anyone active and not in the file has left the register.
  const missing = existing.filter((s) => s.isActive && !seenIds.has(s.id));
  const missingIds = missing.map((s) => s.id);
  if (existing.length) {
    await d
      .update(sponsors)
      .set({ lastSeenAt: now })
      .where(missingIds.length ? notInArray(sponsors.id, missingIds) : sql`true`);
  }
  for (const s of missing) {
    await d.update(sponsors).set({ isActive: false }).where(eq(sponsors.id, s.id));
    events.push({ sponsorId: s.id, eventType: "REMOVED", oldValue: s.rating, newValue: null, detectedAt: now });
  }

  for (const c of chunk(toInsert, 500)) await d.insert(sponsors).values(c);
  for (const c of chunk(events, 500)) await d.insert(registerEvents).values(c);

  await d.update(ingestionRuns).set({ finishedAt: new Date(), jobsSeen: entries.length, jobsNew: toInsert.length }).where(eq(ingestionRuns.id, run!.id));
  log(`register: ${toInsert.length} added, ${missing.length} removed, ${changed} changed${initial ? " (first snapshot: licence dates unknown)" : ""}`);
  return { fileDate, entries: entries.length, added: toInsert.length, removed: missing.length, changed, initial };
}
