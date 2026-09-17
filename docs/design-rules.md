# Design rules

The visual source of truth is `design/reference.html`. It was not present when the
shell was built (2026-09-10); the tokens and rules below come from the brief and
must be reconciled against it once it is added.

## Concept
A verification instrument, not a job board. It reads like an official record that
shows its working. The audience trusts GOV.UK visual language.

## Tokens (`src/app/globals.css`)
| token        | value   | use |
|--------------|---------|-----|
| `--ink`      | #16233A | text, headings, primary buttons |
| `--ink-70`   | #4A5568 | secondary text |
| `--ink-45`   | #7C8798 | tertiary text |
| `--paper`    | #EEF0EC | page background |
| `--card`     | #FFFFFF | surfaces |
| `--stamp`    | #A8361F | VERIFIED state only. Never a button, never decoration |
| `--flag`     | #8A6A1C | failed check or restriction only |
| `--rule`     | #C9CFC8 | hairlines |
| `--rule-soft`| #DFE3DD | inner hairlines |
| radius       | 3px     | everywhere |

## Type
- Archivo: headings (700, tracking -0.03em), UI, job data.
- Source Serif 4: explanatory prose only (ledes, guide body). Class `prose-lede`.
- IBM Plex Mono: codes and figures only. SOC codes, salaries in evidence panels,
  reference strings, timestamps. Never labels. Class `mono`.

## Treat as bugs
- Gradients, glassmorphism, card shadows, decorative blur.
- Cards with shadows or large radii. A card here is `.card`: white surface,
  1px hairline, 3px radius, no shadow. Grids of cards are fine for browsing
  (routes, guides, cities, the method steps); records and role lists stay as
  ledger rows.
- Green anywhere. Verified is oxblood.
- All-caps eyebrow labels above headings.
- "→" appended to link or button text.
- Fade-and-slide-up on scroll. Hover-lift on cards.
- Centred text outside small badges.
- Record lists that are not ledger rows with hairline rules.
- More than one orchestrated motion moment per page (on load, `reveal-seq`).
  Everything else is static except direct responses to user action.
  `prefers-reduced-motion` disables it.
- Anything that breaks at 390px.

## Building blocks (`src/app/globals.css`)
- `.rule-top` 3px ink rule above a headed block. `border-b-2 border-ink` under section headings.
- `.inset`, `.inset-flag`, `.inset-stamp` left-rule callouts. Never a filled box.
- `.field`, `.field-label`, `.check` form controls. 2px ink border, square.
- `.btn`, `.btn-secondary` the only two button styles.
- `.prose-body` long-form serif text (guides, advert text).
- Evidence panel rows carry a state: pass, fail, unknown, skipped, info. Checks the
  engine never reached are shown as "Not checked", not hidden.
- Register names are upper case in the source. Pass them through `titleCase()`.

## Copy
Sentence case, active voice, about B1 reading level. Buttons say what happens:
"Check", "Start", "Add". Empty states give direction, not apology. Never
"guaranteed", "guarantee", or "all jobs offer sponsorship". Never pad a count.

## Screenshots
`node scripts/shot.mjs /path name` writes 1440px and 390px captures to
`screenshots/` and reports horizontal overflow. Look at both before calling a page done.
