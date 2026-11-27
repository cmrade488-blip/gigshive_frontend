import { makeTestMedia } from "../__tests__/fixtures";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { mediaCopy } from "../copy/media";
import { MediaFileList } from "./MediaFileList";

vi.mock("./SignedFileViewer", () => ({
  SignedFileViewer: ({ media }: { media: { original_name: string } }) => (
    <button type="button">Open {media.original_name}</button>
  ),
}));

describe("MediaFileList", () => {
  it("shows an empty state when there are no files", async () => {
    const { container } = render(<MediaFileList media={[]} />);

    expect(screen.getByText(mediaCopy.list.emptyTitle)).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("labels public and private files from the API projection", async () => {
    const { container } = render(
      <MediaFileList
        media={[
          makeTestMedia({ id: "media_public", original_name: "cover.png" }),
          makeTestMedia({
            id: "media_private",
            original_name: "id.png",
            visibility: "PRIVATE",
            url: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText(mediaCopy.list.public)).toBeInTheDocument();
    expect(screen.getByText(mediaCopy.list.private)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open cover.png" })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });
});
