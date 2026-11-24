import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("error boundaries", () => {
  it.each(["error.tsx", "global-error.tsx"])("%s forwards the real Next digest", (file) => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");

    expect(source).toContain("digest={error.digest}");
  });
});
