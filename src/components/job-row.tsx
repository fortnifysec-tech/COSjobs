import Link from "next/link";
import { BandBadge, VerdictBadge, type Band, type Verdict } from "@/components/ui/badges";

export type JobRowData = {
  slug: string;
  title: string;
  employer: string;
  location: string;
  salary: string;
  socCode: string;
  postedAgo: string;
  verdict: Verdict;
  band: Band;
};

/** One ledger row. Hairline above and below, never a card. */
export function JobRow({ job }: { job: JobRowData }) {
  return (
    <li className="border-b hairline-soft">
      <Link
        href={`/jobs/${job.slug}`}
        className="grid grid-cols-1 gap-x-6 gap-y-1.5 px-1 py-3.5 no-underline hover:bg-card focus-visible:bg-card sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      >
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-medium text-ink">{job.title}</p>
          <p className="truncate text-[0.8125rem] text-ink-70">
            {job.employer} <span className="text-ink-45">·</span> {job.location}
          </p>
        </div>
        <div className="mono text-[0.8125rem] text-ink sm:text-right">
          <p>{job.salary}</p>
          <p className="text-[0.6875rem] text-ink-45">
            SOC {job.socCode} · {job.postedAgo}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-1.5 sm:justify-end">
          <VerdictBadge verdict={job.verdict} />
          <BandBadge band={job.band} />
        </div>
      </Link>
    </li>
  );
}
