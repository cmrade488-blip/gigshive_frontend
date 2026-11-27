"use client";

import { EmptyState } from "@gigshive/ui";

import type { Media } from "../api/media";
import { mediaCopy } from "../copy/media";
import { isPrivateMedia } from "../schemas/media";
import { SignedFileViewer } from "./SignedFileViewer";

export interface MediaFileListProps {
  media: Media[];
  title?: string;
  emptyTitle?: string;
  emptyText?: string;
}

/** Reusable list of API-supplied media; public and private files stay distinct. */
export function MediaFileList({
  media,
  title = mediaCopy.list.title,
  emptyTitle = mediaCopy.list.emptyTitle,
  emptyText = mediaCopy.list.emptyText,
}: MediaFileListProps) {
  if (media.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyText} />;
  }

  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="space-y-3">
        {media.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gh-border bg-gh-surface p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.original_name}</p>
              <p className="text-sm text-gh-text-subtle">
                {isPrivateMedia(item) ? mediaCopy.list.private : mediaCopy.list.public}
              </p>
            </div>
            <SignedFileViewer media={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
