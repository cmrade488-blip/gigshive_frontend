/**
 * FE-021 catalog copy. No backend code, message, field name or technical
 * detail is rendered; every fixed string comes from here.
 */
export const catalogCopy = {
  picker: {
    label: "Category",
    singleHint: "Choose one category.",
    multipleHint: "Choose all that apply.",
    loading: "Loading categories…",
    emptyTitle: "No categories available",
    emptyText: "Categories will appear here once they are published.",
  },
  chips: {
    label: "Selected categories",
    loading: "Loading categories…",
    remove: (name: string) => `Remove ${name}`,
    clear: "Clear categories",
    unknown: "Selected category",
  },
  retry: {
    cooldown: (seconds: number) => `Try again in ${seconds}s`,
  },
  errors: {
    kinds: {
      auth: {
        title: "Please sign in",
        description: "Sign in again to continue.",
      },
      forbidden: {
        title: "You do not have access to these categories",
        description: "They may need a profile you have not set up yet.",
      },
      notFound: {
        title: "We cannot find these categories",
        description: "The category list may no longer be available.",
      },
      conflict: {
        title: "The categories have changed",
        description: "Refresh the list and try again.",
        actionLabel: "Refresh",
      },
      validation: {
        title: "Please check the category selection",
        description: "Choose a category from the list and try again.",
      },
      rateLimit: {
        title: "Please wait a moment",
        description: "There have been too many attempts. Wait before trying again.",
        actionLabel: "Try again",
      },
      server: {
        title: "We could not load categories",
        description: "Try again. If it keeps happening, quote the reference to support.",
        actionLabel: "Try again",
      },
      network: {
        title: "You appear to be offline",
        description: "Check your connection and try again.",
        actionLabel: "Try again",
      },
      unknown: {
        title: "That did not go through",
        description: "Please try again.",
        actionLabel: "Try again",
      },
    },
  },
} as const;
