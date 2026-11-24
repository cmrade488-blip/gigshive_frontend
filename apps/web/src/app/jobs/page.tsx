import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JobsScreen, jobsCopy } from "@/features/jobs";
import { isSampleDataEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: jobsCopy.metaTitle,
  description: jobsCopy.metaDescription,
};

export default function JobsPage() {
  // A4: this list is sample data until the public jobs API exists.
  if (!isSampleDataEnabled()) {
    notFound();
  }

  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{jobsCopy.loading}</p>}>
      <JobsScreen />
    </Suspense>
  );
}
