import { isApiError } from "@gigshive/api-client";
import { errorCopy, type ErrorCopyKind } from "@gigshive/shared/error-copy";

import { authCopy } from "../copy/auth";

export type AuthField = "email" | "password" | "phone" | "otp" | "current_password" | "token";
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export interface AuthFormIssue {
  kind: ErrorCopyKind;
  copy: (typeof errorCopy)[ErrorCopyKind];
  fieldErrors: AuthFieldErrors;
  /** Only server errors expose a support reference; never a server message. */
  reference?: string;
  /** 429 only: seconds to wait before another attempt. */
  retryAfterSeconds?: number;
}

const FIELD_COPY: Readonly<Record<AuthField, string>> = {
  email: authCopy.errors.email,
  password: authCopy.errors.password,
  phone: authCopy.errors.phone,
  otp: authCopy.errors.code,
  current_password: authCopy.errors.currentPassword,
  token: authCopy.errors.token,
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

function isAuthField(value: string): value is AuthField {
  return (
    value === "email" ||
    value === "password" ||
    value === "phone" ||
    value === "otp" ||
    value === "current_password" ||
    value === "token"
  );
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

/**
 * Maps an API failure to fixed public copy. Backend messages and codes are
 * deliberately ignored: they are never rendered in the UI.
 */
export function describeAuthError(error: unknown): AuthFormIssue {
  const kind = kindOf(error);
  const copy = errorCopy[kind];

  if (!isApiError(error)) {
    return { kind, copy, fieldErrors: {} };
  }

  const fieldErrors: AuthFieldErrors = {};
  for (const [name] of Object.entries(error.fieldErrors)) {
    const field = name === "code" ? "otp" : name;
    if (isAuthField(field)) {
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
