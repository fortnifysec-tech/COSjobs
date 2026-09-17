import type { Check, RulesInput, RulesOutcome, SalaryInput, Verdict } from "./types";

/** Standard working week used to annualise hourly rates. Matches the Home Office 37.5h basis. */
export const HOURS_PER_WEEK = 37.5;
export const WEEKS_PER_YEAR = 52;

const SKILLED_WORKER_ROUTE = "Skilled Worker";

/**
 * Annualise a salary figure. Returns null if it cannot be done.
 * A range is always assessed at its MINIMUM. The midpoint is never used.
 */
export function annualise(salary: SalaryInput): number | null {
  if (salary.min === null || salary.min <= 0) return null;
  const period = salary.period ?? "year";
  switch (period) {
    case "year":
      return Math.round(salary.min);
    case "month":
      return Math.round(salary.min * 12);
    case "week":
      return Math.round(salary.min * WEEKS_PER_YEAR);
    case "day":
      return Math.round(salary.min * 5 * WEEKS_PER_YEAR);
    case "hour":
      return Math.round(salary.min * HOURS_PER_WEEK * WEEKS_PER_YEAR);
  }
}

/**
 * The eligibility decision. Pure. No I/O, no model call.
 *
 * Order of precedence:
 *  1. Explicit refusal in the advert  → REJECTED (overrides everything)
 *  2. Sponsor licence                 → NO_LICENCE / LICENCE_RESTRICTED
 *  3. Occupation                      → OCCUPATION_INELIGIBLE
 *  4. Salary                          → SALARY_UNKNOWN / BELOW_THRESHOLD
 *  5. All pass                        → CONFIRMED if the advert says sponsorship is offered,
 *                                       LIKELY otherwise.
 */
export function decide(input: RulesInput): RulesOutcome {
  const checks: Check[] = [];
  const { occupation, sponsor, salary, signals, thresholds } = input;

  // 1. Refusal language
  if (signals.negativeMatch) {
    checks.push({
      key: "refusal",
      state: "FAIL",
      detail: `Advert says: “${signals.negativeMatch}”`,
    });
    return finish("REJECTED", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "The advert says sponsorship is not offered.",
      rulesVersion: thresholds.version,
    });
  }
  checks.push({ key: "refusal", state: "PASS", detail: "No refusal wording found." });

  // 2. Licence
  if (!sponsor) {
    checks.push({ key: "licence", state: "FAIL", detail: "Employer not matched to the sponsor register." });
    return finish("NO_LICENCE", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "We could not find this employer on the register of licensed sponsors.",
      rulesVersion: thresholds.version,
    });
  }
  if (!sponsor.isActive) {
    checks.push({ key: "licence", state: "FAIL", detail: `${sponsor.name} is no longer on the register.` });
    return finish("NO_LICENCE", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "This employer has been removed from the register.",
      rulesVersion: thresholds.version,
    });
  }
  if (!sponsor.routes.includes(SKILLED_WORKER_ROUTE)) {
    checks.push({
      key: "licence",
      state: "FAIL",
      detail: `Licence covers ${sponsor.routes.join(", ") || "no routes"}, not Skilled Worker.`,
    });
    return finish("LICENCE_RESTRICTED", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "The employer's licence does not cover the Skilled Worker route.",
      rulesVersion: thresholds.version,
    });
  }
  if (sponsor.rating !== "A") {
    checks.push({
      key: "licence",
      state: "FAIL",
      detail: `Licence is ${sponsor.rating ?? "unrated"}. Only A-rated sponsors can assign new certificates.`,
    });
    return finish("LICENCE_RESTRICTED", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "The employer's licence is not A-rated, so they cannot sponsor new workers right now.",
      rulesVersion: thresholds.version,
    });
  }
  checks.push({
    key: "licence",
    state: "PASS",
    detail: `${sponsor.name} holds an A-rated Skilled Worker licence.`,
  });

  // 3. Occupation
  if (!occupation) {
    checks.push({ key: "occupation", state: "FAIL", detail: "No occupation code could be assigned." });
    return finish("OCCUPATION_INELIGIBLE", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "We could not match this role to an eligible occupation code.",
      rulesVersion: thresholds.version,
    });
  }
  const occupationEligible = occupation.rqfLevel >= 6 || occupation.isTsl;
  if (!occupationEligible) {
    checks.push({
      key: "occupation",
      state: "FAIL",
      detail: `${occupation.socCode} ${occupation.title} is RQF ${occupation.rqfLevel} and not on the Temporary Shortage List.`,
    });
    return finish("OCCUPATION_INELIGIBLE", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: null,
      reason: "This occupation is below RQF 6 and not on the Temporary Shortage List.",
      rulesVersion: thresholds.version,
    });
  }
  checks.push({
    key: "occupation",
    state: "PASS",
    detail:
      occupation.rqfLevel >= 6
        ? `${occupation.socCode} ${occupation.title} is RQF ${occupation.rqfLevel}.`
        : `${occupation.socCode} ${occupation.title} is on the Temporary Shortage List.`,
  });

  // 4. Salary
  const assessed = annualise(salary);
  if (occupation.payScale) {
    checks.push({
      key: "salary",
      state: "UNKNOWN",
      detail: `${occupation.socCode} is paid on a national pay scale. Pay-scale rates are not checked as a single figure.`,
    });
    return finish("SALARY_UNKNOWN", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: assessed,
      salaryRequiredAnnual: null,
      reason: "This occupation's going rate is a national pay scale (Table 3 of Appendix Skilled Occupations). We do not check pay-scale salaries yet.",
      rulesVersion: thresholds.version,
    });
  }
  const required = Math.max(thresholds.general, occupation.goingRateAnnual);
  if (assessed === null) {
    checks.push({ key: "salary", state: "UNKNOWN", detail: "No salary figure in the advert." });
    return finish("SALARY_UNKNOWN", checks, {
      salaryCheck: "UNKNOWN",
      salaryAssessedAnnual: null,
      salaryRequiredAnnual: required,
      reason: "The advert does not state a salary, so the salary rule cannot be checked.",
      rulesVersion: thresholds.version,
    });
  }
  const hourlyFail = salary.period === "hour" && (salary.min ?? 0) < thresholds.hourlyMin;
  if (assessed < required || hourlyFail) {
    checks.push({
      key: "salary",
      state: "FAIL",
      detail: hourlyFail
        ? `£${salary.min} an hour is below the £${thresholds.hourlyMin} hourly floor.`
        : `£${assessed.toLocaleString("en-GB")} is below the £${required.toLocaleString("en-GB")} required.`,
    });
    return finish("BELOW_THRESHOLD", checks, {
      salaryCheck: "FAIL",
      salaryAssessedAnnual: assessed,
      salaryRequiredAnnual: required,
      reason: hourlyFail
        ? "The hourly rate is below the minimum for the route."
        : "The salary is below the higher of the general threshold and the going rate.",
      rulesVersion: thresholds.version,
    });
  }
  checks.push({
    key: "salary",
    state: "PASS",
    detail: `£${assessed.toLocaleString("en-GB")} meets the £${required.toLocaleString("en-GB")} required.`,
  });

  // 5. All rule checks passed
  const verdict: Verdict = signals.positiveSnippet ? "CONFIRMED" : "LIKELY";
  return finish(verdict, checks, {
    salaryCheck: "PASS",
    salaryAssessedAnnual: assessed,
    salaryRequiredAnnual: required,
    reason: signals.positiveSnippet ? null : "Every rule passes, but the advert does not say sponsorship is offered.",
    rulesVersion: thresholds.version,
  });
}

function finish(
  verdict: Verdict,
  checks: Check[],
  rest: Omit<RulesOutcome, "verdict" | "checks">,
): RulesOutcome {
  return { verdict, checks, ...rest };
}
