import { type schema } from "@gigshive/api-client";

import { sessionClient } from "@/lib/api";

export type Category = NonNullable<schema.components["schemas"]["Category"]>;
export type CategoryType = Category["category_type"];
export type CategoriesData = NonNullable<
  schema.paths["/categories"]["get"]["responses"][200]["content"]["application/json"]["data"]
>;

/** Reads the API-owned category tree; visibility and ordering stay backend decisions. */
export async function getCategories(): Promise<Category[]> {
  const response = await sessionClient.get<CategoriesData>("/categories");
  return response.data ?? [];
}
