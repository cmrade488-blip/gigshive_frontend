/**
 * Public URL paths shared across features (FE-024 bugfix).
 *
 * These live in a package, not in the `site` feature barrel: features import
 * routes from here so that the site index can render components from other
 * features without creating a circular module evaluation (which made
 * `siteRoutes` undefined at runtime on the home page).
 */
export const siteRoutes = {
  home: "/",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  profile: "/profile",
  myJobs: "/my/jobs",
  myJobsNew: "/my/jobs/new",
  myProposals: "/my/proposals",
  contracts: "/contracts",
  wallet: "/wallet",
  jobs: "/jobs",
  workers: "/workers",
  howItWorks: "/how-it-works",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  settingsAccount: "/settings/account",
  terms: "/terms",
  privacy: "/privacy",
  safety: "/safety",
  fees: "/fees",
  help: "/help",
  contact: "/contact",
  about: "/about",
  accessDenied: "/access-denied",
  serverError: "/server-error",
  maintenance: "/maintenance",
} as const;

/** Public detail URLs are shared so home-page previews and feature routes cannot drift. */
export function workerDetailPath(id: string): string {
  return `${siteRoutes.workers}/${encodeURIComponent(id)}`;
}

export function jobDetailPath(id: string): string {
  return `${siteRoutes.jobs}/${encodeURIComponent(id)}`;
}
