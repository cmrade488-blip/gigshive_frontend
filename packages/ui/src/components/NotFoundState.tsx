import * as React from "react";

import { StateMessage, type BaseStateProps } from "./StateMessage";

/** An item cannot be found or is not visible to this user. */
export function NotFoundState(props: BaseStateProps) {
  return <StateMessage {...props} tone="neutral" role="status" />;
}
