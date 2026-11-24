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
api/          typed mocks for the fee example, contact submit and home samples until endpoints exist
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
- The support reference is Next's `error.digest`, passed from `error.tsx` and `global-error.tsx`. No digest means no reference and no random display token. `reportError(error, reference)` in `ServerErrorScreen` is the no-op hook for FE-011's error tracker; it adds no dependency and never sends request data yet.
- B1 adds Testing Library and axe tests for `SiteHeader` (including menu open/close and Escape), `HowItWorksScreen` and `ServerErrorScreen`. Contacts and fee helpers keep their existing pure tests; the axe assertions cover both the digest and no-digest error states.
- The 360 px check was done at a real 360 px Chrome viewport using CDP device emulation: document and body scroll widths stayed within the viewport on the home, jobs, job detail, workers, worker detail, how-it-works, fees and server-error screens. Decorative background layers extend past the edge but are clipped and do not create horizontal scrolling.
- Maintenance mode is the build-time `GIGSHIVE_MAINTENANCE_MODE=true` flag checked in the root layout. Because statically generated pages bake it in, toggling needs a rebuild, and a layout-rendered maintenance screen still returns HTTP 200. Serving a true 503 needs a host or middleware decision — raise it with the owner; do not invent infrastructure here.
- "Switch profile" links to the reserved `/dashboard` route from the design; the dashboard task owns that URL. The shared status-to-copy mapping (401/403/404/409/422/429/5xx/offline) remains FE-009's responsibility; this feature owns only the full-page states.
- The empty-state illustrations come from `packages/brand/images/empty/` and are published by `scripts/copy-brand-assets.mjs`; they are not copied by hand into `public/`.

## Home page (FE-076)

- `HomeScreen` composes a home-only dark hero, the category grid, the how-it-works teaser, sample jobs, sample workers, the trust band and the closing CTA. It uses `SiteHeader` and `SiteFooter` but not `SitePage`, because the design's hero is wider and two-column.
- `copy/home.ts` owns all home text and the static category/step content, taken from `design/public-site/source/Main.dc.html` (desktop wording; `MobileHome.dc.html` informs only the responsive layout).
- `api/home.ts` supplies typed sample jobs and workers. `docs/DESIGN.md` records that "Meet workers" needs a public workers list in the API; until those endpoints exist these are labelled samples in the UI and loaded through React Query hooks in `state/`. No endpoint is invented and no amounts are computed: sample budgets are integer kobo and are only formatted for display. A4: the sample worker cards carry no verification badge, and both sample sections are hidden in production unless `NEXT_PUBLIC_SHOW_SAMPLE_DATA=true`.
- Category links, the search form and the CTAs point at the reserved `/jobs` and `/register` routes, matching the existing header. Those routes are owned by later tasks.
- The new category, avatar and illustration folders are published by `scripts/copy-brand-assets.mjs`; no brand file is copied by hand into `public/`.

## Launch metadata (FE-080)

- Inter and Poppins load through `next/font/google` in the root layout and expose `--font-inter` / `--font-poppins`. `apps/web/src/app/globals.css` maps those onto the brand's `--gh-font-sans` / `--gh-font-display` variables with system-font fallbacks so `global-error.tsx` still renders legibly without the layout's font classes.
- Icons, the web manifest, the social card, `robots.txt` and `sitemap.xml` reference files already in `packages/brand` (`favicon/`, `social/`); `scripts/copy-brand-assets.mjs` publishes them. No images are generated or copied by hand.
- `getSiteUrl()` in `apps/web/src/lib/site-url.ts` reads the existing `PUBLIC_SITE_URL`. When `GIGSHIVE_ENV=production`, a missing, invalid or credentialed URL throws and fails the build; otherwise the localhost fallback keeps local builds working. Invalid local values warn without echoing the value.
- `robots.txt` excludes the three error-state preview routes. `sitemap.xml` lists only pages that exist today; routes owned by later tasks are added when they ship.
- The site copy owns the shared description and the home page title/description. Every existing page already sets its own title and description.
