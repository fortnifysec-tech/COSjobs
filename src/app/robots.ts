import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosjobs.co.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/sign-in"] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
