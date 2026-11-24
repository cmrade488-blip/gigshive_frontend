/**
 * Absolute public site URL used by metadata, robots and sitemap.
 *
 * PUBLIC_SITE_URL is the existing name in .env.example. A localhost fallback
 * keeps local builds working; deploy builds set GIGSHIVE_ENV=production and
 * must provide a valid PUBLIC_SITE_URL, otherwise generated sitemap, robots
 * and social-card URLs would point at localhost.
 */
const LOCAL_FALLBACK = "http://localhost:3000";

function isProductionBuild(): boolean {
  // next build always sets NODE_ENV=production, even locally, so use the
  // explicit deploy-time flag instead.
  return process.env.GIGSHIVE_ENV === "production";
}

export function getSiteUrl(): string {
  const configured = process.env.PUBLIC_SITE_URL?.trim();

  if (!configured) {
    if (isProductionBuild()) {
      throw new Error("PUBLIC_SITE_URL must be set when GIGSHIVE_ENV=production");
    }
    return LOCAL_FALLBACK;
  }

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
    if (isProductionBuild()) {
      throw new Error(
        "PUBLIC_SITE_URL must be a valid http(s) URL without credentials when GIGSHIVE_ENV=production",
      );
    }
    console.warn(`PUBLIC_SITE_URL is invalid or unsupported; falling back to ${LOCAL_FALLBACK}`);
    return LOCAL_FALLBACK;
  }
}
