import { describe, expect, it } from "vitest";
import { healthBodyTokens } from "./match";

describe("healthBodyTokens", () => {
  it("keeps the distinctive words of an NHS name", () => {
    expect(healthBodyTokens("Norfolk & Suffolk Foundation NHS Trust")).toEqual(["NORFOLK", "SUFFOLK"]);
    expect(healthBodyTokens("The Christie NHS FT")).toEqual(["CHRISTIE"]);
    expect(healthBodyTokens("Swansea Bay University Health Board")).toEqual(["SWANSEA", "BAY"]);
    expect(healthBodyTokens("Derbyshire Community Health Services NHSFT")).toEqual(["DERBYSHIRE"]);
    expect(healthBodyTokens("West and North London ICB")).toEqual(["WEST", "NORTH", "LONDON"]);
  });
  it("returns null for names that are not health bodies", () => {
    expect(healthBodyTokens("Monzo Bank Ltd")).toBeNull();
    expect(healthBodyTokens("NHS Trust")).toBeNull();
  });
});
