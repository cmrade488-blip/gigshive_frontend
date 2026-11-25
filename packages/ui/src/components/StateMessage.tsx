import type { ErrorCopyTone } from "@gigshive/shared/error-copy";
import * as React from "react";

import { cn } from "../lib/tw-merge";

export type StateTone = ErrorCopyTone;

export interface StateMessageProps {
  title: string;
  description?: React.ReactNode;
  /** A button or link; the caller owns its label and behaviour. */
  action?: React.ReactNode;
  /** Short server-issued support reference. Never a server message or code. */
  reference?: string;
  tone?: StateTone;
  variant?: "page" | "section";
  role?: "status" | "alert";
  className?: string;
}

export type BaseStateProps = Omit<StateMessageProps, "tone" | "role">;

const toneClasses: Record<StateTone, string> = {
  neutral: "border-gh-border bg-gh-surface text-gh-text",
  info: "border-gh-info bg-gh-info-bg text-gh-info",
  warning: "border-gh-warning bg-gh-warning-bg text-gh-warning",
  danger: "border-gh-danger bg-gh-danger-bg text-gh-danger",
};

/** Presentational base for the standard loading/empty/error/forbidden states. */
export function StateMessage({
  title,
  description,
  action,
  reference,
  tone = "neutral",
  variant = "section",
  role = "status",
  className,
}: StateMessageProps) {
  const isAlert = role === "alert";

  return (
    <div
      role={role}
      aria-live={isAlert ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "rounded-xl border p-5 text-left",
        toneClasses[tone],
        variant === "page" && "mx-auto w-full max-w-xl p-8",
        className,
      )}
    >
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap gap-2">{action}</div> : null}
      {reference ? <p className="mt-4 break-words text-xs">Reference: {reference}</p> : null}
    </div>
  );
}
