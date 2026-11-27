"use client";

import { Button, LoadingState, Modal, StateMessage } from "@gigshive/ui";
import { useCallback, useState } from "react";

import { describeMediaError } from "../api/error-copy";
import type { Media } from "../api/media";
import { mediaCopy } from "../copy/media";
import { formatMediaExpiry, isPrivateMedia, mediaViewKind, publicMediaUrl } from "../schemas/media";
import { usePrivateFile } from "../state/use-private-file";

export interface SignedFileViewerProps {
  media: Media;
}

/**
 * Opens public media directly and private media through a one-shot signed
 * request. The signed URL is never rendered, navigated to or retained.
 */
export function SignedFileViewer({ media }: SignedFileViewerProps) {
  const [open, setOpen] = useState(false);
  const isPrivate = isPrivateMedia(media);
  const publicUrl = publicMediaUrl(media);
  const { open: openFile, close: closeFile, ...file } = usePrivateFile(isPrivate ? media.id : null);
  const issue = file.status === "error" ? describeMediaError(file.error) : null;
  const expiresAt = formatMediaExpiry(file.expiresAt);
  const source = publicUrl ?? (file.status === "ready" ? file.blobUrl : null);
  const isImage = mediaViewKind(media) === "IMAGE";

  const handleClose = useCallback(() => {
    setOpen(false);
    closeFile();
  }, [closeFile]);

  async function handleOpen() {
    setOpen(true);
    if (isPrivate) {
      await openFile();
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => void handleOpen()}>
        {mediaCopy.viewer.open(media.original_name)}
      </Button>

      <Modal open={open} onClose={handleClose} title={media.original_name}>
        {isPrivate ? (
          <p className="mb-3 text-sm text-gh-text-subtle">{mediaCopy.viewer.privateNote}</p>
        ) : (
          <p className="mb-3 text-sm text-gh-text-subtle">{mediaCopy.viewer.publicNote}</p>
        )}

        {file.status === "loading" && isPrivate ? (
          <LoadingState label={mediaCopy.viewer.loading} />
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
                <Button type="button" variant="outline" onClick={() => void openFile()}>
                  {issue.actionLabel}
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!issue && source ? (
          <div className="space-y-3">
            {isImage ? (
              <img
                src={source}
                alt={mediaCopy.viewer.imageAlt(media.original_name)}
                className="max-h-80 w-full rounded-xl border border-gh-border object-contain"
              />
            ) : (
              <p className="text-sm text-gh-text">{media.original_name}</p>
            )}
            <a
              href={source}
              download={media.original_name}
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-gh-border bg-gh-surface px-4 py-2 text-sm font-semibold text-gh-text"
            >
              {mediaCopy.viewer.download}
            </a>
          </div>
        ) : null}

        {!issue && !source && file.status !== "loading" ? (
          <StateMessage
            tone="neutral"
            title={mediaCopy.errors.kinds.notFound.title}
            description={mediaCopy.errors.kinds.notFound.description}
          />
        ) : null}

        {expiresAt ? (
          <p className="mt-3 text-xs text-gh-text-subtle">{mediaCopy.viewer.expires(expiresAt)}</p>
        ) : null}
      </Modal>
    </>
  );
}
