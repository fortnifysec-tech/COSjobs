import type { Metadata } from "next";
import Link from "next/link";
import { BrowseNav } from "@/components/browse-nav";
import { Ledger, LedgerRow } from "@/components/ledger";
import { occupationIndex } from "@/lib/data/browse";
import { money, num } from "@/lib/format";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Occupation codes",
  description:
    "Every SOC 2020 occupation code in Appendix Skilled Occupations, with its going rate, the salary a role must meet, and how many live roles under that code pass the rules today.",
};

export default async function OccupationsPage() {
  const { items, general } = await occupationIndex();
  const withRoles = items.filter((i) => i.live > 0);
  const eligible = items.filter((i) => i.live === 0 && i.eligible);
  const ineligible = items.filter((i) => i.live === 0 && !i.eligible);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
      <BrowseNav current="/occupations" />
      <div className="mt-8 border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Occupation codes</h1>
        <p className="prose-lede mt-3 max-w-[62ch]">
          A Skilled Worker role is sponsored under a SOC 2020 occupation code, and the code sets the going rate. The
          salary must meet the higher of that rate and the general threshold of {money(general)}. This page lists every
          code in Appendix Skilled Occupations with the figure a role under it has to reach.
        </p>
      </div>

      <section className="mt-8" aria-labelledby="with-roles">
        <h2 id="with-roles" className="text-[1.25rem]">
          Codes with live roles
        </h2>
        <p className="mt-1 text-[0.9375rem] text-ink-70">Ordered by how many roles we hold under each code.</p>
        <Ledger className="mt-4">
          {withRoles.map((o) => (
            <LedgerRow
              key={o.socCode}
              href={`/occupations/${o.socCode}`}
              lead={o.socCode}
              title={o.title}
              note={o.payScale ? "National pay scale" : `Going rate ${money(o.goingRateAnnual)} · must meet ${money(o.required ?? general)}${o.isTsl ? " · Temporary Shortage List" : ""}${!o.eligible ? " · below RQF 6, not eligible" : ""}`}
              figures={[
                { value: num(o.meeting), label: "meet the rules" },
                { value: num(o.live), label: "live roles", muted: true },
              ]}
            />
          ))}
        </Ledger>
        {withRoles.length === 0 ? <p className="mt-4 text-ink-70">No live roles yet. Run the ingestion to fill this list.</p> : null}
      </section>

      <details className="group mt-12" open={withRoles.length === 0}>
        <summary className="cursor-pointer list-none border-b-2 border-ink pb-2">
          <h2 id="eligible" className="text-[1.25rem]">
            Eligible codes with no live roles today <span className="mono text-[0.9375rem] font-normal text-ink-45">{num(eligible.length)}</span>
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-70">
            RQF level 6 or above, or on a shortage list. A role under any of these can qualify if the salary and the licence check out.
            <span className="ml-2 text-ink underline underline-offset-4 group-open:hidden">Show the list</span>
            <span className="ml-2 hidden text-ink underline underline-offset-4 group-open:inline">Hide the list</span>
          </p>
        </summary>
        <Ledger className="mt-4 border-t-0">
          {eligible.map((o) => (
            <LedgerRow
              key={o.socCode}
              href={`/occupations/${o.socCode}`}
              lead={o.socCode}
              title={o.title}
              note={o.payScale ? "National pay scale" : `Going rate ${money(o.goingRateAnnual)}${o.isTsl ? " · Temporary Shortage List" : ""}`}
              figures={[{ value: o.payScale ? "Pay scale" : money(o.required ?? general), label: "must meet", muted: false }]}
            />
          ))}
        </Ledger>
      </details>

      <details className="group mt-12">
        <summary className="cursor-pointer list-none border-b-2 border-ink pb-2">
          <h2 id="ineligible" className="text-[1.25rem]">
            Codes below RQF 6 and not on a shortage list <span className="mono text-[0.9375rem] font-normal text-ink-45">{num(ineligible.length)}</span>
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-70">
            Since 22 July 2025 these codes are only open to people already on the route. A new applicant cannot be sponsored under them, whatever the salary.
            <span className="ml-2 text-ink underline underline-offset-4 group-open:hidden">Show the list</span>
            <span className="ml-2 hidden text-ink underline underline-offset-4 group-open:inline">Hide the list</span>
          </p>
        </summary>
        <Ledger className="mt-4 border-t-0">
          {ineligible.map((o) => (
            <LedgerRow key={o.socCode} href={`/occupations/${o.socCode}`} lead={o.socCode} title={o.title} note="Not eligible for new applicants" figures={[]} />
          ))}
        </Ledger>
      </details>

      <p className="mt-10 text-[0.875rem] text-ink-45">
        Source:{" "}
        <a href="https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations" rel="noopener" className="text-ink-70">
          Appendix Skilled Occupations
        </a>
        , read from GOV.UK. See <Link href="/how-it-works" className="text-ink-70">how we check</Link>.
      </p>
    </div>
  );
}
