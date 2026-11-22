# GigsHive pages and error handling

What the frontend builds, and what users see when something fails. This extends Data and State Design 6.2 (routes) and Engineering Blueprint 7.5 (error handling). The visual inventory is the "Page inventory" board in the design canvas.

![Page inventory](previews/page-inventory.png)

## Pages by area

**Public (marketplace app, no sign-in)**

| Route | Page | Priority | Design |
|---|---|---|---|
| / | Home | P0 | Done |
| /jobs, /jobs/[id] | Find work, job details | P0 | Done |
| /workers/[id] | Worker profile | P0 | Done |
| /workers | Browse workers | P1 | Done. Needs a public workers list in the API |
| /how-it-works | How it works | P0 | Done |
| /safety | Safety: verification and payment held until approval, in plain words | P0 | Done |
| /fees | Fees and how payment works. Values come from the API | P0 | Done |
| /help | Help and FAQ | P0 | Done |
| /contact | Contact support | P0 | Done |
| /about | About | P1 | Done |
| /terms, /privacy | Terms and Privacy | P0 | Done (Terms and Privacy tabs). Legal text comes from the company |

**Account**: /login and /register (done, same card height, three-step sign up), /verify-email (done as step 3), /forgot-password and /reset-password (done, four screens).

**Signed in**: onboarding and ID check, dashboards (client and worker), post a job, proposals, apply, contract, wallet (all done). Also done: payment return with polling, account settings, my proposals and the contracts list. Not designed (P1, after launch): notifications, messages, disputes, reviews.

**Admin app (apps/admin)**: overview, staff sign in with code, verification review, payouts, and config, categories, audit logs and staff (done). The profiles, jobs, contracts and payments queues use the same table and detail pattern as verifications and payouts.

**System pages (done)**: 404 not found, 403 access denied, 500 something went wrong (with a reference), 503 maintenance and offline.

Also needed for launch, no design: favicon and social card (in brand/), robots.txt, sitemap.xml, page titles and descriptions per page, and a cookie or privacy notice if analytics is used.

### Remaining screens

| Screen | Preview |
|---|---|
| Browse workers | ![Workers](previews/workers.png) |
| Payment return | ![Payment return](previews/payment-return.png) |
| Account settings | ![Settings](previews/settings.png) |
| My proposals | ![My proposals](previews/my-proposals.png) |
| Contracts list | ![Contracts](previews/contracts.png) |
| Admin sign in | ![Admin login](previews/admin-login.png) |
| Admin verifications | ![Admin verifications](previews/admin-verifications.png) |
| Admin payouts | ![Admin payouts](previews/admin-payouts.png) |
| Admin config, categories, audit, staff | ![Admin settings](previews/admin-settings.png) |

### Content pages

| Page | Preview |
|---|---|
| Safety | ![Safety](previews/pub-safety.png) |
| Fees | ![Fees](previews/pub-fees.png) |
| Help | ![Help](previews/pub-help.png) |
| Contact | ![Contact](previews/pub-contact.png) |
| Terms and Privacy | ![Legal](previews/pub-legal.png) |
| About | ![About](previews/pub-about.png) |
| Password recovery | ![Recover](previews/pub-recover.png) |

Content notes: fee numbers on the Fees page are a sample and must come from the API. The support email is a placeholder. Legal text is placeholder until the company supplies it. Wording about payment is factual (held until approval) and makes no legal claims.

## Error rule

In production users never see a server message, error code, URL, or stack trace. They see short friendly copy written in the app. For server failures (5xx) they also see a short reference they can quote to support. The server detail goes to the error tracker. The full detail is shown only in development.

This tightens one line in the Engineering Blueprint 7.5 ("the server message is used only as a fallback"): in production the server message is never shown, not even as a fallback.

| Response | What the user sees |
|---|---|
| 401 | Sign in page, then back to where they were. Once per session |
| 403 | Access denied page, or the action is hidden |
| 404 | Not found page (also for things the user may not see) |
| 409 | Refresh the item, say what changed in plain words |
| 422 | Field messages from the app copy. Keep input, focus the first error |
| 429 | Pause the button, "Please wait a moment and try again" |
| 500, 502, 503, 504 | Section error card, toast, or the full error page with a reference |
| No response | Offline banner, retry when back online |
| Any unknown code | The HTTP-level behaviour above, never the raw code |

Next.js: use `not-found.tsx` for 404, `error.tsx` and `global-error.tsx` for 500, and a maintenance flag that serves the 503 page.

![Error states](previews/sys-error-states.png)
