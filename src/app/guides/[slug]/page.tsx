import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { longDate } from "@/lib/format";
import { findGuide, GUIDES } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) return { title: "Guide not found" };
  return { title: g.title, description: g.summary };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
      <p className="text-[0.875rem] text-ink-70">
        <Link href="/guides" className="text-ink-70 hover:text-ink">
          Guides
        </Link>
      </p>
      <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] md:gap-12">
        <article className="min-w-0">
          <h1 className="text-[1.875rem] leading-[1.1] sm:text-[2.375rem]">{g.title}</h1>
          <p className="prose-lede mt-4 max-w-[58ch]">{g.summary}</p>
          <p className="mono mt-3 text-[0.8125rem] text-ink-45">Figures checked against GOV.UK on {longDate(g.checked)}.</p>
          <div className="prose-body mt-6 max-w-[68ch] space-y-4 text-[1.0625rem] leading-relaxed">{g.body}</div>
          <section className="mt-10 border-t-2 border-ink pt-3" aria-labelledby="sources">
            <h2 id="sources" className="text-[1rem]">
              Sources
            </h2>
            <ul className="mt-2 space-y-1 text-[0.9375rem]">
              {g.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" className="text-ink">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <aside className="min-w-0 md:pt-2">
          <div className="inset">
            <p className="text-[0.9375rem] leading-relaxed text-ink-70">
              This guide explains published rules. It is not immigration advice and it cannot account for your circumstances. Check GOV.UK before you act,
              and use a regulated adviser if your case is not simple.
            </p>
          </div>
          <h2 className="mt-8 border-b-2 border-ink pb-2 text-[1.125rem]">Other guides</h2>
          <ul className="divide-y divide-rule-soft">
            {others.map((o) => (
              <li key={o.slug} className="py-2.5">
                <Link href={`/guides/${o.slug}`} className="text-[0.9375rem] text-ink">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
