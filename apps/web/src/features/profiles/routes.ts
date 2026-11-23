import { siteRoutes } from "@/features/site";

/** URLs owned by the profiles feature. The list URL stays owned by the site shell. */
export const workersRoutes = {
  list: siteRoutes.workers,
  detail: (id: string): string => `${siteRoutes.workers}/${encodeURIComponent(id)}`,
} as const;
