import { makeTestMedia } from "../__tests__/fixtures";
import { describe, expect, it } from "vitest";

import { formatMediaExpiry, isPrivateMedia, mediaViewKind, publicMediaUrl } from "./media";

describe("media projections", () => {
  it("returns a public URL only for public media with a URL", () => {
    expect(publicMediaUrl(makeTestMedia({ visibility: "PUBLIC", url: "/media/a.png" }))).toBe(
      "/media/a.png",
    );
    expect(publicMediaUrl(makeTestMedia({ visibility: "PUBLIC", url: null }))).toBeNull();
    expect(publicMediaUrl(makeTestMedia({ visibility: "PUBLIC", url: "" }))).toBeNull();
    expect(
      publicMediaUrl(makeTestMedia({ visibility: "PRIVATE", url: "/media/a.png" })),
    ).toBeNull();
  });

  it("identifies private media from the API-owned visibility", () => {
    expect(isPrivateMedia(makeTestMedia({ visibility: "PRIVATE" }))).toBe(true);
    expect(isPrivateMedia(makeTestMedia({ visibility: "PUBLIC" }))).toBe(false);
  });

  it("uses MIME type rather than a file name guess for image previews", () => {
    expect(mediaViewKind(makeTestMedia({ mime_type: "image/png" }))).toBe("IMAGE");
    expect(mediaViewKind(makeTestMedia({ mime_type: "application/pdf" }))).toBe("FILE");
  });

  it("drops missing and malformed expiry values", () => {
    expect(formatMediaExpiry("2030-01-01T00:00:00.000Z")).toBeTypeOf("string");
    expect(formatMediaExpiry(null)).toBeNull();
    expect(formatMediaExpiry(undefined)).toBeNull();
    expect(formatMediaExpiry("not-a-date")).toBeNull();
  });
});
