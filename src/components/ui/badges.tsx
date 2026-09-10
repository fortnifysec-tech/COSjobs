import type { ReactNode } from "react";

/** Role verdicts, as decided by the rules engine (src/lib/eligibility). */
export type Verdict =
  | "CONFIRMED"
  | "LIKELY"
  | "SALARY_UNKNOWN"
  | "BELOW_THRESHOLD"
  | "OCCUPATION_INELIGIBLE"
  | "NO_LICENCE"
  | "REJECTED";

export const VERDICT_LABEL: Record<Verdict, string> = {
  CONFIRMED: "Meets 2026 rules",
  LIKELY: "Likely eligible",
  SALARY_UNKNOWN: "Salary not stated",
  BELOW_THRESHOLD: "Below threshold",
  OCCUPATION_INELIGIBLE: "Occupation not eligible",
  NO_LICENCE: "No sponsor licence",
  REJECTED: "Advert refuses sponsorship",
};

/** Sponsor activity bands, from the sponsor_activity scoring. */
export type Band = "A" | "B" | "C" | "D" | "NEW";

export const BAND_LABEL: Record<Band, string> = {
  A: "Active sponsor",
  B: "Sponsoring",
  C: "Low activity",
  D: "Dormant",
  NEW: "New licence",
};

function Badge({
  tone,
  children,
  title,
}: {
  tone: "stamp" | "flag" | "neutral" | "muted";
  children: ReactNode;
  title?: string;
}) {
  const cls = {
    stamp: "border-stamp text-stamp",
    flag: "border-flag text-flag",
    neutral: "border-ink text-ink",
    muted: "border-rule text-ink-45",
  }[tone];
  return (
    <span
      title={title}
      className={`inline-flex h-5 items-center whitespace-nowrap border px-1.5 text-center text-[0.6875rem] font-medium leading-none ${cls}`}
    >
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const tone =
    verdict === "CONFIRMED" ? "stamp" : verdict === "LIKELY" ? "neutral" : verdict === "SALARY_UNKNOWN" ? "muted" : "flag";
  return <Badge tone={tone}>{VERDICT_LABEL[verdict]}</Badge>;
}

export function BandBadge({ band }: { band: Band }) {
  const tone = band === "A" ? "neutral" : band === "B" ? "neutral" : band === "NEW" ? "muted" : "flag";
  return (
    <Badge tone={tone} title={`Sponsor activity band ${band}`}>
      <span className="mono mr-1">{band}</span>
      {BAND_LABEL[band]}
    </Badge>
  );
}

/** The one stamp mark. Only ever for an eligible verdict. */
export function Stamp({ date, className = "" }: { date: string; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Verified against Skilled Worker rules, ${date}`}
      className={`stamp-in inline-flex -rotate-3 flex-col items-center border-2 border-stamp px-2.5 py-1 text-stamp ${className}`}
    >
      <span className="text-[0.75rem] font-bold uppercase leading-none tracking-[0.08em]">
        Verified
      </span>
      <span className="mono mt-1 text-[0.625rem] leading-none">{date}</span>
    </span>
  );
}
