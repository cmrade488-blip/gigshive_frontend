# auth (apps/web)

**Purpose:** Registration, email and phone OTP, login, logout, password reset, account settings, session bootstrap and route guards. Admin: staff login then OTP.

| | |
|---|---|
| Surface | web |
| Tasks | FE-013 to FE-017, FE-019 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.3](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | BR-02, BR-05, BR-41 |
| Status | FE-013 done: register and email OTP screens; remaining auth tasks not started |

## API used

POST /auth/register, /auth/verify-email, /auth/login, /auth/logout, /auth/forgot-password, /auth/reset-password; GET /me; admin: POST /admin/auth/login, /admin/auth/verify-otp

Endpoint paths come from the generated OpenAPI types. Only `api/` calls the client.

FE-013 collects only `email`, `password` and optional `phone`: the design's full name and goal choice are not accepted by `/auth/register` and were omitted by owner decision rather than invented. Post-registration goal handling needs a backend contract.

FE-013 uses pure validators in `schemas/` because React Hook Form and Zod are not installed; adding them requires an ADR.

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
