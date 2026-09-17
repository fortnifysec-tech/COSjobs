import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobRow } from "@/components/job-row";
import { DefRow, Ledger, LedgerRow } from "@/components/ledger";
import { Pagination } from "@/components/pagination";
import { VERDICT_LABEL, type Verdict } from "@/components/ui/badges";
import { occupationDetail } from "@/lib/data/browse";
import { listJobs, MEETS_RULES } from "@/lib/data/jobs";
import { money, num, plural, titleCase } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/occupations/[soc]">): Promise<Metadata> {
  const { soc } = await params;
  const o = await occupationDetail(soc);
  if (!o) return { title: "Occupation code not found" };
  return {
    title: `${o.socCode} ${o.title}: going rate and sponsored roles`,
    description: o.payScale
      ? `${o.title} is paid on a national pay scale. ${num(o.meeting)} of ${num(o.live)} live roles under code ${o.socCode} meet the Skilled Worker rules.`
      : `A role under ${o.socCode} must pay at least ${money(o.required ?? o.general)}. ${num(o.meeting)} of ${num(o.live)} live roles meet the rules today.`,
  };
}

export default async function OccupationPage({ params, searchParams }: PageProps<"/occupations/[soc]">) {
  const { soc } = await params;
  const sp = await searchParams;
  const o = await occupationDetail(soc);
  if (!o) notFound();
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const all = sp.all === "1";
  const roles = await listJobs({ soc: [o.socCode], rulesOnly: !all, page });
  const now = new Date();
  const href = (p: number) => `/occupations/${o.socCode}?${all ? "all=1&" : ""}page=${p}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/occupations" className="text-ink-70 hover:text-ink">
          Occupation codes
        </Link>
      </p>

      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="min-w-0">
          <p className="mono text-[0.9375rem] text-ink-45">SOC 2020 · {o.socCode}</p>
          <h1 className="mt-1 text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{o.title}</h1>

          <div className={`mt-6 ${o.eligible ? "inset" : "inset-flag"}`}>
            <p className="prose-lede text-[1.0625rem] text-ink">
              {!o.eligible
                ? "This code is below RQF level 6 and not on a shortage list. Since 22 July 2025 a new applicant cannot be sponsored under it."
                : o.payScale
                  ? "An eligible code paid on a national pay scale. The going rate is the pay band for the post, so we do not test the salary as a single figure."
                  : o.isTsl
                    ? `On the Temporary Shortage List. A role under this code must pay at least ${money(o.required ?? o.general)}, the higher of the general threshold and the going rate.`
                    : `An eligible code. A role under it must pay at least ${money(o.required ?? o.general)}, the higher of the general threshold and the going rate.`}
            </p>
          </div>

          {o.exampleTitles.length ? (
            <section className="mt-8" aria-labelledby="titles">
              <h2 id="titles" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                Job titles the appendix gives for this code
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">{o.exampleTitles.join(" · ")}</p>
              <p className="mt-2 text-[0.8125rem] text-ink-45">Non-exclusive. The employer chooses the code on the certificate; we assign one from the advert title.</p>
            </section>
          ) : null}

          <section className="mt-10" aria-labelledby="roles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id="roles" className="text-[1.125rem]">
                {all ? "All live roles" : "Live roles that meet the rules"}
              </h2>
              <p className="text-[0.875rem] text-ink-70">
                <span className="mono text-ink">{num(o.meeting)}</span> of <span className="mono text-ink">{num(o.live)}</span> pass ·{" "}
                <Link href={all ? `/occupations/${o.socCode}` : `/occupations/${o.socCode}?all=1`} className="text-ink">
                  {all ? "Passing only" : "Show all"}
                </Link>
              </p>
            </div>
            {roles.items.length ? (
              <ul>
                {roles.items.map((j) => (
                  <JobRow key={j.id} job={j} now={now} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-70">
                No {all ? "" : "passing "}roles under this code right now.{" "}
                <Link href="/jobs" className="text-ink">
                  Search every role
                </Link>
                .
              </p>
            )}
            <Pagination page={roles.page} pageCount={roles.pageCount} href={href} />
          </section>
        </div>

        <aside className="min-w-0 md:pt-1">
          <section aria-labelledby="figures">
            <h2 id="figures" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              The figures
            </h2>
            <dl className="divide-y divide-rule-soft text-[0.9375rem]">
              <DefRow label="Skill level">
                RQF {o.rqfLevel >= 6 ? "6 or above" : "3 to 5"}
                {o.isTsl ? " · Temporary Shortage List" : ""}
              </DefRow>
              <DefRow label="Going rate">
                {o.payScale ? "National pay scale (Table 3)" : <span className="mono">{money(o.goingRateAnnual)}</span>}
              </DefRow>
              <DefRow label="General threshold">
                <span className="mono">{money(o.general)}</span>
              </DefRow>
              <DefRow label="Must meet">
                {o.payScale ? "The pay band for the post" : <span className="mono">{money(o.required ?? o.general)}</span>}
                {!o.payScale ? <span className="block text-[0.875rem] text-ink-45">The higher of the two. A range is tested at its bottom figure.</span> : null}
              </DefRow>
              <DefRow label="Hourly floor">
                <span className="mono">£17.13</span>
                <span className="block text-[0.875rem] text-ink-45">Applies when the advert quotes an hourly rate.</span>
              </DefRow>
            </dl>
          </section>

          {o.verdicts.length ? (
            <section className="mt-8" aria-labelledby="verdicts">
              <h2 id="verdicts" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                Live roles by verdict
              </h2>
              <dl className="divide-y divide-rule-soft text-[0.9375rem]">
                {o.verdicts
                  .sort((a, b) => b.n - a.n)
                  .map((v) => (
                    <DefRow key={v.verdict} label={VERDICT_LABEL[v.verdict as Verdict]}>
                      <span className="mono">{num(v.n)}</span>
                      {MEETS_RULES.includes(v.verdict as Verdict) ? <span className="text-ink-45"> · passes</span> : null}
                    </DefRow>
                  ))}
              </dl>
            </section>
          ) : null}

          {o.sponsors.length ? (
            <section className="mt-8" aria-labelledby="sponsors">
              <h2 id="sponsors" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                Sponsors advertising under this code
              </h2>
              <Ledger className="border-t-0">
                {o.sponsors.map((s) => (
                  <LedgerRow key={s.id} href={`/sponsors/${s.id}`} title={titleCase(s.rawName)} figures={[{ value: `${num(s.meeting)} of ${num(s.live)}`, label: plural(s.live, "role") + " pass" }]} />
                ))}
              </Ledger>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
