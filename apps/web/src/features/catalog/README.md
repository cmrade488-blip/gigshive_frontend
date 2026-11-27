# catalog (apps/web)

**Purpose:** Category tree picker and filter chips; admin category management.

| | |
|---|---|
| Surface | web |
| Tasks | FE-021 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.7](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | None specific |
| Status | FE-021 done: API-backed two-level category picker and removable filter chips; no route or static category data |

## API used

GET /categories; admin: GET/POST/PATCH /admin/categories

The web category read follows the generated OpenAPI contract. Only `api/` calls the client; admin mutations belong to their own console tasks.

FE-021 exports a checkbox/radio tree picker and removable filter chips through `index.ts`; it adds no route because the design has no category page. The API remains the authority for categories, active status, ordering and the two-level limit. The picker filters inactive records and an optional `category_type`; a category whose parent is absent or inactive is shown as a root rather than silently dropped, and an omitted `sort_order` sorts as zero. Chips resolve names from the same cached query and never render an unknown raw id. Backend codes, messages and field details map to fixed feature copy; 429 disables retry until `Retry-After` elapses and 5xx shows a support reference.

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
