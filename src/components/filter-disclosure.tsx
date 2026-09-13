"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Wraps a filter form. On phones it starts collapsed behind a button so results
 * come first; on wider screens the form is always visible and the button is gone.
 * Renders the same markup on server and client, so no flash on load.
 */
export function FilterDisclosure({
  children,
  initiallyOpen = false,
  summary,
}: {
  children: ReactNode;
  initiallyOpen?: boolean;
  /** Short description of the active filters, shown next to the button. */
  summary?: string;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between gap-4 md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-2 border-2 border-ink px-3.5 text-[0.9375rem] font-medium text-ink"
        >
          <span aria-hidden="true" className="mono text-[0.875rem] leading-none">
            {open ? "−" : "+"}
          </span>
          {open ? "Hide filters" : "Filter roles"}
        </button>
        {summary && !open ? <p className="min-w-0 truncate text-[0.875rem] text-ink-70">{summary}</p> : null}
      </div>
      <div id={id} className={`${open ? "mt-5 block" : "hidden"} md:mt-0 md:block`}>
        {children}
      </div>
    </div>
  );
}
