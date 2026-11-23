import { jobDetailPath, siteRoutes } from "@gigshive/shared/routes";

/** URLs owned by the jobs feature. The list URL stays owned by the site shell. */
export const jobsRoutes = {
  list: siteRoutes.jobs,
  detail: jobDetailPath,
} as const;
