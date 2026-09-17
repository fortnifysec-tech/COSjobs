import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy", description: "What COSjobs collects, why, and how long it is kept." };

const UPDATED = "17 September 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Privacy</h1>
        <p className="mono mt-2 text-[0.8125rem] text-ink-45">Updated {UPDATED}</p>
      </div>
      <div className="prose-body mt-6 max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">
        <h2 className="mt-2 border-b-2 border-ink pb-2 text-[1.25rem]">Searching without an account</h2>
        <p>We keep standard server logs, including IP address and pages requested, for up to 30 days to run and secure the site. We do not use advertising trackers.</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">With an account</h2>
        <p>
          We hold your email address, your saved searches and alert settings, and your plan. Payments are taken by Stripe; we see the last four digits of the card and the payment status, never the full number. Emails are sent through Resend.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Sponsor Watch</h2>
        <p>We store the name of the employer you ask us to watch. We do not tell the employer.</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Why we process it</h2>
        <p>To provide the service you asked for (contract), to keep the site secure (legitimate interest), and to send alerts you turned on (consent, withdrawn from your account page).</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">How long</h2>
        <p>Account data is deleted 90 days after you close the account. Payment records are kept for six years as tax law requires.</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Your rights</h2>
        <p>
          You can ask for a copy of your data, correct it, or have it deleted by <Link href="/contact">contacting us</Link>. You can complain to the Information Commissioner’s Office.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">Employer data</h2>
        <p>Sponsor names and towns are published by the Home Office and are Crown copyright. Job adverts are public. We keep no personal data about the people named as contacts in adverts.</p>
      </div>
    </div>
  );
}
