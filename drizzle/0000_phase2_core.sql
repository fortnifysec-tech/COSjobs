CREATE TYPE "public"."sponsor_band" AS ENUM('A', 'B', 'C', 'D', 'NEW');--> statement-breakpoint
CREATE TYPE "public"."register_event_type" AS ENUM('ADDED', 'REMOVED', 'RATING_CHANGED', 'ROUTE_ADDED', 'ROUTE_REMOVED', 'NAME_CHANGED', 'TOWN_CHANGED');--> statement-breakpoint
CREATE TYPE "public"."salary_check" AS ENUM('PASS', 'FAIL', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."salary_period" AS ENUM('hour', 'day', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('CONFIRMED', 'LIKELY', 'SALARY_UNKNOWN', 'BELOW_THRESHOLD', 'OCCUPATION_INELIGIBLE', 'LICENCE_RESTRICTED', 'NO_LICENCE', 'REJECTED');--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"jobs_seen" integer DEFAULT 0 NOT NULL,
	"jobs_new" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"verdict" "verdict" NOT NULL,
	"sponsor_id" uuid,
	"soc_code" text,
	"salary_check" "salary_check" NOT NULL,
	"salary_assessed_annual" integer,
	"salary_required_annual" integer,
	"positive_signal_snippet" text,
	"negative_signal_matched" text,
	"reason" text,
	"rules_version" date NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"source" text NOT NULL,
	"source_job_id" text NOT NULL,
	"employer_raw_name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_period" "salary_period",
	"location" text NOT NULL,
	"is_remote" boolean DEFAULT false NOT NULL,
	"posted_at" timestamp with time zone NOT NULL,
	"apply_url" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occupations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"soc_code" text NOT NULL,
	"title" text NOT NULL,
	"rqf_level" integer NOT NULL,
	"going_rate_annual" integer NOT NULL,
	"is_tsl" boolean DEFAULT false NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date
);
--> statement-breakpoint
CREATE TABLE "register_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"event_type" "register_event_type" NOT NULL,
	"old_value" text,
	"new_value" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"jobs_posted_90d" integer NOT NULL,
	"refusal_ratio" numeric(4, 3) NOT NULL,
	"eligible_role_count" integer NOT NULL,
	"licence_tenure_days" integer NOT NULL,
	"band" "sponsor_band" NOT NULL,
	"score" integer NOT NULL,
	"scoring_version" text NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"source" text NOT NULL,
	"confidence" numeric(4, 3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_name" text NOT NULL,
	"normalised_name" text NOT NULL,
	"town" text,
	"routes" text[] DEFAULT '{}' NOT NULL,
	"rating" text,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"companies_house_number" text,
	"website_domain" text
);
--> statement-breakpoint
CREATE TABLE "thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date
);
--> statement-breakpoint
ALTER TABLE "job_assessments" ADD CONSTRAINT "job_assessments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_assessments" ADD CONSTRAINT "job_assessments_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_events" ADD CONSTRAINT "register_events_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_activity" ADD CONSTRAINT "sponsor_activity_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_aliases" ADD CONSTRAINT "sponsor_aliases_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_assessments_job_idx" ON "job_assessments" USING btree ("job_id","assessed_at");--> statement-breakpoint
CREATE INDEX "job_assessments_verdict_idx" ON "job_assessments" USING btree ("verdict");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_slug_idx" ON "jobs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_source_idx" ON "jobs" USING btree ("source","source_job_id");--> statement-breakpoint
CREATE INDEX "jobs_live_posted_idx" ON "jobs" USING btree ("is_live","posted_at");--> statement-breakpoint
CREATE INDEX "jobs_first_seen_idx" ON "jobs" USING btree ("first_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "occupations_code_from_idx" ON "occupations" USING btree ("soc_code","effective_from");--> statement-breakpoint
CREATE INDEX "register_events_sponsor_idx" ON "register_events" USING btree ("sponsor_id","detected_at");--> statement-breakpoint
CREATE INDEX "sponsor_activity_sponsor_idx" ON "sponsor_activity" USING btree ("sponsor_id","computed_at");--> statement-breakpoint
CREATE INDEX "sponsor_aliases_alias_idx" ON "sponsor_aliases" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "sponsors_normalised_idx" ON "sponsors" USING btree ("normalised_name");--> statement-breakpoint
CREATE INDEX "sponsors_active_idx" ON "sponsors" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "thresholds_code_from_idx" ON "thresholds" USING btree ("code","effective_from");