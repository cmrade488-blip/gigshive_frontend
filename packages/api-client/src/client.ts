/**
 * Thin fetch wrapper (Blueprint 7.2–7.6, FE-004).
 *
 * - Adds the base URL and JSON handling.
 * - Unwraps the response envelope: { data } and { data, meta }.
 * - Maps the error envelope to ApiError with code, details and request id.
 * - Captures X-Request-Id on every response for support references.
 * - Sends Idempotency-Key when the caller supplies an intent key.
 *
 * Features never call fetch directly; they use this client from their api/
 * folder (or src/lib) only. Both ESLint and the architecture test enforce it.
 */
import { ApiError, NetworkError, type ApiErrorBody } from "./errors";

export interface CursorMeta {
  next_cursor: string | null;
  per_page: number;
}

export interface CollectionResponse<T> {
  data: T[];
  meta: CursorMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  query?: Query;
  /** Idempotency-Key for POSTs that require one (funding, payouts, refunds). */
  idempotencyKey?: string;
  /**
   * Let a 401 reach the caller without clearing the session or redirecting.
   * Used by credential checks such as login and OTP verification (FE-014).
   */
  skipUnauthorizedHandler?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface ApiClientOptions {
  /**
   * Base path or origin for API calls. In the MVP the browser calls the
   * same-origin session proxy (e.g. "/api/proxy"), which attaches the token
   * on the server; server-side code may point at the API origin directly.
   */
  baseUrl: string;
  /** Injectable for tests and MSW. Defaults to global fetch. */
  fetchFn?: typeof fetch;
  /** Called once on 401 so the app can clear the session and redirect. */
  onUnauthorized?: () => void;
  /** Extra headers, e.g. the bearer token when calling from the server. */
  getHeaders?: () => Record<string, string>;
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RawResponse<T> {
  data: T | T[] | null;
  meta?: CursorMeta;
  /** Transport details used to report malformed payloads; not part of the public response. */
  status: number;
  requestId: string;
}

function buildUrl(baseUrl: string, path: string, query?: Query): string {
  const normalisedBase = baseUrl.replace(/\/+$/, "");
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalisedBase}${normalisedPath}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRetryAfter(header: string | null): number | null {
  if (header === null) {
    return null;
  }
  const value = header.trim();
  if (value === "") {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds);
  }

  // Retry-After also permits an HTTP-date (RFC 9110, section 10.2.3).
  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) {
    return null;
  }
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

function malformedResponse(status: number, requestId: string): ApiError {
  return new ApiError({
    status,
    code: "MALFORMED_RESPONSE",
    message: "The server returned an unreadable response.",
    requestId,
  });
}

function isCursorMeta(value: unknown): value is CursorMeta {
  return (
    isRecord(value) &&
    (value["next_cursor"] === null || typeof value["next_cursor"] === "string") &&
    typeof value["per_page"] === "number" &&
    Number.isInteger(value["per_page"]) &&
    value["per_page"] >= 0
  );
}

function errorBody(payload: unknown): ApiErrorBody | null {
  if (!isRecord(payload) || !isRecord(payload["error"])) {
    return null;
  }
  return payload as unknown as ApiErrorBody;
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl } = options;
  const fetchFn = options.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args));

  async function requestRaw<T>(
    method: Method,
    path: string,
    body: unknown,
    requestOptions: RequestOptions,
  ): Promise<RawResponse<T>> {
    const requestId = crypto.randomUUID();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Request-Id": requestId,
      ...options.getHeaders?.(),
      ...requestOptions.headers,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (requestOptions.idempotencyKey !== undefined) {
      headers["Idempotency-Key"] = requestOptions.idempotencyKey;
    }

    let response: Response;
    try {
      response = await fetchFn(buildUrl(baseUrl, path, requestOptions.query), {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        ...(requestOptions.signal ? { signal: requestOptions.signal } : {}),
        credentials: "same-origin",
      });
    } catch (cause) {
      // No response at all: a connectivity problem, not a server error.
      throw new NetworkError(requestId, cause);
    }

    const responseRequestId = response.headers.get("X-Request-Id") ?? requestId;

    if (response.status === 204) {
      return { data: null, status: response.status, requestId: responseRequestId };
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const envelope = errorBody(payload);
      if (response.status === 401 && !requestOptions.skipUnauthorizedHandler) {
        options.onUnauthorized?.();
      }
      throw new ApiError({
        status: response.status,
        code: envelope?.error.code ?? `HTTP_${response.status}`,
        message: envelope?.error.message ?? response.statusText ?? "Request failed",
        details: envelope?.error.details ?? null,
        requestId: envelope?.error.request_id ?? responseRequestId,
        retryAfterSeconds: parseRetryAfter(response.headers.get("Retry-After")),
      });
    }

    if (!isRecord(payload)) {
      throw malformedResponse(response.status, responseRequestId);
    }

    return {
      ...(payload as unknown as RawResponse<T>),
      status: response.status,
      requestId: responseRequestId,
    };
  }

  async function request<T>(
    method: Method,
    path: string,
    body: unknown,
    requestOptions: RequestOptions,
  ): Promise<SingleResponse<T>> {
    const result = await requestRaw<T>(method, path, body, requestOptions);
    return { data: result.data as T };
  }

  async function requestCollection<T>(
    method: Method,
    path: string,
    body: unknown,
    requestOptions: RequestOptions,
  ): Promise<CollectionResponse<T>> {
    const result = await requestRaw<T>(method, path, body, requestOptions);
    if (!isCursorMeta(result.meta)) {
      throw malformedResponse(result.status, result.requestId);
    }
    return {
      data: (result.data ?? []) as T[],
      meta: result.meta,
    };
  }

  return {
    /** Single resource: unwraps { data }. */
    get: <T>(path: string, requestOptions: RequestOptions = {}) =>
      request<T>("GET", path, undefined, requestOptions),
    post: <T>(path: string, body?: unknown, requestOptions: RequestOptions = {}) =>
      request<T>("POST", path, body, requestOptions),
    patch: <T>(path: string, body?: unknown, requestOptions: RequestOptions = {}) =>
      request<T>("PATCH", path, body, requestOptions),
    put: <T>(path: string, body?: unknown, requestOptions: RequestOptions = {}) =>
      request<T>("PUT", path, body, requestOptions),
    delete: <T>(path: string, requestOptions: RequestOptions = {}) =>
      request<T>("DELETE", path, undefined, requestOptions),

    /** Cursor collection: unwraps { data, meta }. */
    getCollection: <T>(path: string, requestOptions: RequestOptions = {}) =>
      requestCollection<T>("GET", path, undefined, requestOptions),
    postCollection: <T>(path: string, body?: unknown, requestOptions: RequestOptions = {}) =>
      requestCollection<T>("POST", path, body, requestOptions),

    /** Escape hatch for multipart uploads used by the media uploader (FE-020). */
    upload: async <T>(
      path: string,
      formData: FormData,
      requestOptions: RequestOptions = {},
    ): Promise<T> => {
      const requestId = crypto.randomUUID();
      const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Request-Id": requestId,
        ...options.getHeaders?.(),
        ...requestOptions.headers,
      };
      if (requestOptions.idempotencyKey !== undefined) {
        headers["Idempotency-Key"] = requestOptions.idempotencyKey;
      }

      let response: Response;
      try {
        response = await fetchFn(buildUrl(baseUrl, path, requestOptions.query), {
          method: "POST",
          headers,
          body: formData,
          credentials: "same-origin",
          ...(requestOptions.signal ? { signal: requestOptions.signal } : {}),
        });
      } catch (cause) {
        throw new NetworkError(requestId, cause);
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const envelope = errorBody(payload);
        if (response.status === 401 && !requestOptions.skipUnauthorizedHandler) {
          options.onUnauthorized?.();
        }
        throw new ApiError({
          status: response.status,
          code: envelope?.error.code ?? `HTTP_${response.status}`,
          message: envelope?.error.message ?? "Upload failed",
          details: envelope?.error.details ?? null,
          requestId: envelope?.error.request_id ?? requestId,
          retryAfterSeconds: parseRetryAfter(response.headers.get("Retry-After")),
        });
      }
      if (!isRecord(payload)) {
        throw malformedResponse(response.status, response.headers.get("X-Request-Id") ?? requestId);
      }
      return (payload as unknown as SingleResponse<T>).data;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
