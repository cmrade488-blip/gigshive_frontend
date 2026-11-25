"use client";

import {
  browserContext,
  createReporter,
  type ObservabilityReporter,
  type ObservabilitySink,
} from "@gigshive/shared/observability";

const release = process.env.NEXT_PUBLIC_RELEASE_VERSION || "local";

/**
 * FOI-02 owns the tracker choice. FE-011 provides the scrubbed seam: no SDK,
 * DSN, network endpoint or browser storage is added. In production the sink is
 * deliberately a no-op until the approved tracker is attached here.
 */
const sink: ObservabilitySink = {
  send(event) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[observability]", event);
    }
  },
};

export const observability: ObservabilityReporter = createReporter({
  sink,
  context: () => browserContext("admin", release),
});

export function reportError(error: unknown, supportReference?: string): void {
  observability.captureError({
    error,
    ...(supportReference ? { context: { supportReference } } : {}),
  });
}
