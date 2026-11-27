import { type schema } from "@gigshive/api-client";

import { csrfHeaders, sessionClient } from "@/lib/api";

export type Media = NonNullable<schema.components["schemas"]["Media"]>;
export type MediaCollection = Media["collection"];

export type SignedUrlData = NonNullable<
  schema.paths["/media/{id}/signed-url"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

export interface PrivateFile {
  blob: Blob;
  expiresAt: string | null;
}

/**
 * Failure to read a private file after the signed URL was issued. The URL and
 * the upstream response text are deliberately absent from this error.
 */
export class MediaFetchError extends Error {
  readonly status: number | null;

  constructor(status: number | null) {
    super("The file could not be opened.");
    this.name = "MediaFetchError";
    this.status = status;
  }
}

/** Multipart upload through the session proxy; visibility stays API-owned. */
export async function uploadMedia(file: File, collection: MediaCollection): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("collection", collection);

  return sessionClient.upload<Media>("/media", formData, {
    headers: await csrfHeaders(),
  });
}

/**
 * Requests a short-lived URL, immediately reads the bytes and returns only a
 * Blob. The signed URL is never stored, logged, cached, rendered or placed in
 * browser navigation: it exists only as a local value for this one request.
 */
export async function fetchPrivateFile(mediaId: string): Promise<PrivateFile> {
  const signed = (
    await sessionClient.get<SignedUrlData>(`/media/${encodeURIComponent(mediaId)}/signed-url`)
  ).data;
  const url = signed?.url;
  if (!url) {
    throw new MediaFetchError(null);
  }

  const response = await fetch(url, {
    cache: "no-store",
    credentials: "omit",
  });
  if (!response.ok) {
    throw new MediaFetchError(response.status);
  }

  return {
    blob: await response.blob(),
    expiresAt: signed?.expires_at ?? null,
  };
}
