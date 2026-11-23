import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * Shared MSW server for unit and integration tests. Browser workers register
 * `handlers` directly; this node server is for Vitest only.
 */
export const server = setupServer(...handlers);
