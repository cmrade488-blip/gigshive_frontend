import { describe, expect, it, vi } from "vitest";

import { installGlobalErrorHandlers, type ErrorEventTarget } from "./global-errors";
import type { CaptureErrorInput } from "./reporter";

class FakeTarget implements ErrorEventTarget {
  private readonly listeners = new Map<string, Array<(event: unknown) => void>>();

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const current = this.listeners.get(type) ?? [];
    current.push(listener);
    this.listeners.set(type, current);
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    const current = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      current.filter((candidate) => candidate !== listener),
    );
  }

  emit(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  count(type: string): number {
    return (this.listeners.get(type) ?? []).length;
  }
}

describe("installGlobalErrorHandlers", () => {
  it("reports error events and unhandled rejections", () => {
    const target = new FakeTarget();
    const captureError = vi.fn<(input: CaptureErrorInput) => void>();
    const stop = installGlobalErrorHandlers({ captureError }, { target });

    const original = new Error("Payment failed for ada@example.com");
    target.emit("error", { error: original, message: "unused" });
    target.emit("error", { message: "plain failure" });
    target.emit("unhandledrejection", { reason: "retry later" });

    expect(captureError).toHaveBeenCalledTimes(3);
    expect(captureError.mock.calls[0]?.[0].error).toBe(original);
    expect(captureError.mock.calls[1]?.[0].error).toBeInstanceOf(Error);
    expect(captureError.mock.calls[2]?.[0].error).toBe("retry later");
    expect(captureError.mock.calls[0]?.[0].extra).toEqual({ source: "window.error" });

    stop();
    expect(target.count("error")).toBe(0);
    expect(target.count("unhandledrejection")).toBe(0);
  });
});
