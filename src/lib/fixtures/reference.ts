/**
 * Reference data fixtures. Versioned by effective date.
 * Going rates approximate Appendix Skilled Occupations (ASHE 2024 based) and must be
 * refreshed from the published tables before live ingestion.
 */
export const RULES_VERSION = "2025-07-22";

export const THRESHOLDS = [
  { code: "GENERAL", amount: 41700, effectiveFrom: "2025-07-22", effectiveTo: null },
  { code: "NEW_ENTRANT", amount: 33400, effectiveFrom: "2025-07-22", effectiveTo: null },
  { code: "PHD_RELEVANT", amount: 37500, effectiveFrom: "2025-07-22", effectiveTo: null },
  { code: "PHD_STEM", amount: 33400, effectiveFrom: "2025-07-22", effectiveTo: null },
  { code: "TSL", amount: 33400, effectiveFrom: "2025-07-22", effectiveTo: null },
  { code: "HOURLY_MIN", amount: 17.13, effectiveFrom: "2025-07-22", effectiveTo: null },
  // Superseded rows, kept so old verdicts can be explained.
  { code: "GENERAL", amount: 38700, effectiveFrom: "2024-04-04", effectiveTo: "2025-07-21" },
  { code: "HOURLY_MIN", amount: 15.88, effectiveFrom: "2024-04-04", effectiveTo: "2025-07-21" },
] as const;

export type OccupationFixture = {
  socCode: string;
  title: string;
  rqfLevel: number;
  goingRateAnnual: number;
  isTsl: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  /** Sample job titles used by the generator. */
  titles: string[];
};

export const OCCUPATIONS: OccupationFixture[] = [
  { socCode: "2134", title: "Programmers and software development professionals", rqfLevel: 6, goingRateAnnual: 49400, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Software engineer", "Senior software engineer", "Backend developer", "Full stack developer", "Platform engineer"] },
  { socCode: "2133", title: "IT business analysts, architects and systems designers", rqfLevel: 6, goingRateAnnual: 48000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Solutions architect", "Business analyst", "Systems designer"] },
  { socCode: "2135", title: "Cyber security professionals", rqfLevel: 6, goingRateAnnual: 50100, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Security engineer", "Cyber security analyst", "Penetration tester"] },
  { socCode: "2136", title: "IT quality and testing professionals", rqfLevel: 6, goingRateAnnual: 40800, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["QA engineer", "Test automation engineer"] },
  { socCode: "2137", title: "IT network professionals", rqfLevel: 6, goingRateAnnual: 41400, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Network engineer", "Cloud infrastructure engineer"] },
  { socCode: "2121", title: "Civil engineers", rqfLevel: 6, goingRateAnnual: 42400, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Civil engineer", "Structural engineer", "Highways engineer"] },
  { socCode: "2122", title: "Mechanical engineers", rqfLevel: 6, goingRateAnnual: 43000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Mechanical engineer", "Design engineer"] },
  { socCode: "2123", title: "Electrical engineers", rqfLevel: 6, goingRateAnnual: 44300, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Electrical engineer", "Power systems engineer"] },
  { socCode: "2129", title: "Engineering professionals n.e.c.", rqfLevel: 6, goingRateAnnual: 42300, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Process engineer", "Systems engineer"] },
  { socCode: "2221", title: "Physiotherapists", rqfLevel: 6, goingRateAnnual: 32300, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Band 6 physiotherapist", "Physiotherapist", "Senior physiotherapist"] },
  { socCode: "2231", title: "Nurses", rqfLevel: 6, goingRateAnnual: 31100, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Staff nurse", "Registered nurse", "Charge nurse"] },
  { socCode: "2211", title: "Generalist medical practitioners", rqfLevel: 6, goingRateAnnual: 72500, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Salaried GP"] },
  { socCode: "2213", title: "Pharmacists", rqfLevel: 6, goingRateAnnual: 43000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Pharmacist", "Clinical pharmacist"] },
  { socCode: "2314", title: "Secondary education teaching professionals", rqfLevel: 6, goingRateAnnual: 31650, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Teacher of mathematics", "Teacher of physics", "Teacher of computing"] },
  { socCode: "2311", title: "Higher education teaching professionals", rqfLevel: 6, goingRateAnnual: 44000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Lecturer in computer science", "Lecturer in economics"] },
  { socCode: "2421", title: "Chartered and certified accountants", rqfLevel: 6, goingRateAnnual: 45700, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Management accountant", "Financial accountant", "Audit senior"] },
  { socCode: "2425", title: "Actuaries, economists and statisticians", rqfLevel: 6, goingRateAnnual: 47600, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Statistician", "Economist", "Actuarial analyst"] },
  { socCode: "2451", title: "Architects", rqfLevel: 6, goingRateAnnual: 41700, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Architect", "Project architect"] },
  { socCode: "2432", title: "Quantity surveyors", rqfLevel: 6, goingRateAnnual: 44400, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Quantity surveyor", "Senior quantity surveyor"] },
  { socCode: "1121", title: "Production managers and directors in manufacturing", rqfLevel: 6, goingRateAnnual: 49000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Production manager", "Operations manager (manufacturing)"] },
  { socCode: "2431", title: "Marketing and commercial managers", rqfLevel: 6, goingRateAnnual: 47800, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Marketing manager", "Commercial manager"] },
  { socCode: "2461", title: "Chartered surveyors", rqfLevel: 6, goingRateAnnual: 43000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Building surveyor", "Chartered surveyor"] },
  // Temporary Shortage List occupations (RQF 3-5, eligible while listed)
  { socCode: "3544", title: "Data analysts", rqfLevel: 4, goingRateAnnual: 34000, isTsl: true, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Data analyst", "Junior data analyst", "Reporting analyst"] },
  { socCode: "3111", title: "Laboratory technicians", rqfLevel: 3, goingRateAnnual: 26400, isTsl: true, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Laboratory technician", "Senior lab technician"] },
  { socCode: "3113", title: "Engineering technicians", rqfLevel: 3, goingRateAnnual: 33000, isTsl: true, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Engineering technician", "Maintenance technician"] },
  { socCode: "5245", title: "IT engineers", rqfLevel: 3, goingRateAnnual: 32100, isTsl: true, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["IT support engineer", "Field service engineer"] },
  { socCode: "3421", title: "Graphic and multimedia designers", rqfLevel: 4, goingRateAnnual: 30600, isTsl: true, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Graphic designer", "Multimedia designer"] },
  // Below RQF 6, not on the list. Not eligible.
  { socCode: "1232", title: "Residential, day and domiciliary care managers and proprietors", rqfLevel: 5, goingRateAnnual: 33000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Care home manager", "Registered manager"] },
  { socCode: "6135", title: "Care workers and home carers", rqfLevel: 3, goingRateAnnual: 25000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Care assistant", "Senior care worker"] },
  { socCode: "5434", title: "Chefs", rqfLevel: 3, goingRateAnnual: 28400, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Chef de partie", "Sous chef", "Head chef"] },
  { socCode: "3212", title: "Nursing auxiliaries and assistants", rqfLevel: 3, goingRateAnnual: 24000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Healthcare assistant"] },
  { socCode: "4122", title: "Book-keepers, payroll managers and wages clerks", rqfLevel: 3, goingRateAnnual: 28000, isTsl: false, effectiveFrom: "2025-07-22", effectiveTo: null, titles: ["Payroll administrator", "Bookkeeper"] },
];
