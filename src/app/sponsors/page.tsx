import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { BAND_LABEL, BandBadge } from "@/components/ui/badges";
import type { Band } from "@/lib/eligibility/scoring";
import { listSponsors, siteStats } from "@/lib/data/sponsors";
import { num, plural, shortDateTime, titleCase } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "Employers on the Home Office register of licensed sponsors, with their rating, routes and how often their roles pass the rules.",
};

const BANDS: Band[] = ["A", "B", "C", "D", "NEW"];

export default async function SponsorsPage({ searchParams }: PageProps<"/sponsors">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() || undefined;
  const bandRaw = Array.isArray(sp.band) ? sp.band[0] : sp.band;
  const band = BANDS.includes(bandRaw as Band) ? (bandRaw as Band) : undefined;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const [result, stats] = await Promise.all([listSponsors({ q, band, page }), siteStats().catch(() => null)]);

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (band) u.set("band", band);
    u.set("page", String(p));
    return `/sponsors?${u.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Sponsors</h1>
        <p className="prose-lede mt-2 max-w-[60ch] text-[1.0625rem]">
          Every employer we have matched to the register. The band is our own measure of how often their advertised
          roles pass the rules. It is context, not a rule, and it is recomputed every morning.
        </p>
      </div>

      <form action="/sponsors" method="get" className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <label className="block">
          <span className="field-label">Employer or town</span>
          <input name="q" type="search" defaultValue={q ?? ""} placeholder="e.g. NHS, Manchester" className="field" />
        </label>
        <label className="block">
          <span className="field-label">Activity band</span>
          <select name="band" defaultValue={band ?? ""} className="field">
            <option value="">Any band</option>
            {BANDS.map((b) => (
              <option key={b} value={b}>
                {b} {BAND_LABEL[b]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="btn w-full sm:w-auto">
            Search
          </button>
        </div>
      </form>

      <p className="mt-8 text-[0.9375rem] text-ink">
        {plural(result.total, "sponsor")}
        {q || band ? " match" : ""}
        {result.pageCount > 1 ? (
          <span className="text-ink-70">
            , page <span className="mono">{result.page}</span> of <span className="mono">{result.pageCount}</span>
          </span>
        ) : null}
      </p>

      <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_7rem_5rem_9rem_11rem] gap-x-6 border-b-2 border-ink px-2 pb-2 text-[0.8125rem] text-ink-70 md:grid">
        <span>Employer</span>
        <span>Rating</span>
        <span className="text-right">Live roles</span>
        <span className="text-right">Meet the rules</span>
        <span className="text-right">Band</span>
      </div>
      <ul className="border-t-2 border-ink md:border-t-0">
        {result.items.map((s) => (
          <li key={s.id} className="border-b hairline-soft">
            <Link
              href={`/sponsors/${s.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1.5 py-3.5 no-underline hover:bg-card md:grid-cols-[minmax(0,1fr)_7rem_5rem_9rem_11rem] md:items-baseline md:px-2"
            >
              <span className="min-w-0">
                <span className="block text-[1rem] font-medium leading-snug text-ink">{titleCase(s.name)}</span>
                <span className="block text-[0.875rem] text-ink-70">
                  {s.town ?? "Town not given"}
                  <span className="text-ink-45"> · </span>
                  {s.routes.length === 1 ? s.routes[0] : `${s.routes.length} routes`}
                  {!s.isActive ? <span className="text-flag"> · removed from register</span> : null}
                </span>
              </span>
              <span className="text-[0.9375rem] text-ink">
                <span className="mono">{s.rating ?? "–"}</span>
                {s.rating === "B" ? <span className="text-flag"> restricted</span> : null}
              </span>
              <span className="mono text-[0.9375rem] text-ink md:text-right">
                <span className="text-[0.8125rem] text-ink-70 md:hidden">Live </span>
                {num(s.liveRoles)}
              </span>
              <span className="mono text-[0.9375rem] text-ink md:text-right">
                <span className="text-[0.8125rem] text-ink-70 md:hidden">Pass </span>
                {num(s.meetingRoles)}
              </span>
              <span className="col-span-2 flex md:col-span-1 md:justify-end">{s.band ? <BandBadge band={s.band} /> : null}</span>
            </Link>
          </li>
        ))}
      </ul>

      {result.items.length === 0 ? (
        <p className="mt-6 max-w-[56ch] text-[0.9375rem] text-ink-70">
          No sponsor matches. The register uses legal names, so try the company name without &ldquo;Ltd&rdquo; or a
          brand, or search by town.{" "}
          <Link href="/sponsors" className="text-ink">
            Show every sponsor.
          </Link>
        </p>
      ) : null}

      <Pagination page={result.page} pageCount={result.pageCount} href={href} />

      <p className="mt-10 max-w-[70ch] text-[0.8125rem] text-ink-45">
        Register data is the Home Office list of licensed sponsors for workers, downloaded daily. Bands are computed
        from roles we have seen, so an employer that advertises elsewhere may show as low activity.
        {stats?.registerCheckedAt ? ` Register last read ${shortDateTime(stats.registerCheckedAt)}.` : ""}
      </p>
    </div>
  );
}
