/* Seed the database with deterministic fixtures. Run: pnpm db:seed */
import { sql } from "drizzle-orm";
import { db, schema } from "../src/db/client";
import { buildFixtures } from "../src/lib/fixtures/generate";

async function main() {
  const fx = buildFixtures();
  const d = db();

  await d.execute(sql`truncate table
    job_assessments, jobs, sponsor_activity, register_events, sponsor_aliases, sponsors,
    occupations, thresholds, ingestion_runs restart identity cascade`);

  await d.insert(schema.thresholds).values(
    fx.thresholds.map((t) => ({ code: t.code, amount: String(t.amount), effectiveFrom: t.effectiveFrom, effectiveTo: t.effectiveTo })),
  );
  await d.insert(schema.occupations).values(
    fx.occupations.map((o) => ({
      socCode: o.socCode, title: o.title, rqfLevel: o.rqfLevel, goingRateAnnual: o.goingRateAnnual,
      isTsl: o.isTsl, effectiveFrom: o.effectiveFrom, effectiveTo: o.effectiveTo,
    })),
  );
  await d.insert(schema.sponsors).values(
    fx.sponsors.map((s) => ({
      id: s.id, rawName: s.rawName, normalisedName: s.normalisedName, town: s.town, routes: s.routes,
      rating: s.rating, firstSeenAt: s.firstSeenAt, lastSeenAt: s.lastSeenAt, isActive: s.isActive,
      companiesHouseNumber: s.companiesHouseNumber, websiteDomain: s.websiteDomain,
    })),
  );
  await d.insert(schema.sponsorAliases).values(
    fx.sponsors.flatMap((s) => s.aliases.map((a) => ({ sponsorId: s.id, alias: a, source: "fixture", confidence: "0.950" }))),
  );
  await d.insert(schema.sponsorActivity).values(
    fx.activity.map((a) => ({ ...a, refusalRatio: a.refusalRatio.toFixed(3) })),
  );
  await d.insert(schema.registerEvents).values(fx.registerEvents);

  for (let i = 0; i < fx.jobs.length; i += 50) {
    const chunk = fx.jobs.slice(i, i + 50);
    await d.insert(schema.jobs).values(
      chunk.map((j) => ({
        id: j.id, slug: j.slug, source: j.source, sourceJobId: j.sourceJobId, employerRawName: j.employerRawName,
        title: j.title, description: j.description, salaryMin: j.salaryMin, salaryMax: j.salaryMax,
        salaryPeriod: j.salaryPeriod, location: j.location, isRemote: j.isRemote, postedAt: j.postedAt,
        applyUrl: j.applyUrl, firstSeenAt: j.firstSeenAt, lastSeenAt: j.lastSeenAt, isLive: j.isLive,
      })),
    );
    await d.insert(schema.jobAssessments).values(
      chunk.map((j) => ({
        jobId: j.id, verdict: j.outcome.verdict, sponsorId: j.sponsorId, socCode: j.socCode,
        salaryCheck: j.outcome.salaryCheck, salaryAssessedAnnual: j.outcome.salaryAssessedAnnual,
        salaryRequiredAnnual: j.outcome.salaryRequiredAnnual, positiveSignalSnippet: j.positiveSnippet,
        negativeSignalMatched: j.negativeMatch, reason: j.outcome.reason, rulesVersion: j.outcome.rulesVersion,
        assessedAt: j.firstSeenAt,
      })),
    );
  }

  const counts = fx.jobs.reduce<Record<string, number>>((acc, j) => ((acc[j.outcome.verdict] = (acc[j.outcome.verdict] ?? 0) + 1), acc), {});
  console.log("seeded", fx.jobs.length, "jobs", counts);
  console.log("bands", fx.activity.reduce<Record<string, number>>((acc, a) => ((acc[a.band] = (acc[a.band] ?? 0) + 1), acc), {}));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
