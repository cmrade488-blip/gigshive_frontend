import type { JobDetail } from "../api/jobs";
import { jobDetailCopy } from "../copy/job-detail";
import { getJobStatusView, type JobStatusTone } from "../state/job-status";

const toneClasses: Readonly<Record<JobStatusTone, string>> = {
  neutral: "bg-ink-100 text-ink-700",
  info: "bg-gh-info-bg text-gh-info",
  success: "bg-gh-success-bg text-gh-success",
  warning: "bg-gh-warning-bg text-gh-warning",
  danger: "bg-gh-danger-bg text-gh-danger",
};

/**
 * Read-only owner sidebar. Management actions land with FE-031/032, so this
 * variant only shows the documented status and any removal reason.
 */
export function OwnerJobNotice({ job }: { job: JobDetail }) {
  const status = getJobStatusView(job.status);

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(15,22,38,0.12)] sm:p-8">
      <p className="m-0 text-sm text-ink-500">{jobDetailCopy.statusLabel}</p>
      <p className="m-0 mt-1">
        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${toneClasses[status.tone]}`}
        >
          {status.label}
        </span>
      </p>
      {job.removalReason ? (
        <div className="mt-5">
          <h2 className="m-0 mb-1.5 text-sm font-semibold">{jobDetailCopy.removalReasonLabel}</h2>
          <p className="m-0 text-[15px] text-ink-700">{job.removalReason}</p>
        </div>
      ) : null}
      <p className="mb-0 mt-5 text-sm text-ink-600">{jobDetailCopy.ownerNotice}</p>
    </section>
  );
}
