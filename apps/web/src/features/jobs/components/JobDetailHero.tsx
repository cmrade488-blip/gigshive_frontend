import Link from "next/link";
import { SiteHeader } from "@/features/site";

import { jobDetailCopy } from "../copy/job-detail";
import { jobsCopy } from "../copy/jobs";
import { jobsRoutes } from "../routes";
import type { JobDetail } from "../api/jobs";

/** Dark hex hero with breadcrumb, badges, title and job facts. */
export function JobDetailHero({ job }: { job: JobDetail }) {
  return (
    <section className="relative overflow-hidden rounded-b-[48px] bg-ink-900 pb-[120px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] -right-[140px] h-[640px] w-[640px] bg-[radial-gradient(circle,rgba(245,160,0,0.38),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
        <div className="mx-auto max-w-[1200px] px-5 pt-12 sm:px-10">
          <nav aria-label={jobDetailCopy.breadcrumbLabel} className="mb-5 text-sm text-ink-300">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href={jobsRoutes.list} className="text-honey-200 hover:underline">
                  {jobsCopy.metaTitle}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>{job.category}</li>
            </ol>
          </nav>

          <div className="mb-[18px] flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white">
              {job.category}
            </span>
            <span className="rounded-full bg-honey-400 px-3.5 py-1.5 text-xs font-semibold text-ink-900">
              {job.mode === "priced" ? jobsCopy.modePriced : jobsCopy.modeBadgeApplication}
            </span>
          </div>

          <h1 className="max-w-[800px] font-display text-[36px] leading-[1.12] font-bold tracking-[-1px] text-white sm:text-[44px]">
            {job.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-ink-300">
            <span>
              {jobDetailCopy.postedPrefix} {job.posted}
            </span>
            <span>{job.location}</span>
            <span>
              {job.proposals}{" "}
              {job.mode === "priced"
                ? jobDetailCopy.proposalsSuffix
                : jobDetailCopy.applicationsSuffix}
            </span>
            <span>
              {jobDetailCopy.openUntilPrefix} {job.openUntil}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
