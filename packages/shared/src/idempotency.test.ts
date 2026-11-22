import { describe, expect, it } from "vitest";
import { bodyFingerprint, nextIdempotencySession, createIdempotencyKey } from "./idempotency";

describe("createIdempotencyKey", () => {
  it("returns a non-empty string", () => {
    const key = createIdempotencyKey();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(10);
  });

  it("returns unique keys", () => {
    const a = createIdempotencyKey();
    const b = createIdempotencyKey();
    expect(a).not.toBe(b);
  });
});

describe("bodyFingerprint", () => {
  it("is order-independent for objects", () => {
    expect(bodyFingerprint({ a: 1, b: 2 })).toBe(bodyFingerprint({ b: 2, a: 1 }));
  });

  it("changes when values change", () => {
    expect(bodyFingerprint({ amount: 100 })).not.toBe(bodyFingerprint({ amount: 200 }));
  });
});

describe("nextIdempotencySession", () => {
  it("creates a new session when previous is null", () => {
    const session = nextIdempotencySession(null, { amount: 100 });
    expect(session.key).toBeTruthy();
    expect(session.fingerprint).toBe(bodyFingerprint({ amount: 100 }));
  });

  it("reuses key when body is unchanged", () => {
    const first = nextIdempotencySession(null, { amount: 100 });
    const second = nextIdempotencySession(first, { amount: 100 });
    expect(second.key).toBe(first.key);
  });

  it("mints a new key when body changes", () => {
    const first = nextIdempotencySession(null, { amount: 100 });
    const second = nextIdempotencySession(first, { amount: 200 });
    expect(second.key).not.toBe(first.key);
  });
});
