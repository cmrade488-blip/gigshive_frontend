# site (apps/web) — approved

**Purpose:** Public marketing and information pages and system pages: Home, How it works, Safety, Fees, Help, Contact, About, Terms and Privacy, and the 404, 403, 500 and 503 pages.

| | |
|---|---|
| Surface | web |
| Tasks | FE-075 to FE-080 (owner-approved; see [docs/tasks/TASKS.md](../../../../../docs/tasks/TASKS.md)) |
| Spec | `design/public-site/PAGES_AND_ERRORS.md`, [docs/DESIGN.md](../../../../../docs/DESIGN.md) |
| Business rules | None; the Fees page shows values from the API, never hard-coded numbers |
| Status | approved by the product owner; MVP Plan update and ADR pending |

This folder is a front-end-only feature (no matching backend module), so it is an exception to "features mirror backend modules". The product owner has approved it; record the decision in an ADR.

## Layout

```
api/          typed mocks for the fee example and contact submit until endpoints exist
components/   public shell pieces plus shared info-page UI (CTA, FAQ list, forms)
screens/      one screen per page
schemas/      contact form values and local validation
state/        query/mutation hooks wrapping the typed mocks
copy/         page text (legal text is placeholder until the company supplies it)
__tests__/
index.ts      public surface
```

## Rules for this folder

- Never import another feature's internals; use its `index.ts` or a shared package.
- Public pages are server rendered. No restricted data. Each page sets its own title and description.
- Production error rule: never show server messages, codes, URLs or stack traces (see docs/DESIGN.md).
- The Fees page renders amounts from `api/fees.ts`. Those kobo values are placeholders behind a typed mock: no public fee endpoint exists yet, and the client never calculates a fee or a worker amount.
- The Contact form submits through `api/contact.ts`. Its destination is undecided; the company still needs to supply the support email.
- Legal copy is placeholder text supplied by the design, pending wording from the company and its legal adviser.

## System pages (FE-079)

- `/not-found` is wired through `apps/web/src/app/not-found.tsx`, so unmatched routes return a real HTTP 404. `/access-denied`, `/server-error` and `/maintenance` are dedicated preview routes; the design has no dedicated URL for 403, 500 or 503.
- `error.tsx` renders the 500 screen inside the site shell; `global-error.tsx` replaces the root layout, so it renders without site chrome with its own `html`/`body` and CSS import. Neither renders the server message, a URL or a stack trace in production. `error.message` appears only in a collapsed `<details>` when `NODE_ENV === "development"`.
- The support reference (`GH-XXXXXX`) is generated after mount in `ServerErrorScreen` so server rendering and hydration agree. It is a display token derived from `@gigshive/shared/id`, not a server-issued error ID.
- Maintenance mode is the build-time `GIGSHIVE_MAINTENANCE_MODE=true` flag checked in the root layout. Because statically generated pages bake it in, toggling needs a rebuild, and a layout-rendered maintenance screen still returns HTTP 200. Serving a true 503 needs a host or middleware decision — raise it with the owner; do not invent infrastructure here.
- "Switch profile" links to the reserved `/dashboard` route from the design; the dashboard task owns that URL. The shared status-to-copy mapping (401/403/404/409/422/429/5xx/offline) remains FE-009's responsibility; this feature owns only the full-page states.
- The empty-state illustrations come from `packages/brand/images/empty/` and are published by `scripts/copy-brand-assets.mjs`; they are not copied by hand into `public/`.
