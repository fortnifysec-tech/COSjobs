import { Stamp } from "@/components/ui/badges";

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
  state?: "pass" | "fail" | "info";
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
}: {
  rows: EvidenceRow[];
  verdict: "pass" | "fail";
  rulesVersion: string;
  animate?: boolean;
  title?: string;
}) {
  return (
    <section
      aria-label={title}
      className={`border hairline bg-card ${animate ? "reveal-seq" : ""}`}
    >
      <div
        className="flex items-center justify-between border-b hairline px-4 py-2.5"
        style={{ ["--i" as string]: 0 }}
      >
        <h3 className="text-[0.8125rem] font-bold tracking-heading">{title}</h3>
        <span className="mono text-[0.6875rem] text-ink-45">rules {rulesVersion}</span>
      </div>
      <dl className="divide-y divide-rule-soft">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)_auto]"
            style={{ ["--i" as string]: i + 1 }}
          >
            <dt className="text-[0.8125rem] text-ink-70">{row.label}</dt>
            <dd className="col-start-1 min-w-0 text-[0.875rem] text-ink sm:col-start-2">
              {row.value ? <span className="mono">{row.value}</span> : null}
              {row.text ? <span className={row.value ? "ml-2" : ""}>{row.text}</span> : null}
              {row.quote ? (
                <q className="font-serif italic text-[0.9375rem]">{row.quote}</q>
              ) : null}
              {row.note ? (
                <span className="block text-[0.75rem] leading-snug text-ink-45">{row.note}</span>
              ) : null}
            </dd>
            <dd
              className={`mono col-start-2 row-start-1 text-[0.6875rem] sm:col-start-3 sm:row-start-auto ${
                row.state === "pass" ? "text-stamp" : row.state === "fail" ? "text-flag" : "text-ink-45"
              }`}
              aria-label={row.state === "pass" ? "check passed" : row.state === "fail" ? "check failed" : undefined}
            >
              {row.state === "pass" ? "PASS" : row.state === "fail" ? "FAIL" : "—"}
            </dd>
          </div>
        ))}
      </dl>
      <div
        className="flex items-center justify-between border-t hairline px-4 py-3"
        style={{ ["--i" as string]: rows.length + 1 }}
      >
        <p className="text-[0.8125rem] text-ink-70">
          {verdict === "pass"
            ? "Every check passed. This role meets the Skilled Worker rules in force on the date shown."
            : "One or more checks failed. This role does not meet the rules as advertised."}
        </p>
        {verdict === "pass" ? <Stamp date={rulesVersion} className="ml-4 shrink-0" /> : null}
      </div>
    </section>
  );
}
