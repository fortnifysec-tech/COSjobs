import Link from "next/link";
import { NAV, SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b hairline bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-baseline gap-2 no-underline"
            aria-label={`${SITE_NAME} home`}
          >
            <span className="text-[1.125rem] font-bold tracking-heading text-ink">
              {SITE_NAME}
            </span>
            <span className="hidden text-[0.75rem] text-ink-45 sm:inline">
              Skilled Worker visa checks
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-70 no-underline hover:text-ink hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/sign-in"
              className="text-sm text-ink-70 no-underline hover:text-ink hover:underline"
            >
              Sign in
            </Link>
            <Link
              href="/jobs"
              className="inline-flex h-9 items-center bg-ink px-3.5 text-sm font-medium text-paper no-underline hover:bg-ink/90"
            >
              Check a role
            </Link>
          </div>

          <details className="group relative md:hidden">
            <summary
              className="inline-flex h-9 cursor-pointer items-center border hairline px-3 text-sm text-ink"
              aria-label="Open menu"
            >
              <span className="group-open:hidden">Menu</span>
              <span className="hidden group-open:inline">Close</span>
            </summary>
            <div className="absolute right-0 top-11 z-40 w-[calc(100vw-2rem)] max-w-xs border hairline bg-card">
              <ul className="divide-y divide-rule-soft text-sm">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-ink no-underline hover:bg-paper"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/sign-in"
                    className="block px-4 py-3 text-ink no-underline hover:bg-paper"
                  >
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
