/** All user-facing text for public job discovery. */
export const jobsCopy = {
  metaTitle: "Find work",
  metaDescription:
    "Browse open jobs from clients across Nigeria. Send a priced proposal or apply with a few answers.",

  heroTitle: "Find work",
  heroSubtitle:
    "Open jobs from clients across Nigeria. Send a proposal or apply with a few answers.",
  searchLabel: "Search jobs",
  searchPlaceholder: "Search by title or skill",
  searchButton: "Search",

  filtersLabel: "Filters",
  clearAll: "Clear all",
  categoryLegend: "Category",
  modeLegend: "How to apply",
  modeAll: "All jobs",
  modePriced: "Priced proposals",
  modeApplication: "Applications",
  modeBadgeApplication: "Application",
  budgetLabel: "Budget (₦)",
  budgetMinLabel: "Minimum budget",
  budgetMaxLabel: "Maximum budget",
  budgetMinPlaceholder: "Min",
  budgetMaxPlaceholder: "Max",
  budgetSeparator: "to",
  applyFilters: "Apply filters",

  sortLabel: "Sort by",
  sortNewest: "Newest",
  sortBudgetDesc: "Budget: high to low",
  sortBudgetAsc: "Budget: low to high",

  resultsLabel: "Showing sample results",
  proposalsUnit: "proposals",
  applicationsUnit: "applications",
  agreedAfterApply: "Agreed after you apply",
  sampleNotice: "Sample listings. Real jobs appear when the API is connected.",

  loading: "Loading jobs…",
  error: "We couldn't load jobs. Please try again.",
  forbidden: "You don't have access to these jobs.",
  empty: "No jobs match these filters. Try clearing them.",
  loadingMore: "Loading more jobs…",
  loadMore: "Load more jobs",
  endOfResults: "You've seen all the sample jobs.",
} as const;

export interface JobCategoryOption {
  readonly id: string;
  readonly label: string;
}

/** Categories from the Find work design's filter panel. */
export const jobCategories: readonly JobCategoryOption[] = [
  { id: "design", label: "Design" },
  { id: "web-and-software", label: "Web and software" },
  { id: "writing", label: "Writing" },
  { id: "marketing", label: "Marketing" },
  { id: "video-and-audio", label: "Video and audio" },
];
