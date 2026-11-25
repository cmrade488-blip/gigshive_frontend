# packages/shared

Pure shared utilities used by both apps and other packages.

- **Tasks:** FE-007 (money, dates, ids, idempotency, status-map). Owner (proposed): FE1.
- Must not import from apps or features.
- Money rules are product safety, not style — see AGENTS.md.

## Modules

| Import | Purpose |
|---|---|
| `@gigshive/shared/money` | Kobo integers, `formatMoney`, `parseMoney` |
| `@gigshive/shared/date` | Africa/Lagos display formatting |
| `@gigshive/shared/id` | Client-side UUID helper |
| `@gigshive/shared/idempotency` | Idempotency-Key generation and session |
| `@gigshive/shared/status-map` | Status → label/tone maps and `availableActions` |
| `@gigshive/shared/error-copy` | API error kind → fixed public copy (FE-009) |
| `@gigshive/shared/observability` | Scrubber, reporter sink, request ids, web vitals and global handlers (FE-011) |

```ts
import { formatMoney, parseMoney, nextIdempotencySession } from "@gigshive/shared";

formatMoney(150050); // "₦1,500.50"
parseMoney("1,500.50"); // { ok: true, kobo: 150050 }
```

`errorCopyFor(error)` is the shared fallback for 401/403/404/409/422/429/5xx/offline errors. It reads only the error's `kind` or `status`, never its message or code, so raw server text cannot leak into the UI. Features may override a string with more specific copy from their own `copy/` folder.

`createReporter()` produces a provider-neutral reporter for errors and web vitals. Events are scrubbed before they reach the injected `ObservabilitySink`; the sink is the seam for the tracker chosen under FOI-02. No SDK, DSN, network endpoint or browser storage is included, and form values must never be added to an event.

## Scripts

```bash
pnpm --filter @gigshive/shared test
pnpm --filter @gigshive/shared typecheck
```
