# auth (apps/web)

**Purpose:** Registration, email and phone OTP, login, logout, password reset, account settings, session bootstrap and route guards. Admin: staff login then OTP.

| | |
|---|---|
| Surface | web |
| Tasks | FE-013 to FE-017, FE-019 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.3](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | BR-02, BR-05, BR-41 |
| Status | FE-013, FE-014 and FE-015 done: register/email OTP, login/logout and password recovery/change; remaining auth tasks not started |

## API used

POST /auth/register, /auth/verify-email, /auth/login, /auth/logout, /auth/forgot-password, /auth/reset-password; GET /me; admin: POST /admin/auth/login, /admin/auth/verify-otp

Endpoint paths come from the generated OpenAPI types. Only `api/` calls the client.

FE-013 collects only `email`, `password` and optional `phone`: the design's full name and goal choice are not accepted by `/auth/register` and were omitted by owner decision rather than invented. Post-registration goal handling needs a backend contract.

FE-013 uses pure validators in `schemas/` because React Hook Form and Zod are not installed; adding them requires an ADR.

FE-014 adds login/logout through the existing same-origin session routes. The return path accepts only same-site paths and falls back to `/dashboard` (the design destination, not built yet); the header uses a narrow `/me` check for sign-out, while full bootstrap, guards and 401 handling remain FE-017.

FE-015 adds `/forgot-password` and `/reset-password` (same-origin forwarders) and `ChangePasswordForm` for FE-016's `/settings/account` page. The reset token is read from the link, removed from the URL immediately and held only in component memory. Forgot-password always shows one confirmation so the UI cannot reveal whether an account exists; 429 uses `Retry-After`, and raw backend text is never rendered. A wrong current password is a 422 field error and keeps the session.

## States to handle

Loading, empty, error, forbidden, plus the entity's status set (see the Data and State Design, section 5). Every screen needs tests for each.

## Layout

```
api/          query and mutation hooks
components/   presentational components for this feature
screens/      composed screens used by routes
schemas/      Zod schemas and FormValues types
state/        UI state machines or reducers, if any
copy/         user-facing text keys (externalised; backend error codes map here)
__tests__/
index.ts      the public surface; other features import only this
```

## Rules for this folder

- Never import another feature's internals; use its `index.ts` or a shared package.
- No `fetch` outside the API client; no business logic in route files.
- Amounts come from the API; format with the shared money utility.
- Keep this README current: update Status and Tasks when work lands.
