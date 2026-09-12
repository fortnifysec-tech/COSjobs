import Link from "next/link";

export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const link = "inline-flex h-10 items-center border border-ink px-4 text-[0.9375rem] font-medium text-ink no-underline hover:bg-card";
  const disabled = "inline-flex h-10 items-center border hairline px-4 text-[0.9375rem] text-ink-45";
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-4 border-t hairline pt-4">
      {page > 1 ? <Link href={href(page - 1)} className={link}>Previous</Link> : <span className={disabled}>Previous</span>}
      <p className="text-[0.875rem] text-ink-70">
        Page <span className="mono">{page}</span> of <span className="mono">{pageCount}</span>
      </p>
      {page < pageCount ? <Link href={href(page + 1)} className={link}>Next</Link> : <span className={disabled}>Next</span>}
    </nav>
  );
}
