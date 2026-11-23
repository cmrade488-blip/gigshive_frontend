export const notFoundCopy = {
  metaTitle: "Page not found",
  metaDescription: "We could not find the page you were looking for.",
  code: "404",
  title: "We cannot find that page",
  description:
    "The link may be old, or the page may have moved. Nothing is wrong with your account.",
  homeLabel: "Go to home",
  jobsLabel: "Find work",
  howItWorksLabel: "How it works",
  image: "/brand/images/empty/no-results.svg",
} as const;

export const accessDeniedCopy = {
  metaTitle: "Access denied",
  metaDescription: "You do not have access to this page.",
  code: "403",
  title: "You do not have access to this page",
  description: "It may belong to another account, or need a profile you have not set up yet.",
  homeLabel: "Go to home",
  switchProfileLabel: "Switch profile",
  signInAgainLabel: "Sign in again",
  image: "/brand/images/empty/no-results.svg",
} as const;

export const serverErrorCopy = {
  metaTitle: "Something went wrong",
  metaDescription: "Something went wrong on our side.",
  code: "500",
  title: "Something went wrong on our side",
  description:
    "Please try again in a moment. If it keeps happening, contact support and quote the reference below.",
  retryLabel: "Try again",
  homeLabel: "Go to home",
  referenceIntro: "Reference",
  referenceSuffix: "quote this if you contact support",
  devDetailLabel: "Technical detail (development only)",
  image: "/brand/images/empty/nothing-yet.svg",
} as const;

export const maintenanceCopy = {
  metaTitle: "We will be right back",
  metaDescription: "GigsHive is down for a short update.",
  code: "503",
  title: "We will be right back",
  description:
    "GigsHive is down for a short update. Your jobs, contracts and money are not affected by this page. Please check again soon.",
  retryLabel: "Check again",
  contactLabel: "Contact support",
  image: "/brand/images/empty/nothing-yet.svg",
} as const;
