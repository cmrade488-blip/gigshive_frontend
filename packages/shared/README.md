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

```ts
import { formatMoney, parseMoney, nextIdempotencySession } from "@gigshive/shared";

formatMoney(150050); // "₦1,500.50"
parseMoney("1,500.50"); // { ok: true, kobo: 150050 }
```

## Scripts

```bash
pnpm --filter @gigshive/shared test
pnpm --filter @gigshive/shared typecheck
```
