"use client";

import { formatMoney, parseMoney, type Kobo } from "@gigshive/shared/money";
import { useEffect, useState } from "react";

import { jobCategories, jobsCopy } from "../copy/jobs";
import type { JobModeFilter, JobsFilterValues } from "../state/jobs-filters";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none";

interface FilterDraft {
  categories: string[];
  mode: JobModeFilter;
  minText: string;
  maxText: string;
}

function toDraft(filters: JobsFilterValues): FilterDraft {
  return {
    categories: [...filters.categories],
    mode: filters.mode,
    minText: filters.minKobo === null ? "" : formatMoney(filters.minKobo, { currency: false }),
    maxText: filters.maxKobo === null ? "" : formatMoney(filters.maxKobo, { currency: false }),
  };
}

function parsedKobo(text: string): Kobo | null {
  if (text.trim() === "") {
    return null;
  }
  const parsed = parseMoney(text);
  return parsed.ok ? parsed.kobo : null;
}

const modeOptions: readonly { value: JobModeFilter; label: string }[] = [
  { value: "all", label: jobsCopy.modeAll },
  { value: "priced", label: jobsCopy.modePriced },
  { value: "application", label: jobsCopy.modeApplication },
];

export interface JobsFilterPanelProps {
  filters: JobsFilterValues;
  onApply: (filters: JobsFilterValues) => void;
  onClear: () => void;
}

/** Filter card from the Find work design. Edits are applied as one batch. */
export function JobsFilterPanel({ filters, onApply, onClear }: JobsFilterPanelProps) {
  const [draft, setDraft] = useState<FilterDraft>(() => toDraft(filters));

  useEffect(() => {
    setDraft(toDraft(filters));
  }, [filters]);

  function applyFilters(): void {
    onApply({
      query: filters.query,
      categories: draft.categories,
      mode: draft.mode,
      minKobo: parsedKobo(draft.minText),
      maxKobo: parsedKobo(draft.maxText),
      sort: filters.sort,
    });
  }

  return (
    <aside
      aria-label={jobsCopy.filtersLabel}
      className="flex w-full shrink-0 flex-col gap-7 rounded-[28px] bg-white p-7 shadow-[0_12px_32px_rgba(15,22,38,0.12)] sm:w-[280px]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold">{jobsCopy.filtersLabel}</h2>
        <button
          type="button"
          onClick={onClear}
          className={`text-sm font-medium text-gh-link underline-offset-2 hover:underline ${focusRing}`}
        >
          {jobsCopy.clearAll}
        </button>
      </div>

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-semibold">{jobsCopy.categoryLegend}</legend>
        {jobCategories.map((option) => (
          <label key={option.id} className="flex items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={draft.categories.includes(option.id)}
              onChange={(event) => {
                const checked = event.target.checked;
                setDraft((current) => ({
                  ...current,
                  categories: checked
                    ? [...current.categories, option.id]
                    : current.categories.filter((value) => value !== option.id),
                }));
              }}
              className={`h-[18px] w-[18px] accent-honey-500 ${focusRing}`}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-semibold">{jobsCopy.modeLegend}</legend>
        {modeOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-3 text-[15px]">
            <input
              type="radio"
              name="jobs-mode"
              checked={draft.mode === option.value}
              onChange={() => setDraft((current) => ({ ...current, mode: option.value }))}
              className={`h-[18px] w-[18px] accent-honey-500 ${focusRing}`}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">{jobsCopy.budgetLabel}</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="jobs-budget-min" className="sr-only">
            {jobsCopy.budgetMinLabel}
          </label>
          <input
            id="jobs-budget-min"
            type="text"
            inputMode="decimal"
            placeholder={jobsCopy.budgetMinPlaceholder}
            value={draft.minText}
            onChange={(event) =>
              setDraft((current) => ({ ...current, minText: event.target.value }))
            }
            className={`min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 font-sans text-[15px] ${focusRing}`}
          />
          <span aria-hidden="true">–</span>
          <label htmlFor="jobs-budget-max" className="sr-only">
            {jobsCopy.budgetMaxLabel}
          </label>
          <input
            id="jobs-budget-max"
            type="text"
            inputMode="decimal"
            placeholder={jobsCopy.budgetMaxPlaceholder}
            value={draft.maxText}
            onChange={(event) =>
              setDraft((current) => ({ ...current, maxText: event.target.value }))
            }
            className={`min-w-0 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5 font-sans text-[15px] ${focusRing}`}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={applyFilters}
        className={`rounded-full bg-ink-900 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-ink-800 ${focusRing}`}
      >
        {jobsCopy.applyFilters}
      </button>
    </aside>
  );
}
