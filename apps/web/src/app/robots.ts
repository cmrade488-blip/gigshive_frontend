import type { MetadataRoute } from "next";

import { siteRoutes } from "@gigshive/shared/routes";
import { isSampleDataEnabled } from "@/lib/flags";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // A4: sample listings must not be indexed until the public APIs exist.
  const sampleDisallows = isSampleDataEnabled()
    ? []
    : [siteRoutes.jobs, `${siteRoutes.jobs}/*`, siteRoutes.workers, `${siteRoutes.workers}/*`];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Design previews for error states, not launch content.
      disallow: [
        siteRoutes.accessDenied,
        siteRoutes.serverError,
        siteRoutes.maintenance,
        ...sampleDisallows,
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
