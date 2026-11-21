# packages/api-client

Types generated from the backend OpenAPI 3 document plus a thin fetch wrapper (envelope unwrapping, error mapping, request-id capture, idempotency header).

- Tasks: FE-004 (generation, drift check, wrapper), FE-005 (mocks in `packages/testing`).
- Generated files are committed and never edited by hand. `pnpm run generate:check` fails CI if they differ from the latest spec.
- Features never call `fetch` directly; they use this package from their `api/` folder.
- Spec: Blueprint section 7. Owner (proposed): FE2.
