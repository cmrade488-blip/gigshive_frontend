import type { SessionData } from "../api/session";

type Profile = SessionData["profiles"][number];

let id = 0;

function nextId(prefix: string): string {
  id += 1;
  return `${prefix}-${id}`;
}

/** Minimal FE-017 session fixture built from the generated contract shape. */
export function makeTestProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: nextId("profile"),
    profile_type: "WORKER",
    worker_type: "CREATOR",
    display_name: "Ada Obi",
    status: "ACTIVE",
    status_reason: null,
    suspended_until: null,
    headline: null,
    rating_average: null,
    rating_count: 0,
    ...overrides,
  };
}

export function makeTestSession(overrides: Partial<SessionData> = {}): SessionData {
  return {
    id: nextId("user"),
    email: "ada@example.com",
    phone: "+2348012345678",
    email_verified_at: "2026-11-01T09:00:00.000Z",
    phone_verified_at: null,
    account_type: "USER",
    status: "ACTIVE",
    profiles: [makeTestProfile({ profile_type: "CLIENT", worker_type: null })],
    abilities: ["client", "worker"],
    ...overrides,
  };
}
