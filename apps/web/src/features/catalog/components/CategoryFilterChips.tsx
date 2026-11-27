"use client";

import { Button, LoadingState } from "@gigshive/ui";

import { catalogCopy } from "../copy/catalog";
import { categoryName } from "../schemas/categories";
import { useCategories } from "../state/use-categories";
import { CategoryQueryMessage } from "./CategoryQueryMessage";

export interface CategoryFilterChipsProps {
  selectedIds: readonly string[];
  onRemove: (id: string) => void;
  onClear?: () => void;
  label?: string;
  disabled?: boolean;
}

/** Removable chips for API-known category ids; unknown ids never appear raw. */
export function CategoryFilterChips({
  selectedIds,
  onRemove,
  onClear,
  label = catalogCopy.chips.label,
  disabled = false,
}: CategoryFilterChipsProps) {
  const categories = useCategories();

  if (selectedIds.length === 0) {
    return null;
  }

  if (categories.isPending) {
    return <LoadingState label={catalogCopy.chips.loading} />;
  }

  if (categories.isError) {
    return (
      <CategoryQueryMessage
        error={categories.error}
        busy={categories.isFetching}
        onRetry={() => void categories.refetch()}
      />
    );
  }

  const available = categories.data ?? [];

  return (
    <section aria-label={label} className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap gap-2">
        {selectedIds.map((id) => {
          const name = categoryName(available, id) ?? catalogCopy.chips.unknown;

          return (
            <li key={id}>
              <button
                type="button"
                disabled={disabled}
                aria-label={catalogCopy.chips.remove(name)}
                onClick={() => onRemove(id)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gh-border bg-gh-surface px-4 py-2 text-sm font-semibold text-gh-text focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{name}</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          );
        })}
      </ul>
      {onClear ? (
        <Button type="button" variant="ghost" disabled={disabled} onClick={onClear}>
          {catalogCopy.chips.clear}
        </Button>
      ) : null}
    </section>
  );
}
