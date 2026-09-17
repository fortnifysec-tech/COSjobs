# What COSjobs is for, and how it earns

## The problem

Every "visa sponsorship jobs" site answers the same easy question: is the employer
on the Home Office register? That is necessary and nowhere near sufficient. A
licensed employer can post a role that cannot be sponsored because:

- the occupation code is below RQF 6 and not on a shortage list;
- the advertised salary is under the going rate for the code, or under the
  general threshold;
- the licence is B-rated, or covers only Global Business Mobility routes;
- the advert itself says sponsorship is not offered.

Job seekers find this out after they have spent an application, or after an
offer. COSjobs checks the role, not just the employer, and shows the figures.

## What we hold

- The register of licensed sponsors, read every morning, with every change kept.
- Appendix Skilled Occupations, the Immigration Salary List and the Temporary
  Shortage List, versioned by effective date.
- Adverts from NHS Jobs and from employer career sites on the register, each
  assessed by the rules engine in `src/lib/eligibility` and stored with the
  rules version.

## How it earns

There is no charge to employers and no advertising, so the verdict has no reason
to lean. Revenue is from job seekers, monthly, cancellable in one click:

| Plan          | Price          | What it unlocks                                                                 |
|---------------|----------------|---------------------------------------------------------------------------------|
| Free          | £0             | Search everything, read every verdict and the failed check.                     |
| Seeker        | £9.99 a month  | Apply link, full advert text, the full evidence panel, alerts within the hour.  |
| Seeker Plus   | £14.99 a month | Seeker, plus CV tailoring to the advert, a pipeline, early access to new sponsors. |
| Sponsor Watch | £2.99 a month  | A daily check on the reader's own employer's licence, with a shortlist ready.   |

The free tier is the marketing. The verdict and the failed check are visible to
everyone so the site is worth linking to; the paid tiers sell time (alerts) and
the last step (the apply link and the full advert).

## Principles that keep it worth paying for

1. Real figures, always sourced and dated. A record without a source is a bug.
2. Never pad a count. "0 passing roles" is a valid page.
3. When a rule cannot be checked (pay-scale salaries, unknown licence date),
   say so rather than guess.
4. The engine is deterministic and pure. An LLM may propose, never decide.
