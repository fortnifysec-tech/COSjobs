import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/jobs";
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="max-w-[34rem]">
        <h1 className="text-[1.875rem] leading-tight">Sign in</h1>
        <p className="prose-lede mt-3">
          Accounts open when the beta ends. Until then every search, verdict and sponsor page is free to read, and
          nothing here needs a login.
        </p>
        <div className="inset mt-6">
          <p className="text-[0.9375rem] text-ink-70">
            Seeker, Seeker Plus and Sponsor Watch are described on the{" "}
            <Link href="/pricing" className="text-ink">
              pricing page
            </Link>
            . Apply links are the employer&rsquo;s own; nothing is sold on this site while the beta runs.
          </p>
        </div>
        <p className="mt-6 text-[0.9375rem] text-ink-70">
          <Link href={next} className="text-ink">
            Back to what you were reading
          </Link>
        </p>
      </div>
    </div>
  );
}
