# ADR 0003: Admin console generated types and test dependencies

- Status: Accepted
- Date: 2026-11-27
- Deciders: Product owner (approval for FE-018), frontend team
- Related: ADR 0001, ADR 0002, FE-018, FE-012

## Context

`apps/admin` had server-side session proxies from FE-008, but no client-side session state, generated API types or test tooling. FE-018 adds a staff login/OTP flow, a permission-aware shell and route guards. The generated OpenAPI types are authoritative, so the app must declare `@gigshive/api-client`. Component and accessibility tests need the same Vitest/Testing Library/axe stack already used by `apps/web`.

## Decision

Declare in `apps/admin`:

- `@gigshive/api-client` for generated request/response types; app code still uses the generated shapes instead of hand-copied types.
- `@gigshive/testing` for shared fixtures and mock handlers where useful.
- `vitest`, `jsdom`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event` and `jest-axe` for DOM and accessibility tests.

These are the exact versions already declared by `apps/web` and recorded in ADR 0002. No new package version or tool enters the lockfile, and Playwright remains out of scope. Add a `test` script and a Vitest config mirroring `apps/web`.

## Consequences

- The root `pnpm run test` now runs admin tests. `pnpm run check` must pass with console tests included.
- The admin app can import generated contract types only in `src/lib` and `src/features/*/api`, as enforced by the architecture rules.
- New feature dependencies are covered by the product owner's explicit FE-018 approval; future dependency additions still need their own decision.
- FE-012 remains open for the broader test-tooling rollout; this ADR only enables the console work that depends on it.

## Alternatives considered

- Reimplement FE-018 without admin tests (rejected: money-adjacent console controls and permission gates need regression tests and axe checks).
- Hand-copy session and OTP types into the admin feature (rejected: ADR 0002 makes generated types authoritative).
- Add a different test runner (rejected: ADR 0001 selected Vitest, already used across the workspace).
