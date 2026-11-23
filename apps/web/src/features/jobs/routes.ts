import { siteRoutes } from "@/features/site";

/** URLs owned by the jobs feature. The list URL stays owned by the site shell. */
export const jobsRoutes = {
  list: siteRoutes.jobs,
  detail: (id: string): string => `${siteRoutes.jobs}/${encodeURIComponent(id)}`,
} as const;
