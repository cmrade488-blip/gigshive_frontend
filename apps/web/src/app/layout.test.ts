import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("root layout imports", () => {
  it("uses the narrow site system entry instead of the full barrel", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layout).toContain('from "@/features/site/system"');
    expect(layout).not.toContain('from "@/features/site"');
  });

  it("keeps the site system entry limited to what the layout needs", () => {
    const entry = readFileSync(join(process.cwd(), "src/features/site/system.ts"), "utf8");

    expect(entry).toContain('export { siteCopy } from "./copy/site";');
    expect(entry).toContain('export { MaintenanceScreen } from "./screens/MaintenanceScreen";');
    expect(entry.match(/^export /gm)).toHaveLength(2);
  });
});
