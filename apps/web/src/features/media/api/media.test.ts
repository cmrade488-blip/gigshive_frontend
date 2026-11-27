import { makeTestMedia } from "../__tests__/fixtures";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchPrivateFile, MediaFetchError, uploadMedia } from "./media";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  upload: vi.fn(),
  csrfHeaders: vi.fn(async () => ({ "X-CSRF-Token": "test-token" })),
  fetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  sessionClient: { get: mocks.get, upload: mocks.upload },
  csrfHeaders: mocks.csrfHeaders,
}));

beforeEach(() => {
  mocks.get.mockReset();
  mocks.upload.mockReset();
  mocks.fetch.mockReset();
  vi.stubGlobal("fetch", mocks.fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("media api", () => {
  it("posts one file and its collection with CSRF headers", async () => {
    const media = makeTestMedia();
    const file = new File(["image"], "piece.png", { type: "image/png" });
    mocks.upload.mockResolvedValue(media);

    await expect(uploadMedia(file, "PORTFOLIO")).resolves.toEqual(media);

    const call = mocks.upload.mock.calls[0];
    if (!call) {
      throw new Error("upload was not called");
    }
    const [path, formData, options] = call as [string, FormData, Record<string, unknown>];
    expect(path).toBe("/media");
    expect(formData.get("collection")).toBe("PORTFOLIO");
    expect(formData.get("file")).toBeInstanceOf(File);
    expect((formData.get("file") as File).name).toBe("piece.png");
    expect(options).toEqual({ headers: { "X-CSRF-Token": "test-token" } });
  });

  it("reads a private file once and returns only the blob and expiry", async () => {
    const blob = new Blob(["image"], { type: "image/png" });
    mocks.get.mockResolvedValue({
      data: { url: "/mock/private/file.png", expires_at: "2030-01-01T00:00:00.000Z" },
    });
    mocks.fetch.mockResolvedValue({ ok: true, blob: async () => blob });

    const result = await fetchPrivateFile("media_1");

    expect(mocks.get).toHaveBeenCalledWith("/media/media_1/signed-url");
    expect(mocks.fetch).toHaveBeenCalledWith("/mock/private/file.png", {
      cache: "no-store",
      credentials: "omit",
    });
    expect(result.blob).toBe(blob);
    expect(result.expiresAt).toBe("2030-01-01T00:00:00.000Z");
    expect(result).not.toHaveProperty("url");
  });

  it("encodes the media id in the signed-url path", async () => {
    mocks.get.mockResolvedValue({ data: undefined });

    await expect(fetchPrivateFile("media/one")).rejects.toBeInstanceOf(MediaFetchError);
    expect(mocks.get).toHaveBeenCalledWith("/media/media%2Fone/signed-url");
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("rejects a missing signed URL without exposing it", async () => {
    mocks.get.mockResolvedValue({ data: { expires_at: "2030-01-01T00:00:00.000Z" } });

    await expect(fetchPrivateFile("media_1")).rejects.toMatchObject({
      name: "MediaFetchError",
      status: null,
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("maps a failed file read to a status-only error", async () => {
    mocks.get.mockResolvedValue({ data: { url: "/mock/private/file.png" } });
    mocks.fetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(fetchPrivateFile("media_1")).rejects.toMatchObject({
      name: "MediaFetchError",
      status: 404,
    });
  });
});
