"use client";

import { workerDetailPath } from "@gigshive/shared/routes";
import Image from "next/image";
import Link from "next/link";

import { homeCopy as copy } from "../copy/home";
import { useHomeWorkers } from "../state/use-home-workers";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";
const cardClass =
  "flex h-full flex-col items-center rounded-[20px] border border-gh-border bg-white px-6 py-8 text-center shadow-[0_4px_12px_rgba(15,22,38,0.06)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,22,38,0.12)] sm:rounded-[28px]";

/** Sample profiles. No verification badge: that claim must come from real API data. */
export function HomeWorkers() {
  const { data, isPending, isError } = useHomeWorkers();

  return (
    <section aria-labelledby="home-workers-title" className="px-5 pb-16 sm:px-10 sm:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="home-workers-title"
          className="font-display text-[26px] font-bold tracking-[-0.5px] sm:text-[40px]"
        >
          {copy.workersTitle}
        </h2>
        <p className="mt-2 text-base text-ink-600 sm:mb-9">{copy.workersSubtitle}</p>

        {isPending ? (
          <p role="status" className="mt-6 text-base text-ink-600">
            {copy.workersLoading}
          </p>
        ) : null}
        {isError ? (
          <p role="alert" className="mt-6 rounded-2xl bg-gh-danger-bg p-4 text-base text-gh-danger">
            {copy.workersError}
          </p>
        ) : null}
        {!isPending && !isError && !data?.length ? (
          <p role="status" className="mt-6 text-base text-ink-600">
            {copy.workersEmpty}
          </p>
        ) : null}

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {data?.map((worker) => (
            <li key={worker.id}>
              <Link href={workerDetailPath(worker.id)} className={`${cardClass} ${focusRing}`}>
                <Image src={worker.avatar} width={88} height={88} alt="" className="rounded-full" />
                <b className="mt-2 text-[18px] font-semibold">{worker.name}</b>
                <span className="text-sm text-ink-600">{worker.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
