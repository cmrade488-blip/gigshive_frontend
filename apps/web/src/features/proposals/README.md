# proposals (apps/web)

**Purpose:** Proposal or application form, my proposals, client review list, accept, reject, withdraw.

**API used:** POST /jobs/{id}/proposals; PATCH /proposals/{id}; POST /proposals/{id}/attachments; GET /jobs/{id}/proposals; POST /proposals/{id}/accept, /reject, /withdraw

**Business rules reflected:** BR-11 to BR-19

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
