# @gigshive/testing

MSW handlers built from the OpenAPI endpoint catalogue, plus typed fixture factories.

- Tasks: FE-005 (this package). FE-012 adds the render/axe helpers.
- Spec: Blueprint section 11. Dependency decision: [ADR 0002](../docs/adr/0002-api-client-dependencies.md).
- Fixtures return shapes from `@gigshive/api-client`'s generated schema, so a contract change fails compilation here rather than drifting in tests.
- No real personal, bank or identity data: account and identifier numbers are last-four only. Money is integer kobo.

## Exports

```ts
import { makeJob, makeProfile, resetHandlers } from "@gigshive/testing";
import { server } from "@gigshive/testing/server";
```

- `fixtures` — `makeMoney`, `makeProfile`, `makeProfileSummary`, `makeJob`, `makeProposal`, `makeContract`, `makeWallet`, `makeTransaction`, `makeBankAccount`, `makePayout`, `makeSessionUser`, and more. Each factory takes typed overrides. `resetFixtures()` restarts id generation.
- `handlers` — handlers for `/me`, `/categories`, `/workers`, `/jobs`, `/proposals`, `/contracts`, `/wallet`, `/bank-accounts`, `/payouts`, `/media`, and the console reads. `resetHandlers()` restores all fixtures between tests.
- `server` — `setupServer(...handlers)` for Vitest.

## Forcing states

Add `?mock_scenario=error` for a 500 or `?mock_scenario=forbidden` for a 403. Add `?cursor=end` to any collection for an empty page. Search and category filters are applied to `/workers` and `/jobs`, so screen tests can exercise empty results without custom handlers.

```ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  resetHandlers();
  server.resetHandlers();
});
afterAll(() => server.close());
```

Browser workers register `handlers` only. Session route-handler stubs and render helpers arrive with the auth and FE-012 tasks.
