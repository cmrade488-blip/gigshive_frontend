"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutStaff } from "../api/auth";
import { staffAuthCopy } from "../copy/staff-auth";
import { consoleSessionQueryKey } from "../state/use-session-status";

/** Clears the server-held console session and returns to the sign-in screen. */
export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleLogout(): Promise<void> {
    if (pending) {
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      await logoutStaff();
    } catch {
      // handleLogout clears cookies even when revocation fails; do not show a
      // server message or keep the user in a console that may be stale.
      setFailed(true);
    } finally {
      queryClient.setQueryData(consoleSessionQueryKey, null);
      queryClient.clear();
      setPending(false);
      router.replace("/login");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="rounded-full px-3 py-2 text-sm font-medium text-ink-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none disabled:opacity-60"
      >
        {pending ? staffAuthCopy.session.signingOutLabel : staffAuthCopy.session.signOutLabel}
      </button>
      {failed ? (
        <span role="status" className="sr-only">
          {staffAuthCopy.session.signOutFailed}
        </span>
      ) : null}
    </>
  );
}
