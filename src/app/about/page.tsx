import type { Metadata } from "next";
import Link from "next/link";
import { hasDatabase } from "@/db/client";
import { siteStats } from "@/lib/data/sponsors";
import { num, shortDateTime } from "@/lib/format";

/** Counts come from the database; re-render at most every 30 minutes. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "About",
  description: "What COSjobs does, where the data comes from, how often it is refreshed, and what it is not.",
};

export default async function AboutPage() {
  const stats = hasDatabase ? await siteStats().catch(() => null) : null;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="border-b-2 border-ink pb-4">
        <h1 className="text-[1.75rem] leading-tight sm:text-[2rem]">About COSjobs</h1>
      </div>
      <div className="prose-body mt-6 max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">
        <p>
          Most sponsorship job boards answer one question: is this employer on the register? That is the easy half. A licence belongs to the
          employer; eligibility belongs to the role. A licensed employer can advertise a job that cannot be sponsored because the occupation is
          the wrong level, the salary is under the going rate, or the advert says outright that sponsorship is not offered.
        </p>
        <p>
          COSjobs checks each advertised role against the published Skilled Worker rules, in the order the rules apply, and writes down the
          figures it used. The result is a record you can read before you spend an application on it.
        </p>
        <h2 className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">The data</h2>
        <p>
          The register of licensed sponsors, Appendix Skilled Occupations, the Immigration Salary List and the Temporary Shortage List are read
          from GOV.UK. Roles come from NHS Jobs and from the career sites of employers on the register. Every figure on a record links to the
          document it came from.
        </p>
        {stats ? (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t hairline pt-4 sm:grid-cols-4">
            <div>
              <dd className="mono text-[1.375rem] leading-none text-ink">{num(stats.sponsorsOnRegister)}</dd>
              <dt className="mt-1 text-[0.8125rem] text-ink-70">sponsors on the register</dt>
            </div>
            <div>
              <dd className="mono text-[1.375rem] leading-none text-ink">{num(stats.liveJobs)}</dd>
              <dt className="mt-1 text-[0.8125rem] text-ink-70">live roles checked</dt>
            </div>
            <div>
              <dd className="mono text-[1.375rem] leading-none text-ink">{num(stats.meetingJobs)}</dd>
              <dt className="mt-1 text-[0.8125rem] text-ink-70">meet the rules today</dt>
            </div>
            <div>
              <dd className="mono text-[1rem] leading-none text-ink">{stats.registerCheckedAt ? shortDateTime(stats.registerCheckedAt) : "not yet"}</dd>
              <dt className="mt-1 text-[0.8125rem] text-ink-70">register last read</dt>
            </div>
          </dl>
        ) : null}
        <h2 className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">How often</h2>
        <p>
          The register is read every morning and every change is kept. Roles are re-read daily, marked closed when they disappear, and re-assessed
          whenever the rules or the employer’s licence change. The rules version is stamped on every verdict.
        </p>
        <h2 className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">What it is not</h2>
        <p>
          COSjobs is independent. It is not part of, and is not endorsed by, the Home Office or UK Visas and Immigration. It does not issue, sell or
          obtain certificates of sponsorship, and nothing on it is immigration advice. A passing verdict means the role meets the published rules on
          the date shown; only the employer decides whether to sponsor you.
        </p>
        <h2 className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">How it pays for itself</h2>
        <p>
          Searching and every verdict are free. Job seekers who want the apply link, the full advert and alerts pay a monthly subscription. People
          already sponsored can pay a smaller amount to have their own employer’s licence watched. There is no advertising and no charge to employers,
          so the verdicts have no reason to lean either way. See <Link href="/pricing">pricing</Link>.
        </p>
        <h2 className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">Contact</h2>
        <p>
          Corrections and questions: <Link href="/contact">contact</Link>. If a record is wrong, say which one and we will re-run it and reply with what changed.
        </p>
      </div>
    </div>
  );
}
