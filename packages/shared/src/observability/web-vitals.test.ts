import { describe, expect, it, vi } from "vitest";

import {
  startWebVitals,
  webVitalRating,
  type PerformanceEntryLike,
  type PerformanceObserverConstructorLike,
  type PerformanceObserverLike,
  type WebVitalMetric,
} from "./web-vitals";

class FakeObserver implements PerformanceObserverLike {
  static instances: FakeObserver[] = [];
  readonly observed: string[] = [];
  disconnected = false;
  private readonly callback: (
    list: { getEntries(): readonly PerformanceEntryLike[] },
    observer: PerformanceObserverLike,
  ) => void;

  constructor(
    callback: (
      list: { getEntries(): readonly PerformanceEntryLike[] },
      observer: PerformanceObserverLike,
    ) => void,
  ) {
    this.callback = callback;
    FakeObserver.instances.push(this);
  }

  observe(options: { type: string; buffered?: boolean }): void {
    this.observed.push(options.type);
  }

  disconnect(): void {
    this.disconnected = true;
  }

  emit(type: string, entries: readonly PerformanceEntryLike[]): void {
    expect(this.observed).toContain(type);
    this.callback({ getEntries: () => entries }, this);
  }
}

const FakeObserverConstructor = FakeObserver as unknown as PerformanceObserverConstructorLike;

const NavigationPerformance = {
  getEntriesByType: (type: string): readonly PerformanceEntryLike[] =>
    type === "navigation" ? [{ startTime: 100, responseStart: 300 }] : [],
};

describe("webVitalRating", () => {
  it.each([
    ["LCP", 2500, "good"],
    ["LCP", 3000, "needs-improvement"],
    ["LCP", 5000, "poor"],
    ["CLS", 0.2, "needs-improvement"],
    ["INP", 500, "needs-improvement"],
    ["FCP", 1800, "good"],
    ["TTFB", 1801, "poor"],
  ] as const)("rates %s %s as %s", (name, value, expected) => {
    expect(webVitalRating(name, value)).toBe(expected);
  });
});

describe("startWebVitals", () => {
  it("reports improving values and maps each observer entry type", () => {
    FakeObserver.instances = [];
    const report = vi.fn<(metric: WebVitalMetric) => void>();
    const stop = startWebVitals({
      report,
      observer: FakeObserverConstructor,
      performance: NavigationPerformance,
    });
    const observer = FakeObserver.instances[0];
    expect(observer).toBeDefined();
    if (!observer) {
      throw new Error("Expected a web-vitals observer.");
    }

    observer.emit("largest-contentful-paint", [
      { entryType: "largest-contentful-paint", startTime: 1200 },
    ]);
    observer.emit("largest-contentful-paint", [
      { entryType: "largest-contentful-paint", startTime: 3000 },
    ]);
    observer.emit("largest-contentful-paint", [
      { entryType: "largest-contentful-paint", startTime: 2000 },
    ]);
    observer.emit("layout-shift", [
      { entryType: "layout-shift", value: 0.05 },
      { entryType: "layout-shift", value: 0.15 },
      { entryType: "layout-shift", value: 0.1, hadRecentInput: true },
    ]);
    observer.emit("event", [{ entryType: "event", duration: 650 }]);
    observer.emit("paint", [{ entryType: "paint", name: "first-paint", startTime: 10 }]);
    observer.emit("paint", [
      { entryType: "paint", name: "first-contentful-paint", startTime: 1800 },
    ]);

    expect(report.mock.calls.map(([metric]) => [metric.name, metric.value])).toEqual([
      ["TTFB", 200],
      ["LCP", 1200],
      ["LCP", 3000],
      ["CLS", 0.05],
      ["CLS", 0.2],
      ["INP", 650],
      ["FCP", 1800],
    ]);
    expect(report.mock.calls[5]?.[0].rating).toBe("poor");

    stop();
    expect(observer.disconnected).toBe(true);
  });

  it("ignores non-finite and negative values", () => {
    FakeObserver.instances = [];
    const report = vi.fn<(metric: WebVitalMetric) => void>();
    startWebVitals({
      report,
      observer: FakeObserverConstructor,
      performance: { getEntriesByType: () => [] },
    });

    const observer = FakeObserver.instances[0];
    if (!observer) {
      throw new Error("Expected a web-vitals observer.");
    }
    observer.emit("event", [
      { entryType: "event", duration: Number.NaN },
      { entryType: "event", duration: -1 },
      { entryType: "event", duration: 120 },
    ]);

    expect(report).toHaveBeenCalledOnce();
    expect(report.mock.calls[0]?.[0]).toMatchObject({ name: "INP", value: 120 });
  });
});
