"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { SessionData } from "../api/session";
import { dashboardRoles, preferredDashboardRole, type DashboardRole } from "../schemas/dashboard";

interface DashboardRoleValue {
  session: SessionData | null;
  role: DashboardRole;
  roles: DashboardRole[];
  setRole: (role: DashboardRole) => void;
}

const DashboardRoleContext = createContext<DashboardRoleValue | null>(null);

/** Keeps the selected profile type available to the shell and the screen. */
export function DashboardRoleProvider({
  session,
  children,
}: {
  session: SessionData | null;
  children: ReactNode;
}) {
  const [override, setOverride] = useState<DashboardRole | null>(null);
  const roles = useMemo(() => dashboardRoles(session), [session]);
  const role = preferredDashboardRole(session, override ?? undefined);

  const value = useMemo<DashboardRoleValue>(
    () => ({ session, role, roles, setRole: setOverride }),
    [session, role, roles],
  );

  return <DashboardRoleContext.Provider value={value}>{children}</DashboardRoleContext.Provider>;
}

export function useDashboardRole(): DashboardRoleValue {
  const value = useContext(DashboardRoleContext);
  if (!value) {
    throw new Error("useDashboardRole must be used inside DashboardRoleProvider");
  }
  return value;
}
