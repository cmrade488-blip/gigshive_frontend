"use client";

import { EmptyState, LoadingState } from "@gigshive/ui";
import { useId, useMemo } from "react";

import type { CategoryType } from "../api/categories";
import { catalogCopy } from "../copy/catalog";
import { buildCategoryTree, type CategoryNode } from "../schemas/categories";
import { useCategories } from "../state/use-categories";
import { CategoryQueryMessage } from "./CategoryQueryMessage";

export interface CategoryTreePickerProps {
  /** Accessible group label. Callers may override it for a specific form. */
  label?: string;
  value: readonly string[];
  onChange: (ids: string[]) => void;
  /** Checkboxes for multi-select filters, radios for a single profile category. */
  multiple?: boolean;
  /** Optional API-backed restriction; no client-side business rule is added. */
  categoryType?: CategoryType;
  disabled?: boolean;
  /** Caller-owned validation copy; backend text is never passed through. */
  error?: string;
}

/**
 * API-backed two-level category tree. The component owns no category data or
 * selection rule: it renders what the API returns and reports raw ids upwards.
 */
export function CategoryTreePicker({
  label = catalogCopy.picker.label,
  value,
  onChange,
  multiple = true,
  categoryType,
  disabled = false,
  error,
}: CategoryTreePickerProps) {
  const categories = useCategories();
  const groupName = useId();
  const errorId = useId();
  const nodes = useMemo(
    () => buildCategoryTree(categories.data ?? [], categoryType),
    [categories.data, categoryType],
  );
  const selected = new Set(value);
  const inputDisabled = disabled || categories.isPending || categories.isError;

  function toggle(id: string) {
    if (inputDisabled) {
      return;
    }
    if (!multiple) {
      onChange([id]);
      return;
    }
    onChange(selected.has(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  function renderNode(node: CategoryNode) {
    const checked = selected.has(node.category.id);

    return (
      <li key={node.category.id} className="space-y-2">
        <label className="flex items-start gap-3 text-sm text-gh-text">
          <input
            type={multiple ? "checkbox" : "radio"}
            name={multiple ? undefined : groupName}
            checked={checked}
            disabled={inputDisabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={() => toggle(node.category.id)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-gh-primary"
          />
          <span className="min-w-0">
            <span className="block font-medium">{node.category.name}</span>
            {node.category.description ? (
              <span className="mt-0.5 block text-gh-text-subtle">{node.category.description}</span>
            ) : null}
          </span>
        </label>
        {node.children.length > 0 ? (
          <ul className="ml-7 space-y-2 border-l border-gh-border pl-4">
            {node.children.map(renderNode)}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-semibold text-gh-text">{label}</legend>
      <p className="text-sm text-gh-text-subtle">
        {multiple ? catalogCopy.picker.multipleHint : catalogCopy.picker.singleHint}
      </p>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-gh-danger">
          {error}
        </p>
      ) : null}

      {categories.isPending ? <LoadingState label={catalogCopy.picker.loading} /> : null}

      {categories.isError ? (
        <CategoryQueryMessage
          error={categories.error}
          busy={categories.isFetching}
          onRetry={() => void categories.refetch()}
        />
      ) : null}

      {categories.isSuccess && nodes.length === 0 ? (
        <EmptyState
          title={catalogCopy.picker.emptyTitle}
          description={catalogCopy.picker.emptyText}
        />
      ) : null}

      {categories.isSuccess && nodes.length > 0 ? (
        <ul className="space-y-3">{nodes.map(renderNode)}</ul>
      ) : null}
    </fieldset>
  );
}
