import type { Category, CategoryType } from "../api/categories";

export interface CategoryNode {
  readonly category: Category;
  readonly children: readonly CategoryNode[];
}

function compareCategories(a: Category, b: Category): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name);
}

/**
 * Builds the API's two-level tree from the flat generated response. Only active
 * categories are offered; an active category whose parent is absent or inactive
 * becomes a root so valid API data is never silently hidden.
 */
export function buildCategoryTree(
  categories: readonly Category[],
  categoryType?: CategoryType,
): CategoryNode[] {
  const active = categories.filter(
    (category) =>
      category.is_active && (categoryType === undefined || category.category_type === categoryType),
  );
  const byId = new Map(active.map((category) => [category.id, category]));
  const childrenByParent = new Map<string, Category[]>();
  const roots: Category[] = [];

  for (const category of active) {
    const parentId = category.parent_id;
    if (typeof parentId === "string" && parentId !== "" && byId.has(parentId)) {
      const siblings = childrenByParent.get(parentId) ?? [];
      siblings.push(category);
      childrenByParent.set(parentId, siblings);
    } else {
      roots.push(category);
    }
  }

  function toNode(category: Category, ancestors: ReadonlySet<string>): CategoryNode {
    const nextAncestors = new Set(ancestors).add(category.id);
    const children = (childrenByParent.get(category.id) ?? [])
      .filter((child) => !nextAncestors.has(child.id))
      .sort(compareCategories)
      .map((child) => toNode(child, nextAncestors));

    return { category, children };
  }

  return roots.sort(compareCategories).map((category) => toNode(category, new Set<string>()));
}

/** Resolves an API-supplied category id to its name without exposing the id. */
export function categoryName(categories: readonly Category[], id: string): string | null {
  return categories.find((category) => category.id === id)?.name ?? null;
}

export function isCategoryType(value: string): value is CategoryType {
  return value === "DIGITAL" || value === "PHYSICAL";
}
