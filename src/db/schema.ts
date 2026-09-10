import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ---------- enums ---------- */

export const verdictEnum = pgEnum("verdict", [
  "CONFIRMED",
  "LIKELY",
  "SALARY_UNKNOWN",
  "BELOW_THRESHOLD",
  "OCCUPATION_INELIGIBLE",
  "LICENCE_RESTRICTED",
  "NO_LICENCE",
  "REJECTED",
]);

export const salaryPeriodEnum = pgEnum("salary_period", ["hour", "day", "week", "month", "year"]);

export const bandEnum = pgEnum("sponsor_band", ["A", "B", "C", "D", "NEW"]);

export const registerEventTypeEnum = pgEnum("register_event_type", [
  "ADDED",
  "REMOVED",
  "RATING_CHANGED",
  "ROUTE_ADDED",
  "ROUTE_REMOVED",
  "NAME_CHANGED",
  "TOWN_CHANGED",
]);

export const salaryCheckEnum = pgEnum("salary_check", ["PASS", "FAIL", "UNKNOWN"]);

/* ---------- reference data (versioned by date) ---------- */

export const occupations = pgTable(
  "occupations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    socCode: text("soc_code").notNull(),
    title: text("title").notNull(),
    rqfLevel: integer("rqf_level").notNull(),
    goingRateAnnual: integer("going_rate_annual").notNull(),
    isTsl: boolean("is_tsl").notNull().default(false),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
  },
  (t) => [uniqueIndex("occupations_code_from_idx").on(t.socCode, t.effectiveFrom)],
);

export const thresholds = pgTable(
  "thresholds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
  },
  (t) => [uniqueIndex("thresholds_code_from_idx").on(t.code, t.effectiveFrom)],
);

/* ---------- sponsors ---------- */

export const sponsors = pgTable(
  "sponsors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rawName: text("raw_name").notNull(),
    normalisedName: text("normalised_name").notNull(),
    town: text("town"),
    routes: text("routes").array().notNull().default([]),
    rating: text("rating"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    companiesHouseNumber: text("companies_house_number"),
    websiteDomain: text("website_domain"),
  },
  (t) => [
    index("sponsors_normalised_idx").on(t.normalisedName),
    index("sponsors_active_idx").on(t.isActive),
  ],
);

export const sponsorAliases = pgTable(
  "sponsor_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    source: text("source").notNull(),
    confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
  },
  (t) => [index("sponsor_aliases_alias_idx").on(t.alias)],
);

export const sponsorActivity = pgTable(
  "sponsor_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    jobsPosted90d: integer("jobs_posted_90d").notNull(),
    refusalRatio: numeric("refusal_ratio", { precision: 4, scale: 3 }).notNull(),
    eligibleRoleCount: integer("eligible_role_count").notNull(),
    licenceTenureDays: integer("licence_tenure_days").notNull(),
    band: bandEnum("band").notNull(),
    score: integer("score").notNull(),
    scoringVersion: text("scoring_version").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sponsor_activity_sponsor_idx").on(t.sponsorId, t.computedAt)],
);

export const registerEvents = pgTable(
  "register_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    eventType: registerEventTypeEnum("event_type").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("register_events_sponsor_idx").on(t.sponsorId, t.detectedAt)],
);

/* ---------- jobs ---------- */

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    source: text("source").notNull(),
    sourceJobId: text("source_job_id").notNull(),
    employerRawName: text("employer_raw_name").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryPeriod: salaryPeriodEnum("salary_period"),
    location: text("location").notNull(),
    isRemote: boolean("is_remote").notNull().default(false),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    applyUrl: text("apply_url").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    isLive: boolean("is_live").notNull().default(true),
  },
  (t) => [
    uniqueIndex("jobs_slug_idx").on(t.slug),
    uniqueIndex("jobs_source_idx").on(t.source, t.sourceJobId),
    index("jobs_live_posted_idx").on(t.isLive, t.postedAt),
    index("jobs_first_seen_idx").on(t.firstSeenAt),
  ],
);

export const jobAssessments = pgTable(
  "job_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    verdict: verdictEnum("verdict").notNull(),
    sponsorId: uuid("sponsor_id").references(() => sponsors.id, { onDelete: "set null" }),
    socCode: text("soc_code"),
    salaryCheck: salaryCheckEnum("salary_check").notNull(),
    /** Annualised salary used for the check, in GBP. Null when unknown. */
    salaryAssessedAnnual: integer("salary_assessed_annual"),
    /** The threshold the salary had to meet (max of general threshold and going rate). */
    salaryRequiredAnnual: integer("salary_required_annual"),
    positiveSignalSnippet: text("positive_signal_snippet"),
    negativeSignalMatched: text("negative_signal_matched"),
    /** Human-readable reason for a failed verdict. */
    reason: text("reason"),
    rulesVersion: date("rules_version").notNull(),
    assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("job_assessments_job_idx").on(t.jobId, t.assessedAt),
    index("job_assessments_verdict_idx").on(t.verdict),
  ],
);

/* ---------- ingestion bookkeeping ---------- */

export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  jobsSeen: integer("jobs_seen").notNull().default(0),
  jobsNew: integer("jobs_new").notNull().default(0),
});

