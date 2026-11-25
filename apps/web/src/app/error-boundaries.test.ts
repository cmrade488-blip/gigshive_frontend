import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("error boundaries", () => {
  it.each(["error.tsx", "global-error.tsx"])("%s forwards the real Next digest", (file) => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");

    expect(source).toContain("digest={error.digest}");
  });
});

describe("admin error boundaries", () => {
  const adminApp = join(process.cwd(), "..", "admin", "src", "app");

  it.each(["error.tsx", "global-error.tsx"])(
    "%s uses shared public copy and never renders server text",
    (file) => {
      const source = readFileSync(join(adminApp, file), "utf8");

      expect(source).toContain('"use client"');
      expect(source).toContain("errorCopy.server");
      expect(source).toContain("ErrorState");
      expect(source).toContain("reference={error.digest}");
      expect(source).not.toContain("error.message");
    },
  );

  it("not-found.tsx uses the shared not-found copy", () => {
    const source = readFileSync(join(adminApp, "not-found.tsx"), "utf8");

    expect(source).toContain("errorCopy.notFound");
    expect(source).toContain("NotFoundState");
    expect(source).not.toContain("error.message");
  });
});
