"use client";

import { SiteFooter, siteCopy } from "@/features/site";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { WorkersHero } from "../components/WorkersHero";
import { WorkersResults } from "../components/WorkersResults";
import {
  parseWorkersFilters,
  serializeWorkersFilters,
  type WorkersFilterValues,
} from "../state/workers-filters";

/** Browse workers: hero search, URL-backed filters and cursor-paged results. */
export function WorkersScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseWorkersFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: WorkersFilterValues) => {
      const query = serializeWorkersFilters(next);
      router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
    },
    [pathname, router],
  );

  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <WorkersHero filters={filters} onSearch={commit} />
      <main id="main-content" className="px-5 pb-24 sm:px-10">
        <div className="relative mx-auto -mt-[90px] max-w-[1200px]">
          <WorkersResults filters={filters} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
