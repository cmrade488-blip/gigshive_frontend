import { formatDate } from "@gigshive/shared/date";

import type { Media } from "../api/media";

export type MediaViewKind = "IMAGE" | "FILE";

/** Public URLs come from /me-style projections; private files never use one. */
export function publicMediaUrl(media: Media): string | null {
  if (media.visibility !== "PUBLIC") {
    return null;
  }
  return typeof media.url === "string" && media.url.length > 0 ? media.url : null;
}

export function isPrivateMedia(media: Media): boolean {
  return media.visibility === "PRIVATE";
}

/** Image metadata is API-owned; no extension is guessed from the file name. */
export function mediaViewKind(media: Media): MediaViewKind {
  return media.mime_type.startsWith("image/") ? "IMAGE" : "FILE";
}

/** A malformed API date is dropped rather than rendered as a raw string. */
export function formatMediaExpiry(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    return formatDate(value);
  } catch {
    return null;
  }
}
