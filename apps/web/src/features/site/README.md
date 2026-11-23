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
api/          only the Fees and platform-config reads, if any
components/   public shell pieces: floating navbar, footer, hero band, hex texture
screens/      one screen per page
schemas/      contact form schema
state/        none expected
copy/         page text (legal text is placeholder until the company supplies it)
__tests__/
index.ts      public surface
```

## Rules for this folder

- Never import another feature's internals; use its `index.ts` or a shared package.
- Public pages are server rendered. No restricted data. Each page sets its own title and description.
- Production error rule: never show server messages, codes, URLs or stack traces (see docs/DESIGN.md).
