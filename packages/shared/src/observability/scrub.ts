/**
 * Scrubber for error and analytics payloads (Blueprint 10.6, FE-011).
 *
 * The reporter applies this to every field before it reaches a sink. Form
 * values must never be added to an event; the key rules are a second line of
 * defence for context objects built by features.
 */
import { safeIdentifier } from "./context";

export const REDACTED = "[redacted]";

const MAX_STRING_LENGTH = 4000;
const MAX_ARRAY_ITEMS = 100;

type Redaction = string | ((substring: string) => string);

const REDACTION_RULES: ReadonlyArray<readonly [RegExp, Redaction]> = [
  [/\b(?:https?:\/\/|file:\/\/|www\.)[^\s<>"'`]+/gi, REDACTED],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, REDACTED],
  [/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, REDACTED],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, REDACTED],
  [/(?:₦|NGN)\s?\d[\d,]*(?:\.\d{1,2})?/gi, REDACTED],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]"],
  [/\b[0-9A-HJKMNP-TV-Z]{26}\b/g, "[id]"],
  [
    /(?:\+?\d[\d\s().-]{7,}\d)/g,
    (match) => (match.replace(/\D/g, "").length >= 10 ? REDACTED : match),
  ],
  [/\b\d{8,}\b/g, REDACTED],
  [/[A-Za-z]:\\[^\s)]+/g, REDACTED],
];

const SENSITIVE_FRAGMENTS: readonly string[] = [
  "password",
  "passphrase",
  "secret",
  "token",
  "onetime",
  "otp",
  "cvv",
  "cvc",
  "iban",
  "account",
  "bank",
  "identity",
  "nationalid",
  "idnumber",
  "amount",
  "kobo",
  "price",
  "budget",
  "balance",
  "fee",
  "payout",
  "wallet",
  "ledger",
  "salary",
  "email",
  "phone",
  "mobile",
  "address",
  "fullname",
  "firstname",
  "lastname",
  "displayname",
  "username",
  "dateofbirth",
  "signedurl",
  "signature",
  "redirecturl",
  "authorization",
  "cookie",
  "privatekey",
  "apikey",
  "cardnumber",
  "credential",
];

const SENSITIVE_EXACT_KEYS = new Set(["pwd", "pin", "nin", "bvn", "ssn", "dob", "card", "one"]);
const PRESERVED_IDENTIFIER_KEYS = new Set([
  "requestid",
  "xrequestid",
  "supportreference",
  "digest",
]);
const PRESERVED_METADATA_KEYS = new Set([
  "route",
  "release",
  "surface",
  "deviceclass",
  "metric",
  "rating",
  "level",
  "kind",
  "status",
  "timestamp",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key: string): boolean {
  const normalised = normaliseKey(key);
  if (SENSITIVE_EXACT_KEYS.has(normalised)) {
    return true;
  }
  return SENSITIVE_FRAGMENTS.some((fragment) => normalised.includes(fragment));
}

export function scrubString(value: string): string {
  let scrubbed = value;
  for (const [pattern, replacement] of REDACTION_RULES) {
    scrubbed =
      typeof replacement === "string"
        ? scrubbed.replace(pattern, replacement)
        : scrubbed.replace(pattern, replacement);
  }
  return scrubbed.length > MAX_STRING_LENGTH
    ? `${scrubbed.slice(0, MAX_STRING_LENGTH)}…`
    : scrubbed;
}

function scrubMetadata(value: unknown): unknown {
  if (typeof value !== "string") {
    return scrubValue(value);
  }
  return scrubString(value) === value ? value : REDACTED;
}

/** Deep scrub with cycle protection. Use before logging or sending any value. */
export function scrubValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "string") {
    return scrubString(value);
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : REDACTED;
  }
  if (typeof value === "bigint") {
    return REDACTED;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (seen.has(value)) {
    return REDACTED;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => scrubValue(item, seen));
  }

  if (isRecord(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const normalised = normaliseKey(key);
      if (isSensitiveKey(key)) {
        output[key] = REDACTED;
      } else if (PRESERVED_IDENTIFIER_KEYS.has(normalised)) {
        output[key] = safeIdentifier(item) ?? REDACTED;
      } else if (PRESERVED_METADATA_KEYS.has(normalised)) {
        output[key] = scrubMetadata(item);
      } else {
        output[key] = scrubValue(item, seen);
      }
    }
    return output;
  }

  return REDACTED;
}

/** Name used by server-side glue that needs to scrub a structured log entry. */
export function scrubForLog(value: unknown): unknown {
  return scrubValue(value);
}
