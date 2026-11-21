# auth (apps/web)

**Purpose:** Registration, email and phone OTP, login, logout, password reset, account settings. Admin: staff login then OTP.

**API used:** POST /auth/register, /auth/verify-email, /auth/login, /auth/logout, /auth/forgot-password, /auth/reset-password; GET /me; admin: POST /admin/auth/login, /admin/auth/verify-otp

**Business rules reflected:** BR-02, BR-05, BR-41

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
