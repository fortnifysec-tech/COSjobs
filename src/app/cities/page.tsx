import type { Metadata } from "next";
import Link from "next/link";
import { BrowseNav } from "@/components/browse-nav";
import { cityIndex } from "@/lib/data/browse";
import { num } from "@/lib/format";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Jobs by town and city",
  description: "Sponsored roles by town, with how many pass the Skilled Worker rules and how many licensed sponsors are registered there.",
};

export default async function CitiesPage() {
  const cities = await cityIndex();
  const major = cities.filter((c) => c.live >= 5);
  const rest = cities.filter((c) => c.live < 5);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
      <BrowseNav current="/cities" />
      <div className="mt-8 border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Towns and cities</h1>
        <p className="prose-lede mt-3 max-w-[62ch]">
          Where the roles we hold are based, and how many licensed sponsors give that town as their address on the
          register. A sponsor’s registered town is often a head office, so a London count includes employers with
          sites across the country.
        </p>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {major.map((c) => (
          <li key={c.slug}>
            <Link href={`/cities/${c.slug}`} className="card card-link h-full">
              <p className="text-[1.125rem] font-bold leading-snug text-ink">{c.city}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t hairline pt-3">
                <div>
                  <dd className="mono text-[1.125rem] leading-none text-ink">{num(c.meeting)}</dd>
                  <dt className="mt-1 text-[0.75rem] leading-tight text-ink-45">pass</dt>
                </div>
                <div>
                  <dd className="mono text-[1.125rem] leading-none text-ink-70">{num(c.live)}</dd>
                  <dt className="mt-1 text-[0.75rem] leading-tight text-ink-45">live</dt>
                </div>
                <div>
                  <dd className="mono text-[1.125rem] leading-none text-ink-70">{num(c.sponsorsInTown)}</dd>
                  <dt className="mt-1 text-[0.75rem] leading-tight text-ink-45">sponsors</dt>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>

      {rest.length ? (
        <section className="mt-10" aria-labelledby="more">
          <h2 id="more" className="text-[1.125rem]">
            Fewer than five roles
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
            {rest.map((c) => (
              <li key={c.slug}>
                <Link href={`/cities/${c.slug}`} className="text-ink">
                  {c.city}
                </Link>
                <span className="mono ml-1 text-[0.8125rem] text-ink-45">
                  {c.meeting}/{c.live}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cities.length === 0 ? <p className="mt-4 text-ink-70">No roles yet.</p> : null}
      <p className="mt-8 text-[0.875rem] text-ink-45">
        Remote roles are not listed by town.{" "}
        <Link href="/jobs" className="text-ink-70">
          Search every role
        </Link>
        .
      </p>
    </div>
  );
}
