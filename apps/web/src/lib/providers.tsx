"use client";

import { installGlobalErrorHandlers, startWebVitals } from "@gigshive/shared/observability";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { observability } from "./observability";

/**
 * App-level providers for the marketplace web app.
 * Session / auth providers land in FE-008.
 * Theme and design-system providers land with FE-006.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stopWebVitals = startWebVitals({
      report: (metric) => observability.captureMetric(metric),
    });
    const stopGlobalErrors = installGlobalErrorHandlers(observability);

    return () => {
      stopGlobalErrors();
      stopWebVitals();
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
