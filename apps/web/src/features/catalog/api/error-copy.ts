import { isApiError, isNetworkError } from "@gigshive/api-client";
import { type ErrorCopyKind } from "@gigshive/shared/error-copy";
import { type StateTone } from "@gigshive/ui";

import { catalogCopy } from "../copy/catalog";

const ERROR_KINDS: ReadonlySet<string> = new Set<ErrorCopyKind>([
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

const TONES: Readonly<Record<ErrorCopyKind, StateTone>> = {
  auth: "info",
  forbidden: "warning",
  notFound: "neutral",
  conflict: "warning",
  validation: "warning",
  rateLimit: "warning",
  server: "danger",
  network: "warning",
  unknown: "danger",
};

export interface CatalogIssue {
  kind: ErrorCopyKind;
  title: string;
  description: string;
  actionLabel?: string;
  tone: StateTone;
  /** Short server-issued support reference; never a backend message. */
  reference?: string;
  /** 429 only: seconds to wait before another attempt. */
  retryAfterSeconds?: number;
}

function kindOf(error: unknown): ErrorCopyKind {
  if (isApiError(error) || isNetworkError(error)) {
    return error.kind as ErrorCopyKind;
  }
  if (typeof error === "object" && error !== null && "kind" in error) {
    const candidate = (error as { kind?: unknown }).kind;
    if (typeof candidate === "string" && ERROR_KINDS.has(candidate)) {
      return candidate as ErrorCopyKind;
    }
  }
  return "unknown";
}

/** Maps any failure to fixed catalog copy; backend messages and codes are ignored. */
export function describeCatalogError(error: unknown): CatalogIssue {
  const kind = kindOf(error);
  const copy = catalogCopy.errors.kinds[kind];

  return {
    kind,
    title: copy.title,
    description: copy.description,
    ...("actionLabel" in copy ? { actionLabel: copy.actionLabel } : {}),
    tone: TONES[kind],
    ...(kind === "server" && isApiError(error) ? { reference: error.requestId } : {}),
    ...(kind === "rateLimit" && isApiError(error) && error.retryAfterSeconds !== null
      ? { retryAfterSeconds: error.retryAfterSeconds }
      : {}),
  };
}
