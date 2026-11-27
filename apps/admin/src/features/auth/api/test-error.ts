import { ApiError } from "@gigshive/api-client";

/**
 * Test-only factory kept in `api/` so feature tests can build real ApiError
 * instances without importing the client from a screen folder.
 */
export function makeTestApiError(params: ConstructorParameters<typeof ApiError>[0]): ApiError {
  return new ApiError(params);
}
