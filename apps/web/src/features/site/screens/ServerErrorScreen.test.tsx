import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServerErrorScreen } from "./ServerErrorScreen";

function renderScreen(props: { digest?: string; error?: Error }): string {
  return renderToStaticMarkup(createElement(ServerErrorScreen, { ...props, standalone: true }));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ServerErrorScreen", () => {
  it("shows the Next digest as the support reference in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderScreen({ digest: "digest_abc123", error: new Error("db-password") });

    expect(html).toContain("Reference");
    expect(html).toContain("digest_abc123");
    expect(html).not.toContain("db-password");
    expect(html).not.toContain("Technical detail");
  });

  it("shows no support reference when Next supplies no digest", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderScreen({ error: new Error("db-password") });

    expect(html).not.toContain("Reference");
    expect(html).not.toContain("quote the reference below");
    expect(html).not.toContain("db-password");
  });

  it("shows technical detail only in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    const html = renderScreen({ digest: "digest_abc123", error: new Error("dev-only-detail") });

    expect(html).toContain("dev-only-detail");
    expect(html).toContain("Technical detail");
  });
});
