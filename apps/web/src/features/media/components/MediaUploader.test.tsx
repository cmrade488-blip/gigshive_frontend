import { makeTestApiError } from "../api/test-error";
import { makeTestMedia } from "../__tests__/fixtures";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mediaCopy } from "../copy/media";
import { MediaUploader } from "./MediaUploader";

const mocks = vi.hoisted(() => ({
  state: {
    isPending: false,
    isSuccess: false,
    data: null as unknown,
    error: null as unknown,
  },
  mutate: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("../state/use-media-upload", () => ({
  useMediaUpload: () => ({
    mutate: mocks.mutate,
    reset: mocks.reset,
    isPending: mocks.state.isPending,
    isSuccess: mocks.state.isSuccess,
    data: mocks.state.data,
    error: mocks.state.error,
  }),
}));

beforeEach(() => {
  mocks.state.isPending = false;
  mocks.state.isSuccess = false;
  mocks.state.data = null;
  mocks.state.error = null;
  mocks.mutate.mockReset();
  mocks.reset.mockReset();
});

describe("MediaUploader", () => {
  it("renders an accessible labelled file input", async () => {
    const { container } = render(<MediaUploader collection="PORTFOLIO" />);

    expect(screen.getByLabelText(mediaCopy.uploader.label("PORTFOLIO"))).toHaveAttribute(
      "type",
      "file",
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it("uploads the selected file with its collection", async () => {
    const user = userEvent.setup();
    render(<MediaUploader collection="KYC_DOCUMENT" accept="image/*,.pdf" />);
    const file = new File(["id"], "id.png", { type: "image/png" });

    await user.upload(screen.getByLabelText(mediaCopy.uploader.label("KYC_DOCUMENT")), file);

    expect(mocks.mutate).toHaveBeenCalledWith(
      { file, collection: "KYC_DOCUMENT" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(screen.getByLabelText(mediaCopy.uploader.label("KYC_DOCUMENT"))).toHaveAttribute(
      "accept",
      "image/*,.pdf",
    );
  });

  it("shows a loading state while uploading", () => {
    mocks.state.isPending = true;
    render(<MediaUploader collection="PORTFOLIO" />);

    expect(screen.getByRole("status")).toHaveTextContent(mediaCopy.uploader.uploading);
    expect(screen.getByLabelText(mediaCopy.uploader.label("PORTFOLIO"))).toBeDisabled();
  });

  it("shows the uploaded file name and reports success", async () => {
    const media = makeTestMedia({ original_name: "brand.png" });
    mocks.state.isSuccess = true;
    mocks.state.data = media;
    mocks.mutate.mockImplementation((_input: unknown, options: unknown) => {
      const callbacks = options as { onSuccess?: (value: unknown) => void };
      callbacks.onSuccess?.(media);
    });
    const onUploaded = vi.fn();
    const user = userEvent.setup();
    render(<MediaUploader collection="PORTFOLIO" onUploaded={onUploaded} />);

    await user.upload(
      screen.getByLabelText(mediaCopy.uploader.label("PORTFOLIO")),
      new File(["x"], "brand.png", { type: "image/png" }),
    );

    expect(screen.getByText(mediaCopy.uploader.success("brand.png"))).toBeInTheDocument();
    expect(onUploaded).toHaveBeenCalledWith(media);
  });

  it("maps 422 details to the file field without backend text", () => {
    mocks.state.error = makeTestApiError({
      status: 422,
      code: "RAW_CODE",
      message: "RAW BACKEND MESSAGE",
      details: { file: ["RAW FIELD DETAIL"] },
      requestId: "req_1",
    });
    render(<MediaUploader collection="PORTFOLIO" />);

    expect(screen.getByLabelText(mediaCopy.uploader.label("PORTFOLIO"))).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText(mediaCopy.uploader.fileInvalid)).toBeInTheDocument();
    expect(screen.getByText(mediaCopy.errors.kinds.validation.title)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("RAW");
  });

  it("backs off from retrying after 429", () => {
    vi.useFakeTimers();
    try {
      mocks.state.error = makeTestApiError({
        status: 429,
        code: "TOO_MANY_REQUESTS",
        message: "RAW BACKEND MESSAGE",
        requestId: "req_429",
        retryAfterSeconds: 2,
      });
      render(<MediaUploader collection="PORTFOLIO" />);

      expect(screen.getByRole("button", { name: mediaCopy.uploader.cooldown(2) })).toBeDisabled();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", { name: mediaCopy.uploader.retry })).toBeEnabled();
      expect(document.body).not.toHaveTextContent("RAW BACKEND MESSAGE");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows a forbidden state without a misleading retry", () => {
    mocks.state.error = makeTestApiError({
      status: 403,
      code: "FORBIDDEN",
      message: "RAW BACKEND MESSAGE",
      requestId: "req_403",
    });
    render(<MediaUploader collection="PORTFOLIO" />);

    expect(screen.getByText(mediaCopy.errors.kinds.forbidden.title)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: mediaCopy.uploader.retry })).toBeNull();
  });

  it("keeps retry only for retryable upload failures", () => {
    mocks.state.error = makeTestApiError({
      status: 500,
      code: "RAW_CODE",
      message: "RAW BACKEND MESSAGE",
      requestId: "req_500",
    });
    render(<MediaUploader collection="PORTFOLIO" />);

    expect(
      screen.getByRole("button", { name: mediaCopy.errors.kinds.server.actionLabel }),
    ).toBeEnabled();
  });
});
