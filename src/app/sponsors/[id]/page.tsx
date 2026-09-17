import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobRow } from "@/components/job-row";
import { BAND_LABEL, BAND_SENTENCE, BandBadge, VERDICT_LABEL } from "@/components/ui/badges";
import { MEETS_RULES } from "@/lib/data/jobs";
import { getSponsor } from "@/lib/data/sponsors";
import { daysToYears, describeChange, longDate, num, shortDate, shortDateTime, titleCase } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/sponsors/[id]">): Promise<Metadata> {
  const { id } = await params;
  const d = await getSponsor(id);
  if (!d) return { title: "Sponsor not found" };
  return { title: `${titleCase(d.sponsor.rawName)} on the sponsor register` };
}

export default async function SponsorPage({ params }: PageProps<"/sponsors/[id]">) {
  const { id } = await params;
  const d = await getSponsor(id);
  if (!d) notFound();
  const { sponsor, activity, events, roles, verdictCounts } = d;
  const now = new Date();
  const live = verdictCounts.reduce((n, v) => n + v.n, 0);
  const meeting = verdictCounts.filter((v) => MEETS_RULES.includes(v.verdict)).reduce((n, v) => n + v.n, 0);
  const canSponsor = sponsor.isActive && sponsor.rating === "A" && sponsor.routes.includes("Skilled Worker");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/sponsors" className="text-ink-70 hover:text-ink">
          Sponsors
        </Link>
      </p>

      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{titleCase(sponsor.rawName)}</h1>
          <p className="mt-2 text-[1.125rem] text-ink-70">
            {sponsor.town ?? "Town not given"}
            {activity ? (
              <>
                <span className="text-ink-45"> · </span>
                <BandBadge band={activity.band} />
              </>
            ) : null}
          </p>

          <div className={`mt-6 ${canSponsor ? "inset" : "inset-flag"}`}>
            <p className="prose-lede text-[1.0625rem] text-ink">
              {!sponsor.isActive
                ? "This employer has been removed from the register. Roles they advertise cannot be sponsored until they are relicensed."
                : !sponsor.routes.includes("Skilled Worker")
                  ? "This licence does not cover the Skilled Worker route, so it cannot be used to sponsor a Skilled Worker visa."
                  : sponsor.rating !== "A"
                    ? `This licence is ${sponsor.rating}-rated. A B-rated sponsor cannot assign new certificates until the Home Office restores the A-rating.`
                    : "This employer holds an A-rated licence covering the Skilled Worker route and can assign certificates of sponsorship."}
            </p>
            {activity ? <p className="mt-1 text-[0.9375rem] text-ink-70">{BAND_SENTENCE[activity.band]}</p> : null}
          </div>

          <section className="mt-10" aria-labelledby="roles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id="roles" className="text-[1.125rem]">
                Live roles
              </h2>
              <p className="text-[0.875rem] text-ink-70">
                <span className="mono text-ink">{num(meeting)}</span> of <span className="mono text-ink">{num(live)}</span> meet the rules
              </p>
            </div>
            {roles.length ? (
              <ul>
                {roles.map((j) => (
                  <JobRow key={j.id} job={j} now={now} showEmployer={false} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 max-w-[56ch] text-[0.9375rem] text-ink-70">
                No live roles from this employer in the sources we read. Their licence still stands; it is the
                advertising we have not seen.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 md:pt-1">
          <section aria-labelledby="entry">
            <h2 id="entry" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              Register entry
            </h2>
            <dl className="divide-y divide-rule-soft text-[0.9375rem]">
              <Row label="Name as listed">
                <span className="mono text-[0.875rem]">{sponsor.rawName}</span>
              </Row>
              <Row label="Rating">
                <span className="mono">{sponsor.rating ?? "None"}</span>
              </Row>
              <Row label="Routes">
                {sponsor.routes.length ? (
                  <ul className="space-y-0.5">
                    {sponsor.routes.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  "None"
                )}
              </Row>
              <Row label="First seen">
                {sponsor.licenceSinceKnown ? longDate(sponsor.firstSeenAt) : `Before ${longDate(sponsor.firstSeenAt)}`}
                <span className="block text-[0.875rem] text-ink-45">
                  {sponsor.licenceSinceKnown
                    ? `${daysToYears(activity?.licenceTenureDays ?? Math.floor((now.getTime() - sponsor.firstSeenAt.getTime()) / 86_400_000))} on the register`
                    : "Listed when we took our first copy of the register. The licence date is not published."}
                </span>
              </Row>
              <Row label="Last seen">{shortDateTime(sponsor.lastSeenAt)}</Row>
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
              {sponsor.websiteDomain ? (
                <Row label="Website">
                  <a href={`https://${sponsor.websiteDomain}`} rel="noopener nofollow" className="text-ink">
                    {sponsor.websiteDomain}
                  </a>
                </Row>
              ) : null}
            </dl>
          </section>

          {activity ? (
            <section className="mt-8" aria-labelledby="activity">
              <h2 id="activity" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                Activity, last 90 days
              </h2>
              <dl className="divide-y divide-rule-soft text-[0.9375rem]">
                <Row label="Band">
                  <span className="mono">{activity.band}</span> {BAND_LABEL[activity.band]}
                </Row>
                <Row label="Score">
                  <span className="mono">{activity.score}</span>
                  <span className="text-ink-45"> of 100</span>
                </Row>
                <Row label="Roles posted">
                  <span className="mono">{num(activity.jobsPosted90d)}</span>
                </Row>
                <Row label="Passed checks">
                  <span className="mono">{num(activity.eligibleRoleCount)}</span>
                  <span className="text-ink-45"> · {Math.round((1 - activity.refusalRatio) * 100)}% pass rate</span>
                </Row>
                {verdictCounts.length ? (
                  <Row label="By verdict">
                    <ul className="space-y-0.5 text-[0.875rem]">
                      {[...verdictCounts]
                        .sort((a, b) => b.n - a.n)
                        .map((v) => (
                          <li key={v.verdict} className="flex justify-between gap-4">
                            <span>{VERDICT_LABEL[v.verdict]}</span>
                            <span className="mono">{num(v.n)}</span>
                          </li>
                        ))}
                    </ul>
                  </Row>
                ) : null}
                <Row label="Computed">
                  {shortDateTime(activity.computedAt)}
                  <span className="block text-[0.875rem] text-ink-45">scoring {activity.scoringVersion}</span>
                </Row>
              </dl>
            </section>
          ) : null}

          <section className="mt-8" aria-labelledby="history">
            <h2 id="history" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              Register history
            </h2>
            {events.length ? (
              <ul>
                {events.map((e, i) => (
                  <li key={i} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 border-b hairline-soft py-2.5 text-[0.9375rem]">
                    <span className="mono pt-px text-[0.8125rem] text-ink-45">{shortDate(e.detectedAt)}</span>
                    <span>{describeChange(e)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[0.9375rem] text-ink-70">No changes since we began reading the register.</p>
            )}
          </section>

          <div className="mt-8 border-2 border-ink p-4">
            <p className="text-[0.9375rem] font-medium text-ink">Work here already?</p>
            <p className="mt-1 text-[0.875rem] leading-snug text-ink-70">
              Sponsor Watch checks this entry every morning and emails you the day anything changes, with a
              shortlist of open roles that pass.
            </p>
            <Link href="/pricing#watch" className="btn-secondary mt-3 h-9 text-[0.9375rem]">
              Watch this licence
            </Link>
          </div>
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
