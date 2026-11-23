import { kobo, type Kobo } from "@gigshive/shared/money";

export interface HomeJobBudget {
  /** Integer kobo amounts supplied together by the platform, never derived here. */
  minKobo: Kobo;
  maxKobo: Kobo;
}

export interface HomeJob {
  id: string;
  category: string;
  posted: string;
  title: string;
  summary: string;
  /** Null when the amount is agreed after applying; no number is invented. */
  budget: HomeJobBudget | null;
  mode: string;
  client: string;
  avatar: string;
}

export interface HomeWorker {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

/**
 * Typed mocks for the sample content on the home page. No public jobs or workers
 * endpoint exists yet, and DESIGN.md records that "Meet workers" needs one.
 * Amounts are integers in kobo; the client only formats them for display.
 */
const sampleJobs: readonly HomeJob[] = [
  {
    id: "sample-fintech-brand",
    category: "Design",
    posted: "2 days ago",
    title: "Brand identity for a new fintech startup",
    summary: "Logo, colour palette and a short brand guide for a Lagos-based startup.",
    budget: { minKobo: kobo(15_000_000), maxKobo: kobo(25_000_000) },
    mode: "Priced proposals",
    client: "Sample Fintech Ltd",
    avatar: "/brand/images/avatars/avatar-01.svg",
  },
  {
    id: "sample-clinic-site",
    category: "Web and software",
    posted: "3 days ago",
    title: "Build a landing page and booking form",
    summary: "A fast, mobile-first site for a small clinic with an online booking form.",
    budget: { minKobo: kobo(30_000_000), maxKobo: kobo(45_000_000) },
    mode: "Priced proposals",
    client: "Sample Care Clinic",
    avatar: "/brand/images/avatars/avatar-03.svg",
  },
  {
    id: "sample-travel-writer",
    category: "Writing",
    posted: "5 days ago",
    title: "Part-time content writer for a travel blog",
    summary: "Four articles a month. Answer three short questions and share two writing samples.",
    budget: null,
    mode: "Application",
    client: "Sample Travel Co",
    avatar: "/brand/images/avatars/avatar-06.svg",
  },
];

const sampleWorkers: readonly HomeWorker[] = [
  {
    id: "sample-amaka",
    name: "Amaka O.",
    role: "Product designer",
    avatar: "/brand/images/avatars/avatar-04.svg",
  },
  {
    id: "sample-tunde",
    name: "Tunde A.",
    role: "Full-stack developer",
    avatar: "/brand/images/avatars/avatar-02.svg",
  },
  {
    id: "sample-ife",
    name: "Ife B.",
    role: "Content writer",
    avatar: "/brand/images/avatars/avatar-05.svg",
  },
  {
    id: "sample-kunle",
    name: "Kunle S.",
    role: "Video editor",
    avatar: "/brand/images/avatars/avatar-07.svg",
  },
];

/** Typed mock until a public jobs endpoint exists. */
export async function getHomeJobs(): Promise<readonly HomeJob[]> {
  return sampleJobs;
}

/** Typed mock until a public workers list endpoint exists. */
export async function getHomeWorkers(): Promise<readonly HomeWorker[]> {
  return sampleWorkers;
}
