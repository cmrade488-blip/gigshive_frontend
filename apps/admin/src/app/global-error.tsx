"use client";

import { errorCopy } from "@gigshive/shared/error-copy";
import { Button, ErrorState } from "@gigshive/ui";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = errorCopy.server;

  // This replaces the root layout, so it owns html/body and imports the CSS.
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-3xl px-6 py-16">
          <ErrorState
            variant="page"
            title={copy.title}
            description={copy.description}
            reference={error.digest}
            action={
              <Button type="button" onClick={reset}>
                {copy.actionLabel}
              </Button>
            }
          />
        </main>
      </body>
    </html>
  );
}
