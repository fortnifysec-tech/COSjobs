import Link from "next/link";

const ITEMS = [
  { href: "/occupations", label: "Occupation codes" },
  { href: "/cities", label: "Towns and cities" },
  { href: "/visa", label: "Visa routes" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/guides", label: "Guides" },
] as const;

/**
 * The same short row on every browse page, so a reader always knows the four
 * ways in and where they are. The current section carries the ink rule.
 */
export function BrowseNav({ current }: { current: (typeof ITEMS)[number]["href"] }) {
  return (
    <nav aria-label="Browse" className="-mx-4 overflow-x-auto border-b hairline px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-6 whitespace-nowrap text-[0.9375rem]">
        {ITEMS.map((i) => {
          const active = i.href === current;
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block border-b-2 py-2.5 no-underline ${active ? "border-ink text-ink" : "border-transparent text-ink-70 hover:border-rule hover:text-ink"}`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
