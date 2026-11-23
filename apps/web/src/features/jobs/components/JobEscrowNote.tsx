import { jobDetailCopy } from "../copy/job-detail";

/** Escrow reminder from the detail design; no amounts are computed here. */
export function JobEscrowNote() {
  return (
    <aside className="flex gap-3.5 rounded-[28px] bg-ink-900 p-7">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-honey-400"
      >
        <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </svg>
      <p className="m-0 text-sm text-ink-200">{jobDetailCopy.escrowNote}</p>
    </aside>
  );
}
