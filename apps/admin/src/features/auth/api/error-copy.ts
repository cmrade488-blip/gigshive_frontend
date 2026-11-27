import { isApiError } from "@gigshive/api-client";
import { errorCopy, type ErrorCopyKind } from "@gigshive/shared/error-copy";

import { staffAuthCopy } from "../copy/staff-auth";

export type StaffAuthField = "email" | "password" | "otp";
export type StaffAuthFieldErrors = Partial<Record<StaffAuthField, string>>;

export interface StaffAuthFormIssue {
  kind: ErrorCopyKind;
  copy: (typeof errorCopy)[ErrorCopyKind];
  fieldErrors: StaffAuthFieldErrors;
  reference?: string;
  retryAfterSeconds?: number;
}

const FIELD_COPY: Readonly<Record<StaffAuthField, string>> = {
  email: staffAuthCopy.errors.email,
  password: staffAuthCopy.errors.password,
  otp: staffAuthCopy.errors.code,
};

const KNOWN_KINDS = new Set<ErrorCopyKind>([
  "auth",
  "forbidden",
  "notFound",
  "conflict",
  "validation",
  "rateLimit",
  "server",
  "network",
  "unknown",
]);

function isStaffAuthField(value: string): value is StaffAuthField {
  return value === "email" || value === "password" || value === "otp";
}

function kindOf(error: unknown): ErrorCopyKind {
  if (typeof error !== "object" || error === null) {
    return "unknown";
  }

  const candidate = error as { kind?: unknown; status?: unknown };
  if (typeof candidate.kind === "string" && KNOWN_KINDS.has(candidate.kind as ErrorCopyKind)) {
    return candidate.kind as ErrorCopyKind;
  }
  if (typeof candidate.status === "number") {
    if (candidate.status === 401) return "auth";
    if (candidate.status === 403) return "forbidden";
    if (candidate.status === 404) return "notFound";
    if (candidate.status === 409) return "conflict";
    if (candidate.status === 422) return "validation";
    if (candidate.status === 429) return "rateLimit";
    return candidate.status >= 500 ? "server" : "unknown";
  }
  return "unknown";
}

/** Maps a failure to fixed copy; backend messages and codes are never shown. */
export function describeStaffAuthError(error: unknown): StaffAuthFormIssue {
  const kind = kindOf(error);
  const copy = errorCopy[kind];

  if (!isApiError(error)) {
    return { kind, copy, fieldErrors: {} };
  }

  const fieldErrors: StaffAuthFieldErrors = {};
  for (const [name] of Object.entries(error.fieldErrors)) {
    const field = name === "code" ? "otp" : name;
    if (isStaffAuthField(field)) {
      fieldErrors[field] = FIELD_COPY[field];
    }
  }

  return {
    kind,
    copy,
    fieldErrors,
    ...(kind === "server" ? { reference: error.requestId } : {}),
    ...(kind === "rateLimit" && error.retryAfterSeconds !== null
      ? { retryAfterSeconds: error.retryAfterSeconds }
      : {}),
  };
}
