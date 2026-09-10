# COSjobs

UK visa-sponsorship job platform. Every role is checked against the Skilled Worker
rules (occupation code, going rate, salary threshold, sponsor licence, advert
wording) and the arithmetic is shown.

## Develop

```bash
pnpm install
cp .env.example .env        # fill in Supabase, Stripe, Resend
pnpm dev                    # http://localhost:3000
pnpm test                   # unit tests (vitest)
node scripts/shot.mjs /jobs # screenshots at 1440px and 390px
```

Design rules: `docs/design-rules.md`. Visual reference: `design/reference.html`.
