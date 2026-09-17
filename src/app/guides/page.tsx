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
      <ul className="mt-2">
        {GUIDES.map((g) => (
          <li key={g.slug} className="border-b hairline-soft py-5">
            <h2 className="text-[1.25rem] leading-snug">
              <Link href={`/guides/${g.slug}`} className="text-ink no-underline hover:underline">
                {g.title}
              </Link>
            </h2>
            <p className="mt-1 max-w-[70ch] text-[0.9375rem] leading-relaxed text-ink-70">{g.summary}</p>
            <p className="mono mt-2 text-[0.75rem] text-ink-45">Checked {longDate(g.checked)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
