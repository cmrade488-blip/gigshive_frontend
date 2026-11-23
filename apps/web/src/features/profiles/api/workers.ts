import { filterWorkers, type WorkersFilterValues } from "../state/workers-filters";

/** Public projection only. No status, address, contact or identity fields live here. */
export type WorkerCategoryId = "design" | "writing" | "web" | "other";

export interface WorkerPortfolioItem {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly image: string;
}

export interface Worker {
  readonly id: string;
  readonly displayName: string;
  readonly headline: string;
  readonly avatar: string;
  readonly location: string;
  readonly categoryId: WorkerCategoryId;
  readonly skills: readonly string[];
  readonly ratingAverage: number | null;
  readonly ratingCount: number;
  readonly jobsCount: number;
  readonly verified: boolean;
}

export interface WorkerDetail extends Worker {
  readonly bio: readonly string[];
  readonly memberSince: string;
  readonly identityVerified: boolean;
  readonly emailVerified: boolean;
  readonly portfolio: readonly WorkerPortfolioItem[];
}

export interface WorkersPage {
  readonly items: readonly Worker[];
  readonly nextCursor: string | null;
  readonly total: number;
}

/**
 * Typed samples for the design's Browse workers page. No public workers endpoint
 * exists yet (DESIGN.md records the gap; FE-004/FE-005 are outstanding), so this
 * mock is the only data source. It contains only fields safe for public display.
 */
const sampleWorkers: readonly Worker[] = [
  {
    id: "sample-amaka",
    displayName: "Amaka O.",
    headline: "Product designer for mobile and web apps",
    avatar: "/brand/images/avatars/avatar-04.svg",
    location: "Ibadan, Nigeria",
    categoryId: "design",
    skills: ["UI design", "Prototyping", "User research", "Design systems"],
    ratingAverage: 4.9,
    ratingCount: 28,
    jobsCount: 28,
    verified: true,
  },
  {
    id: "sample-tunde",
    displayName: "Tunde A.",
    headline: "Full-stack developer",
    avatar: "/brand/images/avatars/avatar-02.svg",
    location: "Lagos, Nigeria",
    categoryId: "web",
    skills: ["React", "Next.js", "APIs", "Testing"],
    ratingAverage: 4.8,
    ratingCount: 26,
    jobsCount: 26,
    verified: true,
  },
  {
    id: "sample-ife",
    displayName: "Ife B.",
    headline: "Content writer",
    avatar: "/brand/images/avatars/avatar-05.svg",
    location: "Abuja, Nigeria",
    categoryId: "writing",
    skills: ["Copy", "Editing", "SEO"],
    ratingAverage: 4.9,
    ratingCount: 34,
    jobsCount: 34,
    verified: true,
  },
  {
    id: "sample-kunle",
    displayName: "Kunle S.",
    headline: "Video editor",
    avatar: "/brand/images/avatars/avatar-07.svg",
    location: "Lagos, Nigeria",
    categoryId: "other",
    skills: ["Editing", "Motion", "Reels"],
    ratingAverage: 4.7,
    ratingCount: 15,
    jobsCount: 15,
    verified: true,
  },
  {
    id: "sample-chinedu",
    displayName: "Chinedu Eze",
    headline: "Brand and logo designer",
    avatar: "/brand/images/avatars/avatar-01.svg",
    location: "Lagos, Nigeria",
    categoryId: "design",
    skills: ["Logo", "Branding", "Figma"],
    ratingAverage: 4.9,
    ratingCount: 31,
    jobsCount: 31,
    verified: true,
  },
  {
    id: "sample-ife-adebayo",
    displayName: "Ife Adebayo",
    headline: "Mobile app UI designer",
    avatar: "/brand/images/avatars/avatar-02.svg",
    location: "Port Harcourt, Nigeria",
    categoryId: "design",
    skills: ["UI", "Figma", "Prototyping"],
    ratingAverage: 4.9,
    ratingCount: 24,
    jobsCount: 24,
    verified: true,
  },
  {
    id: "sample-tolu",
    displayName: "Tolu Bakare",
    headline: "Product designer",
    avatar: "/brand/images/avatars/avatar-03.svg",
    location: "Ibadan, Nigeria",
    categoryId: "design",
    skills: ["UX", "Research", "Web"],
    ratingAverage: 4.7,
    ratingCount: 12,
    jobsCount: 12,
    verified: true,
  },
  {
    id: "sample-sade",
    displayName: "Sade Okon",
    headline: "Copywriter and editor",
    avatar: "/brand/images/avatars/avatar-06.svg",
    location: "Enugu, Nigeria",
    categoryId: "writing",
    skills: ["Copy", "Editing", "SEO"],
    ratingAverage: 4.8,
    ratingCount: 40,
    jobsCount: 40,
    verified: true,
  },
  {
    id: "sample-kemi",
    displayName: "Kemi Ajayi",
    headline: "Frontend developer",
    avatar: "/brand/images/avatars/avatar-08.svg",
    location: "Lagos, Nigeria",
    categoryId: "web",
    skills: ["Next.js", "React", "Tailwind"],
    ratingAverage: 4.9,
    ratingCount: 18,
    jobsCount: 18,
    verified: true,
  },
  {
    id: "sample-emeka",
    displayName: "Emeka Obi",
    headline: "Video editor",
    avatar: "/brand/images/avatars/avatar-01.svg",
    location: "Abuja, Nigeria",
    categoryId: "other",
    skills: ["Editing", "Motion", "Reels"],
    ratingAverage: 4.6,
    ratingCount: 9,
    jobsCount: 9,
    verified: true,
  },
  {
    id: "sample-zainab",
    displayName: "Zainab Musa",
    headline: "Data entry and admin",
    avatar: "/brand/images/avatars/avatar-03.svg",
    location: "Kano, Nigeria",
    categoryId: "other",
    skills: ["Excel", "Typing", "Research"],
    ratingAverage: 4.8,
    ratingCount: 55,
    jobsCount: 55,
    verified: true,
  },
];

/** Portfolio artwork from the design; public media only, no signed URLs. */
const samplePortfolio: readonly WorkerPortfolioItem[] = [
  {
    id: "portfolio-mobile-app",
    title: "Delivery app redesign",
    kind: "Mobile app",
    image: "/brand/images/portfolio/mobile-app.svg",
  },
  {
    id: "portfolio-dashboard",
    title: "Savings dashboard",
    kind: "Web app",
    image: "/brand/images/portfolio/dashboard.svg",
  },
  {
    id: "portfolio-website",
    title: "Clinic booking flow",
    kind: "Website",
    image: "/brand/images/portfolio/website.svg",
  },
  {
    id: "portfolio-branding",
    title: "Brand and icon set",
    kind: "Branding",
    image: "/brand/images/portfolio/branding.svg",
  },
  {
    id: "portfolio-packaging",
    title: "Snack box packaging",
    kind: "Packaging",
    image: "/brand/images/portfolio/packaging.svg",
  },
  {
    id: "portfolio-poster",
    title: "Event poster",
    kind: "Print",
    image: "/brand/images/portfolio/poster.svg",
  },
];

type WorkerDetailExtras = Omit<WorkerDetail, keyof Worker>;

/** Detail sections for every sample id, so each list card has a page. */
const workerDetailExtras: Readonly<Record<string, WorkerDetailExtras>> = {
  "sample-amaka": {
    bio: [
      "I design clear, simple screens for apps and websites. I like turning a rough idea into something people can use on their first try.",
      "I work from research and sketches to final screens, and I hand over files that developers can build from.",
    ],
    memberSince: "2026",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-tunde": {
    bio: [
      "I build web apps end to end, with a focus on small, maintainable changes and a quick feedback loop.",
      "I work well with designers and enjoy turning a fixed design into something fast and accessible.",
    ],
    memberSince: "2024",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-ife": {
    bio: [
      "I write clear copy for websites, emails and product screens, then edit it until every line earns its place.",
      "I can work from a short brief and will ask the questions needed to get the tone right.",
    ],
    memberSince: "2025",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-kunle": {
    bio: [
      "I turn raw footage into short videos with clean cuts, captions and a clear story.",
      "I send a rough cut early so feedback arrives before the final colour pass.",
    ],
    memberSince: "2025",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-chinedu": {
    bio: [
      "I design logos and small brand systems that stay legible on a phone screen and on a shop sign.",
      "I start with sketches, then supply source files and a short guide the team can use straight away.",
    ],
    memberSince: "2023",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-ife-adebayo": {
    bio: [
      "I design mobile app screens that are easy to learn, from the first sketch through a working prototype.",
      "I test with real people where I can and keep the handover simple for developers.",
    ],
    memberSince: "2025",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-tolu": {
    bio: [
      "I shape product flows around what people actually need, using research and quick prototypes to decide what to build.",
      "I work comfortably with engineers and keep a record of why each decision was made.",
    ],
    memberSince: "2026",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-sade": {
    bio: [
      "I write and edit articles, landing pages and product copy that sound like the people behind the work.",
      "I am happy to take a rough draft and make it ready to publish.",
    ],
    memberSince: "2022",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-kemi": {
    bio: [
      "I build accessible front ends with React and TypeScript, and care about the details that make a page feel quick.",
      "I write tests for the tricky parts and leave clear notes for the next person.",
    ],
    memberSince: "2025",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-emeka": {
    bio: [
      "I edit short-form video for social and web, with attention to pacing, captions and readable type.",
      "I keep the project files tidy so a later edit is easy to pick up.",
    ],
    memberSince: "2026",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
  "sample-zainab": {
    bio: [
      "I handle data entry, spreadsheets and admin work with care and a steady turnaround.",
      "I check my work twice and flag anything that looks inconsistent before it becomes a problem.",
    ],
    memberSince: "2023",
    identityVerified: true,
    emailVerified: true,
    portfolio: samplePortfolio,
  },
};

const PAGE_SIZE = 4;

export interface GetWorkersPageInput {
  filters: WorkersFilterValues;
  /** Opaque offset cursor. Null loads the first page. */
  cursor: string | null;
}

/** Returns one page of matching sample workers and the cursor for the next one. */
export async function getWorkersPage({
  filters,
  cursor,
}: GetWorkersPageInput): Promise<WorkersPage> {
  const matches = filterWorkers(sampleWorkers, filters);
  const parsedCursor = cursor === null ? 0 : Number.parseInt(cursor, 10);
  const offset =
    Number.isInteger(parsedCursor) && parsedCursor >= 0
      ? Math.min(parsedCursor, matches.length)
      : 0;
  const items = matches.slice(offset, offset + PAGE_SIZE);
  const nextOffset = offset + PAGE_SIZE;

  return {
    items,
    nextCursor: nextOffset < matches.length ? String(nextOffset) : null,
    total: matches.length,
  };
}

/** Sample ids used to pre-render detail pages when the API is connected. */
export function getWorkerIds(): readonly string[] {
  return sampleWorkers.map((worker) => worker.id);
}

/** Returns the typed sample detail for an id, or null when it does not exist. */
export function getWorkerById(id: string): WorkerDetail | null {
  const worker = sampleWorkers.find((candidate) => candidate.id === id);
  const extras = workerDetailExtras[id];
  if (worker === undefined || extras === undefined) {
    return null;
  }

  return { ...worker, ...extras };
}
