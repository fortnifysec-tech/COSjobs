import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Questions and answers",
  description: "What a verdict means, why a role fails, how we read the register and what the plans include.",
};

const QA: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: "What does \"meets the rules\" mean?",
    a: "The employer holds an A-rated licence covering the Skilled Worker route, the role's occupation code is eligible, the advertised salary meets the higher of the general threshold and the going rate, and the advert does not refuse sponsorship. Confirmed means the advert also says sponsorship is offered. Likely means every rule passes but the advert is silent.",
    link: { href: "/how-it-works", label: "How we check" },
  },
  {
    q: "Does a passing verdict mean the employer will sponsor me?",
    a: "No. It means the role can lawfully be sponsored under the published rules on the date shown. Whether the employer sponsors you is their decision, made after they choose you. We do not issue, sell or obtain certificates of sponsorship.",
  },
  {
    q: "Why is a role marked below threshold when the top of the range would pass?",
    a: "The certificate carries one salary and the employer can issue it at the bottom of the range. We test the minimum so the verdict is true in the worst case.",
    link: { href: "/guides/salary-rules", label: "The salary rules" },
  },
  {
    q: "I am a new entrant. Do your figures apply to me?",
    a: "Not exactly. New entrants, relevant PhD holders and shortage list jobs have lower thresholds. We cannot tell from an advert whether you qualify, so every verdict uses the standard rule. The record shows the figure used; compare it with the discount you qualify for.",
  },
  {
    q: "Why is the salary \"not checked\" on NHS nursing and medical roles?",
    a: "Those occupation codes are paid on national pay scales, and the going rate is the pay band for the post rather than a single figure. We show the band the advert quotes and leave the salary rule unknown rather than guess.",
    link: { href: "/guides/nhs-jobs-and-sponsorship", label: "NHS jobs and sponsorship" },
  },
  {
    q: "The employer is not matched to the register. Are they unlicensed?",
    a: "Possibly, or they are licensed under a different legal name. We match after stripping company suffixes and keep aliases for common trading names, but we miss some. Search the sponsor list for the parent company before you give up.",
    link: { href: "/sponsors", label: "Search sponsors" },
  },
  {
    q: "Where do the roles come from?",
    a: "NHS Jobs, read through its public search interface and advert pages, and the career sites of employers on the register that publish their vacancies openly. Every role is re-read on each run and marked closed when it disappears or passes its closing date.",
  },
  {
    q: "How often is the register checked?",
    a: "Every morning. We download the published spreadsheet, compare it with the previous copy, and record every addition, removal, rating change and route change. Sponsor pages show the history.",
  },
  {
    q: "What does the sponsor band mean?",
    a: "Context, not a rule. It reflects how many roles the sponsor has advertised in the last 90 days, how many passed, and how long the licence has been on the register. A sponsor with no recent roles is band D even if its licence is fine.",
  },
  {
    q: "What do I get for £9.99?",
    a: "Searching and every verdict are free. Seeker adds the apply link, the full advert text, the complete evidence panel and alerts within the hour for new roles that pass your saved searches. Sponsor Watch, at £2.99, checks your own employer's licence every morning.",
    link: { href: "/pricing", label: "Pricing" },
  },
  {
    q: "Is this immigration advice?",
    a: "No. COSjobs is an independent information service and is not connected to the Home Office. The rules are published on GOV.UK and we link to them on every page. For advice on your own case use a regulated immigration adviser or solicitor.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QA.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Questions and answers</h1>
      </div>
      <dl className="mt-2 max-w-[74ch]">
        {QA.map((x) => (
          <div key={x.q} className="border-b hairline-soft py-5">
            <dt className="text-[1.125rem] font-bold leading-snug text-ink">{x.q}</dt>
            <dd className="prose-body mt-2 text-[1rem] leading-relaxed text-ink-70">
              {x.a}
              {x.link ? (
                <>
                  {" "}
                  <Link href={x.link.href} className="text-ink">
                    {x.link.label}
                  </Link>
                  .
                </>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
