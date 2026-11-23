import type { JobStatus } from "../api/jobs";
import { jobDetailCopy } from "../copy/job-detail";

/** Tones from Data and State Design §5.1. Colour is never the only signal. */
export type JobStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface JobStatusView {
  readonly label: string;
  readonly tone: JobStatusTone;
}

/** Exhaustive status map from Data and State Design §5.3. */
const statusTones: Readonly<Record<JobStatus, JobStatusTone>> = {
  DRAFT: "neutral",
  OPEN: "success",
  IN_PROGRESS: "info",
  CLOSED: "neutral",
  CANCELLED: "neutral",
  EXPIRED: "warning",
  REMOVED: "danger",
};

/** Returns the label and tone for a job status. */
export function getJobStatusView(status: JobStatus): JobStatusView {
  return { label: jobDetailCopy.statusLabels[status], tone: statusTones[status] };
}
