/**
 * Sample-data flag (review fixes A3/A4).
 *
 * Development shows sample records by default. Production must opt in
 * explicitly with NEXT_PUBLIC_SHOW_SAMPLE_DATA=true; the final sample-data
 * policy is still an owner decision (A4). Next inlines both variables at
 * build time, so this is safe to call from server and client components.
 */
export function isSampleDataEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_SAMPLE_DATA === "true"
  );
}
