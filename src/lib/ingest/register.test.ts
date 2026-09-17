import { describe, expect, it } from "vitest";
import { entriesFromCsv, parseCsv } from "./register";

const CSV = `Organisation Name,Town/City,County,Type & Rating,Route
Monzo Bank Ltd,London,,Worker (A rating),Skilled Worker
Monzo Bank Ltd,London ,,Worker (A rating),Global Business Mobility: Senior or Specialist Worker
"Smith, Jones & Co Limited",LEEDS,West Yorkshire,Worker (B rating),Skilled Worker
Unquoted, Comma Ltd,Bristol,,Worker (A rating),Skilled Worker
Creative Agency Ltd,London,,Temporary Worker (A rating),Creative Worker
Expansion Co,Manchester,,Worker (UK Expansion Worker: Provisional ),Global Business Mobility: UK Expansion Worker
`;

describe("register csv", () => {
  it("parses quoted fields", () => {
    const rows = parseCsv(CSV);
    expect(rows[3]).toEqual(["Smith, Jones & Co Limited", "LEEDS", "West Yorkshire", "Worker (B rating)", "Skilled Worker"]);
  });

  it("groups routes by organisation and reads the rating", () => {
    const entries = entriesFromCsv(parseCsv(CSV));
    const monzo = entries.find((e) => e.rawName === "Monzo Bank Ltd")!;
    expect(monzo.routes).toEqual(["Global Business Mobility: Senior or Specialist Worker", "Skilled Worker"]);
    expect(monzo.rating).toBe("A");
    expect(monzo.normalisedName).toBe("MONZO BANK");
    expect(monzo.town).toBe("London");
  });

  it("reads names with unquoted commas from the right", () => {
    const entries = entriesFromCsv(parseCsv(CSV));
    const e = entries.find((x) => x.rawName.startsWith("Unquoted"))!;
    expect(e.rawName).toBe("Unquoted, Comma Ltd");
    expect(e.town).toBe("Bristol");
    expect(e.routes).toEqual(["Skilled Worker"]);
  });

  it("title-cases shouting towns and keeps B ratings and provisional licences", () => {
    const entries = entriesFromCsv(parseCsv(CSV));
    expect(entries.find((e) => e.rawName.startsWith("Smith"))!.town).toBe("Leeds");
    expect(entries.find((e) => e.rawName.startsWith("Smith"))!.rating).toBe("B");
    expect(entries.find((e) => e.rawName === "Expansion Co")!.rating).toBe("Provisional");
    expect(entries.find((e) => e.rawName === "Creative Agency Ltd")!.rating).toBe("A");
  });
});
