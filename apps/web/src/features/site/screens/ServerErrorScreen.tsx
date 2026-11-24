"use client";

import Link from "next/link";
import { useEffect } from "react";

import { serverErrorCopy as copy } from "../copy/system";
import { siteRoutes } from "../routes";
import {
  SystemPage,
  systemPrimaryClass,
  systemSecondaryClass,
  type SystemPageProps,
} from "../components/SystemPage";

/**
 * FE-011 hook: replace this no-op with the scrubbed error-tracker call.
 * It stays dependency-free here; callers already pass the server-issued digest.
 */
export function reportError(error: Error, reference?: string): void {
  void error;
  void reference;
}

export interface ServerErrorScreenProps {
  /** Next.js error boundary reset. When absent, the retry action reloads the page. */
  reset?: () => void;
  /** Technical detail is rendered only in development, never in production. */
  error?: Error | null;
  /** Next's server-render error digest. It is the only support reference. */
  digest?: string;
  /** global-error.tsx replaces the root layout, so it renders without site chrome. */
  standalone?: boolean;
}

export function ServerErrorScreen({
  reset,
  error,
  digest,
  standalone = false,
}: ServerErrorScreenProps) {
  const reference = digest?.trim() || undefined;

  useEffect(() => {
    if (error) reportError(error, reference);
  }, [error, reference]);

  const referenceNode: SystemPageProps["reference"] = reference ? (
    <>
      {copy.referenceIntro} <strong className="tracking-[1px] text-white">{reference}</strong> ·{" "}
      {copy.referenceSuffix}
    </>
  ) : undefined;

  return (
    <SystemPage
      code={copy.code}
      title={copy.title}
      description={reference ? copy.description : copy.descriptionWithoutReference}
      image={copy.image}
      reference={referenceNode}
      standalone={standalone}
    >
      <button
        type="button"
        onClick={() => (reset ? reset() : window.location.reload())}
        className={systemPrimaryClass}
      >
        {copy.retryLabel}
      </button>
      <Link href={siteRoutes.home} className={systemSecondaryClass}>
        {copy.homeLabel}
      </Link>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <details className="w-full rounded-2xl border border-white/20 bg-white/[0.06] p-4 text-sm text-ink-200">
          <summary className="cursor-pointer font-semibold">{copy.devDetailLabel}</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        </details>
      ) : null}
    </SystemPage>
  );
}
