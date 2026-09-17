import type { Metadata } from "next";
import Link from "next/link";
import { BrowseNav } from "@/components/browse-nav";
import { longDate } from "@/lib/format";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description: "Plain-English guides to the Skilled Worker rules, costs, the sponsor register and NHS sponsorship. Figures checked against GOV.UK on the date shown.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:py-8">
      <BrowseNav current="/guides" />
      <div className="mt-8 border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Guides</h1>
        <p className="prose-lede mt-3 max-w-[62ch]">
          Short, factual and dated. Each guide lists the GOV.UK pages it was checked against. None of it is immigration advice.
        </p>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="card card-link flex h-full flex-col">
              <h2 className="text-[1.125rem] leading-snug text-ink">{g.title}</h2>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-snug text-ink-70">{g.summary}</p>
              <p className="mono mt-4 border-t hairline pt-3 text-[0.75rem] text-ink-45">
                {g.toc.length} sections · checked {longDate(g.checked)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/how-it-works" className="card card-link">
          <p className="text-[1.0625rem] font-bold text-ink">How we check a role</p>
          <p className="mt-1 text-[0.9375rem] text-ink-70">The five checks, in the order they run, with the figures in force.</p>
        </Link>
        <Link href="/faq" className="card card-link">
          <p className="text-[1.0625rem] font-bold text-ink">Questions and answers</p>
          <p className="mt-1 text-[0.9375rem] text-ink-70">What a verdict means, why roles fail, and what the plans include.</p>
        </Link>
      </div>
    </div>
  );
}
