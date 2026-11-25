# @gigshive/api-client

Types generated from the backend OpenAPI 3.1 document plus a thin fetch wrapper (envelope unwrapping, error mapping, request-id capture, idempotency header).

- Task: FE-004. Spec: Blueprint section 7. ADR: [0002](../docs/adr/0002-api-client-dependencies.md).
- Generated files are committed and never edited by hand. `pnpm run generate:check` regenerates into a temporary file and fails CI if the committed `src/generated/schema.ts` differs from `spec/openapi.yaml`.
- Features never call `fetch` directly; they use this package from their `api/` folder (or `src/lib`) only. ESLint and the architecture test enforce that boundary.
- No runtime dependency: the wrapper uses the platform `fetch` and `crypto.randomUUID`.

## Commands

```bash
pnpm --filter @gigshive/api-client generate        # regenerate src/generated/schema.ts
pnpm run generate:check                            # drift check (root script)
pnpm --filter @gigshive/api-client test             # wrapper contract tests
pnpm --filter @gigshive/api-client typecheck
```

## Keeping the spec current

`spec/openapi.yaml` is a reviewed copy of `gigshive_doc:packages/api-client/spec/openapi.yaml`. CI must not need a second checkout, so the mirror is committed here. When the backend contract changes, refresh the copy and regenerate types in the same commit:

```bash
cp ../gigshive_doc/packages/api-client/spec/openapi.yaml packages/api-client/spec/openapi.yaml
pnpm --filter @gigshive/api-client generate
pnpm run generate:check
```

A spec change without regenerated types is a failing check, not a silent rebuild.

## Exports

- `createApiClient({ baseUrl, fetchFn?, onUnauthorized?, getHeaders? })` — `get`, `post`, `patch`, `put`, `delete`, `getCollection`, `postCollection` and `upload`.
- `RequestOptions` supports `query`, `idempotencyKey`, `headers`, `signal` and `skipUnauthorizedHandler`. The last one lets credential checks such as login and OTP receive a 401 without a global logout or redirect (FE-014).
- Collections require a valid `meta` from the API; a missing or malformed cursor envelope raises `ApiError` with code `MALFORMED_RESPONSE` instead of inventing a page size.
- `ApiError`, `NetworkError`, `ErrorKind`, `isApiError`, `isNetworkError` — codes are branchable; UI copy maps from `kind` and never shows raw server text. `NetworkError` uses fixed public copy; the raw failure stays in `cause` for diagnostics only.
- `schema` — generated OpenAPI types, authoritative for response shapes.
