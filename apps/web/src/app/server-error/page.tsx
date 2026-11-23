import type { Metadata } from "next";

import { ServerErrorScreen, serverErrorCopy } from "@/features/site";

export const metadata: Metadata = {
  title: serverErrorCopy.metaTitle,
  description: serverErrorCopy.metaDescription,
};

/** Preview route for the 500 design. Real failures render through error.tsx. */
export default function ServerErrorPage() {
  return <ServerErrorScreen />;
}
