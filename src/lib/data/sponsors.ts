import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { Band } from "@/lib/eligibility/scoring";
import type { Verdict } from "@/lib/eligibility/types";
import { MEETS_RULES, type JobListItem } from "./jobs";

const { jobs, jobAssessments, sponsors, sponsorActivity, registerEvents } = schema;

export type SponsorListItem = {
  id: string;
  name: string;
  town: string | null;
  routes: string[];
  rating: string | null;
  isActive: boolean;
  band: Band | null;
  liveRoles: number;
  meetingRoles: number;
  firstSeenAt: Date;
};

export type SponsorFilters = { q?: string; band?: Band; page: number };
export const SPONSOR_PAGE_SIZE = 40;

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

function latestAssessment() {
  return db()
    .selectDistinctOn([jobAssessments.jobId], {
      jobId: jobAssessments.jobId,
      verdict: jobAssessments.verdict,
      sponsorId: jobAssessments.sponsorId,
      socCode: jobAssessments.socCode,
    })
    .from(jobAssessments)
    .orderBy(jobAssessments.jobId, desc(jobAssessments.assessedAt))
    .as("la");
}

export async function listSponsors(f: SponsorFilters) {
  const d = db();
  const act = latestActivity();
  const la = latestAssessment();
  const meets = inArray(la.verdict, MEETS_RULES);

  const roleCounts = d
    .select({
      sponsorId: la.sponsorId,
      live: count().as("live"),
      meeting: sql<number>`count(*) filter (where ${meets})`.mapWith(Number).as("meeting"),
    })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .where(eq(jobs.isLive, true))
    .groupBy(la.sponsorId)
    .as("rc");

  const conds = [];
  if (f.q) conds.push(or(ilike(sponsors.rawName, `%${f.q.trim()}%`), ilike(sponsors.town, `%${f.q.trim()}%`))!);
  if (f.band) conds.push(eq(act.band, f.band));
  const where = conds.length ? and(...conds) : undefined;

  const [c] = await d.select({ n: count() }).from(sponsors).leftJoin(act, eq(act.sponsorId, sponsors.id)).where(where);
  const total = c?.n ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / SPONSOR_PAGE_SIZE));
  const page = Math.min(Math.max(1, f.page), pageCount);

  const rows = await d
    .select({
      id: sponsors.id,
      name: sponsors.rawName,
      town: sponsors.town,
      routes: sponsors.routes,
      rating: sponsors.rating,
      isActive: sponsors.isActive,
      band: act.band,
      liveRoles: sql<number>`coalesce(${roleCounts.live}, 0)`.mapWith(Number),
      meetingRoles: sql<number>`coalesce(${roleCounts.meeting}, 0)`.mapWith(Number),
      firstSeenAt: sponsors.firstSeenAt,
    })
    .from(sponsors)
    .leftJoin(act, eq(act.sponsorId, sponsors.id))
    .leftJoin(roleCounts, eq(roleCounts.sponsorId, sponsors.id))
    .where(where)
    .orderBy(desc(sql`coalesce(${roleCounts.meeting}, 0)`), asc(sponsors.rawName))
    .limit(SPONSOR_PAGE_SIZE)
    .offset((page - 1) * SPONSOR_PAGE_SIZE);

  return { items: rows as SponsorListItem[], total, page, pageCount };
}

export type SponsorDetail = {
  sponsor: typeof sponsors.$inferSelect;
  activity: {
    band: Band;
    score: number;
    jobsPosted90d: number;
    eligibleRoleCount: number;
    refusalRatio: number;
    licenceTenureDays: number;
    scoringVersion: string;
    computedAt: Date;
  } | null;
  events: { eventType: string; oldValue: string | null; newValue: string | null; detectedAt: Date }[];
  roles: JobListItem[];
  verdictCounts: { verdict: Verdict; n: number }[];
};

export async function getSponsor(id: string): Promise<SponsorDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const d = db();
  const [sponsor] = await d.select().from(sponsors).where(eq(sponsors.id, id)).limit(1);
  if (!sponsor) return null;

  const la = latestAssessment();
  const [activityRow, events, roles, verdictCounts] = await Promise.all([
    d
      .select()
      .from(sponsorActivity)
      .where(eq(sponsorActivity.sponsorId, id))
      .orderBy(desc(sponsorActivity.computedAt))
      .limit(1)
      .then((r) => r[0] ?? null),
    d
      .select({ eventType: registerEvents.eventType, oldValue: registerEvents.oldValue, newValue: registerEvents.newValue, detectedAt: registerEvents.detectedAt })
      .from(registerEvents)
      .where(eq(registerEvents.sponsorId, id))
      .orderBy(desc(registerEvents.detectedAt)),
    d
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
        band: sql<Band | null>`null`,
      })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(and(eq(jobs.isLive, true), eq(la.sponsorId, id)))
      .orderBy(sql`case ${la.verdict} when 'CONFIRMED' then 0 when 'LIKELY' then 1 else 2 end`, desc(jobs.postedAt))
      .limit(50),
    d
      .select({ verdict: la.verdict, n: count() })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(and(eq(jobs.isLive, true), eq(la.sponsorId, id)))
      .groupBy(la.verdict),
  ]);

  const activity = activityRow
    ? {
        band: activityRow.band,
        score: activityRow.score,
        jobsPosted90d: activityRow.jobsPosted90d,
        eligibleRoleCount: activityRow.eligibleRoleCount,
        refusalRatio: Number(activityRow.refusalRatio),
        licenceTenureDays: activityRow.licenceTenureDays,
        scoringVersion: activityRow.scoringVersion,
        computedAt: activityRow.computedAt,
      }
    : null;

  // Band is left off the rows: it belongs to the sponsor, and this page already shows it once.
  return {
    sponsor,
    activity,
    events,
    roles: roles.map((r) => ({ ...r, band: null })),
    verdictCounts: verdictCounts as { verdict: Verdict; n: number }[],
  };
}

export type RegisterChange = {
  sponsorId: string;
  sponsorName: string;
  town: string | null;
  eventType: string;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: Date;
};

export async function recentRegisterChanges(limit = 6): Promise<RegisterChange[]> {
  return db()
    .select({
      sponsorId: registerEvents.sponsorId,
      sponsorName: sponsors.rawName,
      town: sponsors.town,
      eventType: registerEvents.eventType,
      oldValue: registerEvents.oldValue,
      newValue: registerEvents.newValue,
      detectedAt: registerEvents.detectedAt,
    })
    .from(registerEvents)
    .innerJoin(sponsors, eq(sponsors.id, registerEvents.sponsorId))
    .orderBy(desc(registerEvents.detectedAt))
    .limit(limit);
}

export type SiteStats = {
  liveJobs: number;
  meetingJobs: number;
  sponsorsOnRegister: number;
  sponsorsWithRoles: number;
  registerCheckedAt: Date | null;
  rulesVersion: string | null;
  generalThreshold: number | null;
};

export async function siteStats(): Promise<SiteStats> {
  const d = db();
  const la = latestAssessment();
  const [[j], [s], [sw], [r], [t]] = await Promise.all([
    d
      .select({
        live: count(),
        meeting: sql<number>`count(*) filter (where ${inArray(la.verdict, MEETS_RULES)})`.mapWith(Number),
      })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(eq(jobs.isLive, true)),
    d.select({ n: count(), last: sql<Date | null>`max(${sponsors.lastSeenAt})` }).from(sponsors).where(eq(sponsors.isActive, true)),
    d
      .select({ n: sql<number>`count(distinct ${la.sponsorId})`.mapWith(Number) })
      .from(jobs)
      .innerJoin(la, eq(la.jobId, jobs.id))
      .where(and(eq(jobs.isLive, true), inArray(la.verdict, MEETS_RULES))),
    d.select({ v: sql<string | null>`max(${jobAssessments.rulesVersion})` }).from(jobAssessments),
    d
      .select({ amount: schema.thresholds.amount })
      .from(schema.thresholds)
      .where(and(eq(schema.thresholds.code, "GENERAL"), sql`${schema.thresholds.effectiveTo} is null`))
      .limit(1),
  ]);
  return {
    liveJobs: j?.live ?? 0,
    meetingJobs: j?.meeting ?? 0,
    sponsorsOnRegister: s?.n ?? 0,
    sponsorsWithRoles: sw?.n ?? 0,
    registerCheckedAt: s?.last ? new Date(s.last) : null,
    rulesVersion: r?.v ?? null,
    generalThreshold: t?.amount ? Number(t.amount) : null,
  };
}
