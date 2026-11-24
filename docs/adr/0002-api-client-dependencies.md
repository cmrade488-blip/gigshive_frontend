# ADR 0002: API client generation and test dependencies

- Status: Accepted
- Date: 2026-11-23
- Deciders: Product owner (approval to add the dependencies), frontend team
- Related: ADR 0001 (frontend stack), Blueprint 7.2–7.6, FE-004, FE-005, FE-012

## Context

ADR 0001 selected `openapi-typescript` for generating types from the backend OpenAPI document and Vitest for unit tests, but no package in this repository declared those dependencies: `packages/api-client` and `packages/testing` were README-only and `pnpm run generate:check` was a no-op. FE-004 needs to generate types from the committed spec, fail CI on drift, and test the fetch wrapper; FE-005 and FE-012 build on the same tooling.

The spec is available at `gigshive_doc:packages/api-client/spec/openapi.yaml` (OpenAPI 3.1). CI must not depend on cloning a second repository, so a reviewed copy is committed here and regenerated from that file.

## Decision

Add to `packages/api-client` as devDependencies:

- `openapi-typescript` — generate `src/generated/schema.ts` from `spec/openapi.yaml`; the output is committed and never edited by hand. `pnpm run generate:check` regenerates into a temporary file and fails if it differs from the committed output.
- `vitest` — unit tests for the fetch wrapper (envelope unwrapping, error mapping, request id, idempotency header, retry hints and network failures).
- The existing workspace tools `@gigshive/config`, `eslint` and `typescript`, matching `packages/shared`.
- `msw` in `packages/testing` for the FE-005 mock layer. MSW is already part of the test stack approved in ADR 0001; this records the concrete dependency and keeps the mock endpoints on the generated contract.
- `vitest` in `apps/web` (review fix A2) for pure unit tests in features — the contact validator and the development-only submit mock. B1 extends the same config with jsdom, Testing Library and axe for component and accessibility tests. It is the same runner and version already used by `packages/shared`, not a new tool.

The spec copy is a mirror of gigshive_doc. When the backend contract changes, refresh the copy in a dedicated commit and regenerate types in the same change. Shared packages may import `@gigshive/api-client` for those types; only app code outside `src/features/<name>/api` and `src/lib` remains barred (enforced by the architecture test).

## Consequences

- Adding dependencies and enabling generation changes the local gate: `pnpm run generate:check` now runs for real and must be green before a push.
- Generated types become the authoritative response shapes for all features. Mocks and hand-written placeholder types that disagree with them must be corrected, not the other way round.
- A spec change in gigshive_doc does not automatically reach this repository; the mirror commit is the integration point and must be explicit.
- No runtime dependency is added: the client uses the platform `fetch` and `crypto.randomUUID`.
- `apps/web` now has a `test` script, so the root `pnpm run test` runs feature unit tests as well as package tests.

## Alternatives considered

- Hand-write response types in each feature (rejected: drift from the API, duplicated security-sensitive projections and no drift signal).
- Fetch the spec from gigshive_doc during CI (rejected: CI should not need a second checkout or network access to build, and a silent upstream change would make builds non-reproducible).
- Use a different generator or test runner (rejected: ADR 0001 already selected these, and both are already used in the gigshive_doc workspace).
