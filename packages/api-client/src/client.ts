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
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds : null;
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
      throw new NetworkError(
        cause instanceof Error ? cause.message : "Network request failed",
        requestId,
      );
    }

    const responseRequestId = response.headers.get("X-Request-Id") ?? requestId;

    if (response.status === 204) {
      return { data: null };
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const envelope = errorBody(payload);
      if (response.status === 401) {
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
      throw new ApiError({
        status: response.status,
        code: "MALFORMED_RESPONSE",
        message: "The server returned an unreadable response.",
        requestId: responseRequestId,
      });
    }

    return payload as unknown as RawResponse<T>;
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
    return {
      data: (result.data ?? []) as T[],
      meta: result.meta ?? { next_cursor: null, per_page: 20 },
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
        throw new NetworkError(
          cause instanceof Error ? cause.message : "Network request failed",
          requestId,
        );
      }

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const envelope = errorBody(payload);
        if (response.status === 401) {
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
      return (payload as SingleResponse<T>).data;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
