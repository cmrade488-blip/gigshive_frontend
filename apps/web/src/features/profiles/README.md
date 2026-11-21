# profiles (apps/web)

**Purpose:** Profile creation wizard, edit, submit for review, status banner, public worker list and detail.

**API used:** POST /profiles; PATCH /profiles/{id}; POST /profiles/{id}/submit; GET /workers; GET /workers/{id}; GET /me

**Business rules reflected:** BR-01, BR-02, BR-03, BR-04

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
