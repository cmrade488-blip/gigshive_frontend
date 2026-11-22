/**
 * Date/time helpers. Display timezone is Africa/Lagos (WAT, UTC+1, no DST).
 */

export const DISPLAY_TIMEZONE = "Africa/Lagos";

export type FormatDateOptions = {
  /** Locale. Default "en-NG". */
  locale?: string;
  /** Include time. Default false. */
  time?: boolean;
  /** Style for date part. Default "medium". */
  dateStyle?: "full" | "long" | "medium" | "short";
  /** Style for time part when time is true. Default "short". */
  timeStyle?: "full" | "long" | "medium" | "short";
};

/**
 * Format an ISO string or Date for display in Africa/Lagos.
 */
export function formatDate(
  value: string | Date,
  options: FormatDateOptions = {},
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`formatDate(): invalid date ${String(value)}`);
  }

  const {
    locale = "en-NG",
    time = false,
    dateStyle = "medium",
    timeStyle = "short",
  } = options;

  if (time) {
    return new Intl.DateTimeFormat(locale, {
      timeZone: DISPLAY_TIMEZONE,
      dateStyle,
      timeStyle,
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: DISPLAY_TIMEZONE,
    dateStyle,
  }).format(date);
}

/**
 * Relative label for recent times ("just now", "5 minutes ago", …).
 * Falls back to formatDate for older values.
 */
export function formatRelative(
  value: string | Date,
  now: Date = new Date(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`formatRelative(): invalid date ${String(value)}`);
  }

  const diffMs = now.getTime() - date.getTime();
  const abs = Math.abs(diffMs);
  const seconds = Math.round(abs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat("en-NG", { numeric: "auto" });

  if (seconds < 45) return rtf.format(diffMs >= 0 ? 0 : 0, "second"); // "now"
  if (minutes < 60) return rtf.format(diffMs > 0 ? -minutes : minutes, "minute");
  if (hours < 24) return rtf.format(diffMs > 0 ? -hours : hours, "hour");
  if (days < 7) return rtf.format(diffMs > 0 ? -days : days, "day");

  return formatDate(date, { dateStyle: "medium" });
}
