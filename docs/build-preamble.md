# Unattended build preamble

Paste this above the build prompt when running Claude Code inside the devcontainer
with `claude --permission-mode bypassPermissions`. See `.devcontainer/` and
`.claude/settings.json` for the environment it assumes.

```
SCOPE AND AUTONOMY RULES — these override anything else in this prompt.

1. You are running unattended. Do not ask me anything. Do not pause for
   confirmation. If you need a decision, make the one most consistent with the
   design rules and the product principle, record it in DECISIONS.md, and continue.

2. STAY INSIDE THIS PROJECT DIRECTORY. Do not read, list, edit or reference any
   path outside the current working directory. Do not read ~/.ssh, ~/.aws,
   ~/.config, /etc, or any other user's home. If a task seems to require a file
   outside the project, it doesn't — find another way or note it as blocked.

3. ENVIRONMENT. You are in a Docker devcontainer. Use it. If you need a service
   (Postgres, Redis, a mail catcher), add it to docker-compose.yml in this project
   and run it there. Do not install anything system-wide. Do not use sudo.

4. SECRETS. Read them from .env only. Never print them, never commit them, never
   write them into any file other than .env. Keep .env.example current.

5. NO PUSHING. Commit locally after each phase. Never push. I review and push.

6. IF SOMETHING BREAKS. Try three distinct approaches. If all three fail, write
   the failure to BLOCKED.md with what you tried and what's needed, skip that
   item, and continue with everything that doesn't depend on it. Never stop the
   whole build for one blocked item.

7. WHEN YOU FINISH, write REPORT.md in the project root containing:
   - What was built, phase by phase, one line each
   - Every decision you made without me, from DECISIONS.md
   - Everything blocked, from BLOCKED.md, with the exact fix needed
   - Test results: which passed, which failed, which are skipped
   - Lighthouse scores for /, /jobs, /jobs/[slug], /tools/eligibility at mobile
   - Screenshots saved to /screenshots/, listed with the route and breakpoint
   - The exact commands to run it: install, migrate, seed, dev, test
   - Three things you'd fix next
   Then stop. REPORT.md is the deliverable. Make it something I can read in five
   minutes and know exactly where the project stands.

Now execute the build below.
```
