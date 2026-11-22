import * as React from "react";
import { formatMoney } from "@gigshive/shared/money";

import { cn } from "@/lib/tw-merge";

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Integer amount in kobo (1 naira = 100 kobo). */
  amountKobo: number;
  currency?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function MoneyDisplay({
  amountKobo,
  currency = true,
  size = "md",
  className,
  ...props
}: MoneyDisplayProps) {
  const label = formatMoney(amountKobo, { currency });

  return (
    <span
      className={cn("font-medium tabular-nums text-gh-text", sizeClasses[size], className)}
      {...props}
    >
      {label}
    </span>
  );
}
