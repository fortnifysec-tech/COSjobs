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

## Real data

```bash
supabase start              # local Postgres on 54322 (needs Docker)
pnpm db:migrate
pnpm ingest occupations     # Appendix Skilled Occupations, ISL and TSL from GOV.UK
pnpm ingest register        # register of licensed sponsors (about 127k organisations)
pnpm ingest jobs            # NHS Jobs and employer career sites, assessed by the rules engine
pnpm ingest jobs --source nhs-jobs --pages 2 --limit 300   # a smaller run
```

`pnpm db:seed` loads deterministic fixtures instead; do not mix the two on one
database. In production the same tasks run from `/api/cron/<task>` on the
schedule in `vercel.json`, authorised with `CRON_SECRET`. Sources live in
`src/lib/ingest/sources/`; add a Greenhouse board to `BOARDS` only after checking
the employer's name on the register. Product notes: `docs/product.md`.

Design rules: `docs/design-rules.md`. Visual reference: `design/reference.html`.

## Run Claude Code unattended

`.devcontainer/` is Anthropic's reference Claude Code sandbox with this project's
needs added: Node 22, pnpm, Playwright's Chromium, and an outbound firewall that
allows only npm, GitHub, Anthropic, Stripe, Resend, Google Fonts and the Supabase
hosts named in `.env`. Only the project directory is mounted.

```bash
cp .devcontainer/claude-settings.json .claude/settings.json   # bypass mode + deny rules + sandbox
# fill .env with a hosted Supabase project (the firewall reads its hosts from .env)
# VS Code: Reopen in Container, then in the container terminal:
claude mcp add playwright -- npx -y @playwright/mcp@latest
claude --permission-mode bypassPermissions
```

Paste `docs/build-preamble.md` above the build prompt. Commits stay local;
push from the host after review.
