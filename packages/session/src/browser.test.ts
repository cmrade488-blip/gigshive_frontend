import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { csrfHeaderName, csrfHeaders, readCsrfToken } from "./browser";

describe("browser CSRF helper", () => {
  it("is client-safe: no server-only imports", async () => {
    const source = await readFile(new URL("./browser.ts", import.meta.url), "utf8");
    expect(source).not.toContain("node:crypto");
    expect(source).not.toContain('from "./csrf"');
    expect(source).not.toContain('from "./cookie"');
    expect(source).not.toContain('from "./proxy"');
    expect(csrfHeaderName).toBe("x-csrf-token");
  });

  it("returns no headers when there is no document", () => {
    expect(readCsrfToken("web")).toBeNull();
    expect(csrfHeaders("admin")).toEqual({});
  });
});
