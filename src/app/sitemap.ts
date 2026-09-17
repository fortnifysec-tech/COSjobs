import type { MetadataRoute } from "next";
import { and, desc, eq } from "drizzle-orm";
import { db, hasDatabase, schema } from "@/db/client";
import { cityIndex, occupationIndex, routeIndex } from "@/lib/data/browse";
import { GUIDES } from "@/lib/guides";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosjobs.co.uk";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/sponsors`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/occupations`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/cities`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/visa`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...GUIDES.map((g) => ({ url: `${BASE}/guides/${g.slug}`, lastModified: new Date(g.checked), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  if (!hasDatabase) return fixed;

  const d = db();
  const [{ items: occ }, cities, routes, jobs] = await Promise.all([
    occupationIndex(),
    cityIndex(),
    routeIndex(),
    d
      .select({ slug: schema.jobs.slug, lastSeenAt: schema.jobs.lastSeenAt })
      .from(schema.jobs)
      .where(and(eq(schema.jobs.isLive, true)))
      .orderBy(desc(schema.jobs.postedAt))
      .limit(5000),
  ]);
  return [
    ...fixed,
    ...occ.map((o) => ({ url: `${BASE}/occupations/${o.socCode}`, lastModified: now, changeFrequency: "daily" as const, priority: o.live ? 0.6 : 0.3 })),
    ...cities.map((c) => ({ url: `${BASE}/cities/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.5 })),
    ...routes.map((r) => ({ url: `${BASE}/visa/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.4 })),
    ...jobs.map((j) => ({ url: `${BASE}/jobs/${j.slug}`, lastModified: j.lastSeenAt, changeFrequency: "daily" as const, priority: 0.5 })),
  ];
}
