/**
 * Reference data from GOV.UK: Appendix Skilled Occupations (codes and going
 * rates), the Immigration Salary List and the Temporary Shortage List.
 * Rows are versioned by effective date so old verdicts keep their figures.
 */
import { and, eq, isNull } from "drizzle-orm";
import { schema, type Db } from "@/db/client";
import { THRESHOLDS } from "@/lib/fixtures/reference";
import { unescapeHtml } from "./html";

const { occupations, thresholds } = schema;

const CONTENT = "https://www.gov.uk/api/content";
export const APPENDIX_URL = `${CONTENT}/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations`;
export const ISL_URL = `${CONTENT}/guidance/immigration-rules/immigration-rules-appendix-immigration-salary-list`;
export const TSL_URL = `${CONTENT}/government/publications/skilled-worker-visa-temporary-shortage-list/skilled-worker-visa-temporary-shortage-list`;

export type OccupationRow = {
  socCode: string;
  title: string;
  /** 6 for Tables 1 and 3; 3 for Tables 1a and 3a (RQF 3 to 5, eligible only via a shortage list). */
  rqfLevel: number;
  goingRateAnnual: number;
  isTsl: boolean;
  payScale: boolean;
  examples: string[];
};

function text(html: string): string {
  return unescapeHtml(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function cells(row: string): string[] {
  return [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((m) => text(m[1]!));
}

/**
 * Parse the appendix body. Table 1 and 3 are the eligible occupations; 1a and
 * 3a are RQF 3 to 5 codes that new applicants can only use through a
 * shortage list. Exported for tests.
 */
export function parseAppendix(body: string, shortageCodes: Set<string>): OccupationRow[] {
  const parts = body.split(/(<table[\s\S]*?<\/table>)/);
  let heading = "";
  const out = new Map<string, OccupationRow>();
  for (const part of parts) {
    if (!part.startsWith("<table")) {
      const hs = [...part.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)];
      if (hs.length) heading = text(hs[hs.length - 1]![1]!);
      continue;
    }
    const table = /^Table (1a?|3a?)\b/.exec(heading)?.[1];
    if (!table) continue;
    const payScale = table.startsWith("3");
    const rqfLevel = table.endsWith("a") ? 3 : 6;
    const rows = [...part.matchAll(/<tr[\s\S]*?<\/tr>/g)].map((m) => cells(m[0]));
    const header = rows[0] ?? [];
    const exIdx = header.findIndex((h) => /related job titles/i.test(h));
    const rateIdx = header.findIndex((h) => /going rate/i.test(h));
    for (const r of rows.slice(1)) {
      const m = /^(\d{4})\s+(.+)$/.exec(r[0] ?? "");
      if (!m) continue;
      const socCode = m[1]!;
      const title = m[2]!.replace(/\s*\((England|Scotland|Wales|Northern Ireland)\)\s*$/, "").replace(/\s*Note:.*$/, "").trim();
      const rate = rateIdx >= 0 ? /£([\d,]+)/.exec(r[rateIdx] ?? "")?.[1] : undefined;
      const examples = exIdx >= 0 ? (r[exIdx] ?? "").split("•").map((s) => s.trim()).filter(Boolean) : [];
      if (out.has(socCode)) continue; // national variants repeat the code; keep the first
      out.set(socCode, {
        socCode,
        title,
        rqfLevel,
        goingRateAnnual: payScale ? 0 : rate ? Number(rate.replace(/,/g, "")) : 0,
        isTsl: rqfLevel < 6 && shortageCodes.has(socCode),
        payScale,
        examples,
      });
    }
  }
  return [...out.values()];
}

/** Four-digit codes at the start of a table cell or followed by a title. Exported for tests. */
export function parseShortageCodes(body: string): Set<string> {
  const codes = new Set<string>();
  for (const m of text(body).matchAll(/\b([1-9]\d{3})\b(?=\s+[A-Z][a-z])/g)) codes.add(m[1]!);
  for (const row of body.matchAll(/<tr[\s\S]*?<\/tr>/g)) {
    const c = cells(row[0]);
    if (/^\d{4}$/.test(c[0] ?? "")) codes.add(c[0]!);
  }
  return codes;
}

async function contentJson(url: string): Promise<{ body: string; updatedAt: string }> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const j = (await res.json()) as { details: { body: string }; public_updated_at: string };
  return { body: j.details.body, updatedAt: j.public_updated_at };
}

export type OccupationsSummary = { effectiveFrom: string; total: number; inserted: number; closed: number; unchanged: number; thresholdsInserted: number };

/** Fetch the three GOV.UK pages and bring the occupations table up to date. */
export async function importOccupations(d: Db, log: (s: string) => void = () => {}): Promise<OccupationsSummary> {
  const [appendix, isl, tsl] = await Promise.all([contentJson(APPENDIX_URL), contentJson(ISL_URL), contentJson(TSL_URL)]);
  const shortage = new Set([...parseShortageCodes(isl.body), ...parseShortageCodes(tsl.body)]);
  const rows = parseAppendix(appendix.body, shortage);
  const effectiveFrom = appendix.updatedAt.slice(0, 10);
  log(`occupations: ${rows.length} codes in the appendix (updated ${effectiveFrom}); ${shortage.size} codes on the shortage lists`);

  const current = await d.select().from(occupations).where(isNull(occupations.effectiveTo));
  const byCode = new Map(current.map((c) => [c.socCode, c]));
  const dayBefore = new Date(`${effectiveFrom}T00:00:00Z`);
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
  const closeDate = dayBefore.toISOString().slice(0, 10);

  let inserted = 0;
  let closed = 0;
  let unchanged = 0;
  for (const r of rows) {
    const c = byCode.get(r.socCode);
    const same = c && c.title === r.title && c.rqfLevel === r.rqfLevel && c.goingRateAnnual === r.goingRateAnnual && c.isTsl === r.isTsl && c.payScale === r.payScale && JSON.stringify(c.exampleTitles) === JSON.stringify(r.examples);
    if (same) {
      unchanged++;
      continue;
    }
    if (c) {
      if (c.effectiveFrom >= effectiveFrom) {
        // Same-day correction: replace in place rather than opening a zero-length version.
        await d.update(occupations).set({ title: r.title, rqfLevel: r.rqfLevel, goingRateAnnual: r.goingRateAnnual, isTsl: r.isTsl, payScale: r.payScale, exampleTitles: r.examples }).where(eq(occupations.id, c.id));
        inserted++;
        continue;
      }
      await d.update(occupations).set({ effectiveTo: closeDate }).where(eq(occupations.id, c.id));
      closed++;
    }
    await d.insert(occupations).values({ socCode: r.socCode, title: r.title, rqfLevel: r.rqfLevel, goingRateAnnual: r.goingRateAnnual, isTsl: r.isTsl, payScale: r.payScale, exampleTitles: r.examples, effectiveFrom, effectiveTo: null });
    inserted++;
  }

  // Thresholds are published in the rules themselves; keep the reference rows present.
  let thresholdsInserted = 0;
  for (const t of THRESHOLDS) {
    const [exists] = await d.select({ id: thresholds.id }).from(thresholds).where(and(eq(thresholds.code, t.code), eq(thresholds.effectiveFrom, t.effectiveFrom))).limit(1);
    if (exists) continue;
    await d.insert(thresholds).values({ code: t.code, amount: String(t.amount), effectiveFrom: t.effectiveFrom, effectiveTo: t.effectiveTo });
    thresholdsInserted++;
  }
  log(`occupations: ${inserted} written, ${closed} superseded, ${unchanged} unchanged; ${thresholdsInserted} threshold rows added`);
  return { effectiveFrom, total: rows.length, inserted, closed, unchanged, thresholdsInserted };
}
