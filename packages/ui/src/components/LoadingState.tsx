import * as React from "react";

import { cn } from "../lib/tw-merge";

export interface LoadingStateProps {
  label: string;
  description?: React.ReactNode;
  className?: string;
}

/** Announced, non-interactive loading state. */
export function LoadingState({ label, description, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-gh-border bg-gh-surface p-5 text-left",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gh-border-strong border-t-gh-primary"
      />
      <div>
        <p className="text-base font-medium text-gh-text">{label}</p>
        {description ? <p className="mt-1 text-sm text-gh-text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
