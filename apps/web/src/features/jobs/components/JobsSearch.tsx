"use client";

import { useEffect, useState } from "react";

import { jobsCopy } from "../copy/jobs";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

export interface JobsSearchProps {
  value: string;
  onSearch: (query: string) => void;
}

/** The search pill in the Find work hero. */
export function JobsSearch({ value, onSearch }: JobsSearchProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <form
      role="search"
      className="flex flex-wrap items-center gap-2 rounded-full bg-white py-2 pr-2 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:max-w-[720px]"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft.trim());
      }}
    >
      <label htmlFor="jobs-search" className="sr-only">
        {jobsCopy.searchLabel}
      </label>
      <input
        id="jobs-search"
        type="search"
        value={draft}
        placeholder={jobsCopy.searchPlaceholder}
        onChange={(event) => setDraft(event.target.value)}
        className={`min-w-0 flex-1 border-0 bg-transparent py-3 font-sans text-base text-ink-900 outline-none placeholder:text-ink-400 ${focusRing}`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded-full bg-honey-500 px-8 py-4 font-semibold text-ink-900 transition-colors hover:bg-honey-400 ${focusRing}`}
      >
        {jobsCopy.searchButton}
      </button>
    </form>
  );
}
