import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { hasDatabase } from "@/db/client";
import { siteStats } from "@/lib/data/sponsors";
import { isoDate, shortDateTime } from "@/lib/format";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "COSjobs: UK jobs checked against the Skilled Worker visa rules",
    template: "%s · COSjobs",
  },
  description:
    "Every role is checked against the Skilled Worker rules: occupation code, going rate, salary threshold and the employer's licence. We show the arithmetic.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let registerLine: string | undefined;
  if (hasDatabase) {
    const s = await siteStats().catch(() => null);
    if (s?.registerCheckedAt) {
      registerLine = `Register checked ${shortDateTime(s.registerCheckedAt)}${s.rulesVersion ? ` · Rules ${isoDate(s.rulesVersion)}` : ""}`;
    }
  }
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-paper focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <SiteHeader registerLine={registerLine} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
