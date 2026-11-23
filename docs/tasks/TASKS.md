# Task catalogue

Source: Frontend MVP Scope and Implementation Plan v1.1, section 8. Owners are proposals (FE1, FE2); either engineer may swap. Size: S/M/L (relative).

**Status values:** `proposed`, `todo`, `in progress`, `blocked`, `review`, `done`. The PR that finishes a task sets it to `done` in this file. Each task has a GitHub issue titled `FE-nnn: <task>`.

**Slice acceptance** is in the MVP Plan section 11. Slices F and G can run in parallel with A to E. Slice H is the convergence point; K needs I and J.

## Slice 0: Foundation
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-001 | Monorepo (pnpm workspaces), TypeScript strict, ESLint, Prettier, PR template | shared | FE1 | none | S | done |
| FE-002 | Next.js skeletons for web and admin: layouts, environment config, providers | shared | FE1 | FE-001 | M | done |
| FE-003 | CI pipeline: install, lint, types, tests, build, audit, secret scan, bundle budgets | infra | FE2 | FE-001 | M | in progress (repository checks, secret scan, PR checks live; build, test, audit and budget stages pending) |
| FE-004 | API client package: OpenAPI type generation, drift check, fetch wrapper | api-client | FE2 | FE-002 | L | done |
| FE-005 | Mock layer: MSW handlers from the spec; typed fixture factories | testing | FE2 | FE-004 | M | todo |
| FE-006 | Design tokens, Tailwind preset, base components (use packages/brand; replaces the placeholder set, FOI-05) | ui | FE1 | FE-002 | L | done (tokens, Tailwind wiring, Button, Input, Textarea, Card, Badge, Modal in packages/ui; fonts and favicon not wired yet, see FE-080) |
| FE-007 | Shared utilities: money, dates (Africa/Lagos), ids, idempotency key, status-map framework | shared | FE1 | FE-001 | M | done |
| FE-008 | Session proxy layer: server-held session, token attach, CSRF, logout (FOI-01) | session | FE2 | FE-004 | L | todo |
| FE-009 | Error boundaries and standard screen states | shared | FE1 | FE-006 | M | todo |
| FE-010 | Import-boundary lint rules and architecture tests | shared | FE1 | FE-002 | S | done |
| FE-011 | Observability: error tracker hook, web vitals, request-id surfacing, scrubber | infra | FE2 | FE-002 | S | todo |
| FE-012 | Test tooling: Vitest, Testing Library, axe, Playwright skeleton | testing | FE2 | FE-003 | M | todo |

## Slice A: Auth and Session
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-013 | Register and email OTP verification screens | auth | FE1 | FE-006, FE-008 | M | todo |
| FE-014 | Login and logout, return path, throttling messages | auth | FE1 | FE-008 | M | todo |
| FE-015 | Forgot, reset and change password | auth | FE1 | FE-014 | S | todo |
| FE-016 | Phone verification and account settings | auth | FE1 | FE-013 | S | todo |
| FE-017 | Session bootstrap: /me seeding, route guards, 401 handling, verify-email prompts | auth | FE2 | FE-008 | M | todo |
| FE-018 | Console shell: layout, permission-aware navigation, staff login with OTP | admin-ops | FE2 | FE-008 | L | todo |
| FE-019 | Role-aware web dashboard shell with status banners | auth | FE1 | FE-017 | S | todo |

## Slice B: Profiles, Media and Catalog
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-020 | Media uploader and signed-URL file viewer | media | FE2 | FE-006 | L | todo |
| FE-021 | Category tree picker and filter chips | catalog | FE1 | FE-004 | S | todo |
| FE-022 | Profile wizard with per-type attribute forms and Zod schemas | profiles | FE1 | FE-021 | L | todo |
| FE-023 | Submit for review, completeness checklist, status banners, rejection resubmit | profiles | FE1 | FE-022 | M | todo |
| FE-024 | Public worker browse and detail pages (server rendered, public fields only) | profiles | FE1 | FE-021 | M | done |
| FE-025 | Console: profile review queue and detail (approve, reject, suspend, reinstate) | admin-ops | FE2 | FE-018 | M | todo |

## Slice C: Verification
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-026 | Verification centre: required checks from the API, status tracking | verification | FE1 | FE-023 | M | todo |
| FE-027 | KYC submission with write-only identifier and private documents | verification | FE1 | FE-026, FE-020 | M | todo |
| FE-028 | Console: verification review queue with masked data and signed document viewer | admin-ops | FE2 | FE-025, FE-020 | M | todo |

## Slice D: Jobs
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-029 | Discovery: filters, keyword search, URL state, cursor list, server rendering | jobs | FE1 | FE-021 | L | done |
| FE-030 | Job detail with public and owner variants | jobs | FE1 | FE-029 | M | done |
| FE-031 | Job composer: wizard, drafts, naira budget, publish, application mode, screening questions | jobs | FE1 | FE-023, FE-007 | L | todo |
| FE-032 | My jobs, close and cancel, removal reason display | jobs | FE1 | FE-031 | M | todo |
| FE-033 | Console: job moderation with recorded removal reason | admin-ops | FE2 | FE-028 | S | todo |

## Slice E: Proposals
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-034 | Proposal and application form (create, edit, resubmit); price optional on application jobs | proposals | FE1 | FE-030, FE-026 | M | todo |
| FE-035 | Worker proposals list and withdraw | proposals | FE1 | FE-034 | S | todo |
| FE-036 | Client proposal and application review, reject, accept confirmation with agreed-price entry (completes in Slice H) | proposals | FE1 | FE-032, FE-073 | M | todo |
| FE-073 | Screening answers, availability, portfolio samples: sections, required-answer validation, display | proposals | FE1 | FE-031, FE-034, GH-073 | M | todo |
| FE-074 | Application attachments: upload after save, per-file progress and retry, signed-URL viewing | proposals, media | FE1 | FE-020, FE-034, GH-074 | M | todo |

## Slice F: Funding and Payments UI
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-037 | Money components: MoneyDisplay, MoneyInput; exhaustive formatting and parsing tests | shared | FE2 | FE-007 | M | in progress (components exist in packages/ui; MoneyDisplay tested, MoneyInput tests pending) |
| FE-038 | Funding dialog: fee breakdown, idempotency key, redirect allow-list | payments | FE2 | FE-037, FE-008 | L | todo |
| FE-039 | Payment return page: bounded polling, all states, timeout, forged-query-string test | payments | FE2 | FE-038 | L | todo |
| FE-040 | Status badge and action-availability framework for contracts and payments | shared | FE2 | FE-009 | M | todo |

## Slice G: Wallet and Bank Accounts
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-041 | Wallet overview and statement (infinite query, as-returned balances) | wallet | FE2 | FE-037 | M | todo |
| FE-042 | Bank accounts: bank list, resolve, confirm name, save, delete; write-only number | wallet | FE2 | FE-037 | L | todo |
| FE-043 | Verification and balance gates on wallet screens | wallet | FE2 | FE-041, FE-026 | S | todo |

## Slice H: Contracts and Escrow
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-044 | Contract list and workspace shell: header, price and fee breakdown, timeline | contracts | FE2 | FE-040 | L | todo |
| FE-045 | Accept-proposal flow end to end, navigation to the new contract | contracts | FE1 | FE-036, FE-044 | M | todo |
| FE-046 | Deliverable submission with private uploads | contracts | FE1 | FE-044, FE-020 | L | todo |
| FE-047 | Approve, request revision, review deadline display, refresh on auto-release | contracts | FE2 | FE-046 | L | todo |
| FE-048 | Cancellation with configurable consequence copy | contracts | FE2 | FE-044 | M | todo |
| FE-049 | Conflict (409) handling and focus refetch across the workspace | contracts | FE2 | FE-047 | M | todo |

## Slice I: Payouts
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-050 | Payout request: balance, verification gate, idempotency, fee and net from the API | wallet | FE2 | FE-041, FE-042 | L | todo |
| FE-051 | Payout history and status tracking; failure and reversal messaging | wallet | FE2 | FE-050 | M | todo |
| FE-052 | Console payout approval UI (only if adopted, OI-06) | admin-ops | FE2 | FE-050 | M | todo |

## Slice J: Console Operations
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-053 | Reusable console table and operational read views: contracts, payments, escrow, payouts | admin-ops | FE1 | FE-025 | L | todo |
| FE-054 | Failed webhooks and reconciliation report views | admin-ops | FE1 | FE-053 | M | todo |
| FE-055 | Platform configuration editor with previous-value display | admin-ops | FE1 | FE-018 | M | todo |
| FE-056 | Audit-log viewer with filters | admin-ops | FE1 | FE-053 | S | todo |
| FE-057 | Dashboard aggregates, category management, staff accounts | admin-ops | FE1 | FE-053 | M | todo |

## Slice K: Hardening and MVP Acceptance
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-058 | End-to-end money-loop Playwright scenarios incl. failure paths and mobile viewport | all | FE1+FE2 | FE-051, FE-057 | L | todo |
| FE-059 | Security review: access-matrix tests, no restricted data in DOM/storage/logs, CSP and headers | all | FE1+FE2 | FE-051 | L | todo |
| FE-060 | Accessibility audit: keyboard-only flows, screen-reader pass, fixes | all | FE1 | FE-058 | M | todo |
| FE-061 | Performance baseline: Lighthouse, bundle budgets, low-end device testing | all | FE2 | FE-029 | M | todo |
| FE-062 | Staging acceptance with provider sandbox accounts | payments | FE2 | FE-058 | M | todo |
| FE-063 | Frontend handover, runbook, final OpenAPI sign-off with the backend team | all | FE1 | FE-058 | M | todo |
| FE-064 | Production readiness: hosting, environments, headers, monitoring, rollback rehearsal | infra | FE2 | FE-062 | L | todo |

## P1 slices (L to R)
| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-065 | Slice L: Notifications inbox, unread badge, preferences | notifications | FE1 | FE-064 | L | todo |
| FE-066 | Slice M: Messaging | messaging | FE1 | FE-065 | L | todo |
| FE-067 | Slice N: Reviews and ratings | reviews | FE1 | FE-064 | M | todo |
| FE-068 | Slice O: Disputes (raise, evidence, timeline) and console handling | disputes | FE2 | FE-064 | L | todo |
| FE-069 | Slice O: Support tickets | support | FE1 | FE-064 | M | todo |
| FE-070 | Slice P: Subscriptions and connects | subscriptions | FE2 | FE-064 | L | todo |
| FE-071 | Slice Q: Request for Quote reusing job and proposal screens | jobs | FE1 | FE-064 | M | todo |
| FE-072 | Slice R: Skills pickers and matching display | catalog | FE1 | FE-064 | M | todo |

## Public site (owner-approved; not yet in MVP Plan v1.1)
The designs for these pages are done (see [docs/DESIGN.md](../DESIGN.md)). The product owner has confirmed FE-075 to FE-080 and the front-end-only `site` feature. The MVP Plan in gigshive_doc still needs updating, and the `site` feature exception needs an ADR.

| ID | Task | Module | Owner | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| FE-075 | Public site shell: floating pill navbar, footer, dark hero band with hex texture | site | FE1 | FE-006 | M | done |
| FE-076 | Home page, desktop and phone | site | FE1 | FE-075 | L | done |
| FE-077 | How it works page | site | FE1 | FE-075 | S | done |
| FE-078 | Info pages: Safety, Fees (values from the API), Help and FAQ, Contact, About, Terms and Privacy (legal text placeholder) | site | FE1 | FE-075 | M | done |
| FE-079 | System pages: not found, access denied, error with reference, maintenance (503); production error rule | site, shared | FE1 | FE-009, FE-075 | S | done |
| FE-080 | Launch metadata: fonts via next/font (Inter, Poppins), favicon and manifest from packages/brand, social card, robots.txt, sitemap.xml, per-page titles and descriptions | web | FE1 | FE-002, FE-075 | S | done |

`GH-nnn` ids refer to backend tasks in the backend plan; a dependency on one means the endpoint must exist on staging (or be mocked behind the generated types).
