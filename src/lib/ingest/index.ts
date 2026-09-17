import type { Db } from "@/db/client";
import { importOccupations, type OccupationsSummary } from "./occupations";
import { ingestSource, type SourceSummary } from "./pipeline";
import { importRegister, type RegisterSummary } from "./register";
import { greenhouse } from "./sources/greenhouse";
import { nhsJobs } from "./sources/nhs";
import type { FetchOptions, JobSource } from "./types";

export const SOURCES: JobSource[] = [nhsJobs, greenhouse];

export type Task = "occupations" | "register" | "jobs" | "all";

export type TaskResult = {
  occupations?: OccupationsSummary;
  register?: RegisterSummary;
  jobs?: SourceSummary[];
  errors: string[];
};

/** Run one of the ingestion tasks. Errors in one source do not stop the others. */
export async function runTask(d: Db, task: Task, opts: FetchOptions & { sources?: string[] } = {}): Promise<TaskResult> {
  const log = opts.log ?? (() => {});
  const result: TaskResult = { errors: [] };
  const wrap = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      const msg = `${label}: ${(e as Error).message}`;
      log(msg);
      result.errors.push(msg);
    }
  };
  if (task === "occupations" || task === "all") await wrap("occupations", async () => void (result.occupations = await importOccupations(d, log)));
  if (task === "register" || task === "all") await wrap("register", async () => void (result.register = await importRegister(d, log)));
  if (task === "jobs" || task === "all") {
    const wanted = opts.sources?.length ? SOURCES.filter((s) => opts.sources!.includes(s.key)) : SOURCES;
    result.jobs = [];
    for (const s of wanted) await wrap(s.key, async () => void result.jobs!.push(await ingestSource(d, s, opts)));
  }
  return result;
}
