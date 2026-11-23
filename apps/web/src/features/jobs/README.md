# jobs (apps/web)

**Purpose:** Public job list and detail, job composer (priced or application mode, screening questions), my jobs, close and cancel. Admin: moderation.

| | |
|---|---|
| Surface | web |
| Tasks | FE-029 to FE-032 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.8](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | BR-10, BR-14, BR-15, BR-16, BR-17 |
| Status | FE-029 done (public discovery); FE-030 to FE-032 not started |

## API used

GET /jobs; GET /jobs/{id}; POST /jobs; PATCH /jobs/{id}; POST /jobs/{id}/publish, /close, /cancel

Endpoint paths are indicative until the generated OpenAPI document is final. Only `api/` calls the client.

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

## Find work (FE-029)

- `JobsScreen` composes the dark hex hero with a search pill, the filter card and the results column. It reuses `SiteHeader` and `SiteFooter` from the `site` feature's `index.ts`.
- The design source is `design/public-site/source/Jobs.dc.html`; all visible text lives in `copy/jobs.ts`.
- `state/jobs-filters.ts` is pure: it parses and serialises URL state (`q`, `category`, `mode`, `min`, `max`, `sort`) and filters/sorts the samples. Invalid URL values fall back to defaults and a clean list has a clean URL.
- `api/jobs.ts` supplies typed sample listings with integer kobo budgets. No public jobs endpoint or generated API type exists yet (FE-004/FE-005 are outstanding), so no endpoint or response shape is invented. The client only formats amounts and never computes one.
- `state/use-jobs.ts` uses an infinite query with an opaque offset cursor; `nextCursor: null` ends the list. The design's numbered pagination is represented by a cursor-driven "Load more" control until the API defines its page contract.
- The route is server-rendered with a Suspense boundary because the screen reads `useSearchParams`; the listing itself is client-driven for now, matching the home page.
- Sample cards are not links yet. `/jobs/[id]` is FE-030; `JobsCard` already accepts an optional `href` so the cards become links when that route lands.
- Public discovery has no meaningful 403 state, but an error carrying status 403 maps to the forbidden copy rather than exposing a raw code.
- Automated component tests need Vitest/Testing Library in `apps/web`, which is FE-012's test-tooling task; no dependency was added here. The pure filter logic is validated with a throwaway Node 24 probe before each push.
