"use client";

import { Button } from "@gigshive/ui";
import { useState } from "react";

import { describeAuthError, type AuthFormIssue } from "../api/error-copy";
import { authCopy } from "../copy/auth";
import { useLogout } from "../state/use-logout";

/** Compact header control; logout succeeds locally even if the API is down. */
export function LogoutButton() {
  const logout = useLogout();
  const [issue, setIssue] = useState<AuthFormIssue | null>(null);

  async function handleLogout(): Promise<void> {
    if (logout.isPending) {
      return;
    }

    setIssue(null);
    try {
      await logout.mutateAsync();
    } catch (error) {
      setIssue(describeAuthError(error));
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {issue ? (
        <span role="alert" className="text-xs text-gh-danger">
          {issue.copy.title}
          {issue.reference ? ` (Reference: ${issue.reference})` : ""}
        </span>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-11 rounded-full px-4 text-[15px] font-semibold text-ink-900 hover:bg-ink-50"
        loading={logout.isPending}
        disabled={logout.isPending}
        onClick={handleLogout}
      >
        {logout.isPending ? authCopy.session.loggingOutLabel : authCopy.session.logoutLabel}
      </Button>
    </div>
  );
}
