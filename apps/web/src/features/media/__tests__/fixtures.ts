import type { Media } from "../api/media";

/** Local test data built from the generated Media type; no workspace test package. */
export function makeTestMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: "media_1",
    collection: "PORTFOLIO",
    visibility: "PUBLIC",
    original_name: "portfolio piece.png",
    mime_type: "image/png",
    size_bytes: 128_000,
    url: "/media/portfolio-piece.png",
    ...overrides,
  };
}
