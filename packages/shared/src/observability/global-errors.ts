/**
 * Global client error handlers (FE-011).
 *
 * Handlers report to the provider-neutral reporter. They never read form
 * values, storage or raw request bodies.
 */
import type { ObservabilityReporter } from "./reporter";

export interface ErrorEventTarget {
  addEventListener(type: string, listener: (event: unknown) => void): void;
  removeEventListener(type: string, listener: (event: unknown) => void): void;
}

export interface GlobalErrorHandlerOptions {
  target?: ErrorEventTarget;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function defaultTarget(): ErrorEventTarget | undefined {
  const candidate = globalThis as unknown as {
    addEventListener?: unknown;
    removeEventListener?: unknown;
  };
  return typeof candidate.addEventListener === "function" &&
    typeof candidate.removeEventListener === "function"
    ? (candidate as ErrorEventTarget)
    : undefined;
}

export function installGlobalErrorHandlers(
  reporter: Pick<ObservabilityReporter, "captureError">,
  options: GlobalErrorHandlerOptions = {},
): () => void {
  const target = options.target ?? defaultTarget();
  if (!target) {
    return () => undefined;
  }

  const onError = (event: unknown): void => {
    const detail = isRecord(event) ? event : {};
    const reported =
      detail["error"] ??
      (typeof detail["message"] === "string"
        ? new Error(detail["message"])
        : new Error("Unhandled error."));
    reporter.captureError({
      error: reported,
      level: "error",
      extra: { source: "window.error" },
    });
  };

  const onUnhandledRejection = (event: unknown): void => {
    const detail = isRecord(event) ? event : {};
    reporter.captureError({
      error: detail["reason"],
      level: "error",
      extra: { source: "unhandledrejection" },
    });
  };

  try {
    target.addEventListener("error", onError);
    target.addEventListener("unhandledrejection", onUnhandledRejection);
  } catch {
    return () => undefined;
  }

  return () => {
    try {
      target.removeEventListener("error", onError);
      target.removeEventListener("unhandledrejection", onUnhandledRejection);
    } catch {
      // Cleanup must not throw during unmount.
    }
  };
}
