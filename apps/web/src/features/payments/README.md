# payments (apps/web)

**Purpose:** Fund contract summary, hosted payment redirect, return page with status polling, retry.

**API used:** POST /contracts/{id}/fund (Idempotency-Key required); GET /contracts/{id}

**Business rules reflected:** BR-21, BR-25, BR-30

**States to handle:** loading, empty, error, forbidden (see Frontend Blueprint section 9.3).

## Layout

- `api/`: query and mutation hooks (the only place that calls the API client)
- `components/`: feature-specific presentational components
- `screens/`: composed screens used by routes
- `schemas/`: Zod schemas and form types
- `state/`: UI state machines or reducers, if any
- `copy/`: user-facing text keys
- `index.ts`: public surface of the feature
- `__tests__/`

Boundary rule: never import another feature's internals; use its `index.ts` or a shared package.
