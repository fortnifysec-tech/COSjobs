import type { SalaryPeriod } from "@/lib/eligibility/types";

/** One advert as read from a source, before any rule is applied. */
export type RawJob = {
  /** Source key, e.g. "nhs-jobs", "greenhouse". Stored on the job row. */
  source: string;
  /** Stable id within the source. */
  sourceJobId: string;
  /** Employer name exactly as the advert gives it. */
  employerRawName: string;
  /**
   * The employer's name on the register of licensed sponsors, when the source
   * knows it (employer career sites are configured per sponsor). Tried first
   * when matching; the raw name is still what the reader sees.
   */
  employerRegisterName?: string;
  title: string;
  /** Plain text. Paragraphs separated by blank lines. */
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: SalaryPeriod | null;
  /** Town or city. "Remote (UK)" when no town is given. */
  location: string;
  isRemote: boolean;
  postedAt: Date;
  /** Adverts past this date are not stored. */
  closesAt: Date | null;
  applyUrl: string;
};

export type FetchOptions = {
  /** Cap on adverts per source. Undefined means the source's default. */
  limit?: number;
  /** Search pages per query, for sources that page. */
  pages?: number;
  log?: (line: string) => void;
};

export type JobSource = {
  key: string;
  /**
   * True when one run lists every open advert the source has, so an advert
   * missing from a run can be marked not live. False for keyword searches.
   */
  exhaustive: boolean;
  fetch(opts: FetchOptions): Promise<RawJob[]>;
};
