# GigsHive Design: public site and signed-in app

The first screens to build and launch: the public pages that need no sign-in, followed by the signed-in screens for posting a job, proposals, contracts and the wallet. Modern look with a floating pill navbar, a dark hero band with a hex texture, large rounded cards and soft shadows. Colours, fonts and logo come from `../../brand/`; every image comes from `../../brand/images/` and is mapped in `../../brand/images/README.md`.

All jobs, names and prices in the design are sample content. Real data comes from the API (Frontend Data and State Design).

## Pages

| Page | Preview |
|---|---|
| Home | ![Home](previews/home.png) |
| Find work | ![Find work](previews/find-work.png) |
| Job details | ![Job details](previews/job-details.png) |
| Worker profile | ![Worker profile](previews/worker-profile.png) |
| How it works | ![How it works](previews/how-it-works.png) |
| Sign in and join | ![Sign in and join](previews/sign-in-join.png) |
| Home on a phone | ![Home on a phone](previews/home-phone.png) |
| Image placement map | ![Image map](previews/image-map.png) |

## Signed-in screens

Shared components: `AppSidebar` (role `client` or `worker`, shows the profile switcher, one login with two profiles) and `AppTopbar`. Sample data only.

| Screen | Preview | Notes |
|---|---|---|
| Dashboard | ![Dashboard](previews/app-dashboard.png) | Stats, items needing attention, my jobs |
| Post a job | ![Post a job](previews/app-post-job.png) | Priced bid vs application; screening questions (up to 5) show for applications |
| Proposals | ![Proposals](previews/app-proposals.png) | Accept dialog asks for the agreed amount when the applicant gave no price |
| Send a proposal | ![Send a proposal](previews/app-apply.png) | Worker view: cover letter, price, days, screening answers, samples, files |
| Contract | ![Contract](previews/app-contract.png) | PENDING_FUNDING, ACTIVE, SUBMITTED, COMPLETED; actions depend on stage and role |
| Wallet | ![Wallet](previews/app-wallet.png) | Available and escrow balances, transactions, withdraw, bank accounts |

Build the signed-in screens in `apps/web` after the public pages. Money is integer kobo in the API and formatted as naira in the UI.

## Sign up, ID check and the three dashboards

Flow: Sign in or Create account (three steps: account, goal, verify email; every step has the same card height as Sign in), then onboarding for the chosen profile, then that profile's dashboard.

| Screen | Preview | Notes |
|---|---|---|
| Sign in and create account | ![Sign in](previews/sign-in-join.png) ![Step 1](previews/join-step-1.png) ![Step 2](previews/join-step-2.png) ![Step 3](previews/join-step-3.png) | Fixed 640 px card, so the layout does not jump between tabs and steps |
| Worker onboarding | ![Profile](previews/onboard-worker-1.png) ![ID](previews/onboard-worker-2.png) ![Status](previews/onboard-worker-3.png) | Profile, then BVN or NIN plus a government ID photo (write-only identifier), then status: In review, Verified, Rejected with reason |
| Client onboarding | ![Client](previews/onboard-client-1.png) ![Done](previews/onboard-client-3.png) | No ID check for clients (OI-04). CAC number is optional |
| Worker dashboard | ![Worker dashboard](previews/app-dashboard-worker.png) | Verification banner, active work, proposals, jobs for you |
| Admin dashboard | ![Admin dashboard](previews/admin-dashboard.png) | Staff app (`apps/admin`): verification queue, payout approvals, activity. Has its own sidebar |

The client dashboard is in the table above. Naming: the UI says Client and Worker, matching the API. Marketing copy can say creators or artisans.

## Pages, system pages and errors

See [PAGES_AND_ERRORS.md](PAGES_AND_ERRORS.md) for the full list of pages to build and the production error rule.

| Page | Preview |
|---|---|
| 404 | ![404](previews/sys-404.png) |
| 500 | ![500](previews/sys-500.png) |
| 503 | ![503](previews/sys-503.png) |
| 403 | ![403](previews/sys-403.png) |

## How the design is kept

- **Live canvas:** the working design is a Design canvas in Claude (private; the engineering lead shares it from the Share menu). It holds all pages side by side, with a shared floating header and footer so one change updates every page.
- **In this repo:** `source/` has the same pages as `.dc.html` files plus `canvas.json` (the board layout). They are the design source, not the production code. The frontend team builds the real pages in `apps/web` using these as the reference. Image paths point to `brand/`.
- **Previews:** the PNGs above are rendered from the source for quick review on GitHub.

## Design rules the pages follow

- **Floating navbar:** a white pill with a soft blur, 20 px from the top, logo left, links centre-left, Sign in and a honey "Join free" button right. In the app it is sticky. On phones it keeps the logo and Join free and moves links into a menu.
- **Dark band:** each page starts with an ink band (#0F1626) with a honey glow and the hex texture; content cards overlap its bottom edge.
- **Shapes:** big radii (24 to 48 px cards, pill buttons), soft shadows, small lift on hover.
- **Colour use:** honey for the main button and highlights, ink for text and dark bands, blue only for links, green for verified.
- **Accessibility:** real buttons, links and labelled inputs; text contrast at least 4.5:1; touch targets at least 44 px.

## Build order

1. Shared header, footer, buttons, cards, inputs (from `brand/tokens`).
2. Home, How it works, Sign in and join.
3. Find work, Job details (needs the jobs API).
4. Worker profile (needs the public profile endpoint).

## Notes

- "Meet workers" on Home needs a public list of workers. The backend does not provide one yet, so treat it as optional until it exists.
- "Sign in to send a proposal" on Job details becomes the proposal form once the user has a verified worker profile (Frontend Blueprint, Slice E).
