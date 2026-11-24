/** Static home-page content. Sample data lives in api/home.ts, not here. */
export interface HomeCategory {
  name: string;
  image: string;
}

export interface HomeStep {
  number: string;
  title: string;
  text: string;
  image: string;
}

export const homeCopy = {
  // Hero
  heroEyebrow: "Work with people you can trust",
  heroTitleBefore: "Hire skilled people.",
  heroTitleAccent: "Pay when the work is done.",
  heroSubtitle:
    "Post a job, compare proposals and fund the contract. Your payment is held until you approve the work.",
  searchLabel: "Search for work",
  searchPlaceholder: "Search for work, for example logo design",
  searchButton: "Find work",
  mobilePostJobLabel: "Post a job",
  heroImageAlt: "A worker profile, a funded contract and a released payment",
  heroTrust: ["Payment held until approval", "Verified workers", "Paid in naira"],

  // Categories
  categoriesTitle: "Browse by category",
  categoriesSubtitle: "Find the kind of work you need, or the kind you do.",
  categoriesAllLabel: "All categories",
  categories: [
    { name: "Design", image: "/brand/images/categories/design.svg" },
    { name: "Web and software", image: "/brand/images/categories/web.svg" },
    { name: "Writing", image: "/brand/images/categories/writing.svg" },
    { name: "Marketing", image: "/brand/images/categories/marketing.svg" },
    { name: "Video and audio", image: "/brand/images/categories/video.svg" },
    { name: "Data and analytics", image: "/brand/images/categories/data.svg" },
    { name: "Admin support", image: "/brand/images/categories/admin.svg" },
    { name: "Training and tutoring", image: "/brand/images/categories/tutoring.svg" },
  ] satisfies readonly HomeCategory[],

  // How it works teaser
  stepsTitle: "How it works",
  stepsSubtitle: "One account. Hire when you need help, work when you have time.",
  steps: [
    {
      number: "Step 1",
      title: "Post a job or find one",
      text: "Clients describe the work and the budget. Workers browse open jobs and send a proposal or application.",
      image: "/brand/images/steps/post-a-job.svg",
    },
    {
      number: "Step 2",
      title: "Agree and fund the contract",
      text: "The client accepts a proposal and funds the contract. The payment is held while the work is done.",
      image: "/brand/images/steps/fund.svg",
    },
    {
      number: "Step 3",
      title: "Approve and get paid",
      text: "The worker delivers. When the client approves, the payment is released and can be withdrawn to a bank.",
      image: "/brand/images/steps/get-paid.svg",
    },
  ] satisfies readonly HomeStep[],

  // Sample jobs
  jobsTitle: "Open jobs",
  jobsSubtitle: "Sample listings. Real jobs appear here when clients publish them.",
  jobsAllLabel: "See all jobs",
  jobsLoading: "Loading sample jobs…",
  jobsEmpty: "There are no sample jobs to show right now.",
  jobsError: "We could not load the sample jobs. Please try again.",
  budgetSeparator: "to",
  agreedAfterApply: "Agreed after you apply",

  // Sample workers
  workersTitle: "Meet workers on GigsHive",
  workersSubtitle: "Sample profiles. Every worker confirms their identity before applying.",
  workersLoading: "Loading sample profiles…",
  workersEmpty: "There are no sample profiles to show right now.",
  workersError: "We could not load the sample profiles. Please try again.",

  // Trust band
  trustTitle: "Built so both sides can relax",
  trustCards: [
    {
      title: "Payment held until approval",
      text: "Clients fund the contract first, so workers start knowing the money is there. Clients release it only when they are happy.",
      image: "/brand/images/steps/fund.svg",
    },
    {
      title: "Verified workers",
      text: "Workers confirm their identity before they can apply. Clients see a verified badge on every checked profile.",
    },
    {
      title: "Paid in naira",
      text: "Pay and withdraw in naira to a Nigerian bank account. Every amount is recorded on your wallet.",
    },
  ] as const,

  // Closing call to action
  ctaTitle: "Ready to get started?",
  ctaText: "Create one free account. Add a client profile, a worker profile, or both.",
  ctaPrimaryLabel: "Create free account",
  ctaSecondaryLabel: "Browse jobs",
  ctaImageAlt: "",
} as const;
