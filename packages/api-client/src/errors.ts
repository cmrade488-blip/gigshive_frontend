/**
 * API error model (Blueprint 7.5, FE-004).
 *
 * Error codes are part of the API contract, so features may branch on them.
 * Unknown codes fall back to HTTP-level behaviour and are never shown raw.
 */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | null;
    request_id: string;
  };
}

export type ErrorKind =
  | "auth" // 401: clear the session, one redirect to login
  | "forbidden" // 403: permission or profile-status explanation
  | "notFound" // 404: no hint that the resource exists
  | "conflict" // 409: refetch, explain what changed, offer the valid action
  | "validation" // 422: map details onto form fields
  | "rateLimit" // 429: honour Retry-After before allowing another attempt
  | "server" // 5xx: friendly retry with a short support reference
  | "network" // no response: connectivity problem with retry
  | "unknown";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, string[]>;
  readonly requestId: string;
  readonly kind: ErrorKind;
  readonly retryAfterSeconds: number | null;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, string[]> | null;
    requestId: string;
    retryAfterSeconds?: number | null;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details ?? {};
    this.requestId = params.requestId;
    this.kind = classifyStatus(params.status);
    this.retryAfterSeconds = params.retryAfterSeconds ?? null;
  }

  /** Field-to-messages map for 422 validation failures. */
  get fieldErrors(): Record<string, string[]> {
    return this.kind === "validation" ? this.details : {};
  }
}

export class NetworkError extends Error {
  readonly kind: ErrorKind = "network";
  readonly requestId: string;

  constructor(message: string, requestId: string) {
    super(message);
    this.name = "NetworkError";
    this.requestId = requestId;
  }
}

function classifyStatus(status: number): ErrorKind {
  switch (status) {
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
      return status >= 500 ? "server" : "unknown";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
