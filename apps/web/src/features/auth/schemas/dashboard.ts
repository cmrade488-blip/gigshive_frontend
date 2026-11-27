import type { dashboardCopy } from "../copy/dashboard";
import type { SessionData } from "../api/session";

type Profile = SessionData["profiles"][number];
type ProfileStatus = Profile["status"];
type AccountStatus = SessionData["status"];

export type DashboardRole = "CLIENT" | "WORKER";
export type DashboardActionId = keyof typeof dashboardCopy.actions.items;
export type DashboardBannerKind =
  | "EMAIL_UNVERIFIED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_DELETED"
  | "NO_PROFILE"
  | "PROFILE_PENDING"
  | "PROFILE_SUBMITTED"
  | "PROFILE_REJECTED"
  | "PROFILE_SUSPENDED";

export interface DashboardBanner {
  id: string;
  kind: DashboardBannerKind;
  profileId?: string;
  status?: ProfileStatus;
  /** Owner-only review data from /me; never a backend error message. */
  reason?: string | null;
  until?: string | null;
}

const ACCOUNT_BANNERS = {
  ACTIVE: null,
  SUSPENDED: "ACCOUNT_SUSPENDED",
  DELETED: "ACCOUNT_DELETED",
} satisfies Record<AccountStatus, DashboardBannerKind | null>;

const PROFILE_BANNERS = {
  PENDING: "PROFILE_PENDING",
  SUBMITTED: "PROFILE_SUBMITTED",
  ACTIVE: null,
  REJECTED: "PROFILE_REJECTED",
  SUSPENDED: "PROFILE_SUSPENDED",
} satisfies Record<ProfileStatus, DashboardBannerKind | null>;

const PROFILE_ACTIONS: Record<ProfileStatus, (role: DashboardRole) => DashboardActionId | null> = {
  PENDING: () => null,
  SUBMITTED: () => null,
  ACTIVE: (role) => (role === "CLIENT" ? "browseWorkers" : "browseJobs"),
  REJECTED: () => "viewProfile",
  SUSPENDED: () => "viewProfile",
};

/** Roles with a profile are switchable; a new user may choose either setup path. */
export function dashboardRoles(session: SessionData | null | undefined): DashboardRole[] {
  const present = new Set<DashboardRole>();
  for (const profile of session?.profiles ?? []) {
    if (profile.profile_type === "CLIENT" || profile.profile_type === "WORKER") {
      present.add(profile.profile_type);
    }
  }
  return present.size > 0 ? [...present] : ["CLIENT", "WORKER"];
}

export function preferredDashboardRole(
  session: SessionData | null | undefined,
  current?: DashboardRole,
): DashboardRole {
  const roles = dashboardRoles(session);
  return current && roles.includes(current) ? current : (roles[0] ?? "CLIENT");
}

/** Status banners use only /me data. No aggregate or money endpoint is invented. */
export function dashboardBanners(
  session: SessionData | null | undefined,
  role: DashboardRole,
): DashboardBanner[] {
  if (!session || session.account_type === "STAFF") {
    return [];
  }

  const banners: DashboardBanner[] = [];
  const accountBanner = ACCOUNT_BANNERS[session.status];
  if (accountBanner) {
    banners.push({ id: "account", kind: accountBanner });
  }

  if (!session.email_verified_at) {
    banners.push({ id: "email", kind: "EMAIL_UNVERIFIED" });
  }

  const profiles = session.profiles.filter((profile) => profile.profile_type === role);
  if (profiles.length === 0) {
    banners.push({ id: "no-profile", kind: "NO_PROFILE" });
  }

  for (const profile of profiles) {
    const kind = PROFILE_BANNERS[profile.status];
    if (!kind) {
      continue;
    }
    const showReviewData = kind === "PROFILE_REJECTED" || kind === "PROFILE_SUSPENDED";
    banners.push({
      id: `profile-${profile.id}`,
      kind,
      profileId: profile.id,
      status: profile.status,
      reason: showReviewData ? profile.status_reason : null,
      until: kind === "PROFILE_SUSPENDED" ? profile.suspended_until : null,
    });
  }

  return banners;
}

/** Next actions are hints only; the API remains the authority for each action. */
export function dashboardNextActions(
  session: SessionData | null | undefined,
  role: DashboardRole,
): DashboardActionId[] {
  if (!session || session.account_type === "STAFF") {
    return [];
  }
  if (session.status === "DELETED") {
    return [];
  }
  if (session.status === "SUSPENDED") {
    return ["accountSettings"];
  }

  const actions: DashboardActionId[] = [];
  if (!session.email_verified_at) {
    actions.push("verifyEmail");
  }

  const profiles = session.profiles.filter((profile) => profile.profile_type === role);
  const [profile] = profiles;
  if (!profile) {
    actions.push(role === "CLIENT" ? "createClientProfile" : "createWorkerProfile");
    return actions;
  }

  const profileAction = PROFILE_ACTIONS[profile.status](role);
  if (profileAction) {
    actions.push(profileAction);
  }
  return actions;
}
