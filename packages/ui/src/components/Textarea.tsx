import * as React from "react";
import { cn } from "../lib/tw-merge";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, required, rows = 3, ...props }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gh-text">
            {label}
            {required ? <span className="ml-1 text-gh-danger">*</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
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

Textarea.displayName = "Textarea";
