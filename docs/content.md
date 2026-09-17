# Where the content lives

Everything a reader sees is either read from the database (roles, sponsors,
occupation codes, register events) or written in one of the files below. Edit
the file, run `pnpm lint`, commit.

| What                                   | File                              | Notes |
|----------------------------------------|-----------------------------------|-------|
| Site name, navigation, footer columns  | `src/lib/site.ts`                 | `NAV` is the header bar, `NAV_ASIDE` sits by sign in, `MENU_EXTRA` is phone-only, `BROWSE` is the footer column. |
| Disclaimer and plans                   | `src/lib/site.ts`                 | `DISCLAIMER` is shown on every page. `PLANS` feeds pricing and the home page. |
| Guides                                 | `src/lib/guides.tsx`              | One object per guide: slug, title, summary, date checked, sources, `toc`, body JSX. Figures only with a source. |
| Visa route descriptions                | `src/lib/routes.ts`               | Name must match the register spelling exactly. `group` decides which section of `/visa` it sits in. |
| Questions and answers                  | `src/app/faq/page.tsx`            | The `QA` array. Also emitted as FAQPage structured data. |
| How we check                           | `src/app/how-it-works/page.tsx`   | Keep the "On this page" list in step with the headings. |
| About, contact, terms, privacy, cookies| `src/app/<page>/page.tsx`         | Plain pages. Update the date line when the text changes. |
| Evidence panel wording                 | `src/lib/evidence.ts`             | The notes under each check. |
| Verdict and band labels                | `src/components/ui/badges.tsx`    | `VERDICT_LABEL`, `VERDICT_SENTENCE`, `BAND_LABEL`, `BAND_SENTENCE`. |
| Title to occupation code rules         | `src/lib/ingest/occupation.ts`    | Add a rule, add a case to the test. Codes must exist in the appendix. |
| Advert wording patterns                | `src/lib/eligibility/signals.ts`  | Refusal patterns win over offers. Add a test for every new pattern. |
| Employer career sites read             | `src/lib/ingest/sources/greenhouse.ts` | `BOARDS`: slug, display name, and the exact register name. |
| NHS search terms                       | `src/lib/ingest/sources/nhs.ts`   | `NHS_KEYWORDS`. |

## Page anatomy

Every page follows the same order so a reader always knows where to look:

1. Browse row (on browse pages) or breadcrumb (on records).
2. Heading, then a serif lede of at most two sentences.
3. On records: the verdict inset, then a four-figure strip.
4. The main list or text on the left; figures, register entry and related links
   on the right. On phones the right column follows the left.
5. A source line in small grey text.

Lists are ledger rows with hairlines. Long lists fold behind a `details`
element with a count, never a "load more" button. Figures are mono; labels are
not.

## Design rules

See `docs/design-rules.md`. The short version: it should read like an official
record that shows its working. No cards, no gradients, no green, one motion
moment per page.
