# profiles (apps/web)

**Purpose:** Profile creation wizard, edit, submit for review, status banner, public worker list and detail.

| | |
|---|---|
| Surface | web |
| Tasks | FE-022 to FE-024 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.4](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | BR-01, BR-02, BR-03, BR-04 |
| Status | FE-024 done (public browse and detail); FE-022 and FE-023 not started |

## API used

POST /profiles; PATCH /profiles/{id}; POST /profiles/{id}/submit; GET /workers; GET /workers/{id}; GET /me

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

## Public browse and detail (FE-024)

- The design sources are `design/public-site/source/Workers.dc.html` and `Profile.dc.html`. All visible text lives in `copy/workers.ts` and `copy/worker-profile.ts`.
- `api/workers.ts` holds typed samples for the public projection only: display name, headline, bio, public location, categories, skills, portfolio media and rating counts. No status, status reason, address, email, phone, identity number, bank detail or verification document is part of these types. Only ACTIVE workers are shown publicly, as required by Data and State Design §3.3.
- No public workers endpoint or generated API type exists yet (FE-004/FE-005 are outstanding). `DESIGN.md` calls the list P1 and notes the missing API, while the Data and State Design already specifies `GET /workers`, `GET /workers/{id}` and both routes. Per AGENTS.md §7 this uses typed mocks behind the documented shapes; no endpoint, enum or response shape was invented. If the backend confirms a different shape, only `api/` changes.
- `state/workers-filters.ts` is pure: it parses and serialises URL state (`q`, `category`), filters by name/headline/skills and falls back to defaults for invalid values. The design's three numbered page pills are represented by a cursor-driven "Load more" control, matching the documented infinite query and FE-029's discovery page.
- `state/use-workers.ts` uses the documented `["workers", "list", filters]` key, a one-minute stale time and an opaque offset cursor; `nextCursor: null` ends the list.
- `WorkersScreen` uses `useSearchParams`, so `app/workers/page.tsx` has a Suspense boundary. `app/workers/[id]/page.tsx` is a thin server route: it awaits the Next 15 `params` contract and passes the id to `WorkerProfileScreen`, which does the lookup and calls `notFound()`. `loading.tsx` supplies the route-level loading state.
- The home page's "Meet workers" cards now link to `workersRoutes.detail(id)`. The four existing home sample ids have matching detail records; the remaining cards come from the Browse workers design. Sample detail URLs are excluded from the sitemap until real API data exists.
- Assumptions to confirm against the API contract: the design publicly shows "Verified" / "Identity verified" / "Email verified" badges and "Member since". The Data and State Design puts verification status and activation time in owner/staff projections, so these are typed sample display values only. If the public response omits them, remove those lines rather than deriving them in the client. "Member since" is not computed.
- Automated component tests need Vitest/Testing Library in `apps/web`, which is FE-012's test-tooling task; no dependency was added here. The pure filter logic is validated with a throwaway Node 24 probe before each push.
