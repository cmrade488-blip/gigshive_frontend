import * as React from "react";

import { StateMessage, type BaseStateProps } from "./StateMessage";

/** A permission or profile gate blocked this page or action. */
export function ForbiddenState(props: BaseStateProps) {
  return <StateMessage {...props} tone="warning" role="alert" />;
}
