# admin-ops (apps/admin)

**Purpose:** Staff console: dashboard, review queues, finance read models, configuration, audit log, staff accounts.

**API used:** Endpoints under /admin (Backend Blueprint section 9.9)

**Business rules reflected:** BR-40, BR-41, BR-42

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
