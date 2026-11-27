export {
  getCategories,
  type CategoriesData,
  type Category,
  type CategoryType,
} from "./api/categories";
export { describeCatalogError, type CatalogIssue } from "./api/error-copy";
export {
  CategoryFilterChips,
  type CategoryFilterChipsProps,
} from "./components/CategoryFilterChips";
export { CategoryTreePicker, type CategoryTreePickerProps } from "./components/CategoryTreePicker";
export { catalogCopy } from "./copy/catalog";
export {
  buildCategoryTree,
  categoryName,
  isCategoryType,
  type CategoryNode,
} from "./schemas/categories";
export { useCategories } from "./state/use-categories";
