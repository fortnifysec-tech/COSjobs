import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Guides. Plain English, figures only where we have read them from GOV.UK on
 * the date shown. Nothing here is immigration advice.
 */
export type Guide = {
  slug: string;
  title: string;
  summary: string;
  /** Date the figures were checked against GOV.UK. */
  checked: string;
  sources: { label: string; href: string }[];
  /** Section anchors, in order, for the "On this page" list. */
  toc: { id: string; label: string }[];
  body: ReactNode;
};

const H = ({ id, children }: { id: string; children: ReactNode }) => (
  <h2 id={id} className="mt-10 border-b-2 border-ink pb-2 text-[1.25rem]">
    {children}
  </h2>
);

const Table = ({ rows, head }: { head: string[]; rows: (string | ReactNode)[][] }) => (
  <div className="mt-4 overflow-x-auto">
    <table className="w-full min-w-[28rem] border-t-2 border-ink text-[0.9375rem]">
      <thead>
        <tr className="border-b hairline text-left text-[0.8125rem] text-ink-70">
          {head.map((h) => (
            <th key={h} className="py-2 pr-4 font-normal">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b hairline-soft align-top">
            {r.map((c, j) => (
              <td key={j} className={`py-2 pr-4 ${j > 0 ? "mono" : ""}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const GUIDES: Guide[] = [
  {
    slug: "salary-rules",
    title: "The salary rules, with the arithmetic",
    summary: "The general threshold, the going rate, which one wins, and why a salary range is tested at its bottom figure.",
    checked: "2026-09-17",
    sources: [
      { label: "Appendix Skilled Worker", href: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker" },
      { label: "Appendix Skilled Occupations", href: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations" },
    ],
    toc: [
      { id: "figures", label: "The figures since 22 July 2025" },
      { id: "going-rate", label: "The going rate" },
      { id: "range", label: "Why a range is tested at the bottom" },
      { id: "discounts", label: "Discounts we do not apply" },
    ],
    body: (
      <>
        <p>
          Two figures decide whether a Skilled Worker salary passes. The first is the general threshold, one number for
          every occupation. The second is the going rate, one number per occupation code. The salary must meet
          whichever is higher. That is the whole rule for a standard applicant, and it is the rule this site applies to every role.
        </p>
        <H id="figures">The figures since 22 July 2025</H>
        <Table
          head={["Case", "Annual figure", "Notes"]}
          rows={[
            ["General threshold", "£41,700", "Or the full going rate, whichever is higher"],
            ["New entrant", "£33,400", "Under 26, recent graduate or in professional training. 70% of the going rate"],
            ["PhD relevant to the job", "£37,500", "90% of the going rate"],
            ["STEM PhD relevant to the job", "£33,400", "80% of the going rate"],
            ["Temporary Shortage List job", "£33,400", "The listed rate for the code still applies"],
            ["Hourly floor", "£17.13", "Applies to every option, whatever the annual figure"],
          ]}
        />
        <p className="mt-4 text-[0.875rem] text-ink-45">
          Annual figures assume a 37.5-hour week. A 40-hour contract at the same hourly rate gives a higher annual figure but the
          hourly floor still applies.
        </p>
        <H id="going-rate">The going rate</H>
        <p>
          Every eligible occupation code has a going rate in Appendix Skilled Occupations. Table 1 gives it as a single annual figure,
          the median from the Annual Survey of Hours and Earnings. For a software developer (code 2134) it is £54,700, which is higher
          than the general threshold, so £54,700 is the number a role under that code must reach. For a civil engineer (2121) it is £50,400.
          You can read every code and its rate on the <Link href="/occupations">occupation codes</Link> page.
        </p>
        <p>
          Health and education roles in Table 3 have no single figure. Their going rate is the national pay scale for the post, so a Band 6
          nurse’s rate is the bottom of Band 6. We do not test those salaries as one figure and we say so on the record.
        </p>
        <H id="range">Why a range is tested at the bottom</H>
        <p>
          An advert that says £40,000 to £50,000 promises £40,000. The certificate of sponsorship carries one salary, and the employer can
          lawfully issue it at the bottom of the range. So we test the minimum. If that figure is under the required amount, the role is
          marked below threshold even though the top of the range would pass. We would rather tell you that before you apply than after.
        </p>
        <H id="discounts">Discounts we do not apply</H>
        <p>
          The new entrant, PhD and shortage list options lower the threshold for people who qualify. We cannot know from an advert whether
          you do, so every verdict on this site uses the standard rule. A role marked below threshold may still work for you as a new
          entrant. Check the figure on the record against the table above.
        </p>
      </>
    ),
  },
  {
    slug: "what-a-skilled-worker-visa-costs",
    title: "What a Skilled Worker visa costs",
    summary: "Application fees, the healthcare surcharge and the money you must show, plus the costs that fall on the employer.",
    checked: "2026-09-17",
    sources: [
      { label: "Skilled Worker visa: how much it costs", href: "https://www.gov.uk/skilled-worker-visa/how-much-it-costs" },
      { label: "Health and Care Worker visa", href: "https://www.gov.uk/health-care-worker-visa" },
      { label: "Immigration health surcharge", href: "https://www.gov.uk/healthcare-immigration-application" },
      { label: "UK visa sponsorship for employers", href: "https://www.gov.uk/uk-visa-sponsorship-employers" },
    ],
    toc: [
      { id: "fees", label: "Application fee" },
      { id: "ihs", label: "Immigration health surcharge" },
      { id: "maintenance", label: "Money you must show" },
      { id: "example", label: "A worked example" },
      { id: "employer", label: "What the employer pays" },
    ],
    body: (
      <>
        <p>
          The figures below are as published on GOV.UK on the date this guide was checked. Fees change, usually in April. The GOV.UK
          pages linked at the end are the record; if they disagree with this page, they are right.
        </p>
        <H id="fees">Application fee</H>
        <Table
          head={["Applying from", "Up to 3 years", "More than 3 years"]}
          rows={[
            ["Outside the UK", "£819", "£1,618"],
            ["Inside the UK (extend or switch)", "£943", "£1,865"],
            ["Health and Care Worker visa, either", "£324", "£628"],
          ]}
        />
        <p className="mt-4">
          The fee is per person, so a partner and children pay it too, for the same length of stay as you. A job on the Immigration Salary List
          has a lower fee; you are told the amount when you apply.
        </p>
        <H id="ihs">Immigration health surcharge</H>
        <p>
          £1,035 for each year of the visa, paid up front with the application, or £776 a year for anyone under 18. A three-year visa is £3,105
          before the fee. Health and Care Worker visa holders and their dependants do not pay it.
        </p>
        <H id="maintenance">Money you must show</H>
        <p>
          £1,270 in your account for 28 days in a row before you apply, unless you have been in the UK on a visa for 12 months or your employer
          certifies on the certificate of sponsorship that it will cover your first month. Dependants need their own amounts on top.
        </p>
        <H id="example">A worked example</H>
        <p>
          One person, applying from abroad for a three-year Skilled Worker visa in a job not on the salary list: £819 fee plus £3,105 surcharge,
          £3,924 at the point of application, with £1,270 shown in the bank. The same job on the Health and Care route: £324 and no surcharge.
        </p>
        <H id="employer">What the employer pays</H>
        <Table
          head={["Item", "Small or charitable sponsor", "Medium or large sponsor"]}
          rows={[
            ["Sponsor licence (Worker)", "£611", "£1,682"],
            ["Certificate of sponsorship", "£525", "£525"],
            ["Immigration skills charge, first 12 months", "£480", "£1,320"],
            ["Immigration skills charge, each further 6 months", "£240", "£660"],
          ]}
        />
        <p className="mt-4">
          The certificate fee and the skills charge cannot be passed to you. An employer that asks you to pay them, or to repay them if you leave,
          risks losing its licence. The visa fee and the surcharge can be yours to pay, though many employers cover them.
        </p>
      </>
    ),
  },
  {
    slug: "nhs-jobs-and-sponsorship",
    title: "NHS jobs and sponsorship: how to read an advert",
    summary: "What the Certificate of Sponsorship section on NHS Jobs means, which roles are on a pay scale, and where the Health and Care Worker visa comes in.",
    checked: "2026-09-17",
    sources: [
      { label: "Health and Care Worker visa", href: "https://www.gov.uk/health-care-worker-visa" },
      { label: "Appendix Skilled Occupations, Table 3", href: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations" },
      { label: "NHS Jobs", href: "https://www.jobs.nhs.uk/" },
    ],
    toc: [
      { id: "section", label: "The Certificate of Sponsorship section" },
      { id: "pay-scale", label: "Pay-scale occupations" },
      { id: "health-care", label: "Health and Care Worker visa" },
      { id: "bank", label: "Bank, agency and fixed-term posts" },
    ],
    body: (
      <>
        <p>
          Every NHS trust in England we have checked holds a Worker licence, so the licence test rarely fails. The harder questions are
          whether the particular post is sponsorable, whether the trust intends to sponsor it, and which route applies.
        </p>
        <H id="section">The Certificate of Sponsorship section</H>
        <p>
          When a trust is willing to sponsor a post, the NHS Jobs advert carries a section headed Certificate of Sponsorship. It reads:
          &ldquo;Applications from job seekers who require current Skilled Worker sponsorship to work in the UK are welcome and will be considered
          alongside all other applications.&rdquo; We read adverts for exactly that wording. When it is there, the role is marked confirmed if the
          other checks pass. When it is not, the role is marked likely at best. About half the adverts we sample carry it.
        </p>
        <p>
          Some adverts carry the section and also say, in the body, that sponsorship is not available. Refusal wording wins. We quote it on the record.
        </p>
        <H id="pay-scale">Pay-scale occupations</H>
        <p>
          Nurses, midwives, doctors, physiotherapists, radiographers, paramedics and most other clinical codes are in Table 3 of the appendix. Their
          going rate is the Agenda for Change band or the medical pay scale for the post, not a single figure. We assign the code and show the
          band the advert quotes, but we do not mark the salary as passing or failing. The record says &ldquo;national pay scale&rdquo; instead.
        </p>
        <p>
          Non-clinical NHS roles, such as software engineers, data scientists, clinical scientists and service managers, are in Table 1 and are
          checked in full against the going rate and the general threshold.
        </p>
        <H id="health-care">Health and Care Worker visa</H>
        <p>
          A Skilled Worker visa with a lower fee and no health surcharge, for eligible health occupations with an NHS body, an NHS supplier or
          an adult social care provider. The fee is £324 for up to three years or £628 for longer, and the general salary floor for the route
          is £31,300 or the going rate for the code, whichever is higher. Care worker codes 6135 and 6136 are no longer open to new applicants from
          overseas.
        </p>
        <H id="bank">Bank, agency and fixed-term posts</H>
        <p>
          Bank and agency work is not sponsorable: there is no single employer with a contract to sponsor. A fixed-term post can be sponsored
          for its length. The advert type is shown on each NHS record.
        </p>
        <p>
          Browse <Link href="/jobs?q=nhs">NHS roles</Link>, or read the <Link href="/occupations/2237">nurses</Link> and{" "}
          <Link href="/occupations/2212">specialist medical practitioners</Link> code pages.
        </p>
      </>
    ),
  },
  {
    slug: "reading-the-sponsor-register",
    title: "How to read the register of licensed sponsors",
    summary: "What an A or B rating means, why a licence for the wrong route is no use, and what to do when an employer is missing.",
    checked: "2026-09-17",
    sources: [
      { label: "Register of licensed sponsors: workers", href: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" },
      { label: "Sponsor a worker: guidance for sponsors", href: "https://www.gov.uk/government/collections/sponsorship-information-for-employers-and-educators" },
    ],
    toc: [
      { id: "rating", label: "The rating" },
      { id: "route", label: "The route" },
      { id: "names", label: "Names on the register" },
      { id: "missing", label: "When an employer is not there" },
      { id: "tenure", label: "How long a sponsor has been licensed" },
    ],
    body: (
      <>
        <p>
          The Home Office publishes the register most working days as a spreadsheet with five columns: organisation name, town, county, licence
          type and rating, and route. One organisation has one row per route. We read the file every morning and keep every change.
        </p>
        <H id="rating">The rating</H>
        <p>
          An A rating means the licence is in good standing and the employer can assign certificates of sponsorship. A B rating means the Home
          Office found a problem and put the employer on an action plan. A B-rated sponsor cannot assign new certificates until the A rating is
          restored, so a role from a B-rated employer fails the licence check on this site even if everything else is right.
        </p>
        <H id="route">The route</H>
        <p>
          A licence lists the routes it covers. Only a licence that includes Skilled Worker lets an employer sponsor a new hire from the open market.
          A licence that only covers Global Business Mobility routes is for transferring existing staff. The <Link href="/visa">routes</Link> page
          explains each one.
        </p>
        <H id="names">Names on the register</H>
        <p>
          The register uses legal names. Adverts use trading names. Monzo is on the register as Monzo Bank Ltd; a hospital may be listed under its
          NHS trust. We match names after stripping company suffixes and keep a table of aliases for the rest. When we cannot match, the record
          says so, and you can search the <Link href="/sponsors">sponsor list</Link> yourself.
        </p>
        <H id="missing">When an employer is not there</H>
        <p>
          Three things can be true. The employer has no licence. The employer is licensed under a different legal name, often a parent company.
          Or the employer was removed: licences are revoked, surrendered or allowed to lapse, and a removed employer cannot sponsor anyone until
          it is relicensed. Each sponsor page on this site shows when we first and last saw the entry and every change we recorded.
        </p>
        <H id="tenure">How long a sponsor has been licensed</H>
        <p>
          The register does not give a licence date. For sponsors we have watched since our first copy, we show how long they have been on it.
          For everyone already listed when we started, we say &ldquo;since before&rdquo; that date rather than invent a figure.
        </p>
      </>
    ),
  },
  {
    slug: "changing-employer",
    title: "Changing employer on a Skilled Worker visa",
    summary: "You need a new certificate and a new application before you start. What that means in practice, and what happens if your sponsor loses its licence.",
    checked: "2026-09-17",
    sources: [
      { label: "Skilled Worker visa: update your visa", href: "https://www.gov.uk/skilled-worker-visa/update-your-visa" },
      { label: "Skilled Worker visa: how much it costs", href: "https://www.gov.uk/skilled-worker-visa/how-much-it-costs" },
    ],
    toc: [
      { id: "new-role", label: "The new role is checked from scratch" },
      { id: "cost", label: "Cost and timing" },
      { id: "licence-lost", label: "If your sponsor loses its licence" },
      { id: "same-employer", label: "Changes with the same employer" },
    ],
    body: (
      <>
        <p>
          A Skilled Worker visa is tied to one employer and one job. To move, the new employer assigns you a certificate of sponsorship and you
          apply to update your visa from inside the UK. You must not start the new job until that application is decided.
        </p>
        <H id="new-role">The new role is checked from scratch</H>
        <p>
          The occupation code, the going rate and the general threshold apply to the new role as if you were applying for the first time. If you
          were granted under the rules in force before 22 July 2025, some transitional arrangements apply to the codes and thresholds you can use;
          the caseworker guidance sets them out. Otherwise every record on this site shows the figure the new role must reach.
        </p>
        <H id="cost">Cost and timing</H>
        <p>
          The inside-UK fee is £943 for up to three years or £1,865 for longer, plus the surcharge for any additional time. Standard decisions take
          about eight weeks; a priority service is often available for a further fee. Your current permission continues while a valid application is
          pending, so the safest plan is to apply while still employed.
        </p>
        <H id="licence-lost">If your sponsor loses its licence</H>
        <p>
          When a licence is revoked, the Home Office normally cuts short the permission of the workers it sponsored, usually to 60 days, to give you time
          to find a new sponsor and apply. Sponsor Watch on this site checks your employer’s entry on the register every morning and keeps a
          shortlist of passing roles ready. See <Link href="/pricing#watch">pricing</Link>.
        </p>
        <H id="same-employer">Changes with the same employer</H>
        <p>
          A promotion into a different occupation code, or a move that takes the salary below the figure on your certificate, also needs a new
          application. A pay rise or a change of job title within the same code does not; the employer reports it instead.
        </p>
      </>
    ),
  },
  {
    slug: "bringing-your-family",
    title: "Bringing a partner or children",
    summary: "Who counts as a dependant, what each one pays, and the roles that no longer allow dependants.",
    checked: "2026-09-17",
    sources: [
      { label: "Skilled Worker visa: your partner and children", href: "https://www.gov.uk/skilled-worker-visa/your-partner-and-children" },
      { label: "Immigration health surcharge", href: "https://www.gov.uk/healthcare-immigration-application" },
    ],
    toc: [
      { id: "cost", label: "What each dependant pays" },
      { id: "work", label: "What dependants can do" },
      { id: "not-allowed", label: "Roles that no longer allow dependants" },
    ],
    body: (
      <>
        <p>
          Your partner and children under 18 can apply as dependants, at the same time as you or later. A partner is a spouse, civil partner or
          someone you have lived with for at least two years.
        </p>
        <H id="cost">What each dependant pays</H>
        <p>
          The same application fee as you, for the same length of stay, and the health surcharge at £1,035 a year for adults or £776 a year for
          children. They must also show money to support themselves unless the employer certifies maintenance on your certificate.
        </p>
        <H id="work">What dependants can do</H>
        <p>
          A partner can work in almost any job without sponsorship, and children can attend school. Their permission lasts as long as yours.
        </p>
        <H id="not-allowed">Roles that no longer allow dependants</H>
        <p>
          Care workers and senior care workers sponsored from 11 March 2024 cannot bring dependants. Students on most courses cannot either. A
          Skilled Worker in any other occupation can.
        </p>
      </>
    ),
  },
];

export function findGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
