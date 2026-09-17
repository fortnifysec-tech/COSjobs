import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobRow } from "@/components/job-row";
import { DefRow } from "@/components/ledger";
import { Pagination } from "@/components/pagination";
import { routeIndex } from "@/lib/data/browse";
import { listJobs } from "@/lib/data/jobs";
import { num, plural } from "@/lib/format";
import { routeInfo } from "@/lib/routes";

async function find(slug: string) {
  const routes = await routeIndex();
  return routes.find((r) => r.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/visa/[route]">): Promise<Metadata> {
  const { route } = await params;
  const r = await find(route);
  if (!r) return { title: "Route not found" };
  const info = routeInfo(r.route);
  return {
    title: `${r.route}: sponsors and roles`,
    description: info ? `${info.summary} ${num(r.sponsors)} employers hold a licence for this route.` : `${num(r.sponsors)} employers hold a licence for the ${r.route} route.`,
  };
}

export default async function RoutePage({ params, searchParams }: PageProps<"/visa/[route]">) {
  const { route } = await params;
  const sp = await searchParams;
  const r = await find(route);
  if (!r) notFound();
  const info = routeInfo(r.route);
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const roles = await listJobs({ route: r.route, rulesOnly: true, page });
  const now = new Date();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/visa" className="text-ink-70 hover:text-ink">
          Sponsored visa routes
        </Link>
      </p>
      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{r.route}</h1>
          {info ? (
            <>
              <p className="prose-lede mt-4 max-w-[58ch]">{info.summary}</p>
              <div className={`mt-6 ${info.checked ? "inset-stamp" : "inset"}`}>
                <p className="text-[0.9375rem] leading-relaxed text-ink">
                  {info.checked
                    ? "This is the route we check. Every role on this site is tested against its occupation, salary and licence rules, and the result is shown with the figures."
                    : "We do not check roles against this route's rules. Roles below are from employers whose licence includes it; each was tested against the Skilled Worker rules only."}
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-[0.9375rem] leading-relaxed text-ink-70">
                {info.notes.map((n) => (
                  <li key={n} className="border-l-2 border-rule pl-3">
                    {n}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="prose-lede mt-4 max-w-[58ch]">A route that appears on the register. We do not describe it yet; the rules are on GOV.UK.</p>
          )}

          <section className="mt-10" aria-labelledby="roles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
              <h2 id="roles" className="text-[1.125rem]">
                Passing roles from sponsors licensed for this route
              </h2>
              <p className="text-[0.875rem] text-ink-70">
                <span className="mono text-ink">{num(r.meeting)}</span> of <span className="mono text-ink">{num(r.live)}</span>
              </p>
            </div>
            {roles.items.length ? (
              <ul>
                {roles.items.map((j) => (
                  <JobRow key={j.id} job={j} now={now} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-ink-70">No passing roles from these sponsors right now.</p>
            )}
            <Pagination page={roles.page} pageCount={roles.pageCount} href={(p) => `/visa/${r.slug}?page=${p}`} />
          </section>
        </div>

        <aside className="min-w-0 md:pt-1">
          <section aria-labelledby="figures">
            <h2 id="figures" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              On the register
            </h2>
            <dl className="divide-y divide-rule-soft text-[0.9375rem]">
              <DefRow label="Licences">
                <span className="mono">{num(r.sponsors)}</span>
                <span className="block text-[0.875rem] text-ink-45">Active {plural(r.sponsors, "sponsor")} whose licence includes this route.</span>
              </DefRow>
              <DefRow label="Live roles">
                <span className="mono">{num(r.live)}</span>
              </DefRow>
              <DefRow label="Rules">
                {info ? (
                  <a href={info.govuk} rel="noopener" className="text-ink">
                    GOV.UK
                  </a>
                ) : (
                  "GOV.UK"
                )}
              </DefRow>
            </dl>
          </section>
          <section className="mt-8" aria-labelledby="find">
            <h2 id="find" className="border-b-2 border-ink pb-2 text-[1.125rem]">
              Find a sponsor
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
              Search the register by name or town. Each sponsor page lists the routes on its licence and every role we hold for it.
            </p>
            <Link href="/sponsors" className="btn-secondary mt-4 h-10 text-[0.9375rem]">
              Browse sponsors
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
