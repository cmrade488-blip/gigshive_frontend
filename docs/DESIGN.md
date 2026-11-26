# Design and brand guide

How to find and use the GigsHive brand kit and UI designs when building. Written for developers and AI agents.

## Where things are

| Path in this repo | What it is | Source of truth |
|---|---|---|
| `packages/brand/` | Brand kit as a workspace package (`@gigshive/brand`): tokens, Tailwind preset, logo, favicon, social card, 69 SVG icons, images | `gigshive_doc/brand` |
| `design/public-site/previews/` | PNG renders of every designed screen (look here first) | `gigshive_doc/design/public-site/previews` |
| `design/public-site/source/` | The same screens as `.dc.html` files plus `canvas.json` (design source, reference only) | `gigshive_doc/design/public-site/source` |
| `design/public-site/README.md`, `PAGES_AND_ERRORS.md` | Design rules, the page list, the production error rule | `gigshive_doc/design/public-site` |
| `packages/ui/` | Built components: Button, Input, Textarea, Card, Badge, Modal, MoneyDisplay, MoneyInput | this repo |

`design/` is not in the repo until someone runs the sync script once (below). Until then, read the same files in the gigshive_doc repository.

**Do not edit `design/` here.** Change it in gigshive_doc, then mirror it:

```bash
git clone https://github.com/cmrade488-blip/gigshive_doc.git ../gigshive_doc   # once
git -C ../gigshive_doc pull
bash scripts/sync-design.sh ../gigshive_doc
git add design && git commit -m "chore(design): sync design from gigshive_doc"
```

The script also prints a **brand drift report** comparing `packages/brand` with `gigshive_doc/brand`. If you change a token or asset in `packages/brand`, make the same change in gigshive_doc in a linked PR, otherwise the two will drift.

The `.dc.html` sources load images from `../../brand/`, which does not exist in this repo. Use the PNG previews for visuals and the `.dc.html` for structure, copy and spacing only.

## How to build a screen from the design

1. Find the screen in the map below and open its preview PNG.
2. Open its `.dc.html` source for structure, copy and spacing. It is a reference, never production code: do not copy it into the app.
3. Build with the real stack: React, Tailwind, and components from `@gigshive/ui`. Use semantic tokens, not raw hex values.
4. Replace all sample content (jobs, names, prices) with API data. Money is integer kobo from the API, formatted by the shared utility and `MoneyDisplay`.
5. Cover states the design may not show: loading, empty, error, forbidden, and each status of the entity.

## How the apps use the brand kit

- Tailwind: `apps/*/tailwind.config.ts` uses the preset `@gigshive/brand/tokens/tailwind.preset` (Tailwind 3.4). Semantic colours point at CSS variables, so light and dark themes switch without class changes.
- CSS variables: `packages/brand/tokens/tokens.css`, imported in each app's `globals.css`. Dark mode follows the system setting, or force it with `data-theme="dark"` or `data-theme="light"` on `<html>`.
- Not yet wired in the apps (as of the FE-006 merge): the Inter and Poppins fonts, the favicon and web manifest, the social card, and the icon sprite. These are part of FE-080 (launch metadata) and the screens that need them.

## Brand rules (from the brand README)

- **Colour:** honey amber (`#F5A000`) is for fills, never body text on white; use honey-600 or darker for amber text. Honey buttons carry ink text. Blue is for links only, green for verified.
- **Type:** Inter for interface text (400, 500, 600). Poppins Bold for the wordmark and large display headings only. Load both with `next/font/google` so they are self-hosted.
- **Logo:** `gigshive-logo.svg` on light backgrounds, `gigshive-logo-reversed.svg` on dark, mono files on honey or one-colour print. Never recolour, stretch, rotate, add effects or retype the wordmark. Minimum 16 px for the mark and 96 px wide for the horizontal logo.
- **Icons:** 24 px grid, `currentColor`. Decorative icons are `aria-hidden`; icon-only buttons need an `aria-label`.
- **Accessibility:** text contrast at least 4.5:1 (the token pairs already meet it), touch targets at least 44 px, real buttons, links and labelled inputs.

## Visual rules the pages follow

- Floating white pill navbar with soft blur, 20 px from the top: logo left, links, Sign in, honey "Join free" button. Sticky in the app. On phones, logo and Join free with links in a menu.
- Each page starts with an ink band (`#0F1626`) with a honey glow and the hex texture; content cards overlap its bottom edge.
- Large radii (24 to 48 px cards, pill buttons), soft shadows, small lift on hover.
- The sign-in and create-account card is a fixed 640 px so the layout does not jump between tabs and steps.

## Screen map

Mapped from the design README, `PAGES_AND_ERRORS.md` and file names. Confirm against the file when you start the task. Previews are in `design/public-site/previews/`, sources in `design/public-site/source/`.

**Public pages (apps/web)**

| Route | Source | Preview | Feature | Task |
|---|---|---|---|---|
| `/` | `Main`, `MobileHome` | `home.png`, `home-phone.png` | site | FE-076 (proposed) |
| `/how-it-works` | `HowItWorks` | `how-it-works.png` | site | FE-077 (proposed) |
| `/safety`, `/fees`, `/help`, `/contact`, `/about`, `/terms`, `/privacy` | `Safety`, `Fees`, `Help`, `Contact`, `About`, `Legal` | `pub-safety.png`, `pub-fees.png`, `pub-help.png`, `pub-contact.png`, `pub-about.png`, `pub-legal.png` | site | FE-078 (proposed) |
| `/jobs` | `Jobs` | `find-work.png` | jobs | FE-029 |
| `/jobs/[id]` | `Job` | `job-details.png` | jobs | FE-030 |
| `/workers` (P1, needs a public workers list in the API) | `Workers` | `workers.png` | profiles | FE-024 |
| `/workers/[id]` | `Profile` | `worker-profile.png` | profiles | FE-024 |
| 404, 403, 500, 503 | `NotFound`, `AccessDenied`, `ServerError`, `Maintenance`, `ErrorStates` | `sys-404.png`, `sys-403.png`, `sys-500.png`, `sys-503.png`, `sys-error-states.png` | site, shared | FE-079 (proposed), FE-009 |

**Account**

| Route | Source | Preview | Feature | Task |
|---|---|---|---|---|
| `/login`, `/register`, `/verify-email` | `Auth` | `sign-in-join.png`, `join-step-1.png` to `join-step-3.png` | auth | FE-013, FE-014 |
| `/forgot-password`, `/reset-password` | `Recover` | `pub-recover.png` | auth | FE-015 |
| `/settings/account` | `Settings` | `settings.png` | auth | FE-016 |

**Signed in (apps/web)**

| Screen | Source | Preview | Feature | Task |
|---|---|---|---|---|
| Worker onboarding and ID check | `OnboardWorker` | `onboard-worker-1.png` to `-3.png` | profiles, verification | FE-022, FE-023, FE-026, FE-027 |
| Client onboarding | `OnboardClient` | `onboard-client-1.png`, `onboard-client-3.png` | profiles | FE-022, FE-023 |
| App shell and dashboards | `AppSidebar`, `AppTopbar`, `Dashboard`, `DashboardWorker` | `app-dashboard.png`, `app-dashboard-worker.png` | auth | FE-019 |
| Post a job | `PostJob` | `app-post-job.png` | jobs | FE-031 |
| Send a proposal or application | `Apply` | `app-apply.png` | proposals | FE-034, FE-073, FE-074 |
| My proposals | `MyProposals` | `my-proposals.png` | proposals | FE-035 |
| Proposals for my job (client) | `Proposals` | `app-proposals.png` | proposals | FE-036 |
| Contracts list and contract | `Contracts`, `Contract` | `contracts.png`, `app-contract.png` | contracts | FE-044 to FE-049 |
| Payment return | `PaymentReturn` | `payment-return.png` | payments | FE-039 |
| Wallet, bank accounts, payouts | `Wallet` | `app-wallet.png` | wallet | FE-041 to FE-043, FE-050, FE-051 |

**Staff console (apps/admin)**

| Screen | Source | Preview | Feature | Task |
|---|---|---|---|---|
| Staff sign in with code | `AdminLogin` | `admin-login.png` | auth | FE-018 |
| Shell | `AdminSidebar` | `admin-dashboard.png` | admin-ops | FE-018 |
| Overview | `AdminDashboard` | `admin-dashboard.png` | admin-ops | FE-057 |
| Verification review | `AdminVerifications` | `admin-verifications.png` | admin-ops | FE-028 |
| Payouts | `AdminPayouts` | `admin-payouts.png` | admin-ops | FE-052 |
| Config, categories, audit, staff | `AdminSettings` | `admin-settings.png` | admin-ops, catalog | FE-055 to FE-057 |

The profiles, jobs, contracts and payments queues reuse the verification and payout table-and-detail pattern. All `Source` names are `<Name>.dc.html`.

## Production error rule

In production users never see a server message, error code, URL or stack trace. They see short friendly copy written in the app. For 5xx they also see a short reference to quote to support; the server detail goes to the error tracker. Full detail is shown only in development. This tightens Blueprint 7.5: the server message is never shown, even as a fallback. Use `not-found.tsx` (404), `error.tsx` and `global-error.tsx` (500), and a maintenance flag that serves the 503 page. The response-to-behaviour table is in `design/public-site/PAGES_AND_ERRORS.md`.

## Known gaps and placeholders

- The public pages (Home, How it works, Safety, Fees, Help, Contact, About, Terms and Privacy) are P0 in the design but have **no task in MVP Plan v1.1**. The product owner has confirmed FE-075 to FE-080 in `docs/tasks/TASKS.md` and the `site` feature folder; the MVP Plan in gigshive_doc still needs updating, and the `site` exception needs an ADR.
- Not designed (P1): notifications, messages, disputes, reviews.
- Needed for launch with no design: robots.txt, sitemap.xml, page titles and descriptions, a cookie or privacy notice if analytics is used (FE-080).
- Placeholders: the social card tagline, the support email, legal text (from the company), fee numbers on the Fees page (must come from the API), and "Meet workers" on Home (needs a public workers list in the API).
