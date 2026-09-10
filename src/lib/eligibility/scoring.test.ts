import { describe, expect, it } from "vitest";
import { scoreSponsor } from "./scoring";

describe("scoreSponsor", () => {
  it("NEW for licences under 180 days, regardless of activity", () => {
    expect(scoreSponsor({ jobsPosted90d: 30, refusalRatio: 0, eligibleRoleCount: 20, licenceTenureDays: 100 }).band).toBe("NEW");
  });
  it("A for a busy, mostly-passing, long-tenured sponsor", () => {
    expect(scoreSponsor({ jobsPosted90d: 25, refusalRatio: 0.1, eligibleRoleCount: 15, licenceTenureDays: 2000 }).band).toBe("A");
  });
  it("D for a silent sponsor", () => {
    const r = scoreSponsor({ jobsPosted90d: 0, refusalRatio: 0, eligibleRoleCount: 0, licenceTenureDays: 3000 });
    expect(r.band).toBe("D");
  });
  it("score is bounded 0..100", () => {
    const hi = scoreSponsor({ jobsPosted90d: 999, refusalRatio: 0, eligibleRoleCount: 999, licenceTenureDays: 99999 });
    expect(hi.score).toBe(100);
    const lo = scoreSponsor({ jobsPosted90d: 0, refusalRatio: 1, eligibleRoleCount: 0, licenceTenureDays: 200 });
    expect(lo.score).toBeGreaterThanOrEqual(0);
    expect(lo.band).toBe("D");
  });
  it("C for low activity", () => {
    expect(scoreSponsor({ jobsPosted90d: 2, refusalRatio: 0.5, eligibleRoleCount: 1, licenceTenureDays: 400 }).band).toBe("C");
  });
});
