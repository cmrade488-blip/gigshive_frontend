import * as React from "react";
import { cn } from "@/lib/tw-merge";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-ink-500 text-white",
  info: "bg-gh-info-bg text-gh-info",
  success: "bg-gh-success-bg text-gh-success",
  warning: "bg-gh-warning-bg text-gh-warning",
  danger: "bg-gh-danger-bg text-gh-danger",
};

const defaultLabels: Record<StatusTone, string> = {
  neutral: "Active",
  info: "Information",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  const label = defaultLabels[variant];
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md",
        toneClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
