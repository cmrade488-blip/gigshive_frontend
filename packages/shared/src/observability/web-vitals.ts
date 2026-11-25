/**
 * Dependency-free web-vitals collection (FE-011, Blueprint 13.5).
 *
 * The browser's PerformanceObserver is used when available. The reporter adds
 * the current coarse route and device class at report time, so client-side
 * navigation is reflected without rebuilding the observer.
 */
import type { MetricRating } from "./reporter";

export type WebVitalName = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: MetricRating;
}

export interface PerformanceEntryLike {
  entryType?: unknown;
  name?: unknown;
  startTime?: unknown;
  duration?: unknown;
  value?: unknown;
  hadRecentInput?: unknown;
  responseStart?: unknown;
}

export interface PerformanceObserverEntryListLike {
  getEntries(): readonly PerformanceEntryLike[];
}

export interface PerformanceObserverLike {
  observe(options: { type: string; buffered?: boolean }): void;
  disconnect(): void;
}

export interface PerformanceObserverConstructorLike {
  new (
    callback: (list: PerformanceObserverEntryListLike, observer: PerformanceObserverLike) => void,
  ): PerformanceObserverLike;
  supportedEntryTypes?: readonly string[];
}

export interface PerformanceLike {
  getEntriesByType(type: string): readonly PerformanceEntryLike[];
}

export interface WebVitalsOptions {
  report: (metric: WebVitalMetric) => void;
  observer?: PerformanceObserverConstructorLike;
  performance?: PerformanceLike;
}

export const WEB_VITAL_THRESHOLDS: Readonly<Record<WebVitalName, { good: number; poor: number }>> =
  {
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

export function webVitalRating(name: WebVitalName, value: number): MetricRating {
  const threshold = WEB_VITAL_THRESHOLDS[name];
  if (value <= threshold.good) {
    return "good";
  }
  if (value <= threshold.poor) {
    return "needs-improvement";
  }
  return "poor";
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function defaultObserver(): PerformanceObserverConstructorLike | undefined {
  const candidate = (globalThis as { PerformanceObserver?: unknown }).PerformanceObserver;
  return typeof candidate === "function"
    ? (candidate as PerformanceObserverConstructorLike)
    : undefined;
}

function defaultPerformance(): PerformanceLike | undefined {
  const candidate = (globalThis as { performance?: unknown }).performance;
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }
  const getEntriesByType = (candidate as { getEntriesByType?: unknown }).getEntriesByType;
  return typeof getEntriesByType === "function" ? (candidate as PerformanceLike) : undefined;
}

export function startWebVitals(options: WebVitalsOptions): () => void {
  const Observer = options.observer ?? defaultObserver();
  if (!Observer) {
    return () => undefined;
  }

  const lastReported = new Map<WebVitalName, number>();
  let cumulativeLayoutShift = 0;

  function reportVital(name: WebVitalName, value: number | undefined): void {
    const numeric = numberOrUndefined(value);
    if (numeric === undefined) {
      return;
    }
    const previous = lastReported.get(name);
    if (previous !== undefined && numeric <= previous) {
      return;
    }
    lastReported.set(name, numeric);
    try {
      options.report({ name, value: numeric, rating: webVitalRating(name, numeric) });
    } catch {
      // A broken sink must not interrupt page performance observation.
    }
  }

  function handleEntries(entries: readonly PerformanceEntryLike[]): void {
    for (const entry of entries) {
      const type = typeof entry.entryType === "string" ? entry.entryType : "";

      if (type === "largest-contentful-paint") {
        reportVital("LCP", numberOrUndefined(entry.startTime));
        continue;
      }
      if (type === "layout-shift") {
        if (entry.hadRecentInput !== true) {
          cumulativeLayoutShift += numberOrUndefined(entry.value) ?? 0;
          reportVital("CLS", cumulativeLayoutShift);
        }
        continue;
      }
      if (type === "event") {
        reportVital("INP", numberOrUndefined(entry.duration));
        continue;
      }
      if (type === "paint" && entry.name === "first-contentful-paint") {
        reportVital("FCP", numberOrUndefined(entry.startTime));
      }
    }
  }

  let observer: PerformanceObserverLike | undefined;
  try {
    observer = new Observer((list) => handleEntries(list.getEntries()));
    for (const type of ["largest-contentful-paint", "layout-shift", "event", "paint"]) {
      try {
        observer.observe({ type, buffered: true });
      } catch {
        // Unsupported entry types are simply skipped.
      }
    }
  } catch {
    observer = undefined;
  }

  const performanceApi = options.performance ?? defaultPerformance();
  if (performanceApi) {
    try {
      const navigation = performanceApi.getEntriesByType("navigation")[0];
      const responseStart = numberOrUndefined(navigation?.responseStart);
      const startTime = numberOrUndefined(navigation?.startTime) ?? 0;
      if (responseStart !== undefined) {
        reportVital("TTFB", Math.max(0, responseStart - startTime));
      }
    } catch {
      // Navigation timing is optional.
    }
  }

  return () => {
    try {
      observer?.disconnect();
    } catch {
      // Cleanup must not throw during unmount.
    }
  };
}
