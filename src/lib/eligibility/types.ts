export type Verdict =
  | "CONFIRMED"
  | "LIKELY"
  | "SALARY_UNKNOWN"
  | "BELOW_THRESHOLD"
  | "OCCUPATION_INELIGIBLE"
  | "LICENCE_RESTRICTED"
  | "NO_LICENCE"
  | "REJECTED";

export type SalaryPeriod = "hour" | "day" | "week" | "month" | "year";

export type OccupationRule = {
  socCode: string;
  title: string;
  rqfLevel: number;
  goingRateAnnual: number;
  isTsl: boolean;
  /**
   * Going rate is a national pay scale (Appendix Skilled Occupations, Table 3:
   * NHS Agenda for Change, doctors, teachers). There is no single figure to
   * test the advert against, so the salary rule is left unknown.
   */
  payScale?: boolean;
};

export type SponsorRecord = {
  id: string;
  name: string;
  routes: string[];
  rating: string | null;
  isActive: boolean;
};

export type SalaryInput = {
  min: number | null;
  max: number | null;
  period: SalaryPeriod | null;
};

export type AdvertSignals = {
  /** A quoted sentence from the advert that states sponsorship is offered. */
  positiveSnippet: string | null;
  /** The matched phrase that refuses sponsorship, if any. */
  negativeMatch: string | null;
};

export type RulesInput = {
  occupation: OccupationRule | null;
  sponsor: SponsorRecord | null;
  salary: SalaryInput;
  signals: AdvertSignals;
  thresholds: {
    /** The general salary threshold, annual GBP. */
    general: number;
    /** The hourly floor, GBP. Applies when the advert quotes an hourly rate. */
    hourlyMin: number;
    /** Rules version, ISO date. Stored with every verdict. */
    version: string;
  };
};

export type Check = {
  key: "refusal" | "licence" | "occupation" | "salary";
  state: "PASS" | "FAIL" | "UNKNOWN" | "SKIPPED";
  detail: string;
};

export type RulesOutcome = {
  verdict: Verdict;
  checks: Check[];
  salaryCheck: "PASS" | "FAIL" | "UNKNOWN";
  salaryAssessedAnnual: number | null;
  salaryRequiredAnnual: number | null;
  reason: string | null;
  rulesVersion: string;
};
