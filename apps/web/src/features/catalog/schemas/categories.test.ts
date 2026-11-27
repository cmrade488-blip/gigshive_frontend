import { describe, expect, it } from "vitest";

import { makeTestCategory } from "../__tests__/fixtures";
import { buildCategoryTree, categoryName, isCategoryType } from "./categories";

describe("category schema helpers", () => {
  it("builds a sorted two-level tree from the flat generated response", () => {
    const parent = makeTestCategory({ id: "cat_parent", name: "Design", sort_order: 2 });
    const firstChild = makeTestCategory({
      id: "cat_branding",
      name: "Branding",
      parent_id: parent.id,
      sort_order: 2,
    });
    const secondChild = makeTestCategory({
      id: "cat_animation",
      name: "Animation",
      parent_id: parent.id,
      sort_order: 1,
    });
    const otherRoot = makeTestCategory({ id: "cat_web", name: "Web", sort_order: 1 });
    const hidden = makeTestCategory({ id: "cat_hidden", name: "Hidden", is_active: false });

    const tree = buildCategoryTree([parent, firstChild, secondChild, otherRoot, hidden]);

    expect(tree.map((node) => node.category.name)).toEqual(["Web", "Design"]);
    expect(tree[1]?.children.map((node) => node.category.name)).toEqual(["Animation", "Branding"]);
    expect(JSON.stringify(tree)).not.toContain("Hidden");
  });

  it("shows an active category with a missing parent as a root", () => {
    const orphan = makeTestCategory({
      id: "cat_orphan",
      name: "Specialist work",
      parent_id: "cat_missing",
    });

    expect(buildCategoryTree([orphan]).map((node) => node.category.id)).toEqual(["cat_orphan"]);
  });

  it("applies an optional category type filter", () => {
    const digital = makeTestCategory({ id: "cat_digital_item" });
    const physical = makeTestCategory({
      id: "cat_physical_item",
      name: "Home repair",
      category_type: "PHYSICAL",
    });

    expect(
      buildCategoryTree([digital, physical], "PHYSICAL").map((node) => node.category.id),
    ).toEqual(["cat_physical_item"]);
  });

  it("resolves names without exposing unknown ids", () => {
    const category = makeTestCategory({ id: "cat_known", name: "Writing" });

    expect(categoryName([category], "cat_known")).toBe("Writing");
    expect(categoryName([category], "cat_unknown")).toBeNull();
  });

  it("recognises only generated category types", () => {
    expect(isCategoryType("DIGITAL")).toBe(true);
    expect(isCategoryType("PHYSICAL")).toBe(true);
    expect(isCategoryType("digital")).toBe(false);
  });
});
