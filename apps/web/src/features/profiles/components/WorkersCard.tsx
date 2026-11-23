import Image from "next/image";
import Link from "next/link";

import { workersCopy } from "../copy/workers";
import { workersRoutes } from "../routes";
import type { Worker } from "../api/workers";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

/** One public worker summary, linked to the detail page. */
export function WorkersCard({ worker }: { worker: Worker }) {
  const rating =
    worker.ratingAverage === null ? workersCopy.newRating : worker.ratingAverage.toFixed(1);

  return (
    <Link
      href={workersRoutes.detail(worker.id)}
      className={`flex h-full flex-col gap-3 rounded-[32px] bg-white p-7 shadow-[0_2px_16px_rgba(15,22,38,0.07)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,22,38,0.12)] ${focusRing}`}
    >
      <Image src={worker.avatar} width={64} height={64} alt="" className="shrink-0 rounded-full" />
      <div>
        <p className="m-0 text-[19px] font-semibold">
          {worker.displayName}{" "}
          {worker.verified ? (
            <span className="inline-block rounded-full bg-success-100 px-2.5 py-1 align-middle text-xs font-semibold text-success-700">
              {workersCopy.verified}
            </span>
          ) : null}
        </p>
        <p className="m-0 text-[15px] text-ink-600">{worker.headline}</p>
      </div>
      <p className="m-0 text-sm text-ink-500">
        {rating} · {worker.jobsCount} {workersCopy.jobsSuffix}
      </p>
      <ul className="m-0 flex flex-wrap gap-1.5 p-0">
        {worker.skills.map((skill) => (
          <li key={skill} className="rounded-full bg-ink-50 px-3 py-1 text-[13px] text-ink-700">
            {skill}
          </li>
        ))}
      </ul>
    </Link>
  );
}
