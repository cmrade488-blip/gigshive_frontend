"use client";

import { SiteHeader } from "@/features/site";

import { jobsCopy } from "../copy/jobs";
import { JobsSearch } from "./JobsSearch";

export interface JobsHeroProps {
  query: string;
  onSearch: (query: string) => void;
}

/** Dark hex hero for Find work: header, left-aligned heading and search pill. */
export function JobsHero({ query, onSearch }: JobsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-b-[48px] bg-ink-900 pb-[120px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] -right-[140px] h-[640px] w-[640px] bg-[radial-gradient(circle,rgba(245,160,0,0.38),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
        <div className="mx-auto max-w-[1200px] px-5 pt-14 sm:px-10">
          <h1 className="font-display text-[46px] leading-[1.08] font-bold tracking-[-1px] text-white">
            {jobsCopy.heroTitle}
          </h1>
          <p className="mt-2 mb-7 max-w-[720px] text-[18px] text-ink-300">
            {jobsCopy.heroSubtitle}
          </p>
          <JobsSearch value={query} onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
