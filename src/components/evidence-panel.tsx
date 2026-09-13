import { Stamp } from "@/components/ui/badges";

export type EvidenceState = "pass" | "fail" | "unknown" | "skipped" | "info";

export type EvidenceRow = {
  label: string;
  /** A code or figure. Set in mono. */
  value?: string;
  /** Prose that follows the value (an occupation title, a licence holder). Set in sans. */
  text?: string;
  /** A quoted sentence from the advert. Set in serif. */
  quote?: string;
  /** Provenance or method, on its own line. */
  note?: string;
  state?: EvidenceState;
};

const STATE_TEXT: Record<EvidenceState, string> = {
  pass: "Pass",
  fail: "Fail",
  unknown: "Unknown",
  skipped: "Not checked",
  info: "",
};

const STATE_CLASS: Record<EvidenceState, string> = {
  pass: "text-stamp",
  fail: "text-flag",
  unknown: "text-ink-70",
  skipped: "text-ink-45",
  info: "text-ink-45",
};

/**
 * The evidence panel. A ledger of the checks that produced a verdict.
 * `animate` turns on the single on-load reveal sequence; use it once per page.
 */
export function EvidencePanel({
  rows,
  verdict,
  rulesVersion,
  animate = false,
  title = "Evidence",
  footer,
}: {
  rows: EvidenceRow[];
  verdict: "pass" | "fail" | "unknown";
  rulesVersion: string;
  animate?: boolean;
  title?: string;
  footer?: string;
}) {
  const summary =
    footer ??
    (verdict === "pass"
      ? "Every check passed against the rules in force on the date shown."
      : verdict === "unknown"
        ? "One check could not be completed from the advert. Nothing failed."
        : "A check failed. Checks after it were not run.");

  return (
    <section aria-label={title} className={`border-2 border-ink bg-card ${animate ? "reveal-seq" : ""}`}>
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink px-4 py-2.5" style={{ ["--i" as string]: 0 }}>
        <h3 className="text-[0.9375rem] font-bold tracking-heading">{title}</h3>
        <span className="mono text-[0.75rem] text-ink-70">rules {rulesVersion}</span>
      </div>
      <dl className="divide-y divide-rule-soft">
        {rows.map((row, i) => {
          const state = row.state ?? "info";
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 py-3 pr-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_4rem] ${
                state === "fail" ? "border-l-4 border-l-flag pl-3" : "pl-4"
              }`}
              style={{ ["--i" as string]: i + 1 }}
            >
              <dt className="text-[0.8125rem] text-ink-70 sm:pt-px">{row.label}</dt>
              <dd className="col-start-1 min-w-0 text-[0.9375rem] leading-snug text-ink sm:col-start-2">
                {row.value ? <span className="mono">{row.value}</span> : null}
                {row.text ? <span className={row.value ? "ml-2" : ""}>{row.text}</span> : null}
                {row.quote ? <q className="font-serif text-[1rem] italic">{row.quote}</q> : null}
                {row.note ? <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-45">{row.note}</span> : null}
              </dd>
              <dd
                className={`col-start-2 row-start-1 text-right text-[0.75rem] font-medium uppercase tracking-[0.04em] sm:col-start-3 sm:row-start-auto sm:pt-px ${STATE_CLASS[state]}`}
              >
                {STATE_TEXT[state] || <span aria-hidden="true">·</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="flex items-center justify-between gap-4 border-t-2 border-ink px-4 py-3" style={{ ["--i" as string]: rows.length + 1 }}>
        <p className="text-[0.875rem] leading-snug text-ink-70">{summary}</p>
        {verdict === "pass" ? <Stamp date={rulesVersion} className="shrink-0" /> : null}
      </div>
    </section>
  );
}
