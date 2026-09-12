import Link from "next/link";
import { NAV, SITE_NAME } from "@/lib/site";

export function SiteHeader({ registerLine }: { registerLine?: string }) {
  return (
    <header className="bg-paper">
      <div className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-1.5 text-[0.75rem] sm:px-6">
          <p className="truncate">Independent. Not connected to the Home Office.</p>
          {registerLine ? <p className="mono hidden shrink-0 text-paper/80 sm:block">{registerLine}</p> : null}
        </div>
      </div>
      <div className="border-b-2 border-ink">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex h-[3.75rem] items-center justify-between gap-6">
            <Link href="/" className="flex items-baseline gap-2.5 no-underline" aria-label={`${SITE_NAME} home`}>
              <span className="text-[1.375rem] leading-none tracking-heading text-ink">
                <span className="font-bold">COS</span>
                <span className="font-normal">jobs</span>
              </span>
              <span className="inline-flex h-[1.125rem] items-center border border-ink px-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink">
                Beta
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-7 text-[0.9375rem]">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-ink no-underline hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden items-center gap-5 md:flex">
              <Link href="/sign-in" className="text-[0.9375rem] text-ink no-underline hover:underline">
                Sign in
              </Link>
              <Link
                href="/jobs"
                className="inline-flex h-9 items-center bg-ink px-3.5 text-[0.9375rem] font-medium text-paper no-underline hover:bg-ink/90"
              >
                Check a role
              </Link>
            </div>

            <details className="group relative md:hidden">
              <summary className="inline-flex h-9 cursor-pointer items-center border border-ink px-3 text-[0.9375rem] text-ink" aria-label="Open menu">
                <span className="group-open:hidden">Menu</span>
                <span className="hidden group-open:inline">Close</span>
              </summary>
              <div className="absolute right-0 top-11 z-40 w-[calc(100vw-2rem)] max-w-xs border-2 border-ink bg-card">
                <ul className="divide-y divide-rule-soft text-[0.9375rem]">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block px-4 py-3 text-ink no-underline hover:bg-paper">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/sign-in" className="block px-4 py-3 text-ink no-underline hover:bg-paper">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
