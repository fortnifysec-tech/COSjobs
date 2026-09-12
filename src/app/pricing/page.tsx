import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Search is free. Seeker adds apply links and alerts from £9.99 a month. Sponsor Watch keeps an eye on your own employer's licence for £2.99.",
};

const INCLUDED: { feature: string; free: boolean | string; seeker: boolean | string; plus: boolean | string }[] = [
  { feature: "Search every live role", free: true, seeker: true, plus: true },
  { feature: "Verdict and failed check on every role", free: true, seeker: true, plus: true },
  { feature: "Sponsor band and register entry", free: true, seeker: true, plus: true },
  { feature: "Full evidence panel with figures", free: "Summary", seeker: true, plus: true },
  { feature: "Apply link to the employer's page", free: false, seeker: true, plus: true },
  { feature: "Full advert text", free: false, seeker: true, plus: true },
  { feature: "Email alerts for new roles that pass", free: false, seeker: "Within the hour", plus: "Within the hour" },
  { feature: "Saved searches", free: false, seeker: "3", plus: "Unlimited" },
  { feature: "CV tailored to the advert wording", free: false, seeker: false, plus: true },
  { feature: "Application pipeline", free: false, seeker: false, plus: true },
  { feature: "New sponsors 24 hours before Seeker", free: false, seeker: false, plus: true },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <span aria-label="Included">Yes</span>;
  if (v === false) return <span className="text-ink-45" aria-label="Not included">–</span>;
  return <span>{v}</span>;
}

export default function PricingPage() {
  const [free, seeker, plus, watch] = PLANS;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">Pricing</h1>
      <p className="prose-lede mt-4 max-w-[58ch]">
        Searching and reading verdicts costs nothing and needs no account. You pay for the apply link, the full
        advert and being told first. Every plan is month to month and you cancel from your account page.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-[0.9375rem]">
          <thead>
            <tr className="border-b-2 border-ink text-left align-bottom">
              <th scope="col" className="w-[40%] pb-3 pr-4 font-normal text-ink-70">
                What you get
              </th>
              {[free, seeker, plus].map((p) => (
                <th key={p.id} scope="col" className="pb-3 pr-4">
                  <span className="block text-[1.0625rem] font-bold">{p.name}</span>
                  <span className="mono block text-[1.25rem] font-normal">{p.price}</span>
                  <span className="block text-[0.8125rem] font-normal text-ink-70">{p.per || "no account needed"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule-soft">
            {INCLUDED.map((row) => (
              <tr key={row.feature}>
                <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink">
                  {row.feature}
                </th>
                <td className="py-2.5 pr-4">
                  <Cell v={row.free} />
                </td>
                <td className="py-2.5 pr-4">
                  <Cell v={row.seeker} />
                </td>
                <td className="py-2.5 pr-4">
                  <Cell v={row.plus} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-ink">
              <td className="pt-4" />
              <td className="pt-4 pr-4">
                <Link href="/jobs" className="btn-secondary h-10 text-[0.9375rem]">
                  Search
                </Link>
              </td>
              <td className="pt-4 pr-4">
                <Link href="/sign-in?plan=seeker" className="btn h-10 text-[0.9375rem]">
                  Start Seeker
                </Link>
              </td>
              <td className="pt-4 pr-4">
                <Link href="/sign-in?plan=plus" className="btn h-10 text-[0.9375rem]">
                  Start Seeker Plus
                </Link>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 text-[0.8125rem] text-ink-45">
        Seeker is also available at £3.99 a week or £24.99 a quarter. Seeker Plus at £39.99 a quarter. Prices include
        VAT.
      </p>

      <section id="watch" className="mt-14 grid gap-8 border-t-2 border-ink pt-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div>
          <h2 className="text-[1.5rem] leading-tight">
            {watch.name} <span className="mono ml-2 text-[1.125rem] font-normal">{watch.price} {watch.per}</span>
          </h2>
          <p className="prose-lede mt-3 max-w-[52ch] text-[1.0625rem]">{watch.what}</p>
          <p className="mt-3 max-w-[56ch] text-[0.9375rem] text-ink-70">
            For people already sponsored. If your employer is downgraded or removed you have 60 days to find a new
            sponsor, and most people find out late. We tell you the morning it happens.
          </p>
          <Link href="/sign-in?plan=watch" className="btn mt-5">
            Start Sponsor Watch
          </Link>
        </div>
        <dl className="divide-y divide-rule-soft self-start text-[0.9375rem]">
          {[
            ["Checks", "Every morning after the register is published"],
            ["Watches", "Rating, routes, name, removal"],
            ["Tells you by", "Email, the same morning"],
            ["Includes", "A shortlist of open roles that pass, for your occupation code"],
            ["Does not include", "Apply links. Add Seeker for those."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 py-2.5">
              <dt className="text-[0.8125rem] text-ink-70">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 max-w-[64ch]">
        <h2 className="text-[1.25rem]">Plain answers</h2>
        <dl className="mt-4 divide-y divide-rule-soft">
          {[
            ["Do I need an account to search?", "No. Search, verdicts, evidence summaries and sponsor pages are open to everyone."],
            ["Can I cancel?", "Yes, from your account page, in one click. You keep access to the end of the period you paid for."],
            ["Is a passing role a guarantee of a visa?", "No. It means the role meets the published rules on the date shown. The employer decides whether to sponsor, and the Home Office decides the visa."],
            ["Do you sell certificates of sponsorship?", "No. Nobody legitimately does. Only a licensed employer can assign one, to a person they have decided to hire."],
            ["Why is the apply link paid for?", "It is how we pay for reading the register and re-running every role each morning without adverts or selling your details."],
          ].map(([q, a]) => (
            <div key={q} className="py-4">
              <dt className="text-[1rem] font-medium">{q}</dt>
              <dd className="mt-1 text-[0.9375rem] text-ink-70">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
