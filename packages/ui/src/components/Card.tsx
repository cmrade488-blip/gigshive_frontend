import * as React from "react";
import { cn } from "@/lib/tw-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function Card({ header, footer, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-gh-border bg-gh-surface shadow-sm", className)}
      {...props}
    >
      {header ? <div className="border-b border-gh-border px-4 py-3">{header}</div> : null}
      <div className="px-4 py-4">{children}</div>
      {footer ? <div className="border-t border-gh-border px-4 py-3">{footer}</div> : null}
    </div>
  );
}
