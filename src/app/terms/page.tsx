import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms", description: "Terms of use for COSjobs." };

const UPDATED = "17 September 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Terms of use</h1>
        <p className="mono mt-2 text-[0.8125rem] text-ink-45">Updated {UPDATED}</p>
      </div>
      <div className="prose-body mt-6 max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">
        <p>These terms apply to your use of cosjobs.co.uk. By using the site you agree to them.</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">1. What the service is</h2>
        <p>
          COSjobs is an independent information service. It reads published Home Office data and public job adverts and reports whether an advertised role appears to meet the Skilled Worker rules on a stated date. It is not part of, and is not endorsed by, the Home Office or UK Visas and Immigration.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">2. What it is not</h2>
        <p>
          Nothing on the site is immigration advice. A verdict is our reading of published rules applied to an advert. It is not a promise that an employer will sponsor you, that an application will succeed, or that the rules have not changed. We do not issue, sell or obtain certificates of sponsorship.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">3. Accuracy</h2>
        <p>
          We take care with the data and show its sources and dates, but adverts change, the register changes and the rules change. Check GOV.UK and the employer before you act. We are not liable for loss arising from reliance on a verdict, to the extent the law allows.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">4. Paid plans</h2>
        <p>
          Plans are billed monthly in advance and cancel from your account page. Cancelling stops the next charge; the current month runs to its end. Prices are shown on the <Link href="/pricing">pricing</Link> page and include VAT where it applies.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">5. Acceptable use</h2>
        <p>
          Do not scrape the site at a rate that harms it, resell its data, or use it to make decisions about individuals other than yourself. Employer data is Crown copyright, reused under the Open Government Licence.
        </p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">6. Changes</h2>
        <p>We may change these terms. The date at the top is the date of the current version.</p>
        <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.25rem]">7. Law</h2>
        <p>These terms are governed by the law of England and Wales.</p>
      </div>
    </div>
  );
}
