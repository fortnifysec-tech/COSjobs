import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <p className="mono text-[0.8125rem] text-ink-45">404</p>
      <h1 className="mt-2 text-[1.875rem] leading-tight">There is no page at this address.</h1>
      <p className="prose-lede mt-4 max-w-[52ch]">
        Roles are removed when the advert closes, and a sponsor page moves if the employer changes its registered
        name. The search still has everything that is live.
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        <Link href="/jobs" className="btn">
          Search roles
        </Link>
        <Link href="/sponsors" className="btn-secondary">
          Browse sponsors
        </Link>
      </div>
    </div>
  );
}
