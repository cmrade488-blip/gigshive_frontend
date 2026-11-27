"use client";

import { siteRoutes } from "@gigshive/shared/routes";
import { MoneyDisplay } from "@gigshive/ui";
import Link from "next/link";

import { hasSuspendedProfile, sessionStatus, useSessionStatus } from "@/features/auth";

import type { JobDetail } from "../api/jobs";
import { jobDetailCopy } from "../copy/job-detail";
import { jobsCopy } from "../copy/jobs";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none";

/**
 * Budget, delivery estimate and sign-in route to the proposal form (FE-034).
 * FE-017 gates the visible action for unverified or suspended users; the API
 * remains the authority on whether a proposal may be submitted.
 */
export function JobApplyCard({ job }: { job: JobDetail }) {
  const { data: session } = useSessionStatus();
  const status = sessionStatus(session);
  const suspended = status === "SUSPENDED" || hasSuspendedProfile(session);

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(15,22,38,0.12)] sm:p-8">
      <p className="m-0 text-sm text-ink-500">{jobDetailCopy.budgetLabel}</p>
      {job.budget ? (
        <p className="m-0 mt-0.5 flex flex-wrap items-baseline gap-2 font-display text-[28px] leading-tight font-bold">
          <MoneyDisplay
            amountKobo={job.budget.minKobo}
            size="lg"
            className="font-display text-[28px] font-bold"
          />
          {jobsCopy.budgetSeparator}
          <MoneyDisplay
            amountKobo={job.budget.maxKobo}
            size="lg"
            className="font-display text-[28px] font-bold"
          />
        </p>
      ) : (
        <p className="m-0 mt-0.5 font-display text-[24px] font-bold">
          {jobDetailCopy.agreedAfterApply}
        </p>
      )}
      <p className="mb-6 mt-1 text-sm text-ink-600">
        {jobDetailCopy.deliveryPrefix} {job.deliveryDays} {jobDetailCopy.deliverySuffix}
      </p>

      {suspended ? (
        <p
          role="status"
          className="m-0 rounded-full bg-gh-danger-bg px-5 py-4 text-center text-sm font-semibold text-gh-danger"
        >
          {jobDetailCopy.suspendedCannotApply}
        </p>
      ) : (
        <Link
          href={status === "UNVERIFIED" ? siteRoutes.verifyEmail : siteRoutes.login}
          className={`block rounded-full bg-honey-500 px-5 py-4 text-center font-semibold text-ink-900 hover:bg-honey-400 ${focusRing}`}
        >
          {status === "UNVERIFIED"
            ? jobDetailCopy.verifyEmailToProposal
            : jobDetailCopy.signInToProposal}
        </Link>
      )}
      <p className="mb-0 mt-3.5 text-center text-[13px] text-ink-500">
        {jobDetailCopy.newHere}{" "}
        <Link
          href={siteRoutes.register}
          className={`font-medium text-gh-link hover:underline ${focusRing}`}
        >
          {jobDetailCopy.createFreeAccount}
        </Link>
        . {jobDetailCopy.verifiedProfileNote}
      </p>
    </section>
  );
}
