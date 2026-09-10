import { describe, expect, it } from "vitest";
import { extractSignals } from "./signals";

describe("extractSignals", () => {
  it("finds a positive sponsorship sentence", () => {
    const r = extractSignals("Great team. Visa sponsorship is available for this role. Apply now.");
    expect(r.positiveSnippet).toBe("Visa sponsorship is available for this role.");
    expect(r.negativeMatch).toBeNull();
  });
  it("finds an offer with the route named", () => {
    const r = extractSignals("We can offer Skilled Worker visa sponsorship to the right candidate.");
    expect(r.positiveSnippet).toBe("We can offer Skilled Worker visa sponsorship to the right candidate.");
  });
  it("finds refusal wording", () => {
    const r = extractSignals("Please note we are unable to offer visa sponsorship for this position.");
    expect(r.negativeMatch).toMatch(/unable to offer visa sponsorship/i);
  });
  it("treats right-to-work requirements as refusal", () => {
    expect(extractSignals("Candidates must have the right to work in the UK.").negativeMatch).not.toBeNull();
    expect(extractSignals("Right to work in the UK is essential.").negativeMatch).not.toBeNull();
  });
  it("reports both when an advert contradicts itself", () => {
    const r = extractSignals("We can offer sponsorship. No sponsorship for this role though.");
    expect(r.positiveSnippet).not.toBeNull();
    expect(r.negativeMatch).not.toBeNull();
  });
  it("returns nulls for a neutral advert", () => {
    const r = extractSignals("You will write TypeScript and drink tea.");
    expect(r).toEqual({ positiveSnippet: null, negativeMatch: null });
  });
  it("does not treat a mention of being a licensed sponsor as refusal", () => {
    const r = extractSignals("We are a licensed sponsor and will sponsor the right candidate.");
    expect(r.negativeMatch).toBeNull();
    expect(r.positiveSnippet).not.toBeNull();
  });
});
