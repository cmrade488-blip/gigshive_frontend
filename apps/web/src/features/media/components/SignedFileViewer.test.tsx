import { makeTestApiError } from "../api/test-error";
import { makeTestMedia } from "../__tests__/fixtures";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mediaCopy } from "../copy/media";
import { formatMediaExpiry } from "../schemas/media";
import { SignedFileViewer } from "./SignedFileViewer";

const mocks = vi.hoisted(() => ({
  state: {
    status: "idle" as string,
    blobUrl: null as string | null,
    expiresAt: null as string | null,
    error: null as unknown,
  },
  open: vi.fn(),
  close: vi.fn(),
}));

vi.mock("../state/use-private-file", () => ({
  usePrivateFile: () => ({ ...mocks.state, open: mocks.open, close: mocks.close }),
}));

beforeEach(() => {
  mocks.state.status = "idle";
  mocks.state.blobUrl = null;
  mocks.state.expiresAt = null;
  mocks.state.error = null;
  mocks.open.mockReset();
  mocks.close.mockReset();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("SignedFileViewer", () => {
  it("opens public media directly without a signed request", async () => {
    const user = userEvent.setup();
    const media = makeTestMedia({
      visibility: "PUBLIC",
      url: "/media/portfolio.png",
      mime_type: "image/png",
      original_name: "portfolio.png",
    });
    render(<SignedFileViewer media={media} />);

    await user.click(screen.getByRole("button", { name: mediaCopy.viewer.open("portfolio.png") }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText(mediaCopy.viewer.imageAlt("portfolio.png"))).toHaveAttribute(
      "src",
      "/media/portfolio.png",
    );
    expect(screen.getByText(mediaCopy.viewer.publicNote)).toBeInTheDocument();
    expect(mocks.open).not.toHaveBeenCalled();
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it("shows a private blob preview and expiry without the signed URL", async () => {
    const user = userEvent.setup();
    mocks.state.status = "ready";
    mocks.state.blobUrl = "blob:private-file";
    mocks.state.expiresAt = "2030-01-01T00:00:00.000Z";
    const media = makeTestMedia({ visibility: "PRIVATE", url: null, original_name: "id.png" });
    const signedUrl = "https://files.example.test/signed-secret";
    render(<SignedFileViewer media={media} />);

    await user.click(screen.getByRole("button", { name: mediaCopy.viewer.open("id.png") }));

    expect(mocks.open).toHaveBeenCalledTimes(1);
    expect(screen.getByAltText(mediaCopy.viewer.imageAlt("id.png"))).toHaveAttribute(
      "src",
      "blob:private-file",
    );
    expect(screen.getByText(mediaCopy.viewer.privateNote)).toBeInTheDocument();
    const expiry = formatMediaExpiry("2030-01-01T00:00:00.000Z");
    if (!expiry) {
      throw new Error("expiry was not formatted");
    }
    expect(screen.getByText(mediaCopy.viewer.expires(expiry))).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(signedUrl);
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("shows a loading state while opening a private file", async () => {
    const user = userEvent.setup();
    mocks.state.status = "loading";
    render(<SignedFileViewer media={makeTestMedia({ visibility: "PRIVATE", url: null })} />);

    await user.click(
      screen.getByRole("button", { name: mediaCopy.viewer.open("portfolio piece.png") }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(mediaCopy.viewer.loading);
  });

  it("shows fixed non-retryable error copy for a private file", async () => {
    const user = userEvent.setup();
    mocks.state.status = "error";
    mocks.state.error = makeTestApiError({
      status: 404,
      code: "NOT_FOUND",
      message: "RAW SIGNED URL",
      requestId: "req_404",
    });
    render(<SignedFileViewer media={makeTestMedia({ visibility: "PRIVATE", url: null })} />);

    await user.click(
      screen.getByRole("button", { name: mediaCopy.viewer.open("portfolio piece.png") }),
    );
    expect(screen.getByText(mediaCopy.errors.kinds.notFound.title)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("RAW SIGNED URL");
    expect(screen.queryByRole("button", { name: mediaCopy.viewer.retry })).toBeNull();
  });

  it("retries a private file after a retryable failure", async () => {
    const user = userEvent.setup();
    mocks.state.status = "error";
    mocks.state.error = makeTestApiError({
      status: 503,
      code: "RAW_CODE",
      message: "RAW SIGNED URL",
      requestId: "req_503",
    });
    render(<SignedFileViewer media={makeTestMedia({ visibility: "PRIVATE", url: null })} />);

    await user.click(
      screen.getByRole("button", { name: mediaCopy.viewer.open("portfolio piece.png") }),
    );
    expect(screen.getByText(mediaCopy.errors.kinds.server.title)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: mediaCopy.errors.kinds.server.actionLabel }),
    );
    expect(mocks.open).toHaveBeenCalledTimes(2);
  });

  it("shows the not-found state when public media has no URL", async () => {
    const user = userEvent.setup();
    render(<SignedFileViewer media={makeTestMedia({ visibility: "PUBLIC", url: null })} />);

    await user.click(
      screen.getByRole("button", { name: mediaCopy.viewer.open("portfolio piece.png") }),
    );

    expect(screen.getByText(mediaCopy.errors.kinds.notFound.title)).toBeInTheDocument();
    expect(mocks.open).not.toHaveBeenCalled();
  });
});
