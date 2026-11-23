"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

import type { HelpFaq } from "../copy/help";

export interface FaqListProps {
  faqs: readonly HelpFaq[];
  categories: readonly string[];
  searchLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  categoryLabel: string;
  allCategoriesLabel: string;
  emptyLabel: string;
}

/** Searchable, filterable FAQ list used by the Help centre. */
export function FaqList({
  faqs,
  categories,
  searchLabel,
  searchPlaceholder,
  searchButton,
  categoryLabel,
  allCategoriesLabel,
  emptyLabel,
}: FaqListProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const visibleFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory = category === "" || faq.category === category;
      const matchesQuery =
        needle === "" ||
        faq.question.toLowerCase().includes(needle) ||
        faq.answer.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [faqs, query, category]);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    // Filtering is live; the button submits for keyboard and screen-reader users.
    event.preventDefault();
  }

  return (
    <div>
      <form role="search" onSubmit={onSearch} className="mx-auto flex max-w-[620px] gap-2">
        <label htmlFor={searchId} className="sr-only">
          {searchLabel}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="min-h-12 w-full rounded-full border border-gh-border bg-white px-5 text-base text-gh-text focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
        />
        <button
          type="submit"
          className="min-h-12 flex-none rounded-full bg-ink-900 px-6 font-semibold text-white hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {searchButton}
        </button>
      </form>

      <div className="mt-8" role="group" aria-label={categoryLabel}>
        <div className="flex flex-wrap justify-center gap-2">
          {["", ...categories].map((option) => {
            const label = option === "" ? allCategoriesLabel : option;
            const active = option === category;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(option)}
                className={`min-h-10 rounded-full px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
                  active ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleFaqs.length === 0 ? (
        <p role="status" className="mt-10 text-center text-base text-ink-600">
          {emptyLabel}
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-3">
          {visibleFaqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-[20px] border border-gh-border bg-white px-6 py-1"
            >
              <summary className="cursor-pointer list-none rounded-xl py-5 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span className="block text-xs font-semibold tracking-wide text-honey-800 uppercase">
                  {faq.category}
                </span>
                {faq.question}
              </summary>
              <p className="pb-5 text-base text-ink-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
