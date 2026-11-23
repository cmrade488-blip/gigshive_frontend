/**
 * Typed fixture factories (FE-005).
 *
 * Every factory returns a shape from the generated OpenAPI schema, so a
 * contract change breaks compilation here instead of silently drifting in
 * tests. Money is always integer kobo. Identity and bank numbers are only
 * ever represented by the last four digits returned by the API.
 */
import type { schema } from "@gigshive/api-client";

type Schemas = schema.components["schemas"];

export type Money = Schemas["Money"];
export type ErrorBody = Schemas["ErrorBody"];
export type CursorMeta = Schemas["CursorMeta"];
export type ProfileSummary = Schemas["ProfileSummary"];
export type SessionUser = Schemas["SessionUser"];
export type Category = Schemas["Category"];
export type Media = Schemas["Media"];
export type Profile = Schemas["Profile"];
export type KycVerification = Schemas["KycVerification"];
export type Job = Schemas["Job"];
export type Proposal = Schemas["Proposal"];
export type Contract = Schemas["Contract"];
export type Deliverable = Schemas["Deliverable"];
export type Wallet = Schemas["Wallet"];
export type Transaction = Schemas["Transaction"];
export type BankAccount = Schemas["BankAccount"];
export type Payout = Schemas["Payout"];

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${String(sequence).padStart(16, "0")}`;
}

/** Reset id generation so tests are deterministic. */
export function resetFixtures(): void {
  sequence = 0;
}

export function makeMoney(amountKobo: number): Money {
  return { amount_kobo: amountKobo, currency: "NGN" };
}

export function makeErrorBody(
  code: string,
  message: string,
  details?: Record<string, string[]>,
): ErrorBody {
  return {
    error: {
      code,
      message,
      request_id: nextId("req"),
      ...(details ? { details } : {}),
    },
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: nextId("cat"),
    slug: "design",
    name: "Design & Creative",
    parent_id: null,
    category_type: "DIGITAL",
    description: null,
    sort_order: 0,
    is_active: true,
    ...overrides,
  };
}

export function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: nextId("media"),
    collection: "PORTFOLIO",
    visibility: "PUBLIC",
    original_name: "portfolio piece.png",
    mime_type: "image/png",
    size_bytes: 128_000,
    url: "/media/portfolio-piece.png",
    ...overrides,
  };
}

export function makeProfileSummary(overrides: Partial<ProfileSummary> = {}): ProfileSummary {
  return {
    id: nextId("prof"),
    profile_type: "WORKER",
    worker_type: "CREATOR",
    display_name: "Ada Creatives",
    status: "ACTIVE",
    status_reason: null,
    suspended_until: null,
    headline: "Brand designer",
    rating_average: 4.8,
    rating_count: 12,
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: nextId("prof"),
    profile_type: "WORKER",
    worker_type: "CREATOR",
    display_name: "Ada Creatives",
    headline: "Brand designer and visual storyteller",
    bio: "I help early-stage teams turn a rough idea into a confident visual identity.",
    country: "NG",
    state: "Lagos",
    city: "Lagos",
    address: null,
    attributes: {},
    attributes_version: 1,
    categories: [{ ...makeCategory(), is_primary: true }],
    status: "ACTIVE",
    status_reason: null,
    suspended_until: null,
    submitted_at: "2026-11-01T09:00:00.000Z",
    activated_at: "2026-11-02T09:00:00.000Z",
    rating_average: 4.8,
    rating_count: 12,
    avatar: null,
    cover: null,
    ...overrides,
  };
}

export function makeSessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: nextId("user"),
    email: "ada@example.com",
    phone: "+2348012345678",
    email_verified_at: "2026-11-01T09:00:00.000Z",
    phone_verified_at: null,
    account_type: "USER",
    status: "ACTIVE",
    profiles: [
      makeProfileSummary({
        profile_type: "CLIENT",
        worker_type: null,
        display_name: "Ada Obi",
        headline: null,
      }),
      makeProfileSummary(),
    ],
    abilities: ["client", "worker"],
    ...overrides,
  };
}

export function makeStaffSessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return makeSessionUser({
    account_type: "STAFF",
    abilities: ["staff"],
    permissions: ["profiles.review", "verifications.review", "jobs.moderate", "finance.view"],
    profiles: [],
    ...overrides,
  });
}

export function makeKycVerification(overrides: Partial<KycVerification> = {}): KycVerification {
  return {
    id: nextId("kyc"),
    verification_type: "NIN",
    method: "PROVIDER",
    status: "VERIFIED",
    identifier_last4: "1234",
    rejection_reason: null,
    submitted_at: "2026-11-01T09:00:00.000Z",
    verified_at: "2026-11-01T10:00:00.000Z",
    expires_at: null,
    ...overrides,
  };
}

export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: nextId("job"),
    client: makeProfileSummary({ profile_type: "CLIENT", worker_type: null, headline: null }),
    category: makeCategory(),
    post_type: "JOB",
    title: "Design a flyer for a product launch",
    description: "One A5 flyer, two revision rounds, source file required.",
    work_mode: "REMOTE",
    location_state: null,
    location_city: null,
    budget_type: "FIXED",
    budget_min: makeMoney(500_000),
    budget_max: null,
    desired_completion_date: "2026-12-01",
    application_mode: "PRICED_BID",
    screening_questions: null,
    status: "OPEN",
    removal_reason: null,
    proposals_count: 3,
    published_at: "2026-11-15T10:00:00.000Z",
    expires_at: null,
    closed_at: null,
    ...overrides,
  };
}

export function makeProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: nextId("prop"),
    job_post_id: nextId("job"),
    job_title: "Design a flyer for a product launch",
    worker: makeProfileSummary(),
    cover_letter: "I can deliver this in four days with two revision rounds.",
    amount: makeMoney(450_000),
    estimated_days: 4,
    available_from: "2026-11-20",
    screening_answers: null,
    portfolio_media_ids: [],
    attachments: [],
    status: "SUBMITTED",
    submitted_at: "2026-11-16T08:00:00.000Z",
    decided_at: null,
    withdrawn_at: null,
    ...overrides,
  };
}

export function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: nextId("ctr"),
    job_post_id: nextId("job"),
    proposal_id: nextId("prop"),
    client: makeProfileSummary({ profile_type: "CLIENT", worker_type: null, headline: null }),
    worker: makeProfileSummary(),
    title: "Design a flyer for a product launch",
    scope_summary: "One A5 flyer, two revision rounds.",
    agreed_amount: makeMoney(450_000),
    client_fee: makeMoney(0),
    worker_fee: makeMoney(45_000),
    total_charge: makeMoney(450_000),
    status: "PENDING_FUNDING",
    revision_limit: 2,
    revisions_used: 0,
    due_at: "2026-12-01T17:00:00.000Z",
    funded_at: null,
    delivered_at: null,
    completed_at: null,
    cancelled_at: null,
    review_deadline_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    ...overrides,
  };
}

export function makeDeliverable(overrides: Partial<Deliverable> = {}): Deliverable {
  return {
    id: nextId("del"),
    contract_id: nextId("ctr"),
    sequence: 1,
    message: "First draft attached.",
    status: "SUBMITTED",
    revision_note: null,
    files: [makeMedia({ collection: "DELIVERABLE" })],
    submitted_at: "2026-11-20T12:00:00.000Z",
    responded_at: null,
    ...overrides,
  };
}

export function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
  return { balance: makeMoney(1_250_000), status: "ACTIVE", ...overrides };
}

export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: nextId("txn"),
    entry_type: "ESCROW_RELEASE",
    direction: "CREDIT",
    amount: makeMoney(405_000),
    balance_after: makeMoney(1_250_000),
    description: "Escrow released for Design a flyer",
    created_at: "2026-11-17T14:30:00.000Z",
    contract_id: nextId("ctr"),
    ...overrides,
  };
}

export function makeBankAccount(overrides: Partial<BankAccount> = {}): BankAccount {
  return {
    id: nextId("bank"),
    bank_code: "044",
    bank_name: "Access Bank",
    account_name: "ADA OBI",
    account_number_last4: "6789",
    is_default: true,
    ...overrides,
  };
}

export function makePayout(overrides: Partial<Payout> = {}): Payout {
  return {
    id: nextId("pay"),
    amount: makeMoney(100_000),
    fee: makeMoney(0),
    net_amount: makeMoney(100_000),
    status: "REQUESTED",
    bank_name: "Access Bank",
    account_last4: "6789",
    account_name: "ADA OBI",
    failure_reason: null,
    requested_at: "2026-11-18T09:00:00.000Z",
    processed_at: null,
    approved_at: null,
    ...overrides,
  };
}
