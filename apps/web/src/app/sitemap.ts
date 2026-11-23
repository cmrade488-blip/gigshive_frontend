import type { MetadataRoute } from "next";

import { siteRoutes } from "@/features/site";
import { getSiteUrl } from "@/lib/site-url";

// Only routes that exist today. The preview error pages, sample job detail
// pages and routes owned by later tasks (workers, dashboards) are excluded.
const launchRoutes = [
  siteRoutes.home,
  siteRoutes.jobs,
  siteRoutes.howItWorks,
  siteRoutes.safety,
  siteRoutes.fees,
  siteRoutes.help,
  siteRoutes.contact,
  siteRoutes.about,
  siteRoutes.terms,
  siteRoutes.privacy,
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return launchRoutes.map((route): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === siteRoutes.home ? 1 : 0.7,
  }));
}
