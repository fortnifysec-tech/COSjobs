/** Site-wide constants. Rules versions live in the database; this is display-only fallback. */
export const SITE_NAME = "COSjobs";
export const SITE_DOMAIN = "cosjobs.co.uk";

export const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/occupations", label: "Occupations" },
  { href: "/guides", label: "Guides" },
  { href: "/how-it-works", label: "How we check" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const BROWSE = [
  { href: "/occupations", label: "Occupation codes" },
  { href: "/cities", label: "Towns and cities" },
  { href: "/visa", label: "Visa routes" },
  { href: "/guides", label: "Guides" },
  { href: "/faq", label: "Questions and answers" },
  { href: "/about", label: "About" },
] as const;

/**
 * Footer disclaimer. Shown verbatim on every page.
 * NOTE: design/reference.html was not present at build time; this wording is a
 * draft that follows the brief and must be replaced with the reference text.
 */
export const DISCLAIMER = [
  "COSjobs is an independent information service. It is not part of, and is not endorsed by, the Home Office or UK Visas and Immigration.",
  "We do not issue, sell or obtain Certificates of Sponsorship. Only a licensed employer can assign one, and only after they decide to hire you.",
  "A role that passes our checks meets the published Skilled Worker rules on the date shown. It does not mean the employer will sponsor you, and it is not immigration advice. Check the current rules on GOV.UK before you apply.",
] as const;

export const PLANS = [
  { id: "free", name: "Free", price: "£0", per: "", what: "Search every role. Read every verdict and the sponsor band. No account needed." },
  { id: "seeker", name: "Seeker", price: "£9.99", per: "a month", what: "Apply links, full advert text, the complete evidence panel and alerts within the hour." },
  { id: "plus", name: "Seeker Plus", price: "£14.99", per: "a month", what: "Seeker, plus CV tailoring against the advert, an application pipeline and 24 hours' early access to new sponsors." },
  { id: "watch", name: "Sponsor Watch", price: "£2.99", per: "a month", what: "A daily check on your own employer's licence, with a shortlist of open roles ready if it changes." },
] as const;

/** How a job source is named to readers. */
export function sourceLabel(source: string): string {
  switch (source) {
    case "nhs-jobs":
      return "NHS Jobs";
    case "greenhouse":
      return "Employer careers site";
    case "employer-site":
      return "Employer careers site";
    default:
      return source.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  }
}
