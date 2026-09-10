/** Site-wide constants. Rules versions live in the database; this is display-only fallback. */
export const SITE_NAME = "COSjobs";

export const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/how-it-works", label: "How we check" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/pricing", label: "Pricing" },
] as const;

/**
 * Footer disclaimer. Shown verbatim on every page.
 * NOTE: design/reference.html was not present at build time; this wording is a
 * draft that follows the brief and must be replaced with the reference text.
 */
export const DISCLAIMER = [
  "COSjobs is an independent information service. We are not part of, and are not endorsed by, the Home Office or UK Visas and Immigration.",
  "We never issue, sell or obtain Certificates of Sponsorship. Only a licensed employer can assign one, and only after they decide to hire you.",
  "A role that passes our checks meets the published Skilled Worker rules on the date shown. It does not mean the employer will sponsor you, and it is not immigration advice. Check the current rules on GOV.UK before you apply.",
] as const;
