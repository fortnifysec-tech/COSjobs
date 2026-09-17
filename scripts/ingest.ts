/*
 * Ingest real data. Run: pnpm ingest <task> [--source nhs-jobs,greenhouse] [--pages N] [--limit N]
 *   occupations  GOV.UK Appendix Skilled Occupations, Immigration Salary List, Temporary Shortage List
 *   register     GOV.UK register of licensed sponsors (workers)
 *   jobs         NHS Jobs and employer career sites, assessed against the rules
 *   all          the three above, in that order
 */
import { db } from "../src/db/client";
import { runTask, type Task } from "../src/lib/ingest";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const task = (process.argv[2] ?? "all") as Task;
  if (!["occupations", "register", "jobs", "all"].includes(task)) {
    console.error("usage: pnpm ingest <occupations|register|jobs|all> [--source a,b] [--pages N] [--limit N]");
    process.exit(2);
  }
  const sources = arg("source")?.split(",").map((s) => s.trim()).filter(Boolean);
  const pages = arg("pages") ? Number(arg("pages")) : undefined;
  const limit = arg("limit") ? Number(arg("limit")) : undefined;
  const started = Date.now();
  const result = await runTask(db(), task, { sources, pages, limit, log: (s) => console.log(`[${((Date.now() - started) / 1000).toFixed(0)}s] ${s}`) });
  if (result.errors.length) {
    console.error("errors:", result.errors);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
