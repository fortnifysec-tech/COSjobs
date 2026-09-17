/** Sponsor activity scoring. Pure. */

export type Band = "A" | "B" | "C" | "D" | "NEW";

export const SCORING_VERSION = "2026-09-01";

export type ActivityInput = {
  jobsPosted90d: number;
  /** Share of this sponsor's checked roles that failed. 0..1 */
  refusalRatio: number;
  eligibleRoleCount: number;
  /** Days on the register. Null when the sponsor was already listed when we took our first snapshot. */
  licenceTenureDays: number | null;
};

export type ActivityOutcome = { score: number; band: Band };

/**
 * Score 0..100.
 *  - up to 40 for eligible roles posted in the last 90 days (saturates at 6)
 *  - up to 25 for the share of roles that pass
 *  - up to 20 for volume of postings (saturates at 12)
 *  - up to 15 for licence tenure
 * Sponsors licensed for under 180 days are NEW regardless of score.
 * Unknown tenure (on the register before our first snapshot) scores 0 of the
 * 15 tenure points and is never NEW.
 */
export function scoreSponsor(input: ActivityInput): ActivityOutcome {
  const eligible = clamp(input.eligibleRoleCount / 6, 0, 1) * 40;
  const passShare = clamp(1 - input.refusalRatio, 0, 1) * 25;
  const volume = clamp(input.jobsPosted90d / 12, 0, 1) * 20;
  const tenure = input.licenceTenureDays === null ? 0 : clamp(input.licenceTenureDays / (365 * 3), 0, 1) * 15;
  const score = Math.round(eligible + passShare + volume + tenure);

  if (input.licenceTenureDays !== null && input.licenceTenureDays < 180) return { score, band: "NEW" };
  if (input.jobsPosted90d === 0 && input.eligibleRoleCount === 0) return { score, band: "D" };
  if (score >= 65) return { score, band: "A" };
  if (score >= 40) return { score, band: "B" };
  if (score >= 20) return { score, band: "C" };
  return { score, band: "D" };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
