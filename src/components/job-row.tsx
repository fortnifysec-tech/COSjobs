import Link from "next/link";
import { BandBadge, VerdictBadge } from "@/components/ui/badges";
import type { JobListItem } from "@/lib/data/jobs";
import { salaryLabel, timeAgo } from "@/lib/format";

/** One ledger row. Hairline below, never a card. */
export function JobRow({ job, now, showEmployer = true }: { job: JobListItem; now?: Date; showEmployer?: boolean }) {
  const salary = salaryLabel(job.salaryMin, job.salaryMax, job.salaryPeriod);
  return (
    <li className="border-b hairline-soft">
      <Link
        href={`/jobs/${job.slug}`}
        className="grid grid-cols-1 gap-x-6 gap-y-2 py-3.5 no-underline hover:bg-card focus-visible:bg-card sm:grid-cols-[minmax(0,1fr)_12.5rem_minmax(11rem,auto)] sm:px-2"
      >
        <div className="min-w-0">
          <p className="text-[1rem] font-medium leading-snug text-ink">{job.title}</p>
          <p className="mt-0.5 text-[0.875rem] text-ink-70">
            {showEmployer ? (
              <>
                {job.employer}
                <span className="text-ink-45"> · </span>
              </>
            ) : null}
            {job.location}
          </p>
        </div>
        <div className="text-[0.875rem] text-ink sm:text-right">
          <p className={job.salaryMin === null && job.salaryMax === null ? "text-ink-45" : "mono"}>{salary}</p>
          <p className="mono mt-0.5 text-[0.75rem] text-ink-45">
            {job.socCode ? `SOC ${job.socCode} · ` : ""}
            {timeAgo(job.postedAt, now)}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-1.5 sm:justify-end">
          <VerdictBadge verdict={job.verdict} />
          {job.band ? <BandBadge band={job.band} /> : null}
        </div>
      </Link>
    </li>
  );
}
