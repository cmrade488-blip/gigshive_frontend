import { isApiError, isNetworkError } from "@gigshive/api-client";
import { type ErrorCopyKind } from "@gigshive/shared/error-copy";
import { type StateTone } from "@gigshive/ui";

import { mediaCopy } from "../copy/media";
import { MediaFetchError } from "./media";

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

export interface MediaIssue {
  kind: ErrorCopyKind;
  title: string;
  description: string;
  actionLabel?: string;
  tone: StateTone;
  fieldErrors: Partial<Record<"file", string>>;
  /** Short server-issued support reference; never a backend message. */
  reference?: string;
  /** 429 only: seconds to wait before another attempt. */
  retryAfterSeconds?: number;
}

function statusKind(status: number | null): ErrorCopyKind {
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rateLimit";
  if (status !== null && status >= 500) return "server";
  return "unknown";
}

function kindOf(error: unknown): ErrorCopyKind {
  if (error instanceof MediaFetchError) {
    return statusKind(error.status);
  }
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

/** Maps any failure to fixed media copy; backend messages and codes are ignored. */
export function describeMediaError(error: unknown): MediaIssue {
  const kind = kindOf(error);
  const copy = mediaCopy.errors.kinds[kind];
  const fieldErrors: MediaIssue["fieldErrors"] = {};

  if (kind === "validation" && isApiError(error) && "file" in error.fieldErrors) {
    fieldErrors.file = mediaCopy.uploader.fileInvalid;
  }

  return {
    kind,
    title: copy.title,
    description: copy.description,
    ...("actionLabel" in copy ? { actionLabel: copy.actionLabel } : {}),
    tone: TONES[kind],
    fieldErrors,
    ...(kind === "server" && isApiError(error) ? { reference: error.requestId } : {}),
    ...(kind === "rateLimit" && isApiError(error) && error.retryAfterSeconds !== null
      ? { retryAfterSeconds: error.retryAfterSeconds }
      : {}),
  };
}
