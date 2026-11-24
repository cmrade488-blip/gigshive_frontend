import type { MetadataRoute } from "next";

import { siteRoutes } from "@gigshive/shared/routes";
import { isSampleDataEnabled } from "@/lib/flags";
import { getSiteUrl } from "@/lib/site-url";

// Only routes that exist today. The preview error pages, sample detail pages
// and routes owned by later tasks (dashboards) are excluded.
const launchRoutes = [
  siteRoutes.home,
  siteRoutes.jobs,
  siteRoutes.workers,
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
  // A4: do not advertise routes that currently render only sample data.
  const routes = isSampleDataEnabled()
    ? launchRoutes
    : launchRoutes.filter((route) => route !== siteRoutes.jobs && route !== siteRoutes.workers);

  return routes.map((route): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === siteRoutes.home ? 1 : 0.7,
  }));
}
