import Image from "next/image";
import Link from "next/link";
import { MoneyDisplay } from "@gigshive/ui";

import type { Job } from "../api/jobs";
import { jobsCopy } from "../copy/jobs";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

const cardClass =
  "flex h-full flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(15,22,38,0.14)] sm:rounded-[28px] sm:p-7";

function CardContent({ job }: { job: Job }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700">
            {job.category}
          </span>
          <span className="rounded-full bg-honey-100 px-3 py-1.5 text-xs font-semibold text-honey-800">
            {job.mode === "priced" ? jobsCopy.modePriced : jobsCopy.modeBadgeApplication}
          </span>
        </div>
        <span className="text-[13px] text-ink-500">{job.posted}</span>
      </div>

      <h3 className="text-[21px] leading-[1.3] font-semibold">{job.title}</h3>
      <p className="text-[15px] text-ink-600">{job.summary}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <div className="flex items-center gap-3">
          <Image src={job.avatar} width={32} height={32} alt="" className="rounded-full" />
          <span className="text-sm text-ink-600">{job.client}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-ink-500">
            {job.proposals}{" "}
            {job.mode === "priced" ? jobsCopy.proposalsUnit : jobsCopy.applicationsUnit}
          </span>
          {job.budget ? (
            <p className="m-0 flex flex-wrap items-center gap-1 text-[17px] font-semibold">
              <MoneyDisplay amountKobo={job.budget.minKobo} size="md" />
              {jobsCopy.budgetSeparator}
              <MoneyDisplay amountKobo={job.budget.maxKobo} size="md" />
            </p>
          ) : (
            <p className="m-0 text-[15px] font-semibold">{jobsCopy.agreedAfterApply}</p>
          )}
        </div>
      </div>
    </>
  );
}

export interface JobsCardProps {
  job: Job;
  /** Detail URL; omitted only for the non-link preview card. */
  href?: string;
}

export function JobsCard({ job, href }: JobsCardProps) {
  if (href) {
    return (
      <Link href={href} className={`${cardClass} ${focusRing}`}>
        <CardContent job={job} />
      </Link>
    );
  }

  return (
    <article className={cardClass}>
      <CardContent job={job} />
    </article>
  );
}
