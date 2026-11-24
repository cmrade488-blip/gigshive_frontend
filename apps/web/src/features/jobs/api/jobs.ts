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

export interface ScreeningQuestion {
  id: string;
  text: string;
  required: boolean;
}

export type JobStatus =
  "DRAFT" | "OPEN" | "IN_PROGRESS" | "CLOSED" | "CANCELLED" | "EXPIRED" | "REMOVED";

/** Public job fields plus the read-only detail sections shown on the detail page. */
export interface JobDetail extends Job {
  description: readonly string[];
  deliverables: readonly string[];
  skills: readonly string[];
  questions: readonly ScreeningQuestion[];
  location: string;
  openUntil: string;
  deliveryDays: number;
  status: JobStatus;
  removalReason: string | null;
  clientLocation: string;
  clientEmailVerified: boolean;
  clientMemberSince: string;
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

type JobDetailExtras = Omit<JobDetail, keyof Job | "status" | "removalReason">;

/**
 * Detail sections for every sample id, so each card from the list has a page.
 * These are typed samples behind a local mock, not a guessed API response.
 * A4: clientEmailVerified is false here; a real API must supply that claim.
 */
const jobDetailExtras: Readonly<Record<string, JobDetailExtras>> = {
  "sample-clinic-site": {
    description: [
      "We run a small clinic and need a clear, fast website that works well on phones. Patients should be able to see our services and opening hours, and book an appointment through a short form.",
      "Our logo and colours are ready. We will supply the text and photos. We would like the first version live within three weeks of starting.",
    ],
    deliverables: [
      "A home page, services page and contact page",
      "A booking form that sends requests to our email",
      "Mobile-first design that loads quickly",
      "Handover with simple instructions for edits",
    ],
    skills: ["HTML and CSS", "Responsive design", "Forms", "Accessibility"],
    questions: [
      { id: "q1", text: "Share a link to a similar website you have built.", required: true },
      {
        id: "q2",
        text: "How would you make the booking form simple for older patients?",
        required: true,
      },
      { id: "q3", text: "Is there anything you would change in our brief?", required: false },
    ],
    location: "Lagos, Nigeria",
    openUntil: "15 December",
    deliveryDays: 21,
    clientLocation: "Lagos, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2026",
  },
  "sample-junior-dev": {
    description: [
      "We are building a small marketplace and need a junior developer to help ship the first version. You will work alongside one senior engineer and pick up ui tasks with clear reviews.",
      "The role runs for three months with room to extend. We care more about careful work and good questions than years of experience.",
    ],
    deliverables: [
      "Build and review two screens each week",
      "Fix small bugs with tests",
      "Join a short daily check-in",
    ],
    skills: ["React", "TypeScript", "Git"],
    questions: [
      { id: "q1", text: "Share a project you contributed to and what you owned.", required: true },
      { id: "q2", text: "How do you approach a bug you cannot reproduce?", required: true },
      { id: "q3", text: "What would you like to learn in this role?", required: false },
    ],
    location: "Remote, Nigeria",
    openUntil: "20 December",
    deliveryDays: 90,
    clientLocation: "Lagos, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2025",
  },
  "sample-checkout-bugs": {
    description: [
      "Our React storefront has three known checkout bugs. Customers can sometimes see the wrong total, and the pay button can be pressed twice.",
      "We have written reproduction steps and a staging account. You will fix the bugs, add regression tests and explain each change.",
    ],
    deliverables: [
      "Fix the three reported bugs",
      "Add a regression test for each fix",
      "A short note explaining the root cause",
    ],
    skills: ["React", "Debugging", "Payment flows", "Testing"],
    questions: [
      { id: "q1", text: "Describe a payment bug you fixed before.", required: true },
      { id: "q2", text: "How do you test a checkout flow?", required: true },
    ],
    location: "Remote, Nigeria",
    openUntil: "10 December",
    deliveryDays: 14,
    clientLocation: "Abuja, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2024",
  },
  "sample-figma-site": {
    description: [
      "The design is finished and approved. We need it built as five fast, accessible pages that look right on every screen size.",
      "Images and copy are supplied. We will review in stages and keep feedback in one place.",
    ],
    deliverables: [
      "Five responsive pages",
      "Keyboard and screen-reader friendly navigation",
      "A short handover document",
    ],
    skills: ["Figma", "HTML and CSS", "Accessibility", "Performance"],
    questions: [
      { id: "q1", text: "Link a site you built from a design file.", required: true },
      { id: "q2", text: "How do you test a site at 360 px?", required: true },
      { id: "q3", text: "Any questions about the brief?", required: false },
    ],
    location: "Remote, Nigeria",
    openUntil: "18 December",
    deliveryDays: 21,
    clientLocation: "Port Harcourt, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2025",
  },
  "sample-wordpress-school": {
    description: [
      "A growing school needs help keeping its WordPress site current. Work includes updates, small content changes and a new events page.",
      "This is ongoing work with a simple monthly check-in. You will have a named contact for approvals.",
    ],
    deliverables: [
      "Keep plugins and themes updated",
      "Publish the new events page",
      "Handle small content requests each week",
    ],
    skills: ["WordPress", "PHP", "Content updates"],
    questions: [
      { id: "q1", text: "How do you update a site without breaking it?", required: true },
      { id: "q2", text: "Share an example of a page you built in WordPress.", required: false },
    ],
    location: "Remote, Nigeria",
    openUntil: "22 December",
    deliveryDays: 30,
    clientLocation: "Ibadan, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2023",
  },
  "sample-brand-identity": {
    description: [
      "A new fintech startup needs a brand identity that feels calm and trustworthy. The founders have a clear audience and a short brief ready.",
      "We would like a small set of files the team can use straight away, plus a one-page guide.",
    ],
    deliverables: [
      "A primary logo and a compact mark",
      "Colour and type guidance",
      "Source files and a short brand guide",
    ],
    skills: ["Logo design", "Brand guides", "Vector artwork"],
    questions: [
      { id: "q1", text: "Share two brand identities you designed.", required: true },
      { id: "q2", text: "How do you make a logo work at small sizes?", required: true },
    ],
    location: "Lagos, Nigeria",
    openUntil: "12 December",
    deliveryDays: 14,
    clientLocation: "Lagos, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2026",
  },
  "sample-travel-writer": {
    description: [
      "A travel blog needs four articles a month about places and practical trip planning. The editor supplies a topic list and a short style guide.",
      "This is an application. We will ask a few questions and review two writing samples before agreeing a price.",
    ],
    deliverables: [
      "Four articles of 1,000 to 1,500 words each month",
      "One round of edits per article",
      "Short source notes with each draft",
    ],
    skills: ["Writing", "Editing", "Research", "SEO"],
    questions: [
      { id: "q1", text: "Share two travel articles you wrote.", required: true },
      { id: "q2", text: "How would you structure a practical city guide?", required: true },
      {
        id: "q3",
        text: "Which regions do you know well enough to write about?",
        required: false,
      },
    ],
    location: "Remote, Nigeria",
    openUntil: "28 December",
    deliveryDays: 30,
    clientLocation: "Lagos, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2025",
  },
  "sample-promotional-video": {
    description: [
      "We have two minutes of raw footage and need a clean promotional video with captions for a product launch.",
      "A rough cut is available so you can see the story we want. Music and brand assets will be supplied.",
    ],
    deliverables: [
      "A 60 to 90 second edited video",
      "Captions and a final colour pass",
      "Two export sizes for social and web",
    ],
    skills: ["Video editing", "Captions", "Motion graphics"],
    questions: [
      { id: "q1", text: "Link a short video you edited.", required: true },
      { id: "q2", text: "How do you approach captions for social video?", required: true },
    ],
    location: "Remote, Nigeria",
    openUntil: "16 December",
    deliveryDays: 10,
    clientLocation: "Enugu, Nigeria",
    clientEmailVerified: false,
    clientMemberSince: "2026",
  },
};

/** Sample ids used to pre-render detail pages. */
export function getJobIds(): readonly string[] {
  return sampleJobs.map((job) => job.id);
}

/** Returns the typed sample detail for an id, or null when it does not exist. */
export function getJobById(id: string): JobDetail | null {
  const job = sampleJobs.find((candidate) => candidate.id === id);
  const extras = jobDetailExtras[id];
  if (job === undefined || extras === undefined) {
    return null;
  }

  return {
    ...job,
    ...extras,
    status: "OPEN",
    removalReason: null,
  };
}
