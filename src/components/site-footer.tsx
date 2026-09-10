import Link from "next/link";
import { DISCLAIMER, NAV, SITE_NAME } from "@/lib/site";

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t hairline bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-[1rem] font-bold tracking-heading text-ink">{SITE_NAME}</p>
            <div className="mt-3 max-w-prose space-y-2 text-[0.8125rem] leading-relaxed text-ink-70">
              {DISCLAIMER.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="text-[0.8125rem] font-medium text-ink">Site</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/account" className="text-ink-70 no-underline hover:text-ink hover:underline">
                  Account
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-[0.8125rem] font-medium text-ink">Legal</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t hairline-soft pt-4 text-[0.75rem] text-ink-45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Register data from the Home Office list of
            licensed sponsors, published under the Open Government Licence.
          </p>
          <p>cosjobs.co.uk</p>
        </div>
      </div>
    </footer>
  );
}
