import { jobDetailCopy } from "@/features/jobs";

export default function JobLoading() {
  return (
    <p role="status" className="p-10 text-base text-ink-600">
      {jobDetailCopy.loading}
    </p>
  );
}
