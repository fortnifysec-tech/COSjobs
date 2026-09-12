import type { Metadata } from "next";
import Link from "next/link";
import { JobRow } from "@/components/job-row";
import { Pagination } from "@/components/pagination";
import { VERDICT_LABEL } from "@/components/ui/badges";
import { ALL_VERDICTS, jobFacets, listJobs, parseFilters, POSTED_WINDOWS, ROUTES, type JobFilters } from "@/lib/data/jobs";
import { num, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Every live role, checked against the Skilled Worker rules. Filter by occupation code, salary, town and verdict.",
};

const SALARY_STEPS = [30000, 35000, 41700, 45000, 50000, 60000, 70000, 85000, 100000];

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const now = new Date();
  const [result, facets] = await Promise.all([listJobs(filters), jobFacets()]);

  const active = describeFilters(filters, facets.occupations);
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page" || v === undefined) continue;
      for (const item of Array.isArray(v) ? v : [v]) q.append(k, item);
    }
    q.set("page", String(p));
    return `/jobs?${q.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Jobs</h1>
        <p className="text-[0.9375rem] text-ink-70">
          <span className="mono text-ink">{num(result.totalMeeting)}</span> of{" "}
          <span className="mono text-ink">{num(result.totalAll)}</span> live roles meet the rules
          {active.length ? " for this search" : ""}.
        </p>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-12">
        <aside>
          <form action="/jobs" method="get" className="space-y-5">
            <input type="hidden" name="all" value="1" />

            <label className="block">
              <span className="field-label">Title or employer</span>
              <input name="q" type="search" defaultValue={filters.q ?? ""} placeholder="e.g. nurse, Arup" className="field" />
            </label>

            <label className="block">
              <span className="field-label">Town or city</span>
              <input name="city" type="text" defaultValue={filters.city ?? ""} list="cities" placeholder="Anywhere" className="field" />
              <datalist id="cities">
                {facets.cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="field-label">Occupation code</span>
              <select name="soc" defaultValue={filters.soc?.[0] ?? ""} className="field">
                <option value="">Any occupation</option>
                {facets.occupations.map((o) => (
                  <option key={o.socCode} value={o.socCode}>
                    {o.socCode} {o.title}
                    {o.isTsl ? " (shortage list)" : o.rqfLevel < 6 ? " (not eligible)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="field-label">Salary at least</span>
              <select name="salary_min" defaultValue={filters.salaryMin ?? ""} className="field">
                <option value="">Any salary</option>
                {SALARY_STEPS.map((s) => (
                  <option key={s} value={s}>
                    £{num(s)}
                    {s === 41700 ? " (general threshold)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="field-label">Posted</span>
              <select name="posted" defaultValue={filters.postedDays ?? ""} className="field">
                <option value="">Any time</option>
                {Object.entries(POSTED_WINDOWS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="field-label">Licence route</span>
              <select name="route" defaultValue={filters.route ?? ""} className="field">
                <option value="">Any route</option>
                {ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="border-t hairline pt-4">
              <legend className="field-label">Verdict</legend>
              <div className="mt-1 space-y-2">
                {ALL_VERDICTS.map((v) => (
                  <label key={v} className="flex items-center gap-2.5 text-[0.9375rem] text-ink">
                    <input type="checkbox" name="verdict" value={v} defaultChecked={filters.verdicts?.includes(v) ?? false} className="check" />
                    {VERDICT_LABEL[v]}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-2.5 border-t hairline pt-4 text-[0.9375rem] text-ink">
              <input type="checkbox" name="meets" value="1" defaultChecked={filters.rulesOnly} className="check" />
              Only roles that meet the rules
            </label>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <button type="submit" className="btn">
                Apply filters
              </button>
              {active.length ? (
                <Link href="/jobs" className="text-[0.9375rem] text-ink">
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </aside>

        <section aria-label="Results">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3">
            <p className="text-[0.9375rem] text-ink">
              {plural(result.total, "role")}
              {filters.rulesOnly ? " that meet the rules" : ", including failed checks"}
              {result.pageCount > 1 ? (
                <span className="text-ink-70">
                  , page <span className="mono">{result.page}</span> of <span className="mono">{result.pageCount}</span>
                </span>
              ) : null}
            </p>
            {filters.rulesOnly && result.totalAll > result.totalMeeting ? (
              <Link href={toggleHref(sp, false)} className="text-[0.875rem] text-ink-70 hover:text-ink">
                Show the {num(result.totalAll - result.totalMeeting)} that fail
              </Link>
            ) : !filters.rulesOnly && result.totalMeeting > 0 ? (
              <Link href={toggleHref(sp, true)} className="text-[0.875rem] text-ink-70 hover:text-ink">
                Hide the {num(result.totalAll - result.totalMeeting)} that fail
              </Link>
            ) : null}
          </div>

          {active.length ? (
            <ul className="mb-3 flex flex-wrap gap-2 text-[0.8125rem] text-ink-70">
              {active.map((a) => (
                <li key={a} className="border hairline px-2 py-0.5">
                  {a}
                </li>
              ))}
            </ul>
          ) : null}

          {result.items.length ? (
            <ul className="border-t-2 border-ink">
              {result.items.map((job) => (
                <JobRow key={job.id} job={job} now={now} />
              ))}
            </ul>
          ) : (
            <div className="border-t-2 border-ink pt-6">
              <p className="text-[1.0625rem] font-medium">No roles match.</p>
              <p className="mt-2 max-w-[56ch] text-[0.9375rem] text-ink-70">
                {filters.rulesOnly && result.totalAll > 0
                  ? `${plural(result.totalAll, "role matches", "roles match")} the search but none passes every check. `
                  : "Try a broader title, drop the town, or lower the salary floor. "}
                {filters.rulesOnly && result.totalAll > 0 ? (
                  <Link href={toggleHref(sp, false)} className="text-ink">
                    Show them with the failed check named.
                  </Link>
                ) : (
                  <Link href="/jobs" className="text-ink">
                    Start again with no filters.
                  </Link>
                )}
              </p>
            </div>
          )}

          <Pagination page={result.page} pageCount={result.pageCount} href={href} />
        </section>
      </div>
    </div>
  );
}

function toggleHref(sp: Record<string, string | string[] | undefined>, rulesOnly: boolean) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || k === "meets" || k === "all" || v === undefined) continue;
    for (const item of Array.isArray(v) ? v : [v]) q.append(k, item);
  }
  q.set("all", "1");
  if (rulesOnly) q.set("meets", "1");
  return `/jobs?${q.toString()}`;
}

function describeFilters(f: JobFilters, occ: { socCode: string; title: string }[]): string[] {
  const out: string[] = [];
  if (f.q) out.push(`“${f.q}”`);
  if (f.city) out.push(f.city);
  for (const s of f.soc ?? []) out.push(`SOC ${s} ${occ.find((o) => o.socCode === s)?.title ?? ""}`.trim());
  if (f.salaryMin) out.push(`£${num(f.salaryMin)} or more`);
  if (f.postedDays) out.push(POSTED_WINDOWS[String(f.postedDays) as keyof typeof POSTED_WINDOWS].toLowerCase());
  if (f.route) out.push(f.route);
  for (const v of f.verdicts ?? []) out.push(VERDICT_LABEL[v]);
  return out;
}
