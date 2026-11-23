"use client";

import { createSupportReference } from "@gigshive/shared/id";
import Link from "next/link";
import { useEffect, useState } from "react";

import { serverErrorCopy as copy } from "../copy/system";
import { siteRoutes } from "../routes";
import {
  SystemPage,
  systemPrimaryClass,
  systemSecondaryClass,
  type SystemPageProps,
} from "../components/SystemPage";

export interface ServerErrorScreenProps {
  /** Next.js error boundary reset. When absent, the retry action reloads the page. */
  reset?: () => void;
  /** Technical detail is rendered only in development, never in production. */
  error?: Error | null;
  /** global-error.tsx replaces the root layout, so it renders without site chrome. */
  standalone?: boolean;
}

export function ServerErrorScreen({ reset, error, standalone = false }: ServerErrorScreenProps) {
  // Generate after mount: a random value in a state initialiser would differ
  // between the server render and hydration.
  const [reference, setReference] = useState("");

  useEffect(() => {
    setReference(createSupportReference());
  }, []);

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
      description={copy.description}
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
