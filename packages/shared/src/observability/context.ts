/**
 * Safe context helpers for observability events (FE-011, Blueprint 13.5).
 *
 * Only fixed metadata is allowed here: surface, release, a coarse route, a
 * device class and validated request/reference identifiers. Query strings,
 * form values and unvalidated strings never enter an event.
 */

export type ObservabilitySurface = "web" | "admin";
export type DeviceClass = "mobile" | "tablet" | "desktop" | "unknown";

export interface ObservabilityContext {
  surface: ObservabilitySurface;
  release: string;
  /** Coarse route template, never a raw URL with query or dynamic values. */
  route: string;
  requestId?: string;
  supportReference?: string;
  deviceClass?: DeviceClass;
}

export interface BrowserGlobals {
  location?: { pathname?: unknown };
  innerWidth?: unknown;
}

export interface HeaderReader {
  get(name: string): string | null | undefined;
}

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ULID_SEGMENT = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const SAFE_STATIC_SEGMENT = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_IDENTIFIER = /^[A-Za-z0-9._:-]{6,128}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIdentifierSegment(segment: string): boolean {
  return UUID_SEGMENT.test(segment) || ULID_SEGMENT.test(segment);
}

/**
 * Reduce a pathname to a coarse template: the first static segment is kept and
 * every later segment becomes `:id`. Public slugs, staff record ids and query
 * strings therefore never reach the tracker.
 */
export function coarseRoute(pathname: unknown): string {
  if (typeof pathname !== "string" || pathname.length === 0) {
    return "/";
  }

  const path = pathname.split(/[?#]/, 1)[0] ?? "/";
  if (!path.startsWith("/")) {
    return "/";
  }

  const segments = path.split("/").filter((segment) => segment.length > 0);
  const first = segments[0];
  if (!first) {
    return "/";
  }

  const safeFirst = isIdentifierSegment(first) || !SAFE_STATIC_SEGMENT.test(first) ? ":id" : first;
  const dynamicCount = Math.min(Math.max(segments.length - 1, 0), 4);
  const dynamic = Array.from({ length: dynamicCount }, () => ":id");

  return `/${safeFirst}${dynamic.length === 0 ? "" : `/${dynamic.join("/")}`}`;
}

export function deviceClassFromWidth(width: unknown): DeviceClass {
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
    return "unknown";
  }
  if (width < 640) {
    return "mobile";
  }
  if (width < 1024) {
    return "tablet";
  }
  return "desktop";
}

/** Accept only opaque server-issued references, never arbitrary user text. */
export function safeIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return SAFE_IDENTIFIER.test(trimmed) ? trimmed : undefined;
}

export function requestIdFromError(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }
  for (const key of ["requestId", "request_id", "x-request-id"]) {
    const found = safeIdentifier(error[key]);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function supportReferenceFromError(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }
  for (const key of ["digest", "supportReference", "support_reference"]) {
    const found = safeIdentifier(error[key]);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function requestIdFromHeaders(headers: HeaderReader | null | undefined): string | undefined {
  const reader = headers?.get;
  if (typeof reader !== "function") {
    return undefined;
  }
  try {
    return safeIdentifier(reader.call(headers, "x-request-id"));
  } catch {
    return undefined;
  }
}

export function browserContext(
  surface: ObservabilitySurface,
  release: string,
  browser?: BrowserGlobals,
): ObservabilityContext {
  const current = browser ?? (globalThis as unknown as BrowserGlobals);
  const pathname =
    current.location && typeof current.location.pathname === "string"
      ? current.location.pathname
      : "/";

  return {
    surface,
    release: release.length > 0 ? release : "local",
    route: coarseRoute(pathname),
    deviceClass: deviceClassFromWidth(current.innerWidth),
  };
}
