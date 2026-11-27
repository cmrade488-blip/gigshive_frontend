"use client";

import { Button, Input, LoadingState, StateMessage } from "@gigshive/ui";
import { useEffect, useState, type ChangeEvent } from "react";

import { describeMediaError } from "../api/error-copy";
import type { Media, MediaCollection } from "../api/media";
import { mediaCopy, type MediaCollectionLabelKey } from "../copy/media";
import { useMediaUpload } from "../state/use-media-upload";

export interface MediaUploaderProps {
  collection: MediaCollection & MediaCollectionLabelKey;
  /** Optional design-approved MIME filter; no allow-list is invented here. */
  accept?: string;
  onUploaded?: (media: Media) => void;
}

/** Single-file uploader for POST /media; multi-file flows own their endpoints. */
export function MediaUploader({ collection, accept, onUploaded }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const upload = useMediaUpload();
  const issue = upload.error ? describeMediaError(upload.error) : null;
  const retryAfter = issue?.retryAfterSeconds ?? 0;

  useEffect(() => {
    if (retryAfter > 0) {
      setCooldown(retryAfter);
    }
  }, [retryAfter, upload.error]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setCooldown(0);
    upload.reset();
    if (next) {
      upload.mutate({ file: next, collection }, { onSuccess: (media) => onUploaded?.(media) });
    }
  }

  function handleRetry() {
    if (!file || cooldown > 0 || upload.isPending) {
      return;
    }
    upload.mutate({ file, collection }, { onSuccess: (media) => onUploaded?.(media) });
  }

  return (
    <div className="space-y-3">
      <Input
        type="file"
        label={mediaCopy.uploader.label(collection)}
        hint={mediaCopy.uploader.hint}
        error={issue?.fieldErrors.file}
        accept={accept}
        disabled={upload.isPending || cooldown > 0}
        onChange={handleChange}
      />

      {upload.isPending ? <LoadingState label={mediaCopy.uploader.uploading} /> : null}

      {upload.isSuccess && upload.data ? (
        <StateMessage
          title={mediaCopy.uploader.success(upload.data.original_name)}
          tone="neutral"
        />
      ) : null}

      {issue ? (
        <StateMessage
          role="alert"
          tone={issue.tone}
          title={issue.title}
          description={issue.description}
          reference={issue.reference}
          action={
            issue.actionLabel ? (
              <Button
                type="button"
                variant="outline"
                disabled={upload.isPending || cooldown > 0}
                onClick={handleRetry}
              >
                {cooldown > 0 ? mediaCopy.uploader.cooldown(cooldown) : issue.actionLabel}
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </div>
  );
}
