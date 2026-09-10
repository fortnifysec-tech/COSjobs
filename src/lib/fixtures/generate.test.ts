import { describe, expect, it } from "vitest";
import { buildFixtures } from "./generate";

describe("buildFixtures", () => {
  const fx = buildFixtures();
  it("produces 200 jobs", () => {
    expect(fx.jobs).toHaveLength(200);
  });
  it("is deterministic", () => {
    expect(buildFixtures().jobs.map((j) => j.slug)).toEqual(fx.jobs.map((j) => j.slug));
  });
  it("covers every verdict", () => {
    const verdicts = new Set(fx.jobs.map((j) => j.outcome.verdict));
    for (const v of ["CONFIRMED", "LIKELY", "SALARY_UNKNOWN", "BELOW_THRESHOLD", "OCCUPATION_INELIGIBLE", "LICENCE_RESTRICTED", "NO_LICENCE", "REJECTED"]) {
      expect(verdicts.has(v as never), v).toBe(true);
    }
  });
  it("covers every sponsor band", () => {
    const bands = new Set(fx.activity.map((a) => a.band));
    for (const b of ["A", "B", "C", "D", "NEW"]) expect(bands.has(b as never), b).toBe(true);
  });
  it("has unique slugs and ids", () => {
    expect(new Set(fx.jobs.map((j) => j.slug)).size).toBe(200);
    expect(new Set(fx.jobs.map((j) => j.id)).size).toBe(200);
  });
  it("stores the rules version on every assessment", () => {
    expect(fx.jobs.every((j) => j.outcome.rulesVersion === fx.rulesVersion)).toBe(true);
  });
});
