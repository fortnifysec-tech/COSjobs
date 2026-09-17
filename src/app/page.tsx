import Link from "next/link";
import { EvidencePanel, type EvidenceRow } from "@/components/evidence-panel";
import { JobRow } from "@/components/job-row";
import { Stamp } from "@/components/ui/badges";
import { hasDatabase } from "@/db/client";
import { cityIndex, occupationIndex, routeIndex, type CitySummary, type OccupationSummary, type RouteSummary } from "@/lib/data/browse";
import { getJobBySlug, listJobs, type JobDetail } from "@/lib/data/jobs";
import { recentRegisterChanges, siteStats, type RegisterChange } from "@/lib/data/sponsors";
import { evidenceRows } from "@/lib/evidence";
import { describeChange, employerName, isoDate, longDate, money, num, shortDate, titleCase } from "@/lib/format";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

const CHECKS = [
  {
    n: "1",
    title: "Advert wording",
    body: "We read the advert for a sentence that refuses sponsorship. If there is one, the role fails here, whatever the employer's licence says.",
  },
  {
    n: "2",
    title: "Sponsor licence",
    body: "The employer must be on the Home Office register, A-rated, with a licence that covers the Skilled Worker route. All three, not one.",
  },
  {
    n: "3",
    title: "Occupation code",
    body: "The role is matched to a SOC 2020 code. It must be RQF level 6 or above, or on the Temporary Shortage List.",
  },
  {
    n: "4",
    title: "Salary",
    body: "The advertised figure must meet the higher of the general threshold and the going rate for the code. A range is tested at its bottom.",
  },
  {
    n: "5",
    title: "Record",
    body: "Every figure, code and quote we used is written to the record with the rules version. You can read it before you apply.",
  },
];

export default async function HomePage() {
  const data = hasDatabase ? await loadHome() : null;
  const stats = data?.stats;
  const rulesVersion = stats?.rulesVersion ? isoDate(stats.rulesVersion) : "2025-07-22";

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 md:py-14">
          <div>
            <h1 className="max-w-[20ch] text-[2.125rem] leading-[1.05] sm:text-[3rem]">
              Jobs where the role itself qualifies for a Skilled Worker visa.
            </h1>
            <p className="prose-lede mt-5 max-w-[50ch]">
              A sponsor licence belongs to the employer. Eligibility belongs to the role. We check each role
              against the occupation code, the going rate, the salary threshold and the advert wording, and we
              show the figures we used.
            </p>

            <form action="/jobs" method="get" className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="block">
                <span className="field-label">Job title or keyword</span>
                <input name="q" type="search" placeholder="e.g. software engineer" className="field" />
              </label>
              <label className="block">
                <span className="field-label">Town or city</span>
                <input name="city" type="text" placeholder="Anywhere in the UK" className="field" />
              </label>
              <div className="flex items-end">
                <button type="submit" className="btn w-full sm:w-auto">
                  Check
                </button>
              </div>
            </form>

            {stats ? (
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Figure n={stats.liveJobs} label="live roles checked" href="/jobs?all=1" />
                <Figure n={stats.meetingJobs} label="meet the rules today" href="/jobs" />
                <Figure n={stats.sponsorsWithRoles} label="sponsors with a passing role" href="/sponsors" />
                <Figure n={stats.sponsorsOnRegister} label="licences on the register" href="/visa" />
              </dl>
            ) : null}
          </div>

          <div className="md:pt-1">
            {data?.example ? (
              <>
                <p className="mb-2 text-[0.875rem] text-ink-70">
                  A record, checked {shortDate(data.example.assessment.assessedAt)}.{" "}
                  <Link href={`/jobs/${data.example.job.slug}`} className="text-ink">
                    {data.example.job.title}, {employerName(data.example.job.employerRawName)}
                  </Link>
                </p>
                <EvidencePanel rows={evidenceRows(data.example)} verdict="pass" rulesVersion={rulesVersion} animate />
              </>
            ) : (
              <EvidencePanel rows={STATIC_EXAMPLE} verdict="pass" rulesVersion={rulesVersion} animate />
            )}
            <p className="mt-3 text-[0.8125rem] leading-snug text-ink-45">
              Going rates from Appendix Skilled Occupations. Threshold and rules as published on GOV.UK, version{" "}
              {longDate(rulesVersion)}.
            </p>
          </div>
        </div>
      </section>

      {data ? (
        <section className="border-b hairline">
          <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <div>
                <h2 className="text-[1.625rem] leading-tight">Checked today</h2>
                <p className="mt-1 text-[0.9375rem] text-ink-70">Most recent first. Failed roles are listed too, so you can see why.</p>
              </div>
              <Link href="/jobs" className="text-[0.9375rem] text-ink">
                All {num(stats!.liveJobs)} roles
              </Link>
            </div>
            <ul className="mt-6 border-t-2 border-ink">
              {data.recent.map((job) => (
                <JobRow key={job.id} job={job} now={data.now} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="border-b hairline">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2 className="text-[1.625rem] leading-tight">What we check, in this order</h2>
            <Link href="/how-it-works" className="text-[0.9375rem] text-ink">
              The method in full
            </Link>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CHECKS.map((c) => (
              <li key={c.n} className="card flex flex-col">
                <p className="mono text-[0.8125rem] text-ink-45">{c.n}</p>
                <h3 className="mt-1 text-[1.0625rem]">{c.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-snug text-ink-70">{c.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-[70ch] text-[0.9375rem] text-ink-70">
            A role that fails one check stops there. We still list it, with the failed check named, because a role
            that looks right and is not is the one that costs you an application.
          </p>
        </div>
      </section>

      {data ? (
        <section className="border-b hairline">
          <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <div>
                <h2 className="text-[1.625rem] leading-tight">Browse the record</h2>
                <p className="mt-1 text-[0.9375rem] text-ink-70">By the code the role is sponsored under, by town, or by the route on the licence.</p>
              </div>
              <Link href="/guides" className="text-[0.9375rem] text-ink">
                Read the guides
              </Link>
            </div>
            <div className="mt-6 grid gap-10 md:grid-cols-3 md:gap-8">
              <BrowseList
                title="Occupation codes"
                href="/occupations"
                items={data.occupations.map((o) => ({ href: `/occupations/${o.socCode}`, label: o.title, lead: o.socCode, n: o.meeting, of: o.live }))}
              />
              <BrowseList title="Towns and cities" href="/cities" items={data.cities.map((c) => ({ href: `/cities/${c.slug}`, label: c.city, n: c.meeting, of: c.live }))} />
              <BrowseList title="Routes on the register" href="/visa" items={data.routes.map((r) => ({ href: `/visa/${r.slug}`, label: r.route, n: r.sponsors, unit: "licences" }))} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b hairline">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
          <div>
            <h2 className="text-[1.625rem] leading-tight">The register changes. We read it every morning.</h2>
            <p className="prose-lede mt-3 max-w-[52ch] text-[1.0625rem]">
              Licences are added, downgraded and revoked without notice. A B-rating stops an employer assigning new
              certificates. We download the register daily, compare it with the day before, and re-run every open
              role from any employer whose entry changed.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/sponsors" className="btn-secondary">
                Browse sponsors
              </Link>
              <Link href="/pricing#watch" className="text-[0.9375rem] text-ink">
                Watch your own employer&rsquo;s licence
              </Link>
            </div>
          </div>
          {data?.changes.length ? (
            <div>
              <p className="border-b-2 border-ink pb-2 text-[0.875rem] font-bold">Recent changes on the register</p>
              <ul>
                {data.changes.map((c, i) => (
                  <ChangeRow key={i} change={c} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
            <div>
              <h2 className="text-[1.625rem] leading-tight">Searching is free</h2>
              <p className="prose-lede mt-3 max-w-[52ch] text-[1.0625rem]">
                You can search every role and read every verdict without an account. Seeker, at £9.99 a month,
                adds the apply link, the full advert and alerts. Cancel from your account page in one click.
              </p>
              <Link href="/pricing" className="btn mt-6">
                See plans
              </Link>
            </div>
            <div className="inset self-start">
              <p className="text-[0.9375rem] leading-relaxed text-ink-70">
                <Stamp date={rulesVersion} className="float-right mb-2 ml-4" /> The stamp means every check passed
                against the rules on that date. It does not mean the employer will sponsor you. Only they decide
                that, and only after they offer you the job.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Figure({ n, label, href }: { n: number; label: string; href: string }) {
  return (
    <div>
      <Link href={href} className="card card-link h-full py-3">
        <dt className="sr-only">{label}</dt>
        <dd className="mono text-[1.5rem] leading-none text-ink">{num(n)}</dd>
        <dd className="mt-1 text-[0.8125rem] leading-snug text-ink-70">{label}</dd>
      </Link>
    </div>
  );
}

function BrowseList({ title, href, items }: { title: string; href: string; items: { href: string; label: string; lead?: string; n: number; of?: number; unit?: string }[] }) {
  return (
    <div className="card min-w-0">
      <p className="card-head text-[0.9375rem] font-bold">
        <Link href={href} className="text-ink no-underline hover:underline">
          {title}
        </Link>
      </p>
      <ul>
        {items.map((i) => (
          <li key={i.href} className="border-b hairline-soft">
            <Link href={i.href} className="flex items-baseline justify-between gap-4 py-2 text-[0.9375rem] leading-snug no-underline hover:bg-paper">
              <span className="min-w-0 text-ink">
                {i.lead ? <span className="mono mr-2 text-[0.8125rem] text-ink-45">{i.lead}</span> : null}
                {i.label}
              </span>
              <span className="mono shrink-0 text-[0.8125rem] text-ink-70">
                {num(i.n)}
                {i.of !== undefined ? <span className="text-ink-45"> of {num(i.of)}</span> : i.unit ? <span className="text-ink-45"> {i.unit}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.875rem]">
        <Link href={href} className="text-ink">
          All {title.toLowerCase()}
        </Link>
      </p>
    </div>
  );
}

function ChangeRow({ change }: { change: RegisterChange }) {
  return (
    <li className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 border-b hairline-soft py-2.5 text-[0.9375rem]">
      <span className="mono pt-px text-[0.8125rem] text-ink-45">{shortDate(change.detectedAt)}</span>
      <span className="min-w-0">
        <Link href={`/sponsors/${change.sponsorId}`} className="text-ink">
          {titleCase(change.sponsorName)}
        </Link>
        <span className="block text-[0.875rem] text-ink-70">{describeChange(change)}</span>
      </span>
    </li>
  );
}

async function loadHome() {
  const now = new Date();
  const [stats, recentRes, changes, occ, cities, routes] = await Promise.all([
    siteStats(),
    listJobs({ rulesOnly: false, page: 1 }),
    recentRegisterChanges(6),
    occupationIndex(),
    cityIndex(),
    routeIndex(),
  ]);
  const occupations: OccupationSummary[] = occ.items.filter((o) => o.live > 0).slice(0, 7);
  const topCities: CitySummary[] = cities.slice(0, 7);
  const topRoutes: RouteSummary[] = routes.slice(0, 7);
  const recent = [...recentRes.items].sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime()).slice(0, 8);
  const confirmed = recentRes.items.find((j) => j.verdict === "CONFIRMED" && j.salaryMax !== null);
  const example: JobDetail | null = confirmed ? await getJobBySlug(confirmed.slug) : null;
  return { stats, recent, changes, example, now, occupations, cities: topCities, routes: topRoutes };
}

const STATIC_EXAMPLE: EvidenceRow[] = [
  { label: "Advert wording", quote: "Visa sponsorship is available for this role.", note: "Quoted from the advert.", state: "pass" },
  { label: "Sponsor licence", text: "Octopus Energy Ltd", note: "A-rated. Skilled Worker route. On the register for 6 years.", state: "pass" },
  {
    label: "Occupation code",
    value: "2134",
    text: "Programmers and software development professionals",
    note: "RQF level 6. Eligible without the shortage list.",
    state: "pass",
  },
  { label: "Going rate", value: money(49400), note: "Appendix Skilled Occupations, ASHE 2024, 50th percentile.", state: "info" },
  { label: "General threshold", value: money(41700), note: "The salary must meet £49,400, the higher of the two.", state: "info" },
  {
    label: "Advertised salary",
    value: money(75000),
    note: "Bottom of the advertised range, never the midpoint. Meets the £49,400 required.",
    state: "pass",
  },
  {
    label: "Sponsor activity",
    value: "A",
    text: "Active sponsor",
    note: "9 of 11 roles posted in 90 days met the rules. Not a rule, for context only.",
    state: "info",
  },
];
