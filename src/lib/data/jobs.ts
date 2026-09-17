import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { Band } from "@/lib/eligibility/scoring";
import type { SalaryPeriod, Verdict } from "@/lib/eligibility/types";

const { jobs, jobAssessments, sponsors, sponsorActivity, occupations, thresholds, registerEvents } = schema;

/** Verdicts where every rule passed. */
export const MEETS_RULES: Verdict[] = ["CONFIRMED", "LIKELY"];
export const ALL_VERDICTS: Verdict[] = [
  "CONFIRMED",
  "LIKELY",
  "SALARY_UNKNOWN",
  "BELOW_THRESHOLD",
  "OCCUPATION_INELIGIBLE",
  "LICENCE_RESTRICTED",
  "NO_LICENCE",
  "REJECTED",
];
export const ROUTES = ["Skilled Worker", "Global Business Mobility: Senior or Specialist Worker"] as const;
export const POSTED_WINDOWS = { "1": "Last 24 hours", "3": "Last 3 days", "7": "Last 7 days", "30": "Last 30 days" } as const;
export const PAGE_SIZE = 25;

export type JobFilters = {
  q?: string;
  verdicts?: Verdict[];
  soc?: string[];
  salaryMin?: number;
  city?: string;
  /** Exact location strings, for town pages that merge spellings. */
  locations?: string[];
  route?: string;
  postedDays?: number;
  rulesOnly: boolean;
  page: number;
};

export type JobListItem = {
  id: string;
  slug: string;
  title: string;
  employer: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod | null;
  socCode: string | null;
  postedAt: Date;
  verdict: Verdict;
  band: Band | null;
};

export type JobListResult = {
  items: JobListItem[];
  /** Rows matching the filters, ignoring the rules-only toggle. */
  totalAll: number;
  /** Rows matching the filters that also meet the rules. */
  totalMeeting: number;
  /** Rows returned for the current mode (equals items.length on the last page). */
  total: number;
  page: number;
  pageCount: number;
};

/** Latest assessment per job. */
function latestAssessment() {
  return db()
    .selectDistinctOn([jobAssessments.jobId], {
      jobId: jobAssessments.jobId,
      verdict: jobAssessments.verdict,
      sponsorId: jobAssessments.sponsorId,
      socCode: jobAssessments.socCode,
      salaryCheck: jobAssessments.salaryCheck,
      salaryAssessedAnnual: jobAssessments.salaryAssessedAnnual,
      salaryRequiredAnnual: jobAssessments.salaryRequiredAnnual,
      positiveSignalSnippet: jobAssessments.positiveSignalSnippet,
      negativeSignalMatched: jobAssessments.negativeSignalMatched,
      reason: jobAssessments.reason,
      rulesVersion: jobAssessments.rulesVersion,
      assessedAt: jobAssessments.assessedAt,
    })
    .from(jobAssessments)
    .orderBy(jobAssessments.jobId, desc(jobAssessments.assessedAt))
    .as("la");
}

/** Latest activity row per sponsor. */
function latestActivity() {
  return db()
    .selectDistinctOn([sponsorActivity.sponsorId], {
      sponsorId: sponsorActivity.sponsorId,
      band: sponsorActivity.band,
      score: sponsorActivity.score,
      jobsPosted90d: sponsorActivity.jobsPosted90d,
      eligibleRoleCount: sponsorActivity.eligibleRoleCount,
      refusalRatio: sponsorActivity.refusalRatio,
      licenceTenureDays: sponsorActivity.licenceTenureDays,
      scoringVersion: sponsorActivity.scoringVersion,
      computedAt: sponsorActivity.computedAt,
    })
    .from(sponsorActivity)
    .orderBy(sponsorActivity.sponsorId, desc(sponsorActivity.computedAt))
    .as("act");
}

function buildWhere(f: JobFilters, la: ReturnType<typeof latestAssessment>): SQL[] {
  const conds: SQL[] = [eq(jobs.isLive, true)];
  if (f.q) {
    const like = `%${f.q.trim()}%`;
    conds.push(or(ilike(jobs.title, like), ilike(jobs.employerRawName, like))!);
  }
  if (f.verdicts?.length) conds.push(inArray(la.verdict, f.verdicts));
  if (f.soc?.length) conds.push(inArray(la.socCode, f.soc));
  if (f.salaryMin) conds.push(gte(la.salaryAssessedAnnual, f.salaryMin));
  if (f.city) conds.push(ilike(jobs.location, `%${f.city.trim()}%`));
  if (f.locations?.length) conds.push(inArray(jobs.location, f.locations));
  if (f.route) conds.push(sql`${sponsors.routes} @> ARRAY[${f.route}]::text[]`);
  if (f.postedDays) conds.push(gte(jobs.postedAt, sql`now() - make_interval(days => ${f.postedDays})`));
  return conds;
}

export async function listJobs(f: JobFilters): Promise<JobListResult> {
  const d = db();
  const la = latestAssessment();
  const act = latestActivity();
  const base = buildWhere(f, la);
  const meets = inArray(la.verdict, MEETS_RULES);

  const [counts] = await d
    .select({
      all: count(),
      meeting: sql<number>`count(*) filter (where ${meets})`.mapWith(Number),
    })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .leftJoin(sponsors, eq(sponsors.id, la.sponsorId))
    .where(and(...base));

  const totalAll = counts?.all ?? 0;
  const totalMeeting = counts?.meeting ?? 0;
  const total = f.rulesOnly ? totalMeeting : totalAll;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page), pageCount);

  const where = f.rulesOnly ? and(...base, meets) : and(...base);
  const rows = await d
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      employer: jobs.employerRawName,
      location: jobs.location,
      salaryMin: jobs.salaryMin,
      salaryMax: jobs.salaryMax,
      salaryPeriod: jobs.salaryPeriod,
      socCode: la.socCode,
      postedAt: jobs.postedAt,
      verdict: la.verdict,
      band: act.band,
    })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .leftJoin(sponsors, eq(sponsors.id, la.sponsorId))
    .leftJoin(act, eq(act.sponsorId, la.sponsorId))
    .where(where)
    .orderBy(
      // CONFIRMED first, then LIKELY, then the rest, then recency
      sql`case ${la.verdict} when 'CONFIRMED' then 0 when 'LIKELY' then 1 else 2 end`,
      desc(jobs.postedAt),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return { items: rows, totalAll, totalMeeting, total, page, pageCount };
}

export async function recentJobs(limit = 6): Promise<JobListItem[]> {
  const r = await listJobs({ rulesOnly: false, page: 1 });
  return r.items.slice(0, limit);
}

export type Facets = {
  occupations: { socCode: string; title: string; isTsl: boolean; rqfLevel: number }[];
  cities: string[];
};

export async function jobFacets(): Promise<Facets> {
  const d = db();
  const occ = await d
    .select({ socCode: occupations.socCode, title: occupations.title, isTsl: occupations.isTsl, rqfLevel: occupations.rqfLevel })
    .from(occupations)
    .where(isNull(occupations.effectiveTo))
    .orderBy(asc(occupations.title));
  const cityRows = await d
    .selectDistinct({ location: jobs.location })
    .from(jobs)
    .where(and(eq(jobs.isLive, true), eq(jobs.isRemote, false)))
    .orderBy(asc(jobs.location));
  return { occupations: occ, cities: cityRows.map((r) => r.location) };
}

export type JobDetail = {
  job: typeof jobs.$inferSelect;
  assessment: {
    verdict: Verdict;
    sponsorId: string | null;
    socCode: string | null;
    salaryCheck: "PASS" | "FAIL" | "UNKNOWN";
    salaryAssessedAnnual: number | null;
    salaryRequiredAnnual: number | null;
    positiveSignalSnippet: string | null;
    negativeSignalMatched: string | null;
    reason: string | null;
    rulesVersion: string;
    assessedAt: Date;
  };
  occupation: { socCode: string; title: string; rqfLevel: number; goingRateAnnual: number; isTsl: boolean; payScale: boolean } | null;
  generalThreshold: number | null;
  sponsor: (typeof sponsors.$inferSelect) | null;
  activity: { band: Band; score: number; jobsPosted90d: number; eligibleRoleCount: number; licenceTenureDays: number; scoringVersion: string; computedAt: Date } | null;
  lastRegisterEvent: { eventType: string; oldValue: string | null; newValue: string | null; detectedAt: Date } | null;
};

export async function getJobBySlug(slug: string): Promise<JobDetail | null> {
  const d = db();
  const la = latestAssessment();
  const [row] = await d
    .select({
      job: jobs,
      assessment: {
        verdict: la.verdict,
        sponsorId: la.sponsorId,
        socCode: la.socCode,
        salaryCheck: la.salaryCheck,
        salaryAssessedAnnual: la.salaryAssessedAnnual,
        salaryRequiredAnnual: la.salaryRequiredAnnual,
        positiveSignalSnippet: la.positiveSignalSnippet,
        negativeSignalMatched: la.negativeSignalMatched,
        reason: la.reason,
        rulesVersion: la.rulesVersion,
        assessedAt: la.assessedAt,
      },
    })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .where(eq(jobs.slug, slug))
    .limit(1);
  if (!row) return null;

  const rulesDate = row.assessment.rulesVersion;
  const [occupation, threshold, sponsor] = await Promise.all([
    row.assessment.socCode
      ? d
          .select({ socCode: occupations.socCode, title: occupations.title, rqfLevel: occupations.rqfLevel, goingRateAnnual: occupations.goingRateAnnual, isTsl: occupations.isTsl, payScale: occupations.payScale })
          .from(occupations)
          .where(and(eq(occupations.socCode, row.assessment.socCode), sql`${occupations.effectiveFrom} <= ${rulesDate}`, or(isNull(occupations.effectiveTo), sql`${occupations.effectiveTo} >= ${rulesDate}`)))
          .orderBy(desc(occupations.effectiveFrom))
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
    d
      .select({ amount: thresholds.amount })
      .from(thresholds)
      .where(and(eq(thresholds.code, "GENERAL"), sql`${thresholds.effectiveFrom} <= ${rulesDate}`, or(isNull(thresholds.effectiveTo), sql`${thresholds.effectiveTo} >= ${rulesDate}`)))
      .orderBy(desc(thresholds.effectiveFrom))
      .limit(1)
      .then((r) => (r[0] ? Number(r[0].amount) : null)),
    row.assessment.sponsorId
      ? d.select().from(sponsors).where(eq(sponsors.id, row.assessment.sponsorId)).limit(1).then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  const [activity, lastRegisterEvent] = sponsor
    ? await Promise.all([
        d
          .select({ band: sponsorActivity.band, score: sponsorActivity.score, jobsPosted90d: sponsorActivity.jobsPosted90d, eligibleRoleCount: sponsorActivity.eligibleRoleCount, licenceTenureDays: sponsorActivity.licenceTenureDays, scoringVersion: sponsorActivity.scoringVersion, computedAt: sponsorActivity.computedAt })
          .from(sponsorActivity)
          .where(eq(sponsorActivity.sponsorId, sponsor.id))
          .orderBy(desc(sponsorActivity.computedAt))
          .limit(1)
          .then((r) => r[0] ?? null),
        d
          .select({ eventType: registerEvents.eventType, oldValue: registerEvents.oldValue, newValue: registerEvents.newValue, detectedAt: registerEvents.detectedAt })
          .from(registerEvents)
          .where(eq(registerEvents.sponsorId, sponsor.id))
          .orderBy(desc(registerEvents.detectedAt))
          .limit(1)
          .then((r) => r[0] ?? null),
      ])
    : [null, null];

  return { job: row.job, assessment: row.assessment, occupation, generalThreshold: threshold, sponsor, activity, lastRegisterEvent };
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): JobFilters {
  const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const verdicts = arr(sp.verdict).filter((v): v is Verdict => (ALL_VERDICTS as string[]).includes(v));
  const salary = Number(str(sp.salary_min));
  const posted = Number(str(sp.posted));
  const page = Number(str(sp.page));
  // Rules-only is ON unless the form was submitted with the toggle cleared.
  const submitted = sp.all !== undefined;
  const rulesOnly = submitted ? sp.meets === "1" : true;
  return {
    q: str(sp.q),
    verdicts: verdicts.length ? verdicts : undefined,
    soc: arr(sp.soc).length ? arr(sp.soc) : undefined,
    salaryMin: Number.isFinite(salary) && salary > 0 ? salary : undefined,
    city: str(sp.city),
    route: (ROUTES as readonly string[]).includes(str(sp.route) ?? "") ? str(sp.route) : undefined,
    postedDays: [1, 3, 7, 30].includes(posted) ? posted : undefined,
    rulesOnly,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}
