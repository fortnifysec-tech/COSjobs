import Link from "next/link";
import { EvidencePanel } from "@/components/evidence-panel";
import { JobRow, type JobRowData } from "@/components/job-row";

// Example records for the shell. Replaced by database rows in Phase 3.
const RULES_VERSION = "2025-07-22";
const REGISTER_CHECKED = "2026-09-10 06:00";

const SAMPLE_JOBS: JobRowData[] = [
  { slug: "senior-software-engineer-octopus-energy", title: "Senior software engineer", employer: "Octopus Energy Ltd", location: "London", salary: "£75,000–£95,000", socCode: "2134", postedAgo: "2h ago", verdict: "CONFIRMED", band: "A" },
  { slug: "band-6-physiotherapist-guys", title: "Band 6 physiotherapist", employer: "Guy's and St Thomas' NHS Foundation Trust", location: "London", salary: "£44,806–£53,134", socCode: "2221", postedAgo: "5h ago", verdict: "CONFIRMED", band: "A" },
  { slug: "civil-engineer-arup-manchester", title: "Civil engineer", employer: "Arup", location: "Manchester", salary: "£42,000", socCode: "2121", postedAgo: "1d ago", verdict: "CONFIRMED", band: "B" },
  { slug: "data-analyst-tesco-welwyn", title: "Data analyst", employer: "Tesco Stores Ltd", location: "Welwyn Garden City", salary: "Competitive", socCode: "2433", postedAgo: "1d ago", verdict: "SALARY_UNKNOWN", band: "B" },
  { slug: "care-home-manager-hc-one", title: "Care home manager", employer: "HC-One Ltd", location: "Leeds", salary: "£38,000", socCode: "1232", postedAgo: "2d ago", verdict: "BELOW_THRESHOLD", band: "C" },
];

const WORKED_EXAMPLE = [
  { label: "Occupation code", value: "2134", text: "Programmers and software developers", note: "RQF level 6. Eligible without the shortage list.", state: "pass" as const },
  { label: "Going rate", value: "£49,400", note: "ASHE 2024, 50th percentile", state: "info" as const },
  { label: "General threshold", value: "£41,700", state: "info" as const },
  { label: "Advertised salary", value: "£75,000", note: "Bottom of the advertised range. We never use the midpoint.", state: "pass" as const },
  { label: "Sponsor licence", text: "Octopus Energy Ltd", note: "A-rated. Skilled Worker route. On the register since 2019.", state: "pass" as const },
  { label: "Sponsor activity", value: "A", text: "Active sponsor", note: "31 eligible roles posted in the last 90 days.", state: "info" as const },
  { label: "Advert wording", quote: "Visa sponsorship is available for this role.", state: "pass" as const },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:py-16">
          <div>
            <h1 className="max-w-[22ch] text-[2rem] leading-[1.05] sm:text-[2.75rem]">
              Jobs where the role itself qualifies for a Skilled Worker visa.
            </h1>
            <p className="prose-lede mt-5 max-w-[52ch]">
              Other boards list any job at an employer with a licence. We check the
              occupation code, the going rate, the salary threshold and the advert wording
              for each role, then show you the working.
            </p>

            <form action="/jobs" method="get" className="mt-8 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="block">
                <span className="mb-1 block text-[0.75rem] text-ink-70">Job title or keyword</span>
                <input
                  name="q"
                  type="search"
                  placeholder="software engineer"
                  className="h-10 w-full border hairline bg-card px-3 text-[0.9375rem] text-ink placeholder:text-ink-45"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.75rem] text-ink-70">City or region</span>
                <input
                  name="city"
                  type="text"
                  placeholder="Anywhere in the UK"
                  className="h-10 w-full border hairline bg-card px-3 text-[0.9375rem] text-ink placeholder:text-ink-45"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="h-10 w-full bg-ink px-5 text-[0.9375rem] font-medium text-paper hover:bg-ink/90 sm:w-auto"
                >
                  Check
                </button>
              </div>
            </form>

            <p className="mono mt-4 text-[0.6875rem] text-ink-45">
              Rules version {RULES_VERSION} · Sponsor register checked {REGISTER_CHECKED}
            </p>
          </div>

          <div className="md:pt-2">
            <EvidencePanel
              title="Worked example"
              rows={WORKED_EXAMPLE}
              verdict="pass"
              rulesVersion={RULES_VERSION}
              animate
            />
            <p className="mt-2 text-[0.75rem] text-ink-45">
              This is the panel you see on every role. Nothing is hidden behind a score.
            </p>
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <div>
              <h2 className="text-[1.5rem] leading-tight">The difference is the unit of check.</h2>
              <p className="prose-lede mt-3 max-w-[40ch] text-[1rem]">
                A licence belongs to an employer. Eligibility belongs to a role. We test the role.
              </p>
            </div>
            <dl className="border-t hairline">
              {[
                {
                  them: "Employer appears on the sponsor register",
                  us: "Employer is on the register, and the licence covers the Skilled Worker route, and it is A-rated.",
                },
                {
                  them: "Any job at that employer is listed",
                  us: "Only roles whose occupation code is RQF 6 or on the Temporary Shortage List.",
                },
                {
                  them: "Salary shown as advertised",
                  us: "Salary tested against the higher of the general threshold and the going rate. A range is tested at its minimum. “Competitive” cannot pass.",
                },
                {
                  them: "A disclaimer in the footer",
                  us: "The sponsorship sentence quoted from the advert. Adverts that refuse sponsorship are marked as such, whatever the employer's licence says.",
                },
              ].map((row) => (
                <div
                  key={row.them}
                  className="grid gap-1 border-b hairline-soft py-3.5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-6"
                >
                  <dt className="text-[0.8125rem] text-ink-45">
                    <span className="mr-2 font-medium text-ink-70">Other boards</span>
                    {row.them}
                  </dt>
                  <dd className="text-[0.9375rem] text-ink">
                    <span className="mr-2 font-medium text-ink">COSjobs</span>
                    {row.us}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Recent records */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[1.5rem] leading-tight">Recently checked</h2>
              <p className="mt-1 text-[0.875rem] text-ink-70">
                Every role, including the ones that fail. The verdict tells you why.
              </p>
            </div>
            <Link href="/jobs" className="text-sm text-ink hover:underline">
              See all roles
            </Link>
          </div>
          <ul className="mt-6 border-t hairline">
            {SAMPLE_JOBS.map((job) => (
              <JobRow key={job.slug} job={job} />
            ))}
          </ul>
        </div>
      </section>

      {/* Plans, briefly */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <div>
              <h2 className="text-[1.5rem] leading-tight">Search is free. Applying is not hidden.</h2>
              <p className="prose-lede mt-3 max-w-[40ch] text-[1rem]">
                You can search every role and read every verdict without an account. A
                subscription unlocks the apply link, the full evidence panel and alerts.
              </p>
            </div>
            <dl className="border-t hairline">
              {[
                { plan: "Free", price: "£0", what: "Full search, complete verdicts, sponsor band on every role." },
                { plan: "Seeker", price: "£9.99 a month", what: "Apply links, full descriptions, full evidence panel, instant alerts." },
                { plan: "Seeker Plus", price: "£14.99 a month", what: "Everything in Seeker, plus CV tailoring, a pipeline and a 24-hour head start on new sponsors." },
                { plan: "Sponsor Watch", price: "£2.99 a month", what: "Daily checks on your own employer's licence, with a shortlist ready if it changes." },
              ].map((row) => (
                <div
                  key={row.plan}
                  className="grid gap-1 border-b hairline-soft py-3.5 sm:grid-cols-[8rem_9rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="text-[0.9375rem] font-medium text-ink">{row.plan}</dt>
                  <dd className="mono text-[0.8125rem] text-ink">{row.price}</dd>
                  <dd className="text-[0.875rem] text-ink-70">{row.what}</dd>
                </div>
              ))}
            </dl>
            <div className="md:col-start-2">
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center border border-ink px-4 text-[0.9375rem] font-medium text-ink no-underline hover:bg-card"
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
