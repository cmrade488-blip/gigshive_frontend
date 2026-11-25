/**
 * FE-009: public copy for API error kinds.
 *
 * This is the shared fallback mapping. Features may override a string with a
 * more specific message from their own copy folder, but no raw server message,
 * error code, URL or stack trace is ever part of this map.
 */

export type ErrorCopyKind =
  | "auth"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "validation"
  | "rateLimit"
  | "server"
  | "network"
  | "unknown";

export type ErrorCopyTone = "neutral" | "info" | "warning" | "danger";

export interface ErrorCopy {
  title: string;
  description: string;
  actionLabel?: string;
  tone: ErrorCopyTone;
}

export const errorCopy: Readonly<Record<ErrorCopyKind, ErrorCopy>> = {
  auth: {
    title: "Please sign in",
    description: "Sign in to continue. We will bring you back here afterwards.",
    actionLabel: "Sign in",
    tone: "info",
  },
  forbidden: {
    title: "You do not have access to this",
    description: "It may belong to another account, or need a profile you have not set up yet.",
    tone: "warning",
  },
  notFound: {
    title: "We cannot find that",
    description: "The link may be old, or the item may no longer be available.",
    actionLabel: "Go to home",
    tone: "neutral",
  },
  conflict: {
    title: "This has changed",
    description: "Refresh the item to see the latest state and what you can do next.",
    actionLabel: "Refresh",
    tone: "warning",
  },
  validation: {
    title: "Please check the highlighted fields",
    description: "Fix the fields marked below and try again.",
    tone: "warning",
  },
  rateLimit: {
    title: "Please wait a moment",
    description: "There have been too many attempts. Wait a moment, then try again.",
    actionLabel: "Try again",
    tone: "warning",
  },
  server: {
    title: "Something went wrong",
    description: "Please try again. If it keeps happening, quote the reference to support.",
    actionLabel: "Try again",
    tone: "danger",
  },
  network: {
    title: "You appear to be offline",
    description: "Check your connection and try again. We will reconnect when you are back.",
    actionLabel: "Try again",
    tone: "warning",
  },
  unknown: {
    title: "That did not go through",
    description: "Please try again.",
    actionLabel: "Try again",
    tone: "danger",
  },
} as const;

const knownKinds = new Set<ErrorCopyKind>([
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

function kindFor(error: unknown): ErrorCopyKind {
  if (typeof error !== "object" || error === null) {
    return "unknown";
  }

  const candidate = error as { kind?: unknown; status?: unknown };
  if (typeof candidate.kind === "string" && knownKinds.has(candidate.kind as ErrorCopyKind)) {
    return candidate.kind as ErrorCopyKind;
  }

  if (typeof candidate.status === "number") {
    switch (candidate.status) {
      case 401:
        return "auth";
      case 403:
        return "forbidden";
      case 404:
        return "notFound";
      case 409:
        return "conflict";
      case 422:
        return "validation";
      case 429:
        return "rateLimit";
      default:
        return candidate.status >= 500 ? "server" : "unknown";
    }
  }

  return "unknown";
}

/** Map an API error to fixed public copy without reading its message or code. */
export function errorCopyFor(error: unknown): ErrorCopy {
  return errorCopy[kindFor(error)];
}
