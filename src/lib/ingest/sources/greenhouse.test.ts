import { describe, expect, it } from "vitest";
import { extractSignals } from "@/lib/eligibility";
import { toRaw, ukLocation } from "./greenhouse";

describe("greenhouse locations", () => {
  it("names the UK town", () => {
    expect(ukLocation("Cardiff, London or Remote (UK)")).toEqual({ location: "London", isRemote: false });
    expect(ukLocation("London")).toEqual({ location: "London", isRemote: false });
    expect(ukLocation("Remote (UK)")).toEqual({ location: "Remote (UK)", isRemote: true });
  });
  it("drops non-UK roles", () => {
    expect(ukLocation("New York")).toBeNull();
    expect(ukLocation("Dublin, Ireland")).toBeNull();
    expect(ukLocation("")).toBeNull();
  });
});

describe("greenhouse job", () => {
  const board = { slug: "monzo", employer: "Monzo", registerName: "Monzo Bank Ltd" };
  const job = {
    id: 6635595,
    title: "Backend Engineer III ",
    absolute_url: "https://job-boards.greenhouse.io/monzo/jobs/6635595",
    first_published: "2025-02-17T04:44:43-05:00",
    company_name: "Monzo",
    location: { name: "Cardiff, London or Remote (UK)" },
    content: "&lt;p&gt;💰 £85,000 - £110,000 base salary + Incentive Awards&lt;/p&gt;&lt;p&gt;✈️ We can help you relocate to the UK ✅ We can sponsor visas 📍 London office&lt;/p&gt;",
  };
  it("unescapes the content, reads the salary and keeps the register name", () => {
    const raw = toRaw(board, job)!;
    expect(raw.employerRegisterName).toBe("Monzo Bank Ltd");
    expect(raw.title).toBe("Backend Engineer III");
    expect(raw.salaryMin).toBe(85000);
    expect(raw.salaryMax).toBe(110000);
    expect(raw.salaryPeriod).toBe("year");
    expect(raw.description).toContain("We can sponsor visas");
    expect(extractSignals(raw.description).positiveSnippet).toMatch(/We can sponsor visas/);
  });
});
