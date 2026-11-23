import type { MetadataRoute } from "next";

import { siteRoutes } from "@/features/site";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Design previews for error states, not launch content.
      disallow: [siteRoutes.accessDenied, siteRoutes.serverError, siteRoutes.maintenance],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
