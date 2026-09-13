import type { EvidenceRow } from "@/components/evidence-panel";
import type { JobDetail } from "@/lib/data/jobs";
import { BAND_LABEL } from "@/components/ui/badges";
import { daysToYears, employerName, money, titleCase } from "@/lib/format";

const SW = "Skilled Worker";

/**
 * Turn a stored assessment into the rows of the evidence panel.
 * Rows follow the order the rules engine applies them, and checks that were
 * never reached are shown as not checked rather than hidden.
 */
export function evidenceRows(detail: JobDetail): EvidenceRow[] {
  const { job, assessment: a, occupation, generalThreshold, sponsor, activity } = detail;
  const rows: EvidenceRow[] = [];
  let stopped = false;
  const notChecked = "Not checked. An earlier check failed.";

  // 1. Advert wording
  if (a.negativeSignalMatched) {
    rows.push({ label: "Advert wording", quote: a.negativeSignalMatched, note: "Wording that refuses sponsorship. This overrides every other check.", state: "fail" });
    stopped = true;
  } else if (a.positiveSignalSnippet) {
    rows.push({ label: "Advert wording", quote: a.positiveSignalSnippet, note: "Quoted from the advert.", state: "pass" });
  } else {
    rows.push({ label: "Advert wording", text: "No sentence about sponsorship either way.", note: "A role can still meet the rules without one. It is marked likely rather than confirmed.", state: "unknown" });
  }

  // 2. Licence
  if (stopped) {
    rows.push({ label: "Sponsor licence", text: sponsor ? titleCase(sponsor.rawName) : employerName(job.employerRawName), note: notChecked, state: "skipped" });
  } else if (!sponsor) {
    rows.push({ label: "Sponsor licence", text: employerName(job.employerRawName), note: "Not matched to any entry on the register of licensed sponsors.", state: "fail" });
    stopped = true;
  } else if (!sponsor.isActive) {
    rows.push({ label: "Sponsor licence", text: titleCase(sponsor.rawName), note: "Removed from the register.", state: "fail" });
    stopped = true;
  } else if (!sponsor.routes.includes(SW)) {
    rows.push({ label: "Sponsor licence", text: titleCase(sponsor.rawName), note: `Licence covers ${sponsor.routes.join(", ") || "no routes"}. It does not cover Skilled Worker.`, state: "fail" });
    stopped = true;
  } else if (sponsor.rating !== "A") {
    rows.push({ label: "Sponsor licence", text: titleCase(sponsor.rawName), note: `Rated ${sponsor.rating ?? "unrated"}. Only A-rated sponsors can assign new certificates.`, state: "fail" });
    stopped = true;
  } else {
    rows.push({
      label: "Sponsor licence",
      text: titleCase(sponsor.rawName),
      note: `A-rated. Skilled Worker route. On the register for ${daysToYears(activity?.licenceTenureDays ?? Math.floor((Date.now() - sponsor.firstSeenAt.getTime()) / 86_400_000))}.`,
      state: "pass",
    });
  }

  // 3. Occupation
  if (stopped) {
    rows.push({ label: "Occupation code", value: occupation?.socCode, text: occupation?.title, note: notChecked, state: "skipped" });
  } else if (!occupation) {
    rows.push({ label: "Occupation code", text: "No code could be assigned to this title.", state: "fail" });
    stopped = true;
  } else if (occupation.rqfLevel >= 6) {
    rows.push({ label: "Occupation code", value: occupation.socCode, text: occupation.title, note: `RQF level ${occupation.rqfLevel}. Eligible without the shortage list.`, state: "pass" });
  } else if (occupation.isTsl) {
    rows.push({ label: "Occupation code", value: occupation.socCode, text: occupation.title, note: `RQF level ${occupation.rqfLevel}. On the Temporary Shortage List.`, state: "pass" });
  } else {
    rows.push({ label: "Occupation code", value: occupation.socCode, text: occupation.title, note: `RQF level ${occupation.rqfLevel}. Below level 6 and not on the Temporary Shortage List.`, state: "fail" });
    stopped = true;
  }

  // 4. Salary
  const required = a.salaryRequiredAnnual ?? (occupation && generalThreshold ? Math.max(generalThreshold, occupation.goingRateAnnual) : null);
  if (occupation) {
    rows.push({ label: "Going rate", value: money(occupation.goingRateAnnual), note: "Appendix Skilled Occupations, ASHE 2024, 50th percentile.", state: "info" });
  }
  if (generalThreshold) {
    rows.push({ label: "General threshold", value: money(generalThreshold), note: required ? `The salary must meet ${money(required)}, the higher of the two.` : undefined, state: "info" });
  }
  const advertised = salaryAsAdvertised(job);
  if (stopped) {
    rows.push({ label: "Advertised salary", value: advertised ?? undefined, text: advertised ? undefined : "Not stated", note: notChecked, state: "skipped" });
  } else if (a.salaryCheck === "UNKNOWN") {
    rows.push({ label: "Advertised salary", text: advertised ?? "Not stated", note: job.salaryMax && !job.salaryMin ? "An upper figure alone cannot be tested. The rule applies to the minimum." : "No figure in the advert, so the salary rule cannot be tested.", state: "unknown" });
  } else {
    const basis = salaryBasis(job);
    rows.push({
      label: "Advertised salary",
      value: a.salaryAssessedAnnual !== null ? money(a.salaryAssessedAnnual) : advertised ?? undefined,
      note: a.salaryCheck === "PASS" ? `${basis} Meets the ${money(required ?? 0)} required.` : `${basis} Below the ${money(required ?? 0)} required.`,
      state: a.salaryCheck === "PASS" ? "pass" : "fail",
    });
  }

  // 5. Sponsor activity (context, never a rule)
  if (sponsor && activity) {
    rows.push({
      label: "Sponsor activity",
      value: activity.band,
      text: BAND_LABEL[activity.band],
      note: `${activity.eligibleRoleCount} of ${activity.jobsPosted90d} roles posted in 90 days met the rules. Not a rule, for context only.`,
      state: "info",
    });
  }

  return rows;
}

function salaryAsAdvertised(job: JobDetail["job"]): string | null {
  const { salaryMin: min, salaryMax: max, salaryPeriod: p } = job;
  if (min === null && max === null) return null;
  const per = p && p !== "year" ? ` ${{ hour: "an hour", day: "a day", week: "a week", month: "a month" }[p]}` : "";
  if (min !== null && max !== null && max !== min) return `${money(min)}–${money(max)}${per}`;
  if (min !== null) return `${money(min)}${per}`;
  return `up to ${money(max!)}${per}`;
}

function salaryBasis(job: JobDetail["job"]): string {
  const { salaryMin: min, salaryMax: max, salaryPeriod: p } = job;
  const parts: string[] = [];
  if (min !== null && max !== null && max !== min) parts.push("Bottom of the advertised range, never the midpoint.");
  if (p && p !== "year") {
    const per = { hour: "an hour", day: "a day", week: "a week", month: "a month" }[p];
    parts.push(`Annualised from ${money(min ?? 0)} ${per}${p === "hour" ? " at 37.5 hours a week" : ""}.`);
  }
  return parts.join(" ");
}
