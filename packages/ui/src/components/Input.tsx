import * as React from "react";
import { cn } from "../lib/tw-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, required, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-gh-text">
            {label}
            {required ? <span className="ml-1 text-gh-danger">*</span> : null}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "mt-1 block w-full rounded-md border border-gh-border bg-gh-surface px-3 py-2 text-base text-gh-text",
            "placeholder:text-gh-text-subtle focus:border-gh-primary focus:outline-none",
            "focus:ring-2 focus:ring-gh-focus-ring",
            error ? "border-gh-danger" : "border-gh-border",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="mt-1 text-sm text-gh-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1 text-sm text-gh-text-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
