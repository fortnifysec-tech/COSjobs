import Link from "next/link";
import { BROWSE, DISCLAIMER, NAV, SITE_DOMAIN, SITE_NAME } from "@/lib/site";

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
] as const;

const SOURCES = [
  { label: "Register of licensed sponsors", href: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" },
  { label: "Appendix Skilled Occupations", href: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations" },
  { label: "Skilled Worker visa: rules", href: "https://www.gov.uk/skilled-worker-visa" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <p className="text-[1.125rem] tracking-heading text-ink">
              <span className="font-bold">COS</span>jobs
            </p>
            <div className="mt-3 max-w-[58ch] space-y-2 text-[0.875rem] leading-relaxed text-ink-70">
              {DISCLAIMER.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <nav aria-label="Footer">
            <p className="text-[0.875rem] font-bold text-ink">Site</p>
            <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
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
          <nav aria-label="Browse">
            <p className="text-[0.875rem] font-bold text-ink">Browse</p>
            <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
              {BROWSE.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-[0.875rem] font-bold text-ink">Legal</p>
            <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Sources">
            <p className="text-[0.875rem] font-bold text-ink">Sources on GOV.UK</p>
            <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
              {SOURCES.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" className="text-ink-70 no-underline hover:text-ink hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t hairline pt-4 text-[0.8125rem] text-ink-45 sm:flex-row sm:items-baseline sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Register data is Crown copyright, reused under the Open Government Licence v3.0.
          </p>
          <p className="mono">{SITE_DOMAIN}</p>
        </div>
      </div>
    </footer>
  );
}
