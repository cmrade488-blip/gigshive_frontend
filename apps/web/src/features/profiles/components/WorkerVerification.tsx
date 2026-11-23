import { workerProfileCopy as copy } from "../copy/worker-profile";

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Only the design's public verification ticks; no identity data is rendered. */
export function WorkerVerification({
  identityVerified,
  emailVerified,
}: {
  identityVerified: boolean;
  emailVerified: boolean;
}) {
  return (
    <aside className="rounded-[28px] bg-ink-900 p-7 text-white">
      <h2 className="m-0 text-[17px] font-semibold">{copy.verificationTitle}</h2>
      <ul className="m-0 mt-4 flex flex-col gap-3 p-0 text-[15px] text-ink-100">
        {identityVerified ? (
          <li className="flex items-center gap-2.5">
            <CheckIcon className="text-success-500" />
            {copy.identityVerified}
          </li>
        ) : null}
        {emailVerified ? (
          <li className="flex items-center gap-2.5">
            <CheckIcon className="text-success-500" />
            {copy.emailVerified}
          </li>
        ) : null}
      </ul>
      <p className="mb-0 mt-4 text-[13px] text-ink-300">{copy.identityNote}</p>
    </aside>
  );
}
