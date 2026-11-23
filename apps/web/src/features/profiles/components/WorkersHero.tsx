"use client";

import { SiteHeader } from "@/features/site";

import { workersCopy } from "../copy/workers";
import type { WorkersFilterValues } from "../state/workers-filters";
import { WorkersSearch } from "./WorkersSearch";

export interface WorkersHeroProps {
  filters: WorkersFilterValues;
  onSearch: (filters: WorkersFilterValues) => void;
}

/** Dark hex hero for Browse workers: header, badge, heading and search pill. */
export function WorkersHero({ filters, onSearch }: WorkersHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-b-none bg-ink-900 pb-[150px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/images/patterns/hex-pattern.svg')] bg-[length:104px_120px] opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[220px] -right-[160px] h-[760px] w-[760px] bg-[radial-gradient(circle,rgba(245,160,0,0.4),rgba(245,160,0,0)_66%)]"
      />
      <div className="relative">
        <SiteHeader />
        <div className="mx-auto max-w-[1200px] px-5 pt-14 sm:px-10">
          <span className="inline-block rounded-full bg-honey-500/20 px-4 py-1.5 text-sm font-semibold text-honey-400">
            {workersCopy.heroBadge}
          </span>
          <h1 className="mt-4 font-display text-[40px] leading-[1.08] font-bold tracking-[-1.6px] text-white sm:text-[56px]">
            {workersCopy.heroTitle}
          </h1>
          <p className="mt-4 max-w-[700px] text-[18px] text-ink-300 sm:text-[20px]">
            {workersCopy.heroSubtitle}
          </p>
          <div className="mt-7">
            <WorkersSearch value={filters} onSearch={onSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}
