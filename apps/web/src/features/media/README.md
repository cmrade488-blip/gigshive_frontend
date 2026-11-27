# media (apps/web)

**Purpose:** Shared uploader, preview, progress, signed-URL file lists.

| | |
|---|---|
| Surface | web |
| Tasks | FE-020, FE-074 (see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | [Blueprint section 6.6](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) and the Data and State Design |
| Business rules | BR-42 |
| Status | FE-020 done: reusable single-file uploader, public/private media list and one-shot private file viewer; multi-file attachments remain FE-074 |

## API used

POST /media (multipart), GET /media/{id}/signed-url

Endpoint paths and shapes come from the generated OpenAPI types. Only `api/` calls the client; the signed-file read uses a transient same-origin API call followed by a `no-store` fetch of the returned URL.

FE-020 exports components through `index.ts`; it adds no route because no media page is in the design. Visibility stays API-owned: public files use the API's public URL, while private files request a fresh signed URL when opened. The signed URL is never rendered, navigated to, logged, cached or stored; the viewer keeps only a Blob URL and revokes it on close, media change and unmount. No file-size or MIME allow-list is invented: callers may pass a design-approved `accept` value and the API remains the authority.

FE-020 assumptions: `POST /media` handles one file, so multi-file progress and retry stay in FE-074 where the batch endpoint is defined; the uploader shows indeterminate progress because the committed client helper has no progress callback. Backend text, codes and field details are mapped to fixed feature copy; 429 honours `Retry-After`, and 5xx shows a support reference. KYC identifiers and review documents are owned by FE-027/FE-028 and are not read by this shared viewer without their caller's authorisation.

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
- No direct API calls outside `api/`; the signed-file read uses one transient `fetch` there. No business logic in route files.
- Amounts come from the API; format with the shared money utility.
- Keep this README current: update Status and Tasks when work lands.
