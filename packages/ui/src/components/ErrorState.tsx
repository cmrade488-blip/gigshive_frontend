import * as React from "react";

import { StateMessage, type BaseStateProps } from "./StateMessage";

export interface ErrorStateProps extends BaseStateProps {
  variant?: "page" | "section";
}

/**
 * Section or full-page error. The caller supplies all user-facing copy; a
 * server message, code, URL or stack trace is never accepted here.
 */
export function ErrorState({ variant = "section", ...props }: ErrorStateProps) {
  return <StateMessage {...props} tone="danger" role="alert" variant={variant} />;
}
