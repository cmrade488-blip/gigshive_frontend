/**
 * Idempotency-Key helpers for financial POSTs (fund, payout, refund).
 *
 * Rules (AGENTS.md):
 * - Generate when the form or dialog opens.
 * - Reuse on retry.
 * - New key if the body changes.
 * - Disable submit while in flight.
 */

import { createId } from "./id";

/** Generate a new Idempotency-Key (UUID). */
export function createIdempotencyKey(): string {
  return createId();
}

/**
 * Stable fingerprint of a request body so callers can detect "body changed"
 * and mint a new key. Order-independent for plain objects.
 */
export function bodyFingerprint(body: unknown): string {
  return stableStringify(body);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export type IdempotencySession = {
  key: string;
  fingerprint: string;
};

/**
 * Start or continue an idempotency session for a form.
 * - First call / body change → new key.
 * - Same body → reuse key.
 */
export function nextIdempotencySession(
  previous: IdempotencySession | null,
  body: unknown,
): IdempotencySession {
  const fingerprint = bodyFingerprint(body);
  if (previous && previous.fingerprint === fingerprint) {
    return previous;
  }
  return {
    key: createIdempotencyKey(),
    fingerprint,
  };
}
