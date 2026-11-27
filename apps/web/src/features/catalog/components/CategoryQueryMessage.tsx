"use client";

import { Button, StateMessage } from "@gigshive/ui";
import { useEffect, useState } from "react";

import { describeCatalogError } from "../api/error-copy";
import { catalogCopy } from "../copy/catalog";

export interface CategoryQueryMessageProps {
  error: unknown;
  busy?: boolean;
  onRetry: () => void;
}

/** Shared failure state for the picker and chips; retry stays user-driven. */
export function CategoryQueryMessage({ error, busy = false, onRetry }: CategoryQueryMessageProps) {
  const issue = describeCatalogError(error);
  const [cooldown, setCooldown] = useState(issue.retryAfterSeconds ?? 0);

  useEffect(() => {
    setCooldown(issue.retryAfterSeconds ?? 0);
  }, [issue.retryAfterSeconds, error]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  return (
    <StateMessage
      role="alert"
      tone={issue.tone}
      title={issue.title}
      description={issue.description}
      reference={issue.reference}
      action={
        issue.actionLabel ? (
          <Button type="button" variant="outline" disabled={busy || cooldown > 0} onClick={onRetry}>
            {cooldown > 0 ? catalogCopy.retry.cooldown(cooldown) : issue.actionLabel}
          </Button>
        ) : undefined
      }
    />
  );
}
