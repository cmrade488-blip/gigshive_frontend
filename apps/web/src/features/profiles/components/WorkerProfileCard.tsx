import Image from "next/image";
import Link from "next/link";
import { siteRoutes } from "@gigshive/shared/routes";

import type { WorkerDetail } from "../api/workers";
import { workerProfileCopy as copy } from "../copy/worker-profile";
import { workersCopy } from "../copy/workers";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

/** Name, headline and public facts, overlapping the dark hero band. */
export function WorkerProfileCard({ worker }: { worker: WorkerDetail }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-7 rounded-[32px] bg-white p-6 shadow-[0_12px_32px_rgba(15,22,38,0.12)] sm:p-9">
      <div className="flex flex-wrap items-center gap-7">
        <Image
          src={worker.avatar}
          width={112}
          height={112}
          alt={worker.displayName}
          className="rounded-full border-4 border-honey-100"
        />
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.5px] sm:text-[32px]">
              {worker.displayName}
            </h1>
            {worker.verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-[13px] font-semibold text-success-700">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                {copy.verified}
              </span>
            ) : null}
          </div>
          <p className="mb-2.5 mt-1.5 text-[18px] text-ink-700">{worker.headline}</p>
          <ul className="m-0 flex flex-wrap gap-x-5 gap-y-1 p-0 text-sm text-ink-600">
            <li>{worker.location}</li>
            <li>
              {copy.memberSincePrefix} {worker.memberSince}
            </li>
            <li>{workersCopy.categoryLabels[worker.categoryId]}</li>
          </ul>
        </div>
      </div>
      <Link
        href={siteRoutes.register}
        className={`rounded-full bg-honey-500 px-8 py-4 font-semibold text-ink-900 transition-colors hover:bg-honey-400 ${focusRing}`}
      >
        {copy.postAJob}
      </Link>
    </section>
  );
}
