/**
 * Absolute public site URL used by metadata, robots and sitemap.
 *
 * PUBLIC_SITE_URL is the existing name in .env.example. A localhost fallback
 * keeps local builds working; production must set the variable, otherwise the
 * generated sitemap and social URLs will point at localhost.
 */
const LOCAL_FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  const configured = process.env.PUBLIC_SITE_URL?.trim();
  if (!configured) return LOCAL_FALLBACK;

  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
    // Never put credentials from the environment into generated URLs.
    if (parsed.username || parsed.password) {
      throw new Error("credentials are not allowed in PUBLIC_SITE_URL");
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    // Do not echo the value: it may contain credentials.
    console.warn(`PUBLIC_SITE_URL is invalid or unsupported; falling back to ${LOCAL_FALLBACK}`);
    return LOCAL_FALLBACK;
  }
}
