import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobRow } from "@/components/job-row";
import { DefRow, Ledger, LedgerRow } from "@/components/ledger";
import { Pagination } from "@/components/pagination";
import { VERDICT_LABEL, type Verdict } from "@/components/ui/badges";
import { cityDetail } from "@/lib/data/browse";
import { listJobs, MEETS_RULES } from "@/lib/data/jobs";
import { num, plural, titleCase } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/cities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await cityDetail(slug);
  if (!c) return { title: "Town not found" };
  return {
    title: `Sponsored jobs in ${c.city}`,
    description: `${num(c.meeting)} of ${num(c.live)} live roles in ${c.city} meet the Skilled Worker rules. ${num(c.sponsorsInTown)} licensed sponsors are registered in ${c.city}.`,
  };
}

export default async function CityPage({ params, searchParams }: PageProps<"/cities/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await cityDetail(slug);
  if (!c) notFound();
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const all = sp.all === "1";
  const roles = await listJobs({ locations: c.names, rulesOnly: !all, page });
  const now = new Date();
  const href = (p: number) => `/cities/${c.slug}?${all ? "all=1&" : ""}page=${p}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/cities" className="text-ink-70 hover:text-ink">
          Towns and cities
        </Link>
      </p>
      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{c.city}</h1>
          <p className="prose-lede mt-4 max-w-[58ch]">
            {num(c.meeting)} of {num(c.live)} live {plural(c.live, "role")} based in {c.city} meet the rules today.{" "}
            {c.sponsorsInTown > 0 ? `${num(c.sponsorsInTown)} licensed ${plural(c.sponsorsInTown, "sponsor")} give ${c.city} as their registered town.` : ""}
          </p>

          <section className="mt-8" aria-labelledby="roles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id="roles" className="text-[1.125rem]">
                {all ? "All live roles" : "Roles that meet the rules"}
              </h2>
              <Link href={all ? `/cities/${c.slug}` : `/cities/${c.slug}?all=1`} className="text-[0.875rem] text-ink">
                {all ? "Passing only" : "Show all"}
              </Link>
            </div>
            {roles.items.length ? (
              <ul>
                {roles.items.map((j) => (
                  <JobRow key={j.id} job={j} now={now} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-70">No {all ? "" : "passing "}roles in {c.city} right now.</p>
            )}
            <Pagination page={roles.page} pageCount={roles.pageCount} href={href} />
          </section>
        </div>

        <aside className="min-w-0 md:pt-1">
          <section aria-labelledby="verdicts">
            <h2 id="verdicts" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              Live roles by verdict
            </h2>
            <dl className="divide-y divide-rule-soft text-[0.9375rem]">
              {c.verdicts
                .sort((a, b) => b.n - a.n)
                .map((v) => (
                  <DefRow key={v.verdict} label={VERDICT_LABEL[v.verdict as Verdict]}>
                    <span className="mono">{num(v.n)}</span>
                    {MEETS_RULES.includes(v.verdict as Verdict) ? <span className="text-ink-45"> · passes</span> : null}
                  </DefRow>
                ))}
            </dl>
          </section>

          {c.topSponsors.length ? (
            <section className="mt-8" aria-labelledby="sponsors">
              <h2 id="sponsors" className="border-b-2 border-ink pb-2 text-[1.125rem]">
                Sponsors advertising here
              </h2>
              <Ledger className="border-t-0">
                {c.topSponsors.map((s) => (
                  <LedgerRow key={s.id} href={`/sponsors/${s.id}`} title={titleCase(s.rawName)} figures={[{ value: `${num(s.meeting)} of ${num(s.live)}`, label: plural(s.live, "role") + " pass" }]} />
                ))}
              </Ledger>
            </section>
          ) : null}

          <section className="mt-8" aria-labelledby="register">
            <h2 id="register" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              On the register
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
              A licence is held by the organisation, not the site. An employer registered in {c.city} can sponsor a role anywhere in the UK, and a
              role in {c.city} can be sponsored by an employer registered elsewhere.
            </p>
            <Link href={`/sponsors?q=${encodeURIComponent(c.city)}`} className="btn-secondary mt-4 h-10 text-[0.9375rem]">
              Sponsors registered in {c.city}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
