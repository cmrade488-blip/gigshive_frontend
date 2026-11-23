"use client";

import Image from "next/image";
import Link from "next/link";
import { MoneyDisplay } from "@gigshive/ui";

import { homeCopy as copy } from "../copy/home";
import { siteRoutes } from "../routes";
import { useHomeJobs } from "../state/use-home-jobs";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

/** Sample listings. Cards are not links until the job details route exists. */
export function HomeJobs() {
  const { data, isPending, isError } = useHomeJobs();

  return (
    <section
      aria-labelledby="home-jobs-title"
      className="px-5 pt-6 pb-16 sm:px-10 sm:pt-[24px] sm:pb-[72px]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 sm:mb-9">
          <div>
            <h2
              id="home-jobs-title"
              className="font-display text-[26px] font-bold tracking-[-0.5px] sm:text-[40px]"
            >
              {copy.jobsTitle}
            </h2>
            <p className="mt-2 text-base text-ink-600">{copy.jobsSubtitle}</p>
          </div>
          <Link
            href={siteRoutes.jobs}
            className={`border-b-2 border-honey-500 pb-0.5 font-semibold hover:text-ink-600 ${focusRing}`}
          >
            {copy.jobsAllLabel}
          </Link>
        </div>

        {isPending ? (
          <p role="status" className="text-base text-ink-600">
            {copy.jobsLoading}
          </p>
        ) : null}
        {isError ? (
          <p role="alert" className="rounded-2xl bg-gh-danger-bg p-4 text-base text-gh-danger">
            {copy.jobsError}
          </p>
        ) : null}
        {!isPending && !isError && !data?.length ? (
          <p role="status" className="text-base text-ink-600">
            {copy.jobsEmpty}
          </p>
        ) : null}

        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {data?.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-4 rounded-[20px] border border-gh-border bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:rounded-[28px] sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700">
                  {job.category}
                </span>
                <span className="text-[13px] text-ink-500">{job.posted}</span>
              </div>
              <h3 className="text-[20px] leading-[1.3] font-semibold">{job.title}</h3>
              <p className="text-[15px] text-ink-600">{job.summary}</p>
              <div className="flex items-center gap-3">
                <Image src={job.avatar} width={36} height={36} alt="" className="rounded-full" />
                <span className="text-sm text-ink-600">{job.client}</span>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gh-border pt-4">
                {job.budget ? (
                  <p className="m-0 text-[17px] font-semibold">
                    <MoneyDisplay amountKobo={job.budget.minKobo} size="md" />{" "}
                    {copy.budgetSeparator}{" "}
                    <MoneyDisplay amountKobo={job.budget.maxKobo} size="md" />
                  </p>
                ) : (
                  <p className="m-0 text-[15px] font-semibold">{copy.agreedAfterApply}</p>
                )}
                <span className="text-[13px] font-semibold text-honey-700">{job.mode}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
