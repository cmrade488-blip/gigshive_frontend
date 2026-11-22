/**
 * Money utilities for GigsHive.
 *
 * Rules (AGENTS.md / Blueprint):
 * - Amounts are integers in **kobo** end to end (1 naira = 100 kobo).
 * - Never use floating point for money arithmetic that affects charges or payouts.
 * - The client never computes a fee, total or balance the user is charged or paid;
 *   it only formats and parses for display / input.
 * - One formatter, one parser.
 */

/** Integer amount in kobo. Prefer this branded type over bare number. */
export type Kobo = number & { readonly __brand: "Kobo" };

/** Create a Kobo value from a known integer (e.g. API response). */
export function kobo(amount: number): Kobo {
  if (!Number.isInteger(amount)) {
    throw new Error(`kobo(): expected integer, got ${amount}`);
  }
  return amount as Kobo;
}

const KOBO_PER_NAIRA = 100;

export type FormatMoneyOptions = {
  /** Show currency symbol/code. Default true. */
  currency?: boolean;
  /** "symbol" → ₦, "code" → NGN. Default "symbol". */
  currencyDisplay?: "symbol" | "code";
  /** Locale for number grouping. Default "en-NG". */
  locale?: string;
};

/**
 * Format a kobo integer for display as naira.
 * 150050 → "₦1,500.50"
 */
export function formatMoney(amountKobo: number, options: FormatMoneyOptions = {}): string {
  if (!Number.isInteger(amountKobo)) {
    throw new Error(`formatMoney(): amount must be an integer (kobo), got ${amountKobo}`);
  }

  const {
    currency = true,
    currencyDisplay = "symbol",
    locale = "en-NG",
  } = options;

  const naira = amountKobo / KOBO_PER_NAIRA;

  if (!currency) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(naira);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "NGN",
    currencyDisplay,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

export type ParseMoneyResult =
  | { ok: true; kobo: Kobo }
  | { ok: false; error: string };

/**
 * Parse a user-entered naira string into kobo.
 * Accepts: "1500", "1,500.50", "₦1,500.50", "1500.5", "0.01".
 * Rejects: empty, non-numeric, more than 2 decimal places, negative (unless allowNegative).
 */
export function parseMoney(
  input: string,
  options: { allowNegative?: boolean } = {},
): ParseMoneyResult {
  const raw = input.trim();
  if (raw === "") {
    return { ok: false, error: "Amount is required" };
  }

  // Strip currency symbols and whitespace/grouping separators common in NG input
  let cleaned = raw
    .replace(/₦/g, "")
    .replace(/NGN/gi, "")
    .replace(/\s/g, "")
    .replace(/,/g, "");

  // Allow a single leading minus if permitted
  const negative = cleaned.startsWith("-");
  if (negative) {
    if (!options.allowNegative) {
      return { ok: false, error: "Amount cannot be negative" };
    }
    cleaned = cleaned.slice(1);
  }

  if (cleaned === "" || !/^\d+(\.\d{0,2})?$/.test(cleaned)) {
    // More than 2 decimals or invalid characters
    if (/^\d+\.\d{3,}$/.test(cleaned)) {
      return { ok: false, error: "Use at most two decimal places" };
    }
    return { ok: false, error: "Enter a valid amount" };
  }

  const [wholePart, fracPart = ""] = cleaned.split(".");
  const whole = Number.parseInt(wholePart, 10);
  const frac = Number.parseInt(fracPart.padEnd(2, "0").slice(0, 2), 10);

  if (!Number.isFinite(whole) || !Number.isFinite(frac)) {
    return { ok: false, error: "Enter a valid amount" };
  }

  let totalKobo = whole * KOBO_PER_NAIRA + frac;
  if (negative) totalKobo = -totalKobo;

  return { ok: true, kobo: kobo(totalKobo) };
}

/** Convert naira (number, may have up to 2 decimals) to kobo. Prefer parseMoney for user input. */
export function nairaToKobo(naira: number): Kobo {
  if (!Number.isFinite(naira)) {
    throw new Error(`nairaToKobo(): invalid number ${naira}`);
  }
  // Round half-up to nearest kobo to avoid float drift on exact .xx values
  const asKobo = Math.round(naira * KOBO_PER_NAIRA);
  return kobo(asKobo);
}

/** Convert kobo integer to naira number (for display math that is not charged). */
export function koboToNaira(amountKobo: number): number {
  if (!Number.isInteger(amountKobo)) {
    throw new Error(`koboToNaira(): expected integer, got ${amountKobo}`);
  }
  return amountKobo / KOBO_PER_NAIRA;
}
