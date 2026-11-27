"use client";

import { installGlobalErrorHandlers, startWebVitals } from "@gigshive/shared/observability";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { ConsoleSessionBootstrap } from "@/features/auth";

import { observability } from "./observability";

/**
 * App-level providers for the staff console. FE-018 adds the shared session
 * bootstrap; theme and design-system providers land with FE-006.
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

  return (
    <QueryClientProvider client={queryClient}>
      <ConsoleSessionBootstrap>{children}</ConsoleSessionBootstrap>
    </QueryClientProvider>
  );
}
