/**
 * Provider-neutral observability reporter (FE-011).
 *
 * Sinks receive only scrubbed, fixed-shape events. No SDK, DSN or vendor
 * endpoint is wired here: FOI-02 still owns that choice. The sink seam lets the
 * approved tracker be attached without changing feature code.
 */
import {
  coarseRoute,
  requestIdFromError,
  safeIdentifier,
  supportReferenceFromError,
  type DeviceClass,
  type ObservabilityContext,
  type ObservabilitySurface,
} from "./context";
import { scrubString, scrubValue } from "./scrub";

export type ObservabilityLevel = "fatal" | "error" | "warning" | "info";
export type MetricRating = "good" | "needs-improvement" | "poor" | "unknown";

export interface ObservabilityErrorEvent {
  type: "error";
  timestamp: string;
  level: ObservabilityLevel;
  name: string;
  message: string;
  stack?: string;
  context: ObservabilityContext;
  extra?: Record<string, unknown>;
}

export interface ObservabilityMetricEvent {
  type: "metric";
  timestamp: string;
  name: string;
  value: number;
  rating: MetricRating;
  context: ObservabilityContext;
}

export type ObservabilityEvent = ObservabilityErrorEvent | ObservabilityMetricEvent;

export interface ObservabilitySink {
  send(event: ObservabilityEvent): void;
}

export interface CaptureErrorInput {
  error: unknown;
  context?: Partial<ObservabilityContext>;
  level?: ObservabilityLevel;
  extra?: Record<string, unknown>;
}

export interface CaptureMetricInput {
  name: string;
  value: number;
  rating?: MetricRating;
  context?: Partial<ObservabilityContext>;
}

export interface ObservabilityReporter {
  captureError(input: CaptureErrorInput): void;
  captureMetric(input: CaptureMetricInput): void;
}

export interface ReporterOptions {
  sink?: ObservabilitySink;
  /** A function keeps route and device class current across client navigation. */
  context?: ObservabilityContext | (() => ObservabilityContext);
  now?: () => number;
}

export const noopObservabilitySink: ObservabilitySink = {
  send: () => undefined,
};

const DEFAULT_CONTEXT: ObservabilityContext = {
  surface: "web",
  release: "local",
  route: "/",
  deviceClass: "unknown",
};

const VALID_LEVELS = new Set<ObservabilityLevel>(["fatal", "error", "warning", "info"]);
const VALID_RATINGS = new Set<MetricRating>(["good", "needs-improvement", "poor", "unknown"]);
const VALID_DEVICE_CLASSES = new Set<DeviceClass>(["mobile", "tablet", "desktop", "unknown"]);
const VALID_SURFACES = new Set<ObservabilitySurface>(["web", "admin"]);
const SAFE_METRIC_NAME = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanContext(context: ObservabilityContext): ObservabilityContext {
  const surface: ObservabilitySurface = VALID_SURFACES.has(context.surface)
    ? context.surface
    : "web";
  const deviceClass: DeviceClass = VALID_DEVICE_CLASSES.has(context.deviceClass ?? "unknown")
    ? (context.deviceClass as DeviceClass)
    : "unknown";
  const release =
    typeof context.release === "string" && context.release.length > 0
      ? scrubString(context.release).slice(0, 64)
      : "local";

  return {
    surface,
    release,
    route: coarseRoute(context.route),
    deviceClass,
    ...(safeIdentifier(context.requestId) ? { requestId: safeIdentifier(context.requestId) } : {}),
    ...(safeIdentifier(context.supportReference)
      ? { supportReference: safeIdentifier(context.supportReference) }
      : {}),
  };
}

function mergeContext(
  base: ObservabilityContext,
  override: Partial<ObservabilityContext> | undefined,
  error: unknown,
): ObservabilityContext {
  return cleanContext({
    surface: override?.surface ?? base.surface,
    release: override?.release ?? base.release,
    route: coarseRoute(override?.route ?? base.route),
    deviceClass: override?.deviceClass ?? base.deviceClass,
    requestId: safeIdentifier(override?.requestId) ?? requestIdFromError(error) ?? base.requestId,
    supportReference:
      safeIdentifier(override?.supportReference) ??
      supportReferenceFromError(error) ??
      base.supportReference,
  });
}

function describeError(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: scrubString(error.name || "Error").slice(0, 64),
      message: scrubString(error.message),
      ...(typeof error.stack === "string" ? { stack: scrubString(error.stack) } : {}),
    };
  }

  const record = isRecord(error) ? error : null;
  const rawName = record && typeof record["name"] === "string" ? record["name"] : "Error";
  const rawMessage =
    typeof error === "string"
      ? error
      : record && typeof record["message"] === "string"
        ? record["message"]
        : "Non-error value reported.";

  return {
    name: scrubString(rawName).slice(0, 64),
    message: scrubString(rawMessage),
    ...(record && typeof record["stack"] === "string"
      ? { stack: scrubString(record["stack"]) }
      : {}),
  };
}

function sendSafely(sink: ObservabilitySink, event: ObservabilityEvent): void {
  try {
    sink.send(event);
  } catch {
    // Observability must never change what the user sees or does.
  }
}

export function createReporter(options: ReporterOptions = {}): ObservabilityReporter {
  const sink = options.sink ?? noopObservabilitySink;

  function baseContext(): ObservabilityContext {
    try {
      const value =
        typeof options.context === "function"
          ? options.context()
          : (options.context ?? DEFAULT_CONTEXT);
      return cleanContext(value);
    } catch {
      return cleanContext(DEFAULT_CONTEXT);
    }
  }

  function timestamp(): string {
    const milliseconds = options.now?.() ?? Date.now();
    return Number.isFinite(milliseconds)
      ? new Date(milliseconds).toISOString()
      : new Date(0).toISOString();
  }

  return {
    captureError({ error, context, level, extra }) {
      const details = describeError(error);
      const scrubbedExtra = extra === undefined ? undefined : scrubValue(extra);
      const safeExtra = isRecord(scrubbedExtra) ? scrubbedExtra : undefined;
      const safeLevel: ObservabilityLevel = level && VALID_LEVELS.has(level) ? level : "error";

      sendSafely(sink, {
        type: "error",
        timestamp: timestamp(),
        level: safeLevel,
        name: details.name,
        message: details.message,
        ...(details.stack ? { stack: details.stack } : {}),
        context: mergeContext(baseContext(), context, error),
        ...(safeExtra ? { extra: safeExtra } : {}),
      });
    },

    captureMetric({ name, value, rating, context }) {
      if (!SAFE_METRIC_NAME.test(name) || !Number.isFinite(value) || value < 0) {
        return;
      }
      const safeRating: MetricRating = rating && VALID_RATINGS.has(rating) ? rating : "unknown";

      sendSafely(sink, {
        type: "metric",
        timestamp: timestamp(),
        name,
        value,
        rating: safeRating,
        context: mergeContext(baseContext(), context, undefined),
      });
    },
  };
}
