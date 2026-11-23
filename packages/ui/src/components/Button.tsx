import * as React from "react";
import { cn } from "../lib/tw-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gh-primary text-gh-primary-text hover:bg-gh-primary-hover active:bg-gh-primary-active",
  secondary: "bg-gh-secondary text-gh-secondary-text hover:bg-gh-secondary-hover",
  outline: "bg-transparent border border-gh-border text-gh-text hover:bg-gh-surface-sunken",
  ghost: "bg-transparent text-gh-text hover:bg-gh-surface-sunken",
  danger: "bg-gh-danger text-white hover:bg-gh-danger-bg",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 rounded-sm",
  md: "text-base px-4 py-2 rounded-md",
  lg: "text-lg px-5 py-2.5 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-gh-focus-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
