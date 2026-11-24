import { siteRoutes, workerDetailPath } from "@gigshive/shared/routes";

/** URLs owned by the profiles feature. The list URL stays owned by the site shell. */
export const workersRoutes = {
  list: siteRoutes.workers,
  detail: workerDetailPath,
} as const;
