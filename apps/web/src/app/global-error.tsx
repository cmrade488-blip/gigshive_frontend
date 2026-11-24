"use client";

import { ServerErrorScreen } from "@/features/site";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // This replaces the root layout, so it must own html/body and render without
  // site chrome. The root layout's CSS is imported here explicitly.
  return (
    <html lang="en">
      <body>
        <ServerErrorScreen error={error} digest={error.digest} reset={reset} standalone />
      </body>
    </html>
  );
}
