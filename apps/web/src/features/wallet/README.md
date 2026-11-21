# wallet (apps/web)

**Purpose:** Wallet balance and statement, bank accounts (resolve, confirm, save), payouts.

**API used:** GET /wallet; GET /wallet/transactions; GET/POST /bank-accounts; DELETE /bank-accounts/{id}; POST /payouts (Idempotency-Key required); GET /payouts

**Business rules reflected:** BR-31 to BR-35, BR-42

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
