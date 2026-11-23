import Image from "next/image";

import type { JobDetail } from "../api/jobs";
import { jobDetailCopy } from "../copy/job-detail";

/** Public client summary; no private profile fields are part of this mock. */
export function JobClientCard({ job }: { job: JobDetail }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_4px_12px_rgba(15,22,38,0.06)] sm:p-8">
      <h2 className="m-0 text-[17px] font-semibold">{jobDetailCopy.aboutClient}</h2>
      <div className="my-[18px] flex items-center gap-3.5">
        <Image src={job.avatar} width={56} height={56} alt="" className="rounded-full" />
        <div>
          <p className="m-0 font-semibold">{job.client}</p>
          <p className="m-0 text-sm text-ink-500">{job.clientLocation}</p>
        </div>
      </div>
      <ul className="m-0 flex flex-col gap-2.5 p-0 text-sm text-ink-600">
        {job.clientEmailVerified ? (
          <li className="flex items-center gap-2">
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
              className="text-gh-success"
            >
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
            {jobDetailCopy.emailVerified}
          </li>
        ) : null}
        <li className="flex items-center gap-2">
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
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {jobDetailCopy.memberSincePrefix} {job.clientMemberSince}
        </li>
      </ul>
    </section>
  );
}
