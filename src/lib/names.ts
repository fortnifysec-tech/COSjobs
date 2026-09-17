/** Name and slug helpers shared by ingestion, fixtures and the UI. Pure. */

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalise an organisation name for matching against the sponsor register.
 * Upper case, punctuation dropped, company suffixes and filler words removed.
 */
export function normaliseName(s: string) {
  return s
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[.,'’"()]/g, "")
    .replace(/\b(LIMITED|LTD|PLC|LLP|LLC|INC|GROUP|UK|THE|CO)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Looser variants of a name, tried in order when the exact normalised form
 * does not match. NHS bodies in particular appear on the register with and
 * without "NHS Foundation Trust", and job boards often use trading names.
 */
export function nameVariants(raw: string): string[] {
  const base = normaliseName(raw);
  const out = new Set<string>([base]);
  const nhs = base.replace(/\bNHS (FOUNDATION )?TRUST\b/g, "").replace(/\s+/g, " ").trim();
  if (nhs && nhs !== base) {
    out.add(`${nhs} NHS FOUNDATION TRUST`);
    out.add(`${nhs} NHS TRUST`);
    out.add(nhs);
  }
  const noSuffix = base.replace(/\b(HOLDINGS|SERVICES|TECHNOLOGIES|TECHNOLOGY|INTERNATIONAL|EUROPE|LONDON)\b/g, "").replace(/\s+/g, " ").trim();
  if (noSuffix && noSuffix !== base) out.add(noSuffix);
  return [...out].filter(Boolean);
}
