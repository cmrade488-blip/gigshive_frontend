import { describe, expect, it, vi } from "vitest";

import type { ObservabilityEvent, ObservabilitySink } from "./reporter";
import { createReporter } from "./reporter";

const ULID = "01J8ZQ3Z8ZQ3Z8ZQ3Z8ZQ3Z8ZQ";
const EMAIL = "ada@example.com";
const AMOUNT = "₦1,500.50";

function collectingSink(): { sink: ObservabilitySink; events: ObservabilityEvent[] } {
  const events: ObservabilityEvent[] = [];
  return {
    events,
    sink: {
      send: (event) => {
        events.push(event);
      },
    },
  };
}

describe("createReporter error events", () => {
  it("scrubs the error detail and attaches request and support references", () => {
    const { sink, events } = collectingSink();
    const reporter = createReporter({
      sink,
      now: () => Date.parse("2026-11-25T10:00:00.000Z"),
      context: () => ({ surface: "web", release: "v1", route: "/jobs/:id", deviceClass: "mobile" }),
    });
    const error = Object.assign(new Error(`Pay ${AMOUNT} for ${EMAIL}`), {
      requestId: ULID,
      digest: "digest_abc123",
    });

    reporter.captureError({
      error,
      extra: { otp: "123456", bankAccount: "0123456789", step: "funding" },
    });

    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event?.type).toBe("error");
    expect(event?.timestamp).toBe("2026-11-25T10:00:00.000Z");
    if (event?.type !== "error") {
      throw new Error("Expected an error event.");
    }
    expect(event.message).not.toContain(EMAIL);
    expect(event.message).not.toContain(AMOUNT);
    expect(event.context.requestId).toBe(ULID);
    expect(event.context.supportReference).toBe("digest_abc123");
    expect(event.context.route).toBe("/jobs/:id");
    expect(event.extra).toEqual({
      otp: "[redacted]",
      bankAccount: "[redacted]",
      step: "funding",
    });
    expect(JSON.stringify(event)).not.toContain(EMAIL);
    expect(JSON.stringify(event)).not.toContain(AMOUNT);
  });

  it("uses the current route on each capture", () => {
    let route = "/jobs";
    const { sink, events } = collectingSink();
    const reporter = createReporter({
      sink,
      context: () => ({ surface: "web", release: "local", route }),
    });

    reporter.captureError({ error: new Error("first") });
    route = "/wallet/secret-account-name";
    reporter.captureError({ error: new Error("second") });

    expect(events[0]?.context.route).toBe("/jobs");
    expect(events[1]?.context.route).toBe("/wallet/:id");
  });

  it("never lets a sink failure affect the caller", () => {
    const reporter = createReporter({
      sink: {
        send: () => {
          throw new Error("sink down");
        },
      },
    });

    expect(() => reporter.captureError({ error: new Error("boom") })).not.toThrow();
  });
});

describe("createReporter metric events", () => {
  it("emits valid metrics and ignores invalid input", () => {
    const { sink, events } = collectingSink();
    const reporter = createReporter({
      sink,
      context: { surface: "admin", release: "v1", route: "/queue", deviceClass: "desktop" },
    });

    reporter.captureMetric({ name: "LCP", value: 2100, rating: "good" });
    reporter.captureMetric({ name: "bad name!", value: 2100 });
    reporter.captureMetric({ name: "CLS", value: Number.NaN });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "metric",
      name: "LCP",
      value: 2100,
      rating: "good",
      context: { surface: "admin", route: "/queue", deviceClass: "desktop" },
    });
  });

  it("reports through an injected spy sink", () => {
    const send = vi.fn();
    const reporter = createReporter({ sink: { send } });
    reporter.captureMetric({ name: "TTFB", value: 700 });
    expect(send).toHaveBeenCalledOnce();
  });
});
