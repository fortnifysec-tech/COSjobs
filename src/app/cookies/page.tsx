import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookies", description: "The cookies COSjobs sets and what they do." };

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">Cookies</h1>
      </div>
      <div className="prose-body mt-6 max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">
        <p>Searching the site sets no cookies. There are no advertising or analytics cookies anywhere on it.</p>
        <p>When you sign in, a session cookie keeps you signed in. It is essential to the service, so no consent banner is shown for it. It is removed when you sign out or after it expires.</p>
        <p>Stripe may set its own cookies on the payment page to detect fraud. Stripe’s cookie policy covers those.</p>
      </div>
    </div>
  );
}
