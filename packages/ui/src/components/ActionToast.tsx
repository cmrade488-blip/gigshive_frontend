import * as React from "react";

import { cn } from "../lib/tw-merge";

export interface ActionToastProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

/** Presentational toast for a failed action with no form. */
export function ActionToast({ message, actionLabel, onAction, className }: ActionToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl bg-ink-900 p-4 text-white shadow-lg",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gh-danger font-bold"
      >
        !
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="min-h-11 rounded-md px-2 font-semibold text-honey-300 focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:outline-none"
      >
        {actionLabel}
      </button>
    </div>
  );
}
