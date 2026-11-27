"use client";

import { installGlobalErrorHandlers, startWebVitals } from "@gigshive/shared/observability";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { SessionBootstrap, VerifyEmailPrompt } from "@/features/auth";

import { observability } from "./observability";

/**
 * App-level providers for the marketplace web app.
 * Session bootstrap and route guards are installed by FE-017.
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

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>
        <VerifyEmailPrompt />
        {children}
      </SessionBootstrap>
    </QueryClientProvider>
  );
}
