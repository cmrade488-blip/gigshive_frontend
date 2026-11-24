import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { WorkersScreen, workersCopy } from "@/features/profiles";
import { isSampleDataEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: workersCopy.metaTitle,
  description: workersCopy.metaDescription,
};

export default function WorkersPage() {
  // A4: this list is sample data until the public workers API exists.
  if (!isSampleDataEnabled()) {
    notFound();
  }

  // useSearchParams needs a boundary above it when this route is pre-rendered.
  return (
    <Suspense fallback={<p className="p-10 text-ink-600">{workersCopy.loading}</p>}>
      <WorkersScreen />
    </Suspense>
  );
}
