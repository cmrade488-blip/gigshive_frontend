import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as MediaApi from "../api/media";
import { usePrivateFile } from "./use-private-file";

const mocks = vi.hoisted(() => ({
  fetchPrivateFile: vi.fn(),
  createObjectURL: vi.fn(() => "blob:test"),
  revokeObjectURL: vi.fn(),
}));

vi.mock("../api/media", async (importOriginal) => ({
  ...(await importOriginal<typeof MediaApi>()),
  fetchPrivateFile: mocks.fetchPrivateFile,
}));

beforeEach(() => {
  mocks.fetchPrivateFile.mockReset();
  mocks.createObjectURL.mockClear();
  mocks.revokeObjectURL.mockClear();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: mocks.createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: mocks.revokeObjectURL,
  });
});

describe("usePrivateFile", () => {
  it("starts idle without requesting anything", () => {
    const { result } = renderHook(() => usePrivateFile("media_1"));

    expect(result.current.status).toBe("idle");
    expect(result.current.blobUrl).toBeNull();
    expect(mocks.fetchPrivateFile).not.toHaveBeenCalled();
  });

  it("requests a fresh file and exposes only a blob URL", async () => {
    const file: MediaApi.PrivateFile = {
      blob: new Blob(["image"], { type: "image/png" }),
      expiresAt: "2030-01-01T00:00:00.000Z",
    };
    mocks.fetchPrivateFile.mockResolvedValue(file);
    const { result } = renderHook(() => usePrivateFile("media_1"));

    await act(async () => {
      await result.current.open();
    });

    expect(mocks.fetchPrivateFile).toHaveBeenCalledWith("media_1");
    expect(result.current).toMatchObject({
      status: "ready",
      blobUrl: "blob:test",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
    expect(mocks.createObjectURL).toHaveBeenCalledWith(file.blob);
  });

  it("revokes the blob URL on close and unmount", async () => {
    mocks.fetchPrivateFile.mockResolvedValue({
      blob: new Blob(["image"]),
      expiresAt: null,
    });
    const { result, unmount } = renderHook(() => usePrivateFile("media_1"));

    await act(async () => {
      await result.current.open();
    });
    await act(async () => {
      result.current.close();
    });
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    expect(result.current.status).toBe("idle");

    await act(async () => {
      await result.current.open();
    });
    mocks.revokeObjectURL.mockClear();
    unmount();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });

  it("drops a stale response after the media id changes", async () => {
    let resolveFile: ((value: MediaApi.PrivateFile) => void) | undefined;
    mocks.fetchPrivateFile.mockImplementation(
      () =>
        new Promise<MediaApi.PrivateFile>((resolve) => {
          resolveFile = resolve;
        }),
    );
    const { result, rerender } = renderHook(({ id }) => usePrivateFile(id), {
      initialProps: { id: "media_a" },
    });

    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.open();
    });
    rerender({ id: "media_b" });
    await act(async () => {
      resolveFile?.({ blob: new Blob(["image"]), expiresAt: null });
      await pending;
    });

    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.blobUrl).toBeNull();
    expect(mocks.createObjectURL).not.toHaveBeenCalled();
  });

  it("keeps a status-only failure in error state", async () => {
    const failure = new MediaApi.MediaFetchError(404);
    mocks.fetchPrivateFile.mockRejectedValue(failure);
    const { result } = renderHook(() => usePrivateFile("media_1"));

    await act(async () => {
      await result.current.open();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe(failure);
    expect(result.current.blobUrl).toBeNull();
  });
});
