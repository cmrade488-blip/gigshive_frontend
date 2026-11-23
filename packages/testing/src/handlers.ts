/**
 * MSW handlers from the OpenAPI endpoint catalogue (FE-005).
 *
 * Responses use the same `{ data }` / `{ data, meta }` envelopes as the real
 * API so feature code never changes when the backend slice ships. Fixtures
 * are typed by the generated schema; nothing here invents a field or status.
 *
 * `?mock_scenario=error|forbidden` forces those states for screen tests.
 * `?cursor=end` returns an empty page, matching the real cursor contract.
 */
import { http, HttpResponse, type RequestHandler } from "msw";

import {
  makeBankAccount,
  makeCategory,
  makeContract,
  makeDeliverable,
  makeErrorBody,
  makeJob,
  makeKycVerification,
  makeMedia,
  makeMoney,
  makePayout,
  makeProfile,
  makeProposal,
  makeSessionUser,
  makeStaffSessionUser,
  makeTransaction,
  makeWallet,
  resetFixtures,
} from "./fixtures";

function single<T>(data: T, status = 200): Response {
  return HttpResponse.json({ data }, { status });
}

function collection<T>(data: T[], nextCursor: string | null = null): Response {
  return HttpResponse.json({
    data,
    meta: { next_cursor: nextCursor, per_page: 20 },
  });
}

function adminPage<T>(data: T[]): Response {
  return HttpResponse.json({
    data,
    meta: { current_page: 1, per_page: 20, total: data.length },
  });
}

function mockError(status: number, code: string, message: string): Response {
  return HttpResponse.json(makeErrorBody(code, message), { status });
}

function forcedFailure(request: Request): Response | null {
  const scenario = new URL(request.url).searchParams.get("mock_scenario");
  if (scenario === "error") {
    return mockError(500, "INTERNAL_ERROR", "The mock server returned an error.");
  }
  if (scenario === "forbidden") {
    return mockError(403, "FORBIDDEN", "The mock server denied this request.");
  }
  return null;
}

const categories = [
  makeCategory(),
  makeCategory({ slug: "development", name: "Development & IT" }),
  makeCategory({ slug: "writing", name: "Writing & Translation" }),
  makeCategory({
    slug: "home-repair",
    name: "Home & Repair",
    category_type: "PHYSICAL",
  }),
];

let user = makeSessionUser();
let staff = makeStaffSessionUser();
let workers = [
  makeProfile({ display_name: "Ada Creatives", headline: "Brand designer" }),
  makeProfile({
    display_name: "Chidi Okafor",
    headline: "WordPress developer",
    categories: [{ ...makeCategory({ slug: "development", name: "Development & IT" }) }],
    rating_average: 4.6,
    rating_count: 27,
  }),
];
let jobs = [
  makeJob(),
  makeJob({
    title: "Build a one-page landing site",
    budget_type: "RANGE",
    budget_min: makeMoney(150_000),
    budget_max: makeMoney(300_000),
    application_mode: "APPLICATION",
    screening_questions: [
      { id: "q1", text: "Which projects are you proudest of?", required: true },
      { id: "q2", text: "When can you start?", required: false },
    ],
    proposals_count: 7,
  }),
];

/** Restore every fixture and collection to its initial state between tests. */
export function resetHandlers(): void {
  resetFixtures();
  user = makeSessionUser();
  staff = makeStaffSessionUser();
  workers = [
    makeProfile({ display_name: "Ada Creatives", headline: "Brand designer" }),
    makeProfile({
      display_name: "Chidi Okafor",
      headline: "WordPress developer",
      categories: [{ ...makeCategory({ slug: "development", name: "Development & IT" }) }],
      rating_average: 4.6,
      rating_count: 27,
    }),
  ];
  jobs = [
    makeJob(),
    makeJob({
      title: "Build a one-page landing site",
      budget_type: "RANGE",
      budget_min: makeMoney(150_000),
      budget_max: makeMoney(300_000),
      application_mode: "APPLICATION",
      proposals_count: 7,
    }),
  ];
}

export const handlers: RequestHandler[] = [
  // Session projections. The staff proxy is registered before the generic /me.
  http.get("*/staff-proxy/me", ({ request }) => forcedFailure(request) ?? single(staff)),
  http.get("*/me", ({ request }) => forcedFailure(request) ?? single(user)),

  // Catalog.
  http.get("*/categories", ({ request }) => forcedFailure(request) ?? single(categories)),

  // Public workers directory and detail.
  http.get("*/workers", ({ request }) => {
    const failure = forcedFailure(request);
    if (failure) {
      return failure;
    }
    const url = new URL(request.url);
    if (url.searchParams.get("cursor") === "end") {
      return collection([]);
    }
    const query = url.searchParams.get("q")?.toLowerCase();
    const category = url.searchParams.get("category");
    let results = workers;
    if (query) {
      results = results.filter((worker) =>
        `${worker.display_name} ${worker.headline ?? ""}`.toLowerCase().includes(query),
      );
    }
    if (category) {
      results = results.filter((worker) =>
        worker.categories.some((item) => item.slug === category),
      );
    }
    return collection(results, "end");
  }),
  http.get("*/workers/:id", ({ params, request }) => {
    const failure = forcedFailure(request);
    if (failure) {
      return failure;
    }
    const id = String(params["id"]);
    return single(workers.find((worker) => worker.id === id) ?? workers[0]);
  }),

  // Own verification list (status and last four only).
  http.get(
    "*/profiles/:id/verifications",
    ({ request }) => forcedFailure(request) ?? single([makeKycVerification()]),
  ),

  // More specific job routes before /jobs/:id.
  http.get(
    "*/jobs/:id/proposals",
    ({ request }) => forcedFailure(request) ?? collection([makeProposal()]),
  ),
  http.post("*/jobs/:id/proposals", () => single(makeProposal(), 201)),

  http.get("*/jobs", ({ request }) => {
    const failure = forcedFailure(request);
    if (failure) {
      return failure;
    }
    const url = new URL(request.url);
    if (url.searchParams.get("cursor") === "end") {
      return collection([]);
    }
    const query = url.searchParams.get("q")?.toLowerCase();
    const results = query ? jobs.filter((job) => job.title.toLowerCase().includes(query)) : jobs;
    return collection(results, "end");
  }),
  http.post("*/jobs", () => single(makeJob({ status: "DRAFT" }), 201)),
  http.get("*/jobs/:id", ({ params, request }) => {
    const failure = forcedFailure(request);
    if (failure) {
      return failure;
    }
    const id = String(params["id"]);
    return single(jobs.find((job) => job.id === id) ?? jobs[0]);
  }),

  // Proposals, contracts and deliverables.
  http.get(
    "*/proposals/mine",
    ({ request }) => forcedFailure(request) ?? collection([makeProposal()]),
  ),
  http.get(
    "*/proposals/:id",
    ({ params, request }) =>
      forcedFailure(request) ?? single(makeProposal({ id: String(params["id"]) })),
  ),
  http.get("*/contracts", ({ request }) => forcedFailure(request) ?? collection([makeContract()])),
  http.get(
    "*/contracts/:id",
    ({ params, request }) =>
      forcedFailure(request) ?? single(makeContract({ id: String(params["id"]) })),
  ),
  http.get(
    "*/contracts/:id/deliverables",
    ({ request }) => forcedFailure(request) ?? single([makeDeliverable()]),
  ),

  // Wallet, bank accounts and payouts. Money stays integer kobo; numbers are masked.
  http.get("*/wallet", ({ request }) => forcedFailure(request) ?? single(makeWallet())),
  http.get(
    "*/wallet/transactions",
    ({ request }) => forcedFailure(request) ?? collection([makeTransaction()]),
  ),
  http.get(
    "*/banks",
    ({ request }) =>
      forcedFailure(request) ??
      single([
        { code: "044", name: "Access Bank" },
        { code: "058", name: "GTCO" },
      ]),
  ),
  http.get(
    "*/bank-accounts",
    ({ request }) => forcedFailure(request) ?? single([makeBankAccount()]),
  ),
  http.get(
    "*/bank-accounts/:id",
    ({ params, request }) =>
      forcedFailure(request) ?? single(makeBankAccount({ id: String(params["id"]) })),
  ),
  http.get("*/payouts", ({ request }) => forcedFailure(request) ?? collection([makePayout()])),

  // Media. The URL is a test placeholder, never a real signed URL.
  http.post("*/media", () => single(makeMedia(), 201)),
  http.post("*/media/:id/signed-url", () =>
    single({ url: "/mock/private/file.png", expires_in: 300 }),
  ),

  // Console reads use page meta rather than cursors.
  http.get(
    "*/admin/profiles",
    ({ request }) => forcedFailure(request) ?? adminPage([makeProfile()]),
  ),
  http.get(
    "*/admin/verifications",
    ({ request }) => forcedFailure(request) ?? adminPage([makeKycVerification()]),
  ),
  http.get("*/admin/jobs", ({ request }) => forcedFailure(request) ?? adminPage([makeJob()])),
  http.get(
    "*/admin/contracts",
    ({ request }) => forcedFailure(request) ?? adminPage([makeContract()]),
  ),
  http.get(
    "*/admin/payments",
    ({ request }) => forcedFailure(request) ?? adminPage([makeTransaction()]),
  ),
  http.get("*/admin/payouts", ({ request }) => forcedFailure(request) ?? adminPage([makePayout()])),
  http.get(
    "*/admin/audit-logs",
    ({ request }) =>
      forcedFailure(request) ??
      adminPage([
        {
          id: "audit_0000000000000001",
          action: "PROFILE_APPROVED",
          created_at: "2026-11-18T09:00:00.000Z",
        },
      ]),
  ),
  http.get(
    "*/admin/config",
    ({ request }) => forcedFailure(request) ?? single({ platform_fee_percent: 10 }),
  ),
];
