# jobs (apps/web)

**Purpose:** Public job list and detail, job composer (priced or application mode, screening questions), my jobs, close and cancel. Admin: moderation.

**API used:** GET /jobs; GET /jobs/{id}; POST /jobs; PATCH /jobs/{id}; POST /jobs/{id}/publish, /close, /cancel

**Business rules reflected:** BR-10, BR-14, BR-15, BR-16, BR-17

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
