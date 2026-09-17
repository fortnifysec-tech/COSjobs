import type { Metadata } from "next";
import Link from "next/link";
import { BrowseNav } from "@/components/browse-nav";
import { Ledger, LedgerRow } from "@/components/ledger";
import { routeIndex, type RouteSummary } from "@/lib/data/browse";
import { num } from "@/lib/format";
import { ROUTE_GROUPS, routeInfo } from "@/lib/routes";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Sponsored visa routes",
  description:
    "Every sponsored work route on the register of licensed sponsors, with how many employers hold a licence for it and which routes a job seeker can actually use.",
};

export default async function VisaRoutesPage() {
  const routes = await routeIndex();
  const other = routes.filter((r) => !routeInfo(r.route));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
      <BrowseNav current="/visa" />
      <div className="mt-8 border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Sponsored visa routes</h1>
        <p className="prose-lede mt-3 max-w-[62ch]">
          A sponsor licence names the routes an employer may sponsor on. Most licences cover the Skilled Worker route,
          which is the only one this site checks role by role. The others are listed so you can tell, from a
          sponsor’s page, whether a licence is any use to you.
        </p>
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
            <Ledger className="mt-4">
              {items.map((r) => (
                <RouteRow key={r.slug} r={r} />
              ))}
            </Ledger>
          </section>
        );
      })}

      {other.length ? (
        <section className="mt-10" aria-labelledby="other">
          <h2 id="other" className="text-[1.125rem]">
            Also on the register
          </h2>
          <Ledger className="mt-3">
            {other.map((r) => (
              <LedgerRow key={r.slug} href={`/visa/${r.slug}`} title={r.route} figures={[{ value: num(r.sponsors), label: "licences" }]} />
            ))}
          </Ledger>
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

function RouteRow({ r }: { r: RouteSummary }) {
  const info = routeInfo(r.route)!;
  const settlement = info.settlement === "yes" ? "Leads to settlement" : info.settlement === "some" ? "Settlement in some cases" : "No settlement";
  return (
    <LedgerRow
      href={`/visa/${r.slug}`}
      title={r.route}
      note={`${info.summary} ${settlement}.`}
      figures={[
        { value: num(r.sponsors), label: "licences" },
        { value: num(r.meeting), label: "roles pass", muted: !info.checked },
      ]}
    />
  );
}
