import type { Metadata } from "next";
import Link from "next/link";
import { BrowseNav } from "@/components/browse-nav";
import { routeIndex, type RouteSummary } from "@/lib/data/browse";
import { num } from "@/lib/format";
import { ROUTE_GROUPS, routeInfo } from "@/lib/routes";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Sponsored visa routes",
  description:
    "Every sponsored work route on the register of licensed sponsors, grouped by who can use it, with how many employers hold a licence for each and which lead to settlement.",
};

export default async function VisaRoutesPage() {
  const routes = await routeIndex();
  const other = routes.filter((r) => !routeInfo(r.route));
  const skilled = routes.find((r) => r.route === "Skilled Worker");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
      <BrowseNav current="/visa" />
      <div className="mt-8 grid gap-8 border-b-2 border-ink pb-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div>
          <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Sponsored visa routes</h1>
          <p className="prose-lede mt-3 max-w-[58ch]">
            A sponsor licence names the routes an employer may sponsor on. The routes are grouped here by who can
            use them, because a licence for the wrong route is no use to a job seeker however good the employer.
          </p>
        </div>
        {skilled ? (
          <Link href="/visa/skilled-worker" className="card card-link self-start">
            <p className="text-[0.8125rem] text-ink-70">The route this site checks</p>
            <p className="mt-1 text-[1.125rem] font-bold text-ink">Skilled Worker</p>
            <dl className="mt-3 grid grid-cols-3 gap-3 border-t hairline pt-3">
              <Figure n={skilled.sponsors} label="licences" />
              <Figure n={skilled.live} label="live roles" />
              <Figure n={skilled.meeting} label="pass today" />
            </dl>
          </Link>
        ) : null}
      </div>

      {ROUTE_GROUPS.map((g) => {
        const items = routes.filter((r) => routeInfo(r.route)?.group === g.key);
        if (!items.length) return null;
        return (
          <section key={g.key} className="mt-10" aria-labelledby={`group-${g.key}`}>
            <h2 id={`group-${g.key}`} className="text-[1.25rem]">
              {g.title}
            </h2>
            <p className="mt-1 max-w-[70ch] text-[0.9375rem] text-ink-70">{g.lede}</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <RouteCard key={r.slug} r={r} />
              ))}
            </ul>
          </section>
        );
      })}

      {other.length ? (
        <section className="mt-10" aria-labelledby="other">
          <h2 id="other" className="text-[1.25rem]">
            Also on the register
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {other.map((r) => (
              <li key={r.slug}>
                <Link href={`/visa/${r.slug}`} className="card card-link h-full">
                  <p className="text-[1.0625rem] font-bold leading-snug text-ink">{r.route}</p>
                  <p className="mono mt-2 text-[0.875rem] text-ink-70">
                    {num(r.sponsors)} <span className="font-sans text-ink-45">licences</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-[0.875rem] text-ink-45">
        Licence counts are read from the{" "}
        <a href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" rel="noopener" className="text-ink-70">
          register of licensed sponsors
        </a>
        . Route descriptions are ours; the rules are on GOV.UK. See the <Link href="/guides" className="text-ink-70">guides</Link>.
      </p>
    </div>
  );
}

function Figure({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <dd className="mono text-[1.125rem] leading-none text-ink">{num(n)}</dd>
      <dt className="mt-1 text-[0.75rem] text-ink-45">{label}</dt>
    </div>
  );
}

function RouteCard({ r }: { r: RouteSummary }) {
  const info = routeInfo(r.route)!;
  const settlement = info.settlement === "yes" ? "Leads to settlement" : info.settlement === "some" ? "Settlement in some cases" : "No settlement";
  return (
    <li>
      <Link href={`/visa/${r.slug}`} className="card card-link flex h-full flex-col">
        <p className="text-[1.0625rem] font-bold leading-snug text-ink">{r.route}</p>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-snug text-ink-70">{info.summary}</p>
        <dl className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t hairline pt-3">
          <div className="flex gap-5">
            <Figure n={r.sponsors} label="licences" />
            {info.checked ? <Figure n={r.meeting} label="roles pass" /> : null}
          </div>
          <dd className={`text-[0.75rem] ${info.settlement === "yes" ? "text-ink" : "text-ink-45"}`}>{settlement}</dd>
        </dl>
      </Link>
    </li>
  );
}
