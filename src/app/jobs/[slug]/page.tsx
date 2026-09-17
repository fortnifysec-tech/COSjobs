import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdvertBody } from "@/components/advert-body";
import { sourceLabel } from "@/lib/site";
import { EvidencePanel } from "@/components/evidence-panel";
import { BAND_LABEL, BAND_SENTENCE, BandBadge, VERDICT_LABEL, VERDICT_SENTENCE, VerdictBadge } from "@/components/ui/badges";
import { getJobBySlug, MEETS_RULES } from "@/lib/data/jobs";
import { evidenceRows } from "@/lib/evidence";
import {
  daysToYears,
  describeChange,
  employerName,
  isoDate,
  longDate,
  money,
  num,
  salaryLabel,
  shortDate,
  shortDateTime,
  titleCase,
} from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getJobBySlug(slug);
  if (!d) return { title: "Role not found" };
  return {
    title: `${d.job.title} at ${employerName(d.job.employerRawName)}, ${d.job.location}`,
    description: `${VERDICT_LABEL[d.assessment.verdict]}. ${VERDICT_SENTENCE[d.assessment.verdict]}`,
  };
}

export default async function JobPage({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const d = await getJobBySlug(slug);
  if (!d) notFound();

  const { job, assessment: a, sponsor, activity, occupation, lastRegisterEvent } = d;
  const now = new Date();
  const verdict = a.verdict;
  const passes = MEETS_RULES.includes(verdict);
  const panelVerdict = passes ? "pass" : verdict === "SALARY_UNKNOWN" ? "unknown" : "fail";
  const rules = isoDate(a.rulesVersion);
  const salary = salaryLabel(job.salaryMin, job.salaryMax, job.salaryPeriod);
  const insetClass = passes ? "inset-stamp" : verdict === "SALARY_UNKNOWN" ? "inset" : "inset-flag";
  const employer = employerName(job.employerRawName);
  const matched = a.negativeSignalMatched ?? a.positiveSignalSnippet;
  const matchedShown = Boolean(matched && job.description.replace(/\s+/g, " ").includes(matched.replace(/\s+/g, " ")));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description.slice(0, 5000),
    datePosted: job.postedAt.toISOString(),
    employmentType: "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: employer },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "GB" } },
    ...(job.isRemote ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "GBP",
            value: { "@type": "QuantitativeValue", minValue: job.salaryMin, ...(job.salaryMax ? { maxValue: job.salaryMax } : {}), unitText: (job.salaryPeriod ?? "year").toUpperCase() },
          },
        }
      : {}),
    identifier: { "@type": "PropertyValue", name: job.source, value: job.sourceJobId },
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/jobs" className="text-ink-70 hover:text-ink">
          Jobs
        </Link>
        <span className="mx-2 text-ink-45">/</span>
        Record <span className="mono">{job.slug.slice(-6)}</span>
      </p>

      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{job.title}</h1>
          <p className="mt-2 text-[1.125rem] text-ink">
            {sponsor ? (
              <Link href={`/sponsors/${sponsor.id}`} className="text-ink">
                {employer}
              </Link>
            ) : (
              employer
            )}
            <span className="text-ink-45"> · </span>
            {job.location}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y hairline py-4 sm:grid-cols-[minmax(0,1.7fr)_1fr_1fr_1fr]">
            <div>
              <dt className="text-[0.8125rem] text-ink-70">Salary</dt>
              <dd className={`mt-0.5 text-[1rem] ${job.salaryMin === null && job.salaryMax === null ? "text-ink-45" : "mono"}`}>{salary}</dd>
            </div>
            <div>
              <dt className="text-[0.8125rem] text-ink-70">Occupation code</dt>
              <dd className="mt-0.5 text-[1rem]">
                {occupation ? <span className="mono">{occupation.socCode}</span> : <span className="text-ink-45">None</span>}
              </dd>
            </div>
            <div>
              <dt className="text-[0.8125rem] text-ink-70">Posted</dt>
              <dd className="mt-0.5 text-[1rem]">{shortDate(job.postedAt)}</dd>
            </div>
            <div>
              <dt className="text-[0.8125rem] text-ink-70">Source</dt>
              <dd className="mt-0.5 text-[1rem]">{sourceLabel(job.source)}</dd>
            </div>
          </dl>

          <div className={`mt-6 ${insetClass}`}>
            <div className="flex flex-wrap items-center gap-2">
              <VerdictBadge verdict={verdict} />
              {activity ? <BandBadge band={activity.band} /> : null}
            </div>
            <p className="prose-lede mt-2 text-[1.0625rem] text-ink">{VERDICT_SENTENCE[verdict]}</p>
            {a.reason && !passes ? <p className="mt-1 text-[0.9375rem] text-ink-70">{a.reason}</p> : null}
            <p className="mono mt-2 text-[0.75rem] text-ink-45">
              Checked {shortDateTime(a.assessedAt)} · rules {rules}
            </p>
          </div>

          <section className="mt-10" aria-labelledby="advert">
            <h2 id="advert" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              The advert
            </h2>
            <div className="mt-4 max-w-[64ch] text-[1.0625rem] leading-relaxed">
              <AdvertBody text={job.description} highlight={matched} />
            </div>
            <p className="mt-4 text-[0.8125rem] text-ink-45">
              Text as published by the employer.
              {matchedShown ? " Underlined wording is what the sponsorship check matched." : " No sentence about sponsorship was found in it."}
            </p>
          </section>

          <section className="mt-10 border-2 border-ink p-5" aria-labelledby="apply">
            <h2 id="apply" className="text-[1.125rem]">
              Apply
            </h2>
            {passes ? (
              <p className="mt-2 max-w-[56ch] text-[0.9375rem] text-ink-70">
                The apply link goes straight to the employer&rsquo;s own page. It is part of the Seeker plan, along
                with the full evidence panel and alerts for new roles that pass.
              </p>
            ) : (
              <p className="mt-2 max-w-[56ch] text-[0.9375rem] text-ink-70">
                This role did not pass every check. You can still apply, but on the evidence above it would need
                a change from the employer before it could be sponsored.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/sign-in?next=/jobs/${job.slug}`} className="btn">
                Sign in to apply
              </Link>
              <Link href="/pricing" className="text-[0.9375rem] text-ink">
                Plans from £9.99 a month
              </Link>
            </div>
          </section>
        </div>

        <aside className="min-w-0 md:pt-1">
          <EvidencePanel rows={evidenceRows(d)} verdict={panelVerdict} rulesVersion={rules} animate />

          {sponsor ? (
            <section className="mt-8" aria-labelledby="sponsor">
              <h2 id="sponsor" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                On the register
              </h2>
              <dl className="divide-y divide-rule-soft text-[0.9375rem]">
                <Row label="Registered name">
                  <Link href={`/sponsors/${sponsor.id}`} className="text-ink">
                    {titleCase(sponsor.rawName)}
                  </Link>
                </Row>
                <Row label="Town">{sponsor.town ?? "Not given"}</Row>
                <Row label="Rating">
                  <span className="mono">{sponsor.rating ?? "None"}</span>
                  {sponsor.rating === "A" ? " · can assign certificates" : sponsor.rating === "B" ? " · cannot assign new certificates" : ""}
                </Row>
                <Row label="Routes">{sponsor.routes.join(", ") || "None"}</Row>
                <Row label="On register">
                  {sponsor.licenceSinceKnown ? (
                    <>
                      {daysToYears(activity?.licenceTenureDays ?? Math.floor((now.getTime() - sponsor.firstSeenAt.getTime()) / 86_400_000))}
                      <span className="text-ink-45"> · since {longDate(sponsor.firstSeenAt)}</span>
                    </>
                  ) : (
                    <>
                      Since before {longDate(sponsor.firstSeenAt)}
                      <span className="block text-[0.875rem] text-ink-45">Listed when we took our first copy of the register. Licence date not published.</span>
                    </>
                  )}
                </Row>
                {sponsor.companiesHouseNumber ? (
                  <Row label="Companies House">
                    <a
                      href={`https://find-and-update.company-information.service.gov.uk/company/${sponsor.companiesHouseNumber}`}
                      rel="noopener"
                      className="mono text-ink"
                    >
                      {sponsor.companiesHouseNumber}
                    </a>
                  </Row>
                ) : null}
                {activity ? (
                  <Row label="Activity">
                    <span className="mono">{activity.band}</span> {BAND_LABEL[activity.band]}
                    <span className="block text-[0.875rem] text-ink-45">
                      {BAND_SENTENCE[activity.band]} {activity.eligibleRoleCount} of {num(activity.jobsPosted90d)} roles in 90 days passed.
                    </span>
                  </Row>
                ) : null}
                {lastRegisterEvent ? (
                  <Row label="Last change">
                    {describeChange(lastRegisterEvent)}
                    <span className="block text-[0.875rem] text-ink-45">Seen {shortDate(lastRegisterEvent.detectedAt)}</span>
                  </Row>
                ) : null}
              </dl>
            </section>
          ) : null}

          {passes ? (
            <p className="mt-8 text-[0.875rem] leading-relaxed text-ink-70">
              Meets the rules published on GOV.UK for {longDate(rules)}. Whether {employer} will sponsor
              you is their decision, made after an offer. Salary figure used:{" "}
              {a.salaryAssessedAnnual ? <span className="mono">{money(a.salaryAssessedAnnual)}</span> : "none"}.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 py-2.5">
      <dt className="text-[0.8125rem] text-ink-70">{label}</dt>
      <dd className="min-w-0 text-ink">{children}</dd>
    </div>
  );
}

/** Underline the sentence the sponsorship check matched, without changing the text. */
