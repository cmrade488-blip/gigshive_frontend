import type { Metadata } from "next";

import { NotFoundScreen, notFoundCopy } from "@/features/site";

export const metadata: Metadata = {
  title: notFoundCopy.metaTitle,
  description: notFoundCopy.metaDescription,
};

export default function NotFound() {
  return <NotFoundScreen />;
}
