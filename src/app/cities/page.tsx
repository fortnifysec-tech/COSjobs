import type { Metadata } from "next";
import Link from "next/link";
import { Ledger, LedgerRow } from "@/components/ledger";
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
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Towns and cities</h1>
        <p className="prose-lede mt-3 max-w-[62ch]">
          Where the roles we hold are based, and how many licensed sponsors give that town as their address on the
          register. A sponsor’s registered town is often a head office, so a London count includes employers with
          sites across the country.
        </p>
      </div>
      <Ledger className="mt-6">
        {cities.map((c) => (
          <LedgerRow
            key={c.slug}
            href={`/cities/${c.slug}`}
            title={c.city}
            figures={[
              { value: num(c.meeting), label: "meet the rules" },
              { value: num(c.live), label: "live roles", muted: true },
              { value: num(c.sponsorsInTown), label: "sponsors registered", muted: true },
            ]}
          />
        ))}
      </Ledger>
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
