import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { runTask, type Task } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TASKS: Task[] = ["occupations", "register", "jobs", "all"];

/**
 * Scheduled ingestion. Called by the platform cron with the CRON_SECRET as a
 * bearer token. GET /api/cron/register, /api/cron/jobs, /api/cron/occupations.
 */
export async function GET(req: Request, ctx: { params: Promise<{ task: string }> }) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const { task } = await ctx.params;
  if (!TASKS.includes(task as Task)) return NextResponse.json({ error: "unknown task" }, { status: 404 });

  const url = new URL(req.url);
  const pages = url.searchParams.get("pages");
  const limit = url.searchParams.get("limit");
  const sources = url.searchParams.get("source")?.split(",").filter(Boolean);
  const lines: string[] = [];
  const result = await runTask(db(), task as Task, {
    pages: pages ? Number(pages) : undefined,
    limit: limit ? Number(limit) : undefined,
    sources,
    log: (s) => lines.push(s),
  });
  return NextResponse.json({ task, ...result, log: lines }, { status: result.errors.length ? 207 : 200 });
}
