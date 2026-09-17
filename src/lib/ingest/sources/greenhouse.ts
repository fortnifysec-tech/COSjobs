/**
 * Employer career sites on Greenhouse. The job board API is public and needs
 * no key. Each board is tied to the employer's name on the sponsor register,
 * checked by hand when the board was added.
 */
import { htmlToText, unescapeHtml } from "../html";
import { findSalaryInText } from "../salary";
import type { FetchOptions, JobSource, RawJob } from "../types";

export type Board = {
  slug: string;
  /** Name as the reader should see it. */
  employer: string;
  /** Organisation name on the register of licensed sponsors. */
  registerName: string;
};

/** UK sponsors with A-rated Skilled Worker licences that publish on Greenhouse. */
export const BOARDS: Board[] = [
  { slug: "monzo", employer: "Monzo", registerName: "Monzo Bank Ltd" },
  { slug: "wayve", employer: "Wayve", registerName: "Wayve Technologies Ltd" },
  { slug: "graphcore", employer: "Graphcore", registerName: "Graphcore Limited" },
  { slug: "stripe", employer: "Stripe", registerName: "Stripe Payments UK Ltd" },
  { slug: "anthropic", employer: "Anthropic", registerName: "Anthropic Limited" },
  { slug: "datadog", employer: "Datadog", registerName: "Datadog Ireland Limited" },
  { slug: "tide", employer: "Tide", registerName: "Tide Platform Ltd" },
  { slug: "figma", employer: "Figma", registerName: "Figma UK Limited" },
  { slug: "ocadogroup", employer: "Ocado Group", registerName: "Ocado Central Services Limited" },
  { slug: "gocardless", employer: "GoCardless", registerName: "GoCardless Limited" },
  { slug: "cloudflare", employer: "Cloudflare", registerName: "Cloudflare Limited" },
];

const UK_PLACES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Edinburgh",
  "Glasgow",
  "Cardiff",
  "Cambridge",
  "Oxford",
  "Reading",
  "Sheffield",
  "Nottingham",
  "Newcastle",
  "Liverpool",
  "Belfast",
  "Hatfield",
  "Milton Keynes",
  "Brighton",
];

type GhJob = {
  id: number;
  title: string;
  absolute_url: string;
  content?: string;
  first_published?: string;
  updated_at?: string;
  company_name?: string;
  location?: { name?: string };
};

/** Decide whether a Greenhouse location string is in the UK and name the town. Exported for tests. */
export function ukLocation(name: string | undefined): { location: string; isRemote: boolean } | null {
  const n = (name ?? "").trim();
  if (!n) return null;
  const remote = /\bremote\b/i.test(n);
  const place = UK_PLACES.find((p) => new RegExp(`\\b${p}\\b`, "i").test(n));
  const uk = /\b(?:uk|united kingdom|england|scotland|wales|northern ireland|gb)\b/i.test(n);
  if (place) return { location: remote && !/office/i.test(n) ? `${place}` : place, isRemote: false };
  if (uk) return { location: remote ? "Remote (UK)" : "UK", isRemote: remote };
  return null;
}

export function toRaw(board: Board, j: GhJob): RawJob | null {
  const loc = ukLocation(j.location?.name);
  if (!loc) return null;
  const html = unescapeHtml(j.content ?? "");
  const description = htmlToText(html);
  const salary = findSalaryInText(description);
  const posted = new Date(j.first_published ?? j.updated_at ?? Date.now());
  return {
    source: "greenhouse",
    sourceJobId: `${board.slug}-${j.id}`,
    employerRawName: j.company_name?.trim() || board.employer,
    employerRegisterName: board.registerName,
    title: j.title.trim(),
    description,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryPeriod: salary.period,
    location: loc.location,
    isRemote: loc.isRemote,
    postedAt: Number.isNaN(posted.getTime()) ? new Date() : posted,
    closesAt: null,
    applyUrl: j.absolute_url,
  };
}

export const greenhouse: JobSource = {
  key: "greenhouse",
  exhaustive: true,
  async fetch(opts: FetchOptions): Promise<RawJob[]> {
    const log = opts.log ?? (() => {});
    const out: RawJob[] = [];
    for (const board of BOARDS) {
      try {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { jobs: GhJob[] };
        const uk = data.jobs.map((j) => toRaw(board, j)).filter((j): j is RawJob => j !== null);
        log(`greenhouse/${board.slug}: ${uk.length} UK roles of ${data.jobs.length}`);
        out.push(...uk);
      } catch (e) {
        log(`greenhouse/${board.slug}: failed (${(e as Error).message})`);
      }
      if (opts.limit && out.length >= opts.limit) break;
    }
    return opts.limit ? out.slice(0, opts.limit) : out;
  },
};
