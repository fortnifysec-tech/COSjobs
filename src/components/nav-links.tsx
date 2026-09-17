"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Primary navigation. The current section carries a rule beneath it and aria-current. */
export function NavLinks({ items, variant }: { items: readonly { href: string; label: string }[]; variant: "bar" | "menu" | "plain" }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={
                variant === "bar"
                  ? `inline-flex h-[3.75rem] items-center border-b-[3px] text-ink no-underline hover:underline ${
                      current ? "border-ink font-medium" : "border-transparent"
                    }`
                  : variant === "plain"
                    ? `text-ink no-underline hover:underline ${current ? "font-medium underline" : ""}`
                    : `block px-4 py-3 text-ink no-underline hover:bg-paper ${current ? "border-l-4 border-ink font-medium" : ""}`
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </>
  );
}
