import * as React from "react";

import { cn } from "../lib/tw-merge";

export interface OfflineBannerProps {
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/** Connectivity problem, distinct from a server error. */
export function OfflineBanner({ message, action, className }: OfflineBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-gh-warning bg-gh-warning-bg p-4 text-gh-warning",
        className,
      )}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ●
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {action}
    </div>
  );
}
