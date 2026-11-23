import { workerProfileCopy } from "@/features/profiles";

export default function WorkerProfileLoading() {
  return (
    <p role="status" className="p-10 text-base text-ink-600">
      {workerProfileCopy.loading}
    </p>
  );
}
