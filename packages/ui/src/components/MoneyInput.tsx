import * as React from "react";
import { formatMoney, parseMoney, type Kobo } from "@gigshive/shared/money";
import { cn } from "@/lib/tw-merge";

export interface MoneyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  /** Integer amount in kobo (1 naira = 100 kobo). */
  valueKobo?: number;
  label?: string;
  error?: string;
  /** Called with the parsed kobo value (user-entered naira → kobo). */
  onChange?: (kobo: Kobo) => void;
}

export function MoneyInput({
  valueKobo,
  label,
  error,
  onChange,
  className,
  ...props
}: MoneyInputProps) {
  const toDisplay = (kobo: number | undefined) => formatMoney(kobo ?? 0).replace(/^[^\d.]+/, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const display = e.target.value;
    const result = parseMoney(display);
    if (result.ok) {
      onChange?.(result.kobo);
    }
  };

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor="money-input" className="block text-sm font-medium text-gh-text">
          {label}
        </label>
      ) : null}
      <input
        {...props}
        id="money-input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="Enter amount in naira"
        value={toDisplay(valueKobo)}
        onChange={handleChange}
        className={cn(
          "mt-1 block w-full rounded-md border border-gh-border bg-gh-surface px-3 py-2 text-base text-gh-text",
          "focus:border-gh-primary focus:outline-none focus:ring-2 focus:ring-gh-focus-ring",
          error ? "border-gh-danger" : "border-gh-border",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "money-input-error" : undefined}
      />
      {error ? (
        <p id="money-input-error" role="alert" className="mt-1 text-sm text-gh-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
