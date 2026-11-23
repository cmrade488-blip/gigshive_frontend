import type { Metadata } from "next";
import { Suspense } from "react";

import { JobsScreen, jobsCopy } from "@/features/jobs";

export const metadata: Metadata = {
  title: jobsCopy.metaTitle,
  description: jobsCopy.metaDescription,
};

export default function JobsPage() {
  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{jobsCopy.loading}</p>}>
      <JobsScreen />
    </Suspense>
  );
}
