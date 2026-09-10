import { describe, expect, it } from "vitest";
import { annualise, decide } from "./decide";
import type { OccupationRule, RulesInput, SponsorRecord } from "./types";

const THRESHOLDS = { general: 41700, hourlyMin: 17.13, version: "2025-07-22" };

const dev: OccupationRule = {
  socCode: "2134",
  title: "Programmers and software development professionals",
  rqfLevel: 6,
  goingRateAnnual: 49400,
  isTsl: false,
};
const dataAnalyst: OccupationRule = {
  socCode: "3544",
  title: "Data analysts",
  rqfLevel: 4,
  goingRateAnnual: 34000,
  isTsl: true,
};
const careWorker: OccupationRule = {
  socCode: "6135",
  title: "Care workers and home carers",
  rqfLevel: 3,
  goingRateAnnual: 25000,
  isTsl: false,
};
const sponsorA: SponsorRecord = {
  id: "s1",
  name: "Octopus Energy Ltd",
  routes: ["Skilled Worker"],
  rating: "A",
  isActive: true,
};

function base(overrides: Partial<RulesInput> = {}): RulesInput {
  return {
    occupation: dev,
    sponsor: sponsorA,
    salary: { min: 60000, max: 70000, period: "year" },
    signals: { positiveSnippet: "Visa sponsorship is available.", negativeMatch: null },
    thresholds: THRESHOLDS,
    ...overrides,
  };
}

describe("annualise", () => {
  it("uses the range minimum, never the midpoint", () => {
    expect(annualise({ min: 40000, max: 80000, period: "year" })).toBe(40000);
  });
  it("returns null when the minimum is missing", () => {
    expect(annualise({ min: null, max: 80000, period: "year" })).toBeNull();
    expect(annualise({ min: null, max: null, period: null })).toBeNull();
    expect(annualise({ min: 0, max: null, period: "year" })).toBeNull();
  });
  it("annualises each period", () => {
    expect(annualise({ min: 4000, max: null, period: "month" })).toBe(48000);
    expect(annualise({ min: 1000, max: null, period: "week" })).toBe(52000);
    expect(annualise({ min: 200, max: null, period: "day" })).toBe(52000);
    expect(annualise({ min: 20, max: null, period: "hour" })).toBe(39000);
  });
  it("defaults a missing period to annual", () => {
    expect(annualise({ min: 45000, max: null, period: null })).toBe(45000);
  });
});

describe("decide: precedence", () => {
  it("refusal wording overrides everything, even a perfect role", () => {
    const out = decide(base({ signals: { positiveSnippet: "Sponsorship available.", negativeMatch: "no visa sponsorship" } }));
    expect(out.verdict).toBe("REJECTED");
    expect(out.checks).toHaveLength(1);
    expect(out.checks[0]).toMatchObject({ key: "refusal", state: "FAIL" });
    expect(out.salaryCheck).toBe("UNKNOWN");
  });
  it("licence is checked before occupation", () => {
    const out = decide(base({ sponsor: null, occupation: careWorker }));
    expect(out.verdict).toBe("NO_LICENCE");
  });
  it("occupation is checked before salary", () => {
    const out = decide(base({ occupation: careWorker, salary: { min: null, max: null, period: null } }));
    expect(out.verdict).toBe("OCCUPATION_INELIGIBLE");
  });
});

describe("decide: licence", () => {
  it("no sponsor match → NO_LICENCE", () => {
    expect(decide(base({ sponsor: null })).verdict).toBe("NO_LICENCE");
  });
  it("removed from register → NO_LICENCE", () => {
    expect(decide(base({ sponsor: { ...sponsorA, isActive: false } })).verdict).toBe("NO_LICENCE");
  });
  it("licence without the Skilled Worker route → LICENCE_RESTRICTED", () => {
    expect(decide(base({ sponsor: { ...sponsorA, routes: ["Global Business Mobility: Senior or Specialist Worker"] } })).verdict).toBe("LICENCE_RESTRICTED");
  });
  it("B-rated licence → LICENCE_RESTRICTED", () => {
    expect(decide(base({ sponsor: { ...sponsorA, rating: "B" } })).verdict).toBe("LICENCE_RESTRICTED");
  });
  it("unrated licence → LICENCE_RESTRICTED", () => {
    expect(decide(base({ sponsor: { ...sponsorA, rating: null } })).verdict).toBe("LICENCE_RESTRICTED");
  });
});

describe("decide: occupation", () => {
  it("RQF 6 passes", () => {
    expect(decide(base()).verdict).toBe("CONFIRMED");
  });
  it("RQF 7 passes", () => {
    expect(decide(base({ occupation: { ...dev, rqfLevel: 7 } })).verdict).toBe("CONFIRMED");
  });
  it("RQF 5 fails unless on the TSL", () => {
    expect(decide(base({ occupation: { ...dev, rqfLevel: 5 } })).verdict).toBe("OCCUPATION_INELIGIBLE");
    expect(decide(base({ occupation: { ...dev, rqfLevel: 5, isTsl: true } })).verdict).toBe("CONFIRMED");
  });
  it("RQF 3 on the TSL passes the occupation check", () => {
    const out = decide(base({ occupation: dataAnalyst, salary: { min: 42000, max: null, period: "year" } }));
    expect(out.verdict).toBe("CONFIRMED");
    expect(out.checks.find((c) => c.key === "occupation")?.detail).toContain("Temporary Shortage List");
  });
  it("no occupation code → OCCUPATION_INELIGIBLE", () => {
    expect(decide(base({ occupation: null })).verdict).toBe("OCCUPATION_INELIGIBLE");
  });
});

describe("decide: salary", () => {
  it("required is the higher of general threshold and going rate", () => {
    const out = decide(base());
    expect(out.salaryRequiredAnnual).toBe(49400);
    const low = decide(base({ occupation: { ...dev, goingRateAnnual: 30000 } }));
    expect(low.salaryRequiredAnnual).toBe(41700);
  });
  it("exactly at the requirement passes", () => {
    expect(decide(base({ salary: { min: 49400, max: null, period: "year" } })).verdict).toBe("CONFIRMED");
  });
  it("one pound under fails", () => {
    const out = decide(base({ salary: { min: 49399, max: null, period: "year" } }));
    expect(out.verdict).toBe("BELOW_THRESHOLD");
    expect(out.salaryCheck).toBe("FAIL");
    expect(out.salaryAssessedAnnual).toBe(49399);
  });
  it("a range is tested at its minimum", () => {
    expect(decide(base({ salary: { min: 45000, max: 90000, period: "year" } })).verdict).toBe("BELOW_THRESHOLD");
  });
  it("absent salary → SALARY_UNKNOWN", () => {
    const out = decide(base({ salary: { min: null, max: null, period: null } }));
    expect(out.verdict).toBe("SALARY_UNKNOWN");
    expect(out.salaryCheck).toBe("UNKNOWN");
    expect(out.salaryAssessedAnnual).toBeNull();
    expect(out.salaryRequiredAnnual).toBe(49400);
  });
  it("only a maximum (“up to £80k”) → SALARY_UNKNOWN", () => {
    expect(decide(base({ salary: { min: null, max: 80000, period: "year" } })).verdict).toBe("SALARY_UNKNOWN");
  });
  it("monthly figures are annualised", () => {
    expect(decide(base({ salary: { min: 4200, max: null, period: "month" } })).verdict).toBe("CONFIRMED");
    expect(decide(base({ salary: { min: 4000, max: null, period: "month" } })).verdict).toBe("BELOW_THRESHOLD");
  });
  it("hourly rate below the hourly floor fails even if the annualised figure passes", () => {
    const out = decide(
      base({
        occupation: { ...dev, goingRateAnnual: 30000 },
        salary: { min: 17, max: null, period: "hour" },
        thresholds: { ...THRESHOLDS, general: 30000 },
      }),
    );
    expect(out.verdict).toBe("BELOW_THRESHOLD");
    expect(out.checks.at(-1)?.detail).toContain("hourly floor");
  });
  it("hourly rate at the floor and annualised over the requirement passes", () => {
    const out = decide(
      base({
        occupation: { ...dev, goingRateAnnual: 30000 },
        salary: { min: 17.13, max: null, period: "hour" },
        thresholds: { ...THRESHOLDS, general: 30000 },
      }),
    );
    expect(out.verdict).toBe("CONFIRMED");
  });
});

describe("decide: final verdict", () => {
  it("all pass with a positive sponsorship sentence → CONFIRMED", () => {
    const out = decide(base());
    expect(out.verdict).toBe("CONFIRMED");
    expect(out.reason).toBeNull();
    expect(out.checks.map((c) => c.state)).toEqual(["PASS", "PASS", "PASS", "PASS"]);
  });
  it("all pass without a sponsorship sentence → LIKELY, with a reason", () => {
    const out = decide(base({ signals: { positiveSnippet: null, negativeMatch: null } }));
    expect(out.verdict).toBe("LIKELY");
    expect(out.reason).toMatch(/does not say sponsorship/);
  });
  it("stores the rules version on every outcome", () => {
    for (const v of [base(), base({ sponsor: null }), base({ occupation: null })]) {
      expect(decide(v).rulesVersion).toBe("2025-07-22");
    }
  });
  it("is pure: same input, same output", () => {
    const a = decide(base());
    const b = decide(base());
    expect(a).toEqual(b);
  });
});
