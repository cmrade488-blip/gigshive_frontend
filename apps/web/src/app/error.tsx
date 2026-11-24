"use client";

import { ServerErrorScreen } from "@/features/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ServerErrorScreen error={error} digest={error.digest} reset={reset} />;
}
