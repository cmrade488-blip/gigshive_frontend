# AGENTS.md

Instructions for AI coding agents (and a fast briefing for new developers) working in this repository. Read this fully before changing anything.

## 1. What this repo is

GigsHive frontend monorepo: `apps/web` (marketplace) and `apps/admin` (staff console), plus shared `packages/*`. Stack: TypeScript strict, React 19, Next.js App Router, pnpm workspaces, TanStack Query, React Hook Form + Zod, Tailwind, Vitest/Testing Library/MSW/Playwright/axe. Node 24 (`.nvmrc`). Do not change the stack or add libraries without an ADR (`docs/adr/`).

The backend is a separate Laravel REST API (`/api/v1`). The frontend renders backend state; it never decides it.

## 2. Read order before any task

1. This file.
2. The task: `docs/tasks/TASKS.md` row and its GitHub issue (FE-nnn).
3. The feature's own `README.md` under `apps/*/src/features/<name>/`.
4. The specs in the `gigshive_doc` repository (links in `docs/DOC_MAP.md`): Blueprint (architecture and module spec), Data and State Design (types, keys, routes, state machines), MVP Plan (acceptance criteria for the slice).
5. For any UI work: `docs/DESIGN.md`, then `packages/brand/` (tokens, logo, icons) and the screen previews in `design/public-site/previews/` (once synced).

Precedence when documents disagree: backend docs (API behaviour, business rules, enumerations) > Data and State Design (client data model) > Blueprint (architecture and standards) > MVP Plan (scope and order). The generated OpenAPI types are authoritative for response shapes.

## 3. Commands

```bash
pnpm install --frozen-lockfile   # install
pnpm run check                   # format:check, lint, typecheck, generate:check, test, build (the local gate)
pnpm run format                  # fix formatting
pnpm run generate:check          # API types must match the OpenAPI spec
```

Run `pnpm run check` before every push. Never push with a failing check. GitHub Actions does not run pnpm; it runs repository checks, the secret scan and PR-title/task checks, so the local run is the only place lint, types, tests and build are enforced.

## 4. Layout and boundaries (enforced by lint and an architecture test)

- `apps/*/src/app`: routes and layouts only. No business logic, no API calls.
- `apps/*/src/features/<name>/`: `api/ components/ screens/ schemas/ state/ copy/ __tests__/ index.ts`.
- `packages/*`: shared code. Never imports from apps or features.

Rules:
1. A feature must not import another feature's folders. Use its `index.ts` or move shared code to a package. Routes may use a documented narrow secondary entry (currently only `@/features/site/system`) when a full barrel would pull unrelated screens into a global layout; ESLint and the architecture test enforce the exception.
2. Only a feature's `api/` folder calls the API client. Components get data through hooks. Never call `fetch` directly.
3. Routes import screens; screens import components; components never import routes.
4. `apps/web` and `apps/admin` never import each other.
5. Restricted types exist only in the console.
6. Files and folders kebab-case; components PascalCase; hooks `useX`; Zod schemas `XSchema`, form types `XFormValues`; no default exports except where Next.js requires them.

## 5. Hard rules (do not break; these are product safety, not style)

**Money**
- Amounts are integers in kobo end to end. One utility formats them, one parses naira input. Never use floating point for money.
- The client never computes a fee, total or balance that a user is charged or paid. Display what the API returns.
- Payment success is decided only by the API (contract/payment status). Never trust the gateway redirect's query string. Redirect URLs come from the API response and are checked against an allow-list.
- Financial POSTs (fund, payout, refund) require an `Idempotency-Key`: generate it when the form or dialog opens, reuse it on retry, new key if the body changes, disable submit while in flight.
- Confirmation dialogs restate the amount and the consequence.

**Data and security**
- Never store, log, cache or put in a URL: identity numbers, bank account numbers, OTPs, signed URLs, tokens. Show only the last four characters returned by the API.
- Tokens stay on the server (session proxy, httpOnly cookie). No localStorage/sessionStorage for sensitive data.
- No `dangerouslySetInnerHTML` for user content. External user links use `rel="noopener noreferrer"`.
- Never send personal or financial values to analytics or the error tracker.
- Never commit secrets or real personal data. Use `.env.local` (gitignored) and `.env.example` for names only.

**Correctness and quality**
- Types come from the generated API client. Never hand-copy or hand-edit generated files.
- No `any` without a justified comment. No non-null assertions in feature code.
- Every screen handles loading, empty, error and forbidden states. 409 responses refetch and explain; 422 maps to form fields; 429 backs off.
- Copy lives in the feature's `copy/` folder. Backend error codes map to messages; never show raw codes.
- Accessibility is part of "done": labels, focus, keyboard path, axe passing, usable at 360 px.
- Do not invent endpoints, fields, enum values or business rules. If the spec does not cover it, stop and raise it (see section 7).

## 5a. Design and brand

- Build screens from the design: find the screen in the map in `docs/DESIGN.md`, open its preview PNG, then its `.dc.html` source for structure and copy. The `.dc.html` files are reference only; never copy them into the app.
- Use semantic tokens from `@gigshive/brand` (via the Tailwind preset and `tokens.css`), never raw hex values. Use components from `@gigshive/ui` before writing new ones.
- Honey (`#F5A000`) is for fills, never for body text on white. Inter for interface text, Poppins Bold only for the wordmark and display headings. Never recolour, stretch or retype the logo. Icons use `currentColor`.
- `design/` is mirrored from gigshive_doc: never edit it here. `packages/brand` comes from `gigshive_doc/brand`: if you change a token or asset, make the same change in gigshive_doc in a linked PR (`bash scripts/sync-design.sh` prints a drift report).
- Production error rule: users never see a server message, error code, URL or stack trace. Show app copy; for 5xx also show a short reference to quote to support. Details go to the error tracker. This tightens Blueprint 7.5.
- Sample content in the designs (jobs, names, prices, fees) is placeholder. Real data comes from the API; money is integer kobo.

## 6. Workflow (every change)

1. Work on one task (FE-nnn) at a time. Create a branch from the latest `main`: `<type>/<FE-id>-<short-description>`, for example `feat/FE-013-register-screen`. Types: `feat fix refactor perf test docs chore ci`.
2. Commit small and often with Conventional Commits, lower-case imperative: `feat(auth): add register screen`. Scope is a feature or package (`auth`, `wallet`, `ui`, `api-client`, `ci`, `docs`, `deps`, `repo`). Add `Refs: FE-013` in the body when useful.
3. Add or update tests with the code. Money, date and idempotency utilities need full branch coverage; every status map and `availableActions` function needs every status and role combination.
4. Run `pnpm run check`. Fix everything before pushing. If the PR changes `apps/`, also run `pnpm run smoke`.
5. Push the branch and open a pull request with `.github/PULL_REQUEST_TEMPLATE.md` filled in. PR title follows the same Conventional Commit format (it becomes the squash commit). Reference the task ID and business-rule IDs in the description.
6. If the change alters the client model, routes or a decision, open a matching PR in `gigshive_doc` and link it. Update `docs/tasks/TASKS.md` status in the same PR when a task is finished.
7. Wait for the GitHub checks and review. Address review comments with new commits (do not force-push over a review in progress).

Never: push to `main`, merge your own PR, bypass CI or hooks, force-push shared branches, rewrite history on `main`, or bundle unrelated changes into one PR.

Human approval is required for: any money-flow change (funding, contracts, wallet, payouts, idempotency) which also needs a backend reviewer; changing a decision recorded in an ADR; adding a dependency; changing CI, security headers, CSP or session handling.

## 7. When the spec is unclear or missing

- Check the OpenAPI types, the Data and State Design, and the Blueprint's open items (FOI-nn) and planning defaults first. Build to the planning default and mark the assumption in the PR.
- If an endpoint or field is missing, build against the mock (MSW handler in `packages/testing`) behind the generated types, and raise a request for the backend team (Data and State Design Appendix C, R-numbers). Do not guess a shape.
- If a business rule is ambiguous, stop and ask in the issue. Do not decide it in code.

## 8. Definition of Done (summary)

Code merged through a reviewed PR with green GitHub checks and a clean local `pnpm run check`; tests for new behaviour and all standard states; accessibility and responsive checks; generated types current; no restricted data leaks; copy externalised; boundaries respected; docs and `TASKS.md` updated. Full list: `docs/workflow/definition-of-done.md`.

## 9. Glossary (short)

Kobo: 1/100 naira, the integer money unit. Slice: a vertical delivery increment (0, A to K for P0; L to R for P1). Surface: a deployed app (web or admin). Feature module: a folder under `src/features` owning one capability. Application: a proposal on an application-mode job. BR-nn: backend business rule. FOI-nn: frontend open item.
