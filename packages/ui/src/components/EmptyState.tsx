import * as React from "react";

import { StateMessage, type BaseStateProps } from "./StateMessage";

/** No results yet. Not an error, so it is announced politely. */
export function EmptyState(props: BaseStateProps) {
  return <StateMessage {...props} tone="neutral" role="status" />;
}
