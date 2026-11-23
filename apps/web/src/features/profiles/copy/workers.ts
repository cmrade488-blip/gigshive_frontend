/** All user-facing text for public worker discovery. */
export const workersCopy = {
  metaTitle: "Browse workers",
  metaDescription: "Browse verified workers by skill and invite them to your job.",

  heroBadge: "Workers",
  heroTitle: "Find skilled workers",
  heroSubtitle: "Browse verified workers and invite them to your job.",
  searchLabel: "Search workers",
  searchPlaceholder: "Search by skill or name",
  categoryLabel: "Category",
  categoryAll: "All categories",
  categoryDesign: "Design",
  categoryWriting: "Writing",
  categoryWeb: "Web",
  searchButton: "Search",

  resultsLabel: "Showing sample workers",
  verified: "Verified",
  newRating: "New",
  jobsSuffix: "jobs",
  sampleNotice: "Sample workers. Real profiles appear when the public workers API is connected.",

  loading: "Loading workers…",
  error: "We couldn't load workers. Please try again.",
  forbidden: "You don't have access to these workers.",
  empty: "No workers match this search. Try a different skill or name.",
  loadingMore: "Loading more workers…",
  loadMore: "Load more workers",
  endOfResults: "You've seen all the sample workers.",

  categoryLabels: {
    design: "Design",
    writing: "Writing",
    web: "Web",
    other: "Other",
  },
} as const;

export interface WorkerCategoryOption {
  readonly id: string;
  readonly label: string;
}

/** Categories from the Find skilled workers design's search pill. */
export const workerCategories: readonly WorkerCategoryOption[] = [
  { id: "all", label: workersCopy.categoryAll },
  { id: "design", label: workersCopy.categoryDesign },
  { id: "writing", label: workersCopy.categoryWriting },
  { id: "web", label: workersCopy.categoryWeb },
];
