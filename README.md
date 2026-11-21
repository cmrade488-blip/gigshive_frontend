# GigsHive Frontend

[![CI](https://github.com/cmrade488-blip/gigshive_frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/cmrade488-blip/gigshive_frontend/actions/workflows/ci.yml)

GigsHive is a Nigerian online marketplace connecting clients with verified digital creators and skilled physical artisans. This repository is the **frontend monorepo**: the marketplace web app (visitors, clients, workers) and the staff console (verification, moderation, support, finance). It talks only to the GigsHive Laravel REST API (`/api/v1`).

> **Status:** design complete, implementation starting. The folder structure, workflow and CI are in place; app code is built task by task (see [docs/tasks/TASKS.md](docs/tasks/TASKS.md)).

## Stack

TypeScript (strict) · React 19 · Next.js (App Router, current stable major) · pnpm workspaces · TanStack Query · React Hook Form + Zod · Tailwind CSS · Vitest, Testing Library, MSW, Playwright, axe · GitHub Actions · Node 24 LTS (`.nvmrc`).
Decisions and reasons: [docs/adr/0001-frontend-stack.md](docs/adr/0001-frontend-stack.md).

## Repository map

```
apps/
  web/        marketplace web app     (src/app routes, src/features modules, src/lib glue)
  admin/      staff console           (same structure; separate origin and session)
packages/
  api-client/ generated types + fetch wrapper
  ui/         design system (tokens, components, icons)
  config/     eslint, tsconfig, tailwind presets
  testing/    MSW handlers, fixtures, render helpers
docs/
  workflow/   how we work: git, PRs, CI, releases, GitHub setup, Definition of Done
  tasks/      task catalogue (FE-001 to FE-074) and status
  adr/        architecture decision records
  runbooks/   deployment, rollback, incident response
```

Every feature folder under `apps/*/src/features/<name>/` has its own README (purpose, API, rules, tasks) and the standard layout: `api/ components/ screens/ schemas/ state/ copy/ __tests__/ index.ts`.

## Getting started

```bash
nvm use                 # Node 24, from .nvmrc
corepack enable         # provides the pinned pnpm
pnpm install
cp apps/web/.env.example apps/web/.env.local      # then fill in values
cp apps/admin/.env.example apps/admin/.env.local
pnpm run check          # format, lint, typecheck, test, build
```

GitHub Actions does not run pnpm; `pnpm run check` is the local gate before every push (see [docs/workflow/ci-pipeline.md](docs/workflow/ci-pipeline.md)). Commit `pnpm-lock.yaml` with the first PR that adds real packages.

| Command | What it does |
|---|---|
| `pnpm run format` / `format:check` | Prettier write / check |
| `pnpm run lint` | ESLint in every workspace that defines it |
| `pnpm run typecheck` | TypeScript in every workspace that defines it |
| `pnpm run test` | Vitest in every workspace that defines it |
| `pnpm run build` | Build both apps and packages |
| `pnpm run generate:check` | Regenerate API types and fail if the committed output differs |
| `pnpm run check` | The local gate: format, lint, typecheck, test, build, in order |

## How we work (one screen)

1. Pick a task from [docs/tasks/TASKS.md](docs/tasks/TASKS.md); it has a matching GitHub issue titled `FE-013: ...`.
2. Branch from `main`: `feat/FE-013-register-screen`.
3. Commit with Conventional Commits: `feat(auth): add register screen`.
4. Run `pnpm run check`, then open a pull request using the template. Title = the future squash commit. GitHub checks must be green.
5. The other frontend engineer reviews; money-flow changes also need a backend reviewer.
6. Squash and merge. `main` always stays deployable. Flip the task to done in `TASKS.md` in the same PR.

Details: [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/workflow/](docs/workflow/).

## Specifications (source of truth)

All specifications live in the [gigshive_doc](https://github.com/cmrade488-blip/gigshive_doc) repository. Read [START_HERE.md](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/START_HERE.md) first, then:

| Document | Use it for |
|---|---|
| [Frontend Engineering Blueprint](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md) | Architecture, standards, module specs, security, testing, CI/CD |
| [Frontend Data and State Design](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_Data_and_State_Design_v1_1.md) | Types, enumerations, cache keys, routes, UI state machines |
| [Frontend MVP Scope and Implementation Plan](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/frontend/GigsHive_Frontend_MVP_Scope_Implementation_Plan_v1_1.md) | Slices, tasks, ownership, acceptance, Definition of Done |
| [Alignment: frontend and backend](https://github.com/cmrade488-blip/gigshive_doc/blob/main/docs/ALIGNMENT_FRONTEND_BACKEND.md) | How the two doc sets line up |
| [Brand kit](https://github.com/cmrade488-blip/gigshive_doc/tree/main/brand) and [public-site design](https://github.com/cmrade488-blip/gigshive_doc/tree/main/design/public-site) | Tokens, logo, icons, UI designs |

If documents disagree, the backend documents win on API behaviour, business rules and enumerations; the Data and State Design wins on client data modelling; the Blueprint wins on frontend architecture; the MVP Plan wins on scope and order. Full map: [docs/DOC_MAP.md](docs/DOC_MAP.md).

## Working with AI agents

AI coding agents must read [AGENTS.md](AGENTS.md) before touching code. It holds the rules, commands and workflow in a form agents can follow. `CLAUDE.md` points to the same file.
