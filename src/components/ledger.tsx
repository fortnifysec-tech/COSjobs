import Link from "next/link";
import type { ReactNode } from "react";

/** A list of ledger rows with hairlines. Never cards. */
export function Ledger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <ul className={`border-t hairline ${className}`}>{children}</ul>;
}

/**
 * One row: a title with a note underneath on the left, and up to three
 * figures on the right. On phones the figures wrap under the title.
 */
export function LedgerRow({
  href,
  title,
  note,
  figures,
  lead,
}: {
  href: string;
  title: ReactNode;
  note?: ReactNode;
  /** Right-hand figures, shown as a value and a label. */
  figures: { value: ReactNode; label: string; muted?: boolean }[];
  /** A short code shown before the title, in mono. */
  lead?: string;
}) {
  return (
    <li className="border-b hairline-soft">
      <Link href={href} className="grid gap-x-6 gap-y-2 py-3.5 no-underline hover:bg-card focus-visible:bg-card sm:grid-cols-[minmax(0,1fr)_auto] sm:px-2">
        <div className="min-w-0">
          <p className="text-[1rem] font-medium leading-snug text-ink">
            {lead ? <span className="mono mr-2 text-[0.875rem] font-normal text-ink-45">{lead}</span> : null}
            {title}
          </p>
          {note ? <p className="mt-0.5 text-[0.875rem] leading-snug text-ink-70">{note}</p> : null}
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[0.875rem] sm:justify-end sm:text-right">
          {figures.map((f) => (
            <div key={f.label} className="min-w-[5.5rem]">
              <dd className={`mono ${f.muted ? "text-ink-45" : "text-ink"}`}>{f.value}</dd>
              <dt className="text-[0.75rem] text-ink-45">{f.label}</dt>
            </div>
          ))}
        </dl>
      </Link>
    </li>
  );
}

/** Definition rows, as used on the job and sponsor pages. */
export function DefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[0.875rem] text-ink-70">{label}</dt>
      <dd className="min-w-0 text-ink">{children}</dd>
    </div>
  );
}
