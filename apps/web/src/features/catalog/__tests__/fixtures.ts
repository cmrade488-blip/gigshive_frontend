import type { Category } from "../api/categories";

/** Local test data built from the generated Category type. */
export function makeTestCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat_design",
    slug: "design",
    name: "Design & Creative",
    parent_id: null,
    category_type: "DIGITAL",
    description: null,
    sort_order: 0,
    is_active: true,
    ...overrides,
  };
}
