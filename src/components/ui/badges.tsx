import type { ReactNode } from "react";
import type { Verdict } from "@/lib/eligibility/types";
import type { Band } from "@/lib/eligibility/scoring";

export type { Verdict, Band };

export const VERDICT_LABEL: Record<Verdict, string> = {
  CONFIRMED: "Meets the rules",
  LIKELY: "Likely eligible",
  SALARY_UNKNOWN: "Salary not stated",
  BELOW_THRESHOLD: "Below threshold",
  OCCUPATION_INELIGIBLE: "Occupation not eligible",
  LICENCE_RESTRICTED: "Licence restricted",
  NO_LICENCE: "No sponsor licence",
  REJECTED: "Advert refuses sponsorship",
};

/** One plain sentence per verdict, for the top of a record. */
export const VERDICT_SENTENCE: Record<Verdict, string> = {
  CONFIRMED: "Every check passed and the advert says sponsorship is offered.",
  LIKELY: "Every check passed. The advert does not mention sponsorship either way.",
  SALARY_UNKNOWN: "The advert gives no salary, so the salary rule cannot be tested.",
  BELOW_THRESHOLD: "The advertised salary is below the figure the rules require for this occupation.",
  OCCUPATION_INELIGIBLE: "This occupation is below RQF level 6 and not on the Temporary Shortage List.",
  LICENCE_RESTRICTED: "The employer holds a licence, but not one that lets them sponsor this role right now.",
  NO_LICENCE: "We could not find this employer on the register of licensed sponsors.",
  REJECTED: "The advert says sponsorship is not offered. That overrides the employer's licence.",
};

export const BAND_LABEL: Record<Band, string> = {
  A: "Active sponsor",
  B: "Sponsoring",
  C: "Low activity",
  D: "Dormant",
  NEW: "New licence",
};

export const BAND_SENTENCE: Record<Band, string> = {
  A: "Posts eligible roles regularly and most of them pass.",
  B: "Has sponsored recently, at a lower rate.",
  C: "Few eligible roles in the last 90 days.",
  D: "No eligible roles in the last 90 days.",
  NEW: "Licensed for under six months. No track record yet.",
};

type Tone = "stamp" | "flag" | "neutral" | "muted";

export function verdictTone(verdict: Verdict): Tone {
  if (verdict === "CONFIRMED") return "stamp";
  if (verdict === "LIKELY") return "neutral";
  if (verdict === "SALARY_UNKNOWN") return "muted";
  return "flag";
}

export function bandTone(band: Band): Tone {
  if (band === "A" || band === "B") return "neutral";
  if (band === "NEW") return "muted";
  return "flag";
}

const TONE_CLASS: Record<Tone, string> = {
  stamp: "border-stamp text-stamp",
  flag: "border-flag text-flag",
  neutral: "border-ink text-ink",
  muted: "border-rule text-ink-45",
};

export function Badge({ tone, children, title }: { tone: Tone; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex h-[1.375rem] items-center whitespace-nowrap border px-1.5 text-[0.75rem] font-medium leading-none ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge tone={verdictTone(verdict)}>{VERDICT_LABEL[verdict]}</Badge>;
}

export function BandBadge({ band }: { band: Band }) {
  return (
    <Badge tone={bandTone(band)} title={`Sponsor activity band ${band}. ${BAND_SENTENCE[band]}`}>
      <span className="mono mr-1.5 font-medium">{band}</span>
      {BAND_LABEL[band]}
    </Badge>
  );
}

/** The one stamp mark. Only ever for a verdict where every check passed. */
export function Stamp({ date, className = "", size = "sm" }: { date: string; className?: string; size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <span
      role="img"
      aria-label={`Verified against Skilled Worker rules, ${date}`}
      className={`stamp-in inline-flex -rotate-3 flex-col items-center border-2 border-stamp text-stamp ${big ? "px-4 py-2" : "px-2.5 py-1"} ${className}`}
    >
      <span className={`font-bold uppercase leading-none tracking-[0.08em] ${big ? "text-[1rem]" : "text-[0.75rem]"}`}>Verified</span>
      <span className={`mono mt-1 leading-none ${big ? "text-[0.75rem]" : "text-[0.625rem]"}`}>{date}</span>
    </span>
  );
}
