import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkersScreen, workersCopy } from "@/features/profiles";

export const metadata: Metadata = {
  title: workersCopy.metaTitle,
  description: workersCopy.metaDescription,
};

export default function WorkersPage() {
  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{workersCopy.loading}</p>}>
      <WorkersScreen />
    </Suspense>
  );
}
