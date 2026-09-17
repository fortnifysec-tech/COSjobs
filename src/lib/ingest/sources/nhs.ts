/**
 * NHS Jobs (jobs.nhs.uk). Public search API returns XML with a truncated
 * description; the advert page carries the full text and, when the employer
 * has ticked it, a "Certificate of Sponsorship" section.
 */
import { htmlToText, unescapeHtml } from "../html";
import { parseSalaryField } from "../salary";
import type { FetchOptions, JobSource, RawJob } from "../types";

const SEARCH = "https://www.jobs.nhs.uk/api/v1/search_xml";
const USER_AGENT = "COSjobs/0.1 (+https://cosjobs.co.uk; reads public adverts to check Skilled Worker rules)";

/** Roles the Skilled Worker route covers and that the NHS advertises in volume. */
export const NHS_KEYWORDS = [
  "software engineer",
  "data engineer",
  "data scientist",
  "data analyst",
  "cyber security",
  "network engineer",
  "solutions architect",
  "business analyst",
  "project manager",
  "clinical scientist",
  "biomedical scientist",
  "pharmacist",
  "physiotherapist",
  "occupational therapist",
  "radiographer",
  "sonographer",
  "dietitian",
  "speech and language therapist",
  "clinical psychologist",
  "paramedic",
  "midwife",
  "staff nurse",
  "nurse practitioner",
  "mental health nurse",
  "consultant",
  "specialty doctor",
  "registrar",
  "general practitioner",
  "medical engineer",
  "service manager",
];

type Vacancy = {
  id: string;
  reference: string;
  title: string;
  description: string;
  employer: string;
  salary: string;
  closeDate: string;
  postDate: string;
  url: string;
  location: string;
};

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? unescapeHtml(m[1]!).trim() : "";
}

/** Parse one search page. Exported for tests. */
export function parseSearchXml(xml: string): { vacancies: Vacancy[]; totalPages: number } {
  const vacancies: Vacancy[] = [];
  for (const m of xml.matchAll(/<vacancyDetails>([\s\S]*?)<\/vacancyDetails>/g)) {
    const v = m[1]!;
    vacancies.push({
      id: tag(v, "id"),
      reference: tag(v, "reference"),
      title: tag(v, "title"),
      description: tag(v, "description"),
      employer: tag(v, "employer"),
      salary: tag(v, "salary"),
      closeDate: tag(v, "closeDate"),
      postDate: tag(v, "postDate"),
      url: tag(v, "url"),
      location: tag(v, "location"),
    });
  }
  const totalPages = Number(tag(xml, "totalPages")) || 1;
  return { vacancies, totalPages };
}

/**
 * The advert body: from "Job summary" to just before "Employer details".
 * Exported for tests.
 */
export function parseAdvertHtml(html: string): string | null {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  const text = htmlToText(main);
  const start = text.search(/^Job summary$/m);
  if (start === -1) return null;
  const endMatch = text.slice(start).search(/^Employer details$/m);
  const body = endMatch === -1 ? text.slice(start) : text.slice(start, start + endMatch);
  return body
    .replace(/^Skip to main content.*$/m, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toRaw(v: Vacancy, description: string): RawJob | null {
  if (!v.id || !v.title || !v.employer) return null;
  const salary = parseSalaryField(v.salary);
  const town = v.location.split(",")[0]?.trim() || "UK";
  const postedAt = v.postDate ? new Date(v.postDate.slice(0, 19)) : new Date();
  const closesAt = v.closeDate ? new Date(`${v.closeDate}T23:59:59`) : null;
  return {
    source: "nhs-jobs",
    sourceJobId: v.id,
    employerRawName: v.employer.trim(),
    title: v.title.trim(),
    description,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryPeriod: salary.period,
    location: town,
    isRemote: false,
    postedAt: Number.isNaN(postedAt.getTime()) ? new Date() : postedAt,
    closesAt: closesAt && !Number.isNaN(closesAt.getTime()) ? closesAt : null,
    applyUrl: v.url || `https://www.jobs.nhs.uk/candidate/jobadvert/${v.reference}`,
  };
}

async function get(url: string, accept: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT, accept } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function mapLimit<T, U>(items: T[], limit: number, fn: (t: T) => Promise<U>): Promise<U[]> {
  const out: U[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]!);
      }
    }),
  );
  return out;
}

export const nhsJobs: JobSource = {
  key: "nhs-jobs",
  exhaustive: false,
  async fetch(opts: FetchOptions): Promise<RawJob[]> {
    const log = opts.log ?? (() => {});
    const pages = opts.pages ?? 3;
    const limit = opts.limit ?? 600;
    const seen = new Map<string, Vacancy>();

    for (const keyword of NHS_KEYWORDS) {
      for (let page = 1; page <= pages; page++) {
        let xml: string;
        try {
          xml = await get(`${SEARCH}?keyword=${encodeURIComponent(keyword)}&page=${page}`, "application/xml");
        } catch (e) {
          log(`nhs-jobs: search "${keyword}" page ${page} failed: ${(e as Error).message}`);
          break;
        }
        const { vacancies, totalPages } = parseSearchXml(xml);
        for (const v of vacancies) if (!seen.has(v.id)) seen.set(v.id, v);
        if (page >= totalPages) break;
        if (seen.size >= limit) break;
      }
      if (seen.size >= limit) break;
    }
    const list = [...seen.values()].slice(0, limit);
    log(`nhs-jobs: ${list.length} adverts from ${NHS_KEYWORDS.length} searches; reading advert pages`);

    let fetched = 0;
    const jobs = await mapLimit(list, 4, async (v) => {
      let description = v.description.replace(/\.{3}$/, "").trim();
      try {
        const html = await get(v.url, "text/html");
        const body = parseAdvertHtml(html);
        if (body) {
          description = body;
          fetched++;
        }
      } catch (e) {
        log(`nhs-jobs: advert ${v.reference} not read (${(e as Error).message}); using search summary`);
      }
      await new Promise((r) => setTimeout(r, 150));
      return toRaw(v, description);
    });
    log(`nhs-jobs: full text for ${fetched} of ${list.length}`);
    return jobs.filter((j): j is RawJob => j !== null);
  },
};
