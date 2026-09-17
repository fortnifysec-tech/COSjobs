import type { SalaryPeriod } from "@/lib/eligibility/types";

export type ParsedSalary = { min: number | null; max: number | null; period: SalaryPeriod | null };

const NONE: ParsedSalary = { min: null, max: null, period: null };

/** "£58,133.00", "£58133", "£200, 000" (seen on employer boards) → 58133. */
const AMOUNT = /£\s?(\d{1,3}(?:,\s?\d{3})+|\d+)(?:\.\d{1,2})?/g;

function toNumber(s: string): number {
  return Math.round(Number(s.replace(/[,\s]/g, "")));
}

function periodFrom(text: string): SalaryPeriod | null {
  const t = text.toLowerCase();
  if (/\b(?:per|an|a|\/)\s*(?:hour|hr)\b|\bp\/?h\b|\bhourly\b/.test(t)) return "hour";
  if (/\b(?:per|a|\/)\s*day\b|\bdaily\b|\bday rate\b/.test(t)) return "day";
  if (/\b(?:per|a|\/)\s*week\b|\bweekly\b/.test(t)) return "week";
  if (/\b(?:per|a|\/)\s*month\b|\bmonthly\b|\bpcm\b/.test(t)) return "month";
  if (/\b(?:per|a|\/)\s*(?:annum|year)\b|\bannual(?:ly)?\b|\bp\.?a\.?\b|\byearly\b/.test(t)) return "year";
  return null;
}

/** Guess the period from the size of the figure when the text does not say. */
function periodFromMagnitude(n: number): SalaryPeriod {
  if (n < 150) return "hour";
  if (n < 1500) return "day";
  if (n < 12000) return "month";
  return "year";
}

/**
 * Parse a salary field such as "£49,387 to £56,515 a year" or "£17.50 an hour".
 * Returns nulls when no figure can be read. Never guesses a figure.
 */
export function parseSalaryField(text: string | null | undefined): ParsedSalary {
  if (!text) return NONE;
  const amounts = [...text.matchAll(AMOUNT)].map((m) => toNumber(m[1]!));
  if (amounts.length === 0) return NONE;
  // Decimal hourly figures ("£17.50") lose the pence in toNumber; recover them.
  const decimal = text.match(/£\s?(\d{1,3}(?:,\d{3})*\.\d{1,2})/);
  const period = periodFrom(text) ?? periodFromMagnitude(amounts[0]!);
  const first = period === "hour" && decimal ? Number(decimal[1]!.replace(/,/g, "")) : amounts[0]!;
  const second = amounts.length > 1 ? amounts[1]! : null;
  const min = second !== null ? Math.min(first, second) : first;
  const max = second !== null ? Math.max(first, second) : null;
  if (min <= 0) return NONE;
  return { min, max: max === min ? null : max, period };
}

/**
 * Find an advertised salary inside free text, such as an employer careers page.
 * Only a range with both figures at annual scale, or a single figure next to
 * the word "salary", is trusted. Benefit amounts ("£1,000 a year for books")
 * are ignored.
 */
export function findSalaryInText(text: string): ParsedSalary {
  const t = text.replace(/\s+/g, " ");
  const range = t.match(/£\s?(\d{1,3}(?:,\s?\d{3})+|\d{5,6})(?:\.\d{2})?\s*(?:-|–|—|to)\s*£?\s?(\d{1,3}(?:,\s?\d{3})+|\d{5,6})(?:\.\d{2})?([^£]{0,25})/);
  if (range) {
    const a = toNumber(range[1]!);
    const b = toNumber(range[2]!);
    const period = periodFrom(range[3] ?? "") ?? periodFromMagnitude(Math.min(a, b));
    if (period === "year" && Math.min(a, b) >= 10000) return { min: Math.min(a, b), max: Math.max(a, b), period };
    if (period === "month" && Math.min(a, b) >= 1000) return { min: Math.min(a, b), max: Math.max(a, b), period };
  }
  const single = t.match(/\bsalary[^£]{0,40}£\s?(\d{1,3}(?:,\s?\d{3})+|\d{5,6})(?:\.\d{2})?([^£]{0,25})/i);
  if (single) {
    const n = toNumber(single[1]!);
    const period = periodFrom(single[2] ?? "") ?? periodFromMagnitude(n);
    if (period === "year" && n >= 10000) return { min: n, max: null, period };
  }
  return NONE;
}
