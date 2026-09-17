import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Report a wrong record, ask about a plan, or tell us about an employer that is missing.",
};

const EMAIL = "hello@cosjobs.co.uk";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Contact</h1>
      </div>
      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <div className="prose-body max-w-[60ch] space-y-4 text-[1.0625rem] leading-relaxed">
          <p>
            Write to <a href={`mailto:${EMAIL}`} className="mono text-ink">{EMAIL}</a>. We read everything and reply to anything that needs one, usually within two working days.
          </p>
          <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">A record is wrong</h2>
          <p>
            Send the link to the role. Say which check you think is wrong and, if you can, why: the register entry you found, the code you think applies, the salary the employer confirmed. We re-run the checks and reply with what changed and what did not.
          </p>
          <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">An employer is missing or misnamed</h2>
          <p>
            Tell us the trading name and the legal name on the register. We add the alias and re-assess every open role from that employer.
          </p>
          <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Plans and payments</h2>
          <p>
            Every plan is month to month and cancels from your <Link href="/sign-in">account page</Link> in one click. If a payment went wrong, include the email you subscribed with and the date.
          </p>
          <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Employers</h2>
          <p>
            We do not sell listings or placement. If your roles are on a public careers site we can read, tell us and we will add it to the daily run.
          </p>
        </div>
        <aside className="inset self-start">
          <p className="text-[0.9375rem] leading-relaxed text-ink-70">
            We cannot advise on your own immigration case, and we cannot obtain a certificate of sponsorship for anyone. For advice, use a regulated immigration adviser or solicitor. The rules are on GOV.UK and we link to them from every record.
          </p>
        </aside>
      </div>
    </div>
  );
}
