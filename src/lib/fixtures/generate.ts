import { decide, extractSignals } from "@/lib/eligibility";
import { scoreSponsor, SCORING_VERSION, type Band } from "@/lib/eligibility/scoring";
import type { RulesOutcome, SalaryPeriod, Verdict } from "@/lib/eligibility/types";
import { OCCUPATIONS, RULES_VERSION, THRESHOLDS, type OccupationFixture } from "./reference";
import { SPONSORS, UNLICENSED_EMPLOYERS, type SponsorFixture } from "./sponsors";

/* ---------- deterministic PRNG ---------- */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export { slugify, normaliseName } from "@/lib/names";
import { slugify, normaliseName } from "@/lib/names";

/* ---------- shapes ---------- */

export type SponsorSeed = SponsorFixture & { id: string; normalisedName: string; firstSeenAt: Date; lastSeenAt: Date };

export type JobSeed = {
  id: string;
  slug: string;
  source: string;
  sourceJobId: string;
  employerRawName: string;
  title: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod | null;
  location: string;
  isRemote: boolean;
  postedAt: Date;
  firstSeenAt: Date;
  lastSeenAt: Date;
  applyUrl: string;
  isLive: boolean;
  /** Derived, for the assessment row. */
  sponsorId: string | null;
  socCode: string | null;
  outcome: RulesOutcome;
  positiveSnippet: string | null;
  negativeMatch: string | null;
};

export type ActivitySeed = {
  sponsorId: string;
  jobsPosted90d: number;
  refusalRatio: number;
  eligibleRoleCount: number;
  licenceTenureDays: number;
  band: Band;
  score: number;
  scoringVersion: string;
  computedAt: Date;
};

export type RegisterEventSeed = {
  sponsorId: string;
  eventType: "ADDED" | "REMOVED" | "RATING_CHANGED" | "ROUTE_ADDED" | "ROUTE_REMOVED" | "NAME_CHANGED" | "TOWN_CHANGED";
  oldValue: string | null;
  newValue: string | null;
  detectedAt: Date;
};

export type Fixtures = {
  rulesVersion: string;
  thresholds: typeof THRESHOLDS;
  occupations: OccupationFixture[];
  sponsors: SponsorSeed[];
  jobs: JobSeed[];
  activity: ActivitySeed[];
  registerEvents: RegisterEventSeed[];
};

/* ---------- copy templates ---------- */

const CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Edinburgh", "Glasgow", "Cardiff", "Sheffield", "Nottingham", "Cambridge", "Reading", "Newcastle upon Tyne", "Liverpool", "Derby", "Coventry"];

const POSITIVE_SENTENCES = [
  "Visa sponsorship is available for this role.",
  "We can offer Skilled Worker visa sponsorship to the right candidate.",
  "Skilled Worker sponsorship is available.",
  "Sponsorship available for candidates who need it.",
];
const NEGATIVE_SENTENCES = [
  "Please note we are unable to offer visa sponsorship for this position.",
  "Candidates must have the right to work in the UK.",
  "No sponsorship is available for this role.",
  "Right to work in the UK is essential.",
];

function description(rng: () => number, title: string, employer: string, occ: OccupationFixture | null, extra: string | null) {
  const paras = [
    `${employer} is looking for a ${title.toLowerCase()} to join the team. You will work with colleagues across the business and take ownership of your area from day one.`,
    occ
      ? `The role sits within ${occ.title.toLowerCase().replace(/ n\.e\.c\./, "")}. You will need relevant experience, a methodical approach and clear written English.`
      : "You will need relevant experience, a methodical approach and clear written English.",
    pick(rng, [
      "We offer 25 days holiday plus bank holidays, a pension scheme and hybrid working where the role allows.",
      "Benefits include a defined contribution pension, private medical cover and a learning budget.",
      "You will get 27 days annual leave, an employer pension contribution and flexible hours.",
    ]),
  ];
  if (extra) paras.splice(1 + Math.floor(rng() * 2), 0, extra);
  return paras.join("\n\n");
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

/* ---------- generator ---------- */

type Target = Verdict;

const TARGETS: Target[] = [
  ...Array<Target>(70).fill("CONFIRMED"),
  ...Array<Target>(30).fill("LIKELY"),
  ...Array<Target>(25).fill("SALARY_UNKNOWN"),
  ...Array<Target>(30).fill("BELOW_THRESHOLD"),
  ...Array<Target>(20).fill("OCCUPATION_INELIGIBLE"),
  ...Array<Target>(8).fill("LICENCE_RESTRICTED"),
  ...Array<Target>(7).fill("NO_LICENCE"),
  ...Array<Target>(10).fill("REJECTED"),
];

export function buildFixtures(now = new Date("2026-09-10T06:00:00Z")): Fixtures {
  const rng = mulberry32(20260910);
  const general = THRESHOLDS.find((t) => t.code === "GENERAL" && t.effectiveTo === null)!.amount;
  const hourlyMin = THRESHOLDS.find((t) => t.code === "HOURLY_MIN" && t.effectiveTo === null)!.amount;
  const thresholds = { general, hourlyMin, version: RULES_VERSION };

  const sponsors: SponsorSeed[] = SPONSORS.map((s, i) => ({
    ...s,
    id: uuidFrom(`sponsor-${i}`),
    normalisedName: normaliseName(s.rawName),
    firstSeenAt: new Date(now.getTime() - s.tenureDays * 86_400_000),
    lastSeenAt: s.isActive ? now : new Date(now.getTime() - 20 * 86_400_000),
  }));

  const eligibleOcc = OCCUPATIONS.filter((o) => o.rqfLevel >= 6 || o.isTsl);
  const ineligibleOcc = OCCUPATIONS.filter((o) => !(o.rqfLevel >= 6 || o.isTsl));
  const goodSponsors = sponsors.filter((s) => s.isActive && s.rating === "A" && s.routes.includes("Skilled Worker") && !["PENNINE TIMBER FRAMES LIMITED", "SOUTHDOWN VETERINARY GROUP LTD"].includes(s.rawName));
  const restricted = sponsors.filter((s) => s.isActive && (s.rating !== "A" || !s.routes.includes("Skilled Worker")));
  const removed = sponsors.filter((s) => !s.isActive);

  const jobs: JobSeed[] = [];
  const shuffled = [...TARGETS].sort(() => rng() - 0.5);

  shuffled.forEach((target, i) => {
    let occ: OccupationFixture = pick(rng, eligibleOcc);
    let sponsor: SponsorSeed | null = pick(rng, goodSponsors);
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    let period: SalaryPeriod | null = "year";
    let extra: string | null = null;

    const required = () => Math.max(general, occ.goingRateAnnual);

    switch (target) {
      case "CONFIRMED": {
        salaryMin = required() + Math.round(rng() * 25000);
        salaryMax = rng() < 0.6 ? salaryMin + Math.round(rng() * 20000) : null;
        extra = pick(rng, POSITIVE_SENTENCES);
        break;
      }
      case "LIKELY": {
        salaryMin = required() + Math.round(rng() * 18000);
        salaryMax = rng() < 0.5 ? salaryMin + Math.round(rng() * 15000) : null;
        break;
      }
      case "SALARY_UNKNOWN": {
        salaryMin = null;
        salaryMax = rng() < 0.3 ? required() + 10000 : null;
        period = salaryMax ? "year" : null;
        extra = rng() < 0.5 ? pick(rng, POSITIVE_SENTENCES) : null;
        break;
      }
      case "BELOW_THRESHOLD": {
        salaryMin = Math.max(24000, required() - 1000 - Math.round(rng() * 12000));
        salaryMax = rng() < 0.5 ? required() + Math.round(rng() * 10000) : null; // range crossing the line: tested at min
        extra = rng() < 0.5 ? pick(rng, POSITIVE_SENTENCES) : null;
        break;
      }
      case "OCCUPATION_INELIGIBLE": {
        occ = pick(rng, ineligibleOcc);
        salaryMin = 26000 + Math.round(rng() * 20000);
        extra = rng() < 0.4 ? pick(rng, POSITIVE_SENTENCES) : null;
        break;
      }
      case "LICENCE_RESTRICTED": {
        sponsor = pick(rng, restricted);
        salaryMin = required() + Math.round(rng() * 10000);
        extra = pick(rng, POSITIVE_SENTENCES);
        break;
      }
      case "NO_LICENCE": {
        sponsor = rng() < 0.6 ? null : pick(rng, removed);
        salaryMin = required() + Math.round(rng() * 10000);
        extra = rng() < 0.5 ? pick(rng, POSITIVE_SENTENCES) : null;
        break;
      }
      case "REJECTED": {
        salaryMin = required() + Math.round(rng() * 15000);
        extra = pick(rng, NEGATIVE_SENTENCES);
        break;
      }
    }

    // Some monthly / hourly quotes for realism
    if (salaryMin !== null && period === "year" && target !== "BELOW_THRESHOLD" && rng() < 0.06) {
      salaryMin = Math.round(salaryMin / 12);
      salaryMax = salaryMax ? Math.round(salaryMax / 12) : null;
      period = "month";
    }

    const employerName = sponsor ? pick(rng, [sponsor.aliases[0] ?? sponsor.rawName, sponsor.rawName]) : pick(rng, UNLICENSED_EMPLOYERS);
    const title = pick(rng, occ.titles);
    const city = sponsor?.town && rng() < 0.5 ? sponsor.town : pick(rng, CITIES);
    const isRemote = rng() < 0.12;
    const desc = description(rng, title, employerName, occ, extra);
    const signals = extractSignals(desc);

    const outcome = decide({
      occupation: { socCode: occ.socCode, title: occ.title, rqfLevel: occ.rqfLevel, goingRateAnnual: occ.goingRateAnnual, isTsl: occ.isTsl },
      sponsor: sponsor ? { id: sponsor.id, name: sponsor.aliases[0] ?? sponsor.rawName, routes: sponsor.routes, rating: sponsor.rating, isActive: sponsor.isActive } : null,
      salary: { min: salaryMin, max: salaryMax, period },
      signals,
      thresholds,
    });
    if (outcome.verdict !== target) {
      throw new Error(`Fixture ${i} targeted ${target} but rules gave ${outcome.verdict}`);
    }

    const ageHours = Math.floor(rng() ** 2 * 24 * 60); // skew recent
    const postedAt = new Date(now.getTime() - ageHours * 3_600_000);
    const id = uuidFrom(`job-${i}`);
    jobs.push({
      id,
      slug: `${slugify(title)}-${slugify(employerName)}-${id.slice(0, 6)}`,
      source: pick(rng, ["adzuna", "reed", "employer-site"]),
      sourceJobId: `fx-${i.toString().padStart(4, "0")}`,
      employerRawName: employerName,
      title,
      description: desc,
      salaryMin,
      salaryMax,
      salaryPeriod: period,
      location: isRemote ? `Remote (${city})` : city,
      isRemote,
      postedAt,
      firstSeenAt: new Date(postedAt.getTime() + 1_800_000),
      lastSeenAt: now,
      applyUrl: `https://jobs.example.org/${slugify(employerName)}/${i}`,
      isLive: rng() > 0.05,
      sponsorId: sponsor?.id ?? null,
      socCode: occ.socCode,
      outcome,
      positiveSnippet: signals.positiveSnippet,
      negativeMatch: signals.negativeMatch,
    });
  });

  // Sponsor activity, derived from the jobs above
  const activity: ActivitySeed[] = sponsors.map((s) => {
    const mine = jobs.filter((j) => j.sponsorId === s.id);
    const failed = mine.filter((j) => !["CONFIRMED", "LIKELY"].includes(j.outcome.verdict)).length;
    const eligible = mine.length - failed;
    const input = {
      jobsPosted90d: mine.length,
      refusalRatio: mine.length ? failed / mine.length : 0,
      eligibleRoleCount: eligible,
      licenceTenureDays: s.tenureDays,
    };
    const { score, band } = scoreSponsor(input);
    return { sponsorId: s.id, ...input, band, score, scoringVersion: SCORING_VERSION, computedAt: now };
  });

  const byName = (n: string) => sponsors.find((s) => s.rawName === n)!;
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
  const registerEvents: RegisterEventSeed[] = [
    { sponsorId: byName("BLUESTONE HOSPITALITY LIMITED").id, eventType: "REMOVED", oldValue: "A", newValue: null, detectedAt: daysAgo(20) },
    { sponsorId: byName("MERIDIAN CARE HOMES LIMITED").id, eventType: "RATING_CHANGED", oldValue: "A", newValue: "B", detectedAt: daysAgo(34) },
    { sponsorId: byName("ASHFORD LOGISTICS LTD").id, eventType: "RATING_CHANGED", oldValue: "A", newValue: "B", detectedAt: daysAgo(61) },
    { sponsorId: byName("HELIOS CONSULTING (UK) LIMITED").id, eventType: "ROUTE_REMOVED", oldValue: "Skilled Worker", newValue: null, detectedAt: daysAgo(45) },
    { sponsorId: byName("GREENFIELD ROBOTICS LTD").id, eventType: "ADDED", oldValue: null, newValue: "A", detectedAt: daysAgo(90) },
    { sponsorId: byName("NORTHLIGHT DATA LIMITED").id, eventType: "ADDED", oldValue: null, newValue: "A", detectedAt: daysAgo(140) },
    { sponsorId: byName("OCTOPUS ENERGY LTD").id, eventType: "ROUTE_ADDED", oldValue: null, newValue: "Global Business Mobility: Senior or Specialist Worker", detectedAt: daysAgo(400) },
    { sponsorId: byName("MONZO BANK LIMITED").id, eventType: "TOWN_CHANGED", oldValue: "Cardiff", newValue: "London", detectedAt: daysAgo(210) },
    { sponsorId: byName("REVOLUT LTD").id, eventType: "NAME_CHANGED", oldValue: "REVOLUT LIMITED", newValue: "REVOLUT LTD", detectedAt: daysAgo(300) },
  ];

  return { rulesVersion: RULES_VERSION, thresholds: THRESHOLDS, occupations: OCCUPATIONS, sponsors, jobs, activity, registerEvents };
}

/** Deterministic UUID v4-shaped id from a string. Fixtures only. */
export function uuidFrom(key: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193, h3 = 0x9e3779b9, h4 = 0x7f4a7c15;
  for (let i = 0; i < key.length; i++) {
    const c = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
    h3 = Math.imul(h3 ^ c, 3266489917);
    h4 = Math.imul(h4 ^ c, 668265263);
  }
  const hex = [h1, h2, h3, h4].map((n) => (n >>> 0).toString(16).padStart(8, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
