import { and, asc, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { slugify } from "@/lib/names";
import { MEETS_RULES } from "./jobs";

const { jobs, jobAssessments, occupations, thresholds, sponsors } = schema;

function latest() {
  return db()
    .selectDistinctOn([jobAssessments.jobId], { jobId: jobAssessments.jobId, verdict: jobAssessments.verdict, sponsorId: jobAssessments.sponsorId, socCode: jobAssessments.socCode })
    .from(jobAssessments)
    .orderBy(jobAssessments.jobId, desc(jobAssessments.assessedAt))
    .as("la");
}

async function generalThreshold(): Promise<number> {
  const [t] = await db()
    .select({ amount: thresholds.amount })
    .from(thresholds)
    .where(and(eq(thresholds.code, "GENERAL"), isNull(thresholds.effectiveTo)))
    .orderBy(desc(thresholds.effectiveFrom))
    .limit(1);
  return t ? Number(t.amount) : 0;
}

/* ---------- occupation codes ---------- */

export type OccupationSummary = {
  socCode: string;
  title: string;
  rqfLevel: number;
  goingRateAnnual: number;
  isTsl: boolean;
  payScale: boolean;
  exampleTitles: string[];
  /** Higher of the general threshold and the going rate. Null for pay-scale codes. */
  required: number | null;
  eligible: boolean;
  live: number;
  meeting: number;
};

export async function occupationIndex(): Promise<{ items: OccupationSummary[]; general: number }> {
  const d = db();
  const la = latest();
  const general = await generalThreshold();
  const [occ, counts] = await Promise.all([
    d.select().from(occupations).where(isNull(occupations.effectiveTo)).orderBy(asc(occupations.socCode)),
    d
      .select({ socCode: la.socCode, live: count(), meeting: sql<number>`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`.mapWith(Number) })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(eq(jobs.isLive, true))
      .groupBy(la.socCode),
  ]);
  const byCode = new Map(counts.map((c) => [c.socCode, c]));
  const items = occ.map((o) => {
    const c = byCode.get(o.socCode);
    const eligible = o.rqfLevel >= 6 || o.isTsl;
    return {
      socCode: o.socCode,
      title: o.title,
      rqfLevel: o.rqfLevel,
      goingRateAnnual: o.goingRateAnnual,
      isTsl: o.isTsl,
      payScale: o.payScale,
      exampleTitles: o.exampleTitles,
      required: o.payScale ? null : Math.max(general, o.goingRateAnnual),
      eligible,
      live: c?.live ?? 0,
      meeting: c?.meeting ?? 0,
    };
  });
  items.sort((a, b) => b.live - a.live || a.socCode.localeCompare(b.socCode));
  return { items, general };
}

export type OccupationDetail = OccupationSummary & {
  general: number;
  sponsors: { id: string; rawName: string; live: number; meeting: number }[];
  verdicts: { verdict: string; n: number }[];
};

export async function occupationDetail(socCode: string): Promise<OccupationDetail | null> {
  if (!/^\d{4}$/.test(socCode)) return null;
  const { items, general } = await occupationIndex();
  const item = items.find((i) => i.socCode === socCode);
  if (!item) return null;
  const d = db();
  const la = latest();
  const [sponsorRows, verdicts] = await Promise.all([
    d
      .select({ id: sponsors.id, rawName: sponsors.rawName, live: count(), meeting: sql<number>`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`.mapWith(Number) })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .innerJoin(sponsors, eq(sponsors.id, la.sponsorId))
      .where(and(eq(jobs.isLive, true), eq(la.socCode, socCode)))
      .groupBy(sponsors.id, sponsors.rawName)
      .orderBy(desc(sql`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`), desc(count()), asc(sponsors.rawName))
      .limit(12),
    d
      .select({ verdict: la.verdict, n: count() })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(and(eq(jobs.isLive, true), eq(la.socCode, socCode)))
      .groupBy(la.verdict),
  ]);
  return { ...item, general, sponsors: sponsorRows, verdicts };
}

/* ---------- cities ---------- */

export type CitySummary = { city: string; slug: string; /** Every spelling that maps to this slug. */ names: string[]; live: number; meeting: number; sponsorsInTown: number };

export function citySlug(city: string) {
  return slugify(city);
}

export async function cityIndex(): Promise<CitySummary[]> {
  const d = db();
  const la = latest();
  const rows = await d
    .select({ city: jobs.location, live: count(), meeting: sql<number>`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`.mapWith(Number) })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .where(and(eq(jobs.isLive, true), eq(jobs.isRemote, false)))
    .groupBy(jobs.location)
    .orderBy(desc(count()), asc(jobs.location));
  const towns = rows.map((r) => r.city.toLowerCase());
  const townCounts = towns.length
    ? await d
        .select({ town: sql<string>`lower(${sponsors.town})`, n: count() })
        .from(sponsors)
        .where(and(eq(sponsors.isActive, true), inArray(sql`lower(${sponsors.town})`, towns)))
        .groupBy(sql`lower(${sponsors.town})`)
    : [];
  const byTown = new Map(townCounts.map((t) => [t.town, t.n]));
  // "Stoke-on-Trent" and "Stoke on Trent" share a slug; merge them under the first spelling seen.
  const merged = new Map<string, CitySummary>();
  for (const r of rows) {
    const slug = citySlug(r.city);
    const cur = merged.get(slug);
    const sponsorsInTown = byTown.get(r.city.toLowerCase()) ?? 0;
    if (cur) {
      cur.names.push(r.city);
      cur.live += r.live;
      cur.meeting += r.meeting;
      cur.sponsorsInTown = Math.max(cur.sponsorsInTown, sponsorsInTown);
    } else merged.set(slug, { city: r.city, slug, names: [r.city], live: r.live, meeting: r.meeting, sponsorsInTown });
  }
  return [...merged.values()].sort((a, b) => b.live - a.live || a.city.localeCompare(b.city));
}

export async function cityDetail(slug: string): Promise<(CitySummary & { verdicts: { verdict: string; n: number }[]; topSponsors: { id: string; rawName: string; live: number; meeting: number }[] }) | null> {
  const all = await cityIndex();
  const city = all.find((c) => c.slug === slug);
  if (!city) return null;
  const d = db();
  const la = latest();
  const [verdicts, topSponsors] = await Promise.all([
    d
      .select({ verdict: la.verdict, n: count() })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(and(eq(jobs.isLive, true), inArray(jobs.location, city.names)))
      .groupBy(la.verdict),
    d
      .select({ id: sponsors.id, rawName: sponsors.rawName, live: count(), meeting: sql<number>`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`.mapWith(Number) })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .innerJoin(sponsors, eq(sponsors.id, la.sponsorId))
      .where(and(eq(jobs.isLive, true), inArray(jobs.location, city.names)))
      .groupBy(sponsors.id, sponsors.rawName)
      .orderBy(desc(sql`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`), desc(count()))
      .limit(10),
  ]);
  return { ...city, verdicts, topSponsors };
}

/* ---------- visa routes on the register ---------- */

export type RouteSummary = { route: string; slug: string; sponsors: number; live: number; meeting: number };

export function routeSlug(route: string) {
  return slugify(route);
}

export async function routeIndex(): Promise<RouteSummary[]> {
  const d = db();
  const la = latest();
  const sponsorCounts = await d.execute<{ route: string; n: number }>(sql`
    select r.route as route, count(*)::int as n
    from ${sponsors}, unnest(${sponsors.routes}) as r(route)
    where ${sponsors.isActive} = true
    group by r.route
    order by n desc
  `);
  const jobCounts = await d.execute<{ route: string; live: number; meeting: number }>(sql`
    select r.route as route,
           count(*)::int as live,
           (count(*) filter (where la.verdict in ('CONFIRMED', 'LIKELY')))::int as meeting
    from ${jobs}
    join (
      select distinct on (job_id) job_id, verdict, sponsor_id
      from ${jobAssessments}
      order by job_id, assessed_at desc
    ) la on la.job_id = ${jobs.id}
    join ${sponsors} s on s.id = la.sponsor_id, unnest(s.routes) as r(route)
    where ${jobs.isLive} = true
    group by r.route
  `);
  void la;
  const byRoute = new Map(jobCounts.map((j) => [j.route, j]));
  return sponsorCounts.map((s) => ({ route: s.route, slug: routeSlug(s.route), sponsors: Number(s.n), live: byRoute.get(s.route)?.live ?? 0, meeting: byRoute.get(s.route)?.meeting ?? 0 }));
}
