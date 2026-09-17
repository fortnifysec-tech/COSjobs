import type { Metadata } from "next";
import Link from "next/link";
import { hasDatabase } from "@/db/client";
import { siteStats } from "@/lib/data/sponsors";
import { isoDate, longDate, money } from "@/lib/format";

export const metadata: Metadata = {
  title: "How we check a role",
  description: "The five checks we run on every advertised role, in order, with the figures and sources we use.",
};

export default async function HowItWorksPage() {
  const stats = hasDatabase ? await siteStats().catch(() => null) : null;
  const rules = stats?.rulesVersion ? isoDate(stats.rulesVersion) : "2025-07-22";
  const general = stats?.generalThreshold ?? 41700;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <div className="grid gap-10 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] md:gap-16">
        <article className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">How we check a role</h1>
          <p className="prose-lede mt-4 max-w-[58ch]">
            Most sponsorship job boards answer one question: is this employer on the register? We answer a harder
            one: could this particular role, at this salary, be sponsored under the rules as they stand today? Here
            is exactly how, so you can check our working.
          </p>

          <div className="prose-body mt-8 max-w-[64ch]">
            <h2 id="order">The checks run in a fixed order</h2>
            <p>
              A role must pass all of them. The first failure stops the run, and the record names the check that
              failed. We do not weigh checks against each other or produce a score. The rules are pass or fail, so
              the verdict is too.
            </p>

            <h2 id="wording">1. Advert wording</h2>
            <p>
              We read the advert text for a sentence that refuses sponsorship. &ldquo;Unable to offer visa
              sponsorship&rdquo;, &ldquo;must have the right to work in the UK&rdquo; and similar phrases fail the role
              at once. The employer may hold a perfect licence; if they say they will not use it for this role, that
              is the answer. The matched phrase is quoted on the record.
            </p>
            <p>
              We also look for a sentence that offers sponsorship. It is not required to pass. A role with no
              sentence either way that passes every other check is marked <em>likely eligible</em> rather than
              <em> meets the rules</em>, and the record says so.
            </p>

            <h2 id="licence">2. Sponsor licence</h2>
            <p>
              The employer is matched to the Home Office register of licensed sponsors. The register uses legal
              names, and adverts use trading names, so we keep a table of aliases and a confidence figure for each
              match. A match below our confidence floor is treated as no match.
            </p>
            <p>Three things must all be true of the entry:</p>
            <ul>
              <li>it is still on the register today;</li>
              <li>the licence covers the Skilled Worker route, not only Global Business Mobility or another route;</li>
              <li>it is A-rated. A B-rated sponsor is under an action plan and cannot assign new certificates.</li>
            </ul>

            <h2 id="occupation">3. Occupation code</h2>
            <p>
              Every role is assigned a code from the Standard Occupational Classification 2020. The code decides
              whether the occupation is eligible and what salary it must pay. Since 22 July 2025 an occupation must
              be at RQF level 6 or above, unless it is on the Temporary Shortage List, which keeps a set of level 3
              to 5 occupations open for now.
            </p>
            <p>
              Where a title could sit under two codes we choose the one with the higher going rate. That makes the
              salary test stricter, never looser.
            </p>

            <h2 id="salary">4. Salary</h2>
            <p>
              The advertised salary must meet the higher of two figures: the general threshold, currently{" "}
              <span className="mono">{money(general)}</span> a year, and the going rate for the occupation code from
              Appendix Skilled Occupations. Some rules for new entrants and PhD holders lower these figures. We do
              not apply them, because we cannot know which applies to you.
            </p>
            <ul>
              <li>A range is tested at its bottom figure. The midpoint is never used.</li>
              <li>Hourly, daily and monthly rates are annualised at 37.5 hours a week, 5 days, 12 months.</li>
              <li>&ldquo;Competitive&rdquo;, &ldquo;negotiable&rdquo; or no figure cannot pass. The role is marked salary not stated.</li>
            </ul>

            <h2 id="record">5. The record</h2>
            <p>
              Every figure, code and quote used is stored with the date of the rules it was tested against. When the
              Home Office changes a threshold or a going rate, we re-run every live role and keep the old record, so a
              verdict you read last month still says what it was true against.
            </p>

            <h2 id="register">The register is read every morning</h2>
            <p>
              We download the register daily, compare it line by line with the previous copy, and log every change:
              additions, removals, rating changes, routes added or removed, name and town changes. Any live role from
              an employer whose entry changed is re-run before the site updates.
            </p>

            <h2 id="sources">Where the adverts come from</h2>
            <p>
              NHS Jobs, read through its public search and each advert page, including the Certificate of
              Sponsorship section a trust adds when it will sponsor the post. And the careers sites of employers on
              the register that publish their vacancies openly, each tied by hand to the employer&rsquo;s name on
              the register. Every advert is re-read daily and marked closed when it disappears or passes its closing
              date. We do not take listings from recruiters or paid feeds.
            </p>

            <h2 id="bands">Sponsor activity bands</h2>
            <p>
              The band next to an employer is our own measure, not a Home Office one. It combines how many eligible
              roles they have posted in 90 days, the share of their roles that pass, their posting volume and how long
              they have held a licence. It exists to show whether a licence is used, because many are not. It never
              changes a verdict.
            </p>

            <h2 id="limits">What we cannot tell you</h2>
            <p>
              Whether the employer will sponsor you. Whether you meet the English language, maintenance or
              criminal record requirements. Whether the advert is still open. Whether a new entrant or PhD discount
              would apply to you. We check the role against the rules. The rest is between you, the employer and{" "}
              <a href="https://www.gov.uk/skilled-worker-visa" rel="noopener">
                GOV.UK
              </a>
              .
            </p>
          </div>
        </article>

        <aside className="self-start md:sticky md:top-6 md:pt-2">
          <div className="border-2 border-ink p-4">
            <p className="text-[0.875rem] font-bold">Figures in force</p>
            <dl className="mt-2 divide-y divide-rule-soft text-[0.9375rem]">
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-70">Rules version</dt>
                <dd className="mono">{rules}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-70">General threshold</dt>
                <dd className="mono">{money(general)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-70">Hourly floor</dt>
                <dd className="mono">£17.13</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-70">Skill level</dt>
                <dd>RQF 6, or TSL</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-70">Working week</dt>
                <dd className="mono">37.5h</dd>
              </div>
            </dl>
            <p className="mt-3 text-[0.8125rem] leading-snug text-ink-45">As published on GOV.UK for {longDate(rules)}.</p>
          </div>

          <nav aria-label="On this page" className="mt-8">
            <p className="text-[0.875rem] font-bold">On this page</p>
            <ol className="mt-2 space-y-1.5 text-[0.9375rem]">
              {[
                ["#order", "The order of checks"],
                ["#wording", "Advert wording"],
                ["#licence", "Sponsor licence"],
                ["#occupation", "Occupation code"],
                ["#salary", "Salary"],
                ["#record", "The record"],
                ["#register", "Reading the register"],
                ["#sources", "Where the adverts come from"],
                ["#bands", "Activity bands"],
                ["#limits", "What we cannot tell you"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <p className="mt-8 text-[0.9375rem] text-ink-70">
            See it applied:{" "}
            <Link href="/jobs" className="text-ink">
              every live role
            </Link>
            , including the ones that fail.
          </p>
        </aside>
      </div>
    </div>
  );
}
