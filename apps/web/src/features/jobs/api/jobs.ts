import { kobo, type Kobo } from "@gigshive/shared/money";

import { filterJobs, sortJobs, type JobsFilterValues } from "../state/jobs-filters";

/** Integer kobo amounts supplied together by the platform, never derived here. */
export interface JobBudget {
  minKobo: Kobo;
  maxKobo: Kobo;
}

export type JobMode = "priced" | "application";

export interface Job {
  id: string;
  categoryId: string;
  category: string;
  mode: JobMode;
  posted: string;
  title: string;
  summary: string;
  budget: JobBudget | null;
  proposals: number;
  client: string;
  avatar: string;
}

export interface JobsPage {
  items: readonly Job[];
  nextCursor: string | null;
  total: number;
}

/**
 * Typed samples for the sample results shown in the design. No public jobs
 * endpoint exists yet (FE-004/FE-005 are outstanding), so this mock is the only
 * data source. Amounts are integer kobo; the client only formats them.
 */
const sampleJobs: readonly Job[] = [
  {
    id: "sample-clinic-site",
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "priced",
    posted: "3 days ago",
    title: "Build a landing page and booking form",
    summary:
      "A fast, mobile-first site for a small clinic with an online booking form and clear opening hours.",
    budget: { minKobo: kobo(30_000_000), maxKobo: kobo(45_000_000) },
    proposals: 4,
    client: "Sample Care Clinic",
    avatar: "/brand/images/avatars/avatar-03.svg",
  },
  {
    id: "sample-junior-dev",
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "application",
    posted: "4 days ago",
    title: "Junior front-end developer for a 3-month project",
    summary:
      "Join a small team building a marketplace. Answer two questions and share a portfolio link.",
    budget: null,
    proposals: 9,
    client: "Sample Market Ltd",
    avatar: "/brand/images/avatars/avatar-08.svg",
  },
  {
    id: "sample-checkout-bugs",
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "priced",
    posted: "6 days ago",
    title: "Fix payment checkout bugs in an online shop",
    summary: "Three known bugs in a React storefront. Clear steps to reproduce are provided.",
    budget: { minKobo: kobo(12_000_000), maxKobo: kobo(18_000_000) },
    proposals: 2,
    client: "Sample Shop",
    avatar: "/brand/images/avatars/avatar-01.svg",
  },
  {
    id: "sample-figma-site",
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "priced",
    posted: "1 week ago",
    title: "Convert a Figma design to a responsive website",
    summary: "Five pages. The design is ready and approved. Accessibility and speed matter.",
    budget: { minKobo: kobo(40_000_000), maxKobo: kobo(60_000_000) },
    proposals: 7,
    client: "Sample Studio",
    avatar: "/brand/images/avatars/avatar-06.svg",
  },
  {
    id: "sample-wordpress-school",
    categoryId: "web-and-software",
    category: "Web and software",
    mode: "application",
    posted: "1 week ago",
    title: "WordPress support for a growing school",
    summary: "Ongoing help with updates, small changes and a new events page.",
    budget: null,
    proposals: 5,
    client: "Sample Academy",
    avatar: "/brand/images/avatars/avatar-02.svg",
  },
  {
    id: "sample-brand-identity",
    categoryId: "design",
    category: "Design",
    mode: "priced",
    posted: "2 days ago",
    title: "Brand identity for a new fintech startup",
    summary: "Logo, colour palette and a short brand guide for a Lagos-based startup.",
    budget: { minKobo: kobo(15_000_000), maxKobo: kobo(25_000_000) },
    proposals: 6,
    client: "Sample Fintech Ltd",
    avatar: "/brand/images/avatars/avatar-04.svg",
  },
  {
    id: "sample-travel-writer",
    categoryId: "writing",
    category: "Writing",
    mode: "application",
    posted: "5 days ago",
    title: "Part-time content writer for a travel blog",
    summary: "Four articles a month. Answer three short questions and share two writing samples.",
    budget: null,
    proposals: 11,
    client: "Sample Travel Co",
    avatar: "/brand/images/avatars/avatar-05.svg",
  },
  {
    id: "sample-promotional-video",
    categoryId: "video-and-audio",
    category: "Video and audio",
    mode: "priced",
    posted: "1 week ago",
    title: "Edit a short promotional video",
    summary: "Two minutes of footage, captions and a clean cut for a product launch.",
    budget: { minKobo: kobo(8_000_000), maxKobo: kobo(12_000_000) },
    proposals: 3,
    client: "Sample Media",
    avatar: "/brand/images/avatars/avatar-07.svg",
  },
];

const PAGE_SIZE = 3;

export interface GetJobsPageInput {
  filters: JobsFilterValues;
  /** Opaque offset cursor. Null loads the first page. */
  cursor: string | null;
}

/** Returns one page of matching sample jobs and the cursor for the next one. */
export async function getJobsPage({ filters, cursor }: GetJobsPageInput): Promise<JobsPage> {
  const matches = sortJobs(filterJobs(sampleJobs, filters), filters.sort);
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
