"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface StaffLoginContextValue {
  /** Kept in memory only; never written to a URL or browser storage. */
  pendingEmail: string | null;
  beginLogin: (email: string) => void;
  clearPendingLogin: () => void;
}

const StaffLoginContext = createContext<StaffLoginContextValue | null>(null);

export function StaffLoginProvider({ children }: { children: ReactNode }) {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const value = useMemo<StaffLoginContextValue>(
    () => ({
      pendingEmail,
      beginLogin: (email) => setPendingEmail(email),
      clearPendingLogin: () => setPendingEmail(null),
    }),
    [pendingEmail],
  );

  return <StaffLoginContext.Provider value={value}>{children}</StaffLoginContext.Provider>;
}

export function useStaffLogin(): StaffLoginContextValue {
  const context = useContext(StaffLoginContext);
  if (!context) {
    throw new Error("useStaffLogin must be used inside StaffLoginProvider.");
  }
  return context;
}
