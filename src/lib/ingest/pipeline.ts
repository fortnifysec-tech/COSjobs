/**
 * Read adverts from a source, run each through the rules engine, and store
 * the job with its assessment. Then refresh sponsor activity for every
 * sponsor touched.
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";
import { schema, type Db } from "@/db/client";
import { decide, extractSignals } from "@/lib/eligibility";
import { scoreSponsor, SCORING_VERSION } from "@/lib/eligibility/scoring";
import type { OccupationRule, RulesOutcome } from "@/lib/eligibility/types";
import { slugify } from "@/lib/names";
import { matchSponsor, type MatchedSponsor } from "./match";
import { matchOccupation } from "./occupation";
import type { FetchOptions, JobSource, RawJob } from "./types";

const { jobs, jobAssessments, occupations, thresholds, sponsors, sponsorActivity, ingestionRuns } = schema;

const MEETS = ["CONFIRMED", "LIKELY"] as const;
const STALE_DAYS = 14;

type Rules = {
  occByCode: Map<string, OccupationRule>;
  general: number;
  hourlyMin: number;
  version: string;
};

async function loadRules(d: Db): Promise<Rules> {
  const occ = await d.select().from(occupations).where(isNull(occupations.effectiveTo));
  const th = await d.select().from(thresholds).where(isNull(thresholds.effectiveTo));
  const general = th.find((t) => t.code === "GENERAL");
  const hourly = th.find((t) => t.code === "HOURLY_MIN");
  if (!general || !hourly) throw new Error("Thresholds missing. Run the occupations import first.");
  const dates = [general.effectiveFrom, ...occ.map((o) => o.effectiveFrom)].sort();
  return {
    occByCode: new Map(occ.map((o) => [o.socCode, { socCode: o.socCode, title: o.title, rqfLevel: o.rqfLevel, goingRateAnnual: o.goingRateAnnual, isTsl: o.isTsl, payScale: o.payScale }])),
    general: Number(general.amount),
    hourlyMin: Number(hourly.amount),
    version: dates[dates.length - 1]!,
  };
}

export type Assessment = { outcome: RulesOutcome; sponsor: MatchedSponsor | null; socCode: string | null; positiveSnippet: string | null; negativeMatch: string | null };

/** Run the rules for one advert. No writes. */
export async function assess(d: Db, raw: RawJob, rules: Rules, cache: Map<string, MatchedSponsor | null>): Promise<Assessment> {
  const socCode = matchOccupation(raw.title);
  const occupation = socCode ? (rules.occByCode.get(socCode) ?? null) : null;
  const names = [raw.employerRegisterName, raw.employerRawName].filter((n): n is string => Boolean(n));
  const sponsor = await matchSponsor(d, names, cache);
  const signals = extractSignals(raw.description);
  const outcome = decide({
    occupation,
    sponsor,
    salary: { min: raw.salaryMin, max: raw.salaryMax, period: raw.salaryPeriod },
    signals,
    thresholds: { general: rules.general, hourlyMin: rules.hourlyMin, version: rules.version },
  });
  return { outcome, sponsor, socCode: occupation ? socCode : socCode, positiveSnippet: signals.positiveSnippet, negativeMatch: signals.negativeMatch };
}

export type SourceSummary = { source: string; seen: number; stored: number; new: number; assessed: number; closed: number; verdicts: Record<string, number>; expired: number };

function slugFor(raw: RawJob, id: string) {
  const t = slugify(raw.title).slice(0, 60).replace(/-$/, "");
  const e = slugify(raw.employerRawName).slice(0, 40).replace(/-$/, "");
  return `${t}-${e}-${id.slice(0, 6)}`;
}

export async function ingestSource(d: Db, source: JobSource, opts: FetchOptions = {}): Promise<SourceSummary> {
  const log = opts.log ?? (() => {});
  const startedAt = new Date();
  const [run] = await d.insert(ingestionRuns).values({ source: source.key, startedAt }).returning({ id: ingestionRuns.id });
  const rules = await loadRules(d);
  const cache = new Map<string, MatchedSponsor | null>();
  const summary: SourceSummary = { source: source.key, seen: 0, stored: 0, new: 0, assessed: 0, closed: 0, verdicts: {}, expired: 0 };
  const touched = new Set<string>();

  const raws = await source.fetch(opts);
  summary.seen = raws.length;
  const now = new Date();

  for (const raw of raws) {
    if (raw.closesAt && raw.closesAt < now) {
      summary.expired++;
      continue;
    }
    const a = await assess(d, raw, rules, cache);
    const [existing] = await d
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.source, raw.source), eq(jobs.sourceJobId, raw.sourceJobId)))
      .limit(1);

    let jobId: string;
    if (existing) {
      jobId = existing.id;
      await d
        .update(jobs)
        .set({
          employerRawName: raw.employerRawName,
          title: raw.title,
          description: raw.description,
          salaryMin: raw.salaryMin,
          salaryMax: raw.salaryMax,
          salaryPeriod: raw.salaryPeriod,
          location: raw.location,
          isRemote: raw.isRemote,
          applyUrl: raw.applyUrl,
          lastSeenAt: now,
          isLive: true,
        })
        .where(eq(jobs.id, jobId));
    } else {
      jobId = randomUUID();
      await d.insert(jobs).values({
        id: jobId,
        slug: slugFor(raw, jobId),
        source: raw.source,
        sourceJobId: raw.sourceJobId,
        employerRawName: raw.employerRawName,
        title: raw.title,
        description: raw.description,
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        salaryPeriod: raw.salaryPeriod,
        location: raw.location,
        isRemote: raw.isRemote,
        postedAt: raw.postedAt,
        applyUrl: raw.applyUrl,
        firstSeenAt: now,
        lastSeenAt: now,
        isLive: true,
      });
      summary.new++;
    }
    summary.stored++;

    const [last] = await d
      .select({
        verdict: jobAssessments.verdict,
        sponsorId: jobAssessments.sponsorId,
        socCode: jobAssessments.socCode,
        salaryCheck: jobAssessments.salaryCheck,
        salaryAssessedAnnual: jobAssessments.salaryAssessedAnnual,
        salaryRequiredAnnual: jobAssessments.salaryRequiredAnnual,
        rulesVersion: jobAssessments.rulesVersion,
        positiveSignalSnippet: jobAssessments.positiveSignalSnippet,
        negativeSignalMatched: jobAssessments.negativeSignalMatched,
      })
      .from(jobAssessments)
      .where(eq(jobAssessments.jobId, jobId))
      .orderBy(desc(jobAssessments.assessedAt))
      .limit(1);
    const o = a.outcome;
    const same =
      last &&
      last.verdict === o.verdict &&
      (last.sponsorId ?? null) === (a.sponsor?.id ?? null) &&
      (last.socCode ?? null) === (a.socCode ?? null) &&
      last.salaryCheck === o.salaryCheck &&
      (last.salaryAssessedAnnual ?? null) === (o.salaryAssessedAnnual ?? null) &&
      (last.salaryRequiredAnnual ?? null) === (o.salaryRequiredAnnual ?? null) &&
      last.rulesVersion === o.rulesVersion &&
      (last.positiveSignalSnippet ?? null) === (a.positiveSnippet ?? null) &&
      (last.negativeSignalMatched ?? null) === (a.negativeMatch ?? null);
    if (!same) {
      await d.insert(jobAssessments).values({
        jobId,
        verdict: o.verdict,
        sponsorId: a.sponsor?.id ?? null,
        socCode: a.socCode,
        salaryCheck: o.salaryCheck,
        salaryAssessedAnnual: o.salaryAssessedAnnual,
        salaryRequiredAnnual: o.salaryRequiredAnnual,
        positiveSignalSnippet: a.positiveSnippet,
        negativeSignalMatched: a.negativeMatch,
        reason: o.reason,
        rulesVersion: o.rulesVersion,
        assessedAt: now,
      });
      summary.assessed++;
    }
    summary.verdicts[o.verdict] = (summary.verdicts[o.verdict] ?? 0) + 1;
    if (a.sponsor) touched.add(a.sponsor.id);
    if (last?.sponsorId) touched.add(last.sponsorId);
  }

  // Adverts that have gone. An exhaustive source lists everything it has, so
  // anything unseen this run is closed. A keyword search is not, so wait.
  const cutoff = source.exhaustive ? startedAt : new Date(now.getTime() - STALE_DAYS * 86_400_000);
  const closedRows = await d
    .update(jobs)
    .set({ isLive: false })
    .where(and(eq(jobs.source, source.key), eq(jobs.isLive, true), lt(jobs.lastSeenAt, cutoff)))
    .returning({ id: jobs.id });
  summary.closed = closedRows.length;

  await refreshActivity(d, [...touched], now);
  await d.update(ingestionRuns).set({ finishedAt: new Date(), jobsSeen: summary.seen, jobsNew: summary.new }).where(eq(ingestionRuns.id, run!.id));
  log(`${source.key}: ${summary.seen} read, ${summary.stored} stored (${summary.new} new), ${summary.assessed} assessments written, ${summary.closed} closed, ${summary.expired} past closing date`);
  log(`${source.key}: ${Object.entries(summary.verdicts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  return summary;
}

/** Recompute the activity band for the given sponsors from the last 90 days of adverts. */
export async function refreshActivity(d: Db, sponsorIds: string[], now = new Date()): Promise<number> {
  if (sponsorIds.length === 0) return 0;
  const la = d
    .selectDistinctOn([jobAssessments.jobId], { jobId: jobAssessments.jobId, verdict: jobAssessments.verdict, sponsorId: jobAssessments.sponsorId })
    .from(jobAssessments)
    .orderBy(jobAssessments.jobId, desc(jobAssessments.assessedAt))
    .as("la");
  const since = new Date(now.getTime() - 90 * 86_400_000);
  const counts = await d
    .select({
      sponsorId: la.sponsorId,
      posted: sql<number>`count(*)`.mapWith(Number),
      eligible: sql<number>`count(*) filter (where ${inArray(la.verdict, [...MEETS])})`.mapWith(Number),
    })
    .from(jobs)
    .innerJoin(la, eq(la.jobId, jobs.id))
    .where(and(inArray(la.sponsorId, sponsorIds), gte(jobs.postedAt, since)))
    .groupBy(la.sponsorId);
  const byId = new Map(counts.map((c) => [c.sponsorId!, c]));
  const rows = await d
    .select({ id: sponsors.id, firstSeenAt: sponsors.firstSeenAt, licenceSinceKnown: sponsors.licenceSinceKnown })
    .from(sponsors)
    .where(inArray(sponsors.id, sponsorIds));
  const values = rows.map((s) => {
    const c = byId.get(s.id);
    const posted = c?.posted ?? 0;
    const eligible = c?.eligible ?? 0;
    const tenure = s.licenceSinceKnown ? Math.floor((now.getTime() - s.firstSeenAt.getTime()) / 86_400_000) : null;
    const input = { jobsPosted90d: posted, refusalRatio: posted ? (posted - eligible) / posted : 0, eligibleRoleCount: eligible, licenceTenureDays: tenure };
    const { score, band } = scoreSponsor(input);
    return {
      sponsorId: s.id,
      jobsPosted90d: posted,
      refusalRatio: input.refusalRatio.toFixed(3),
      eligibleRoleCount: eligible,
      licenceTenureDays: tenure ?? 0,
      band,
      score,
      scoringVersion: SCORING_VERSION,
      computedAt: now,
    };
  });
  for (let i = 0; i < values.length; i += 500) await d.insert(sponsorActivity).values(values.slice(i, i + 500));
  return values.length;
}
