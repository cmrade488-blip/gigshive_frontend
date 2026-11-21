# ADR 0001: Frontend stack and repository layout

- Status: Accepted
- Date: 2026-11-21
- Deciders: Product owner (stack confirmed), frontend team
- Related: Blueprint 4.3, 4.4, 5, FD-01, FOI-02; MVP Plan FE-001, FE-002

## Context
The backend is a Laravel REST API (`/api/v1`) with an OpenAPI 3 document generated on every build. The frontend needs server-rendered public pages (shareable job and worker links), a separate staff console, a server-side session layer, and a codebase two engineers can work in without collisions.

## Decision
- TypeScript strict, React 19, Next.js App Router (current stable major), Node 24 LTS.
- pnpm workspaces monorepo: `apps/web`, `apps/admin`, `packages/{api-client,ui,config,testing}`.
- TanStack Query for server state; React state for local state; React Hook Form + Zod; Tailwind with accessible headless primitives.
- Types generated from the OpenAPI document into `packages/api-client` (openapi-typescript plus a thin fetch wrapper).
- Vitest, Testing Library, MSW, Playwright, axe; ESLint, Prettier; GitHub Actions; Sentry with scrubbing.
- Trunk-based workflow with squash merges and Conventional Commits.
- Hosting is not part of this decision (FOI-02): it must provide a Node runtime for server rendering and the session proxy.

## Consequences
- The frontend is independent of PHP; the only coupling is the REST/OpenAPI contract.
- Feature modules mirror backend modules and are boundary-checked by lint and an architecture test.
- Versions are pinned in `.nvmrc` and `package.json` as FE-001/FE-002 land.

## Alternatives considered
Laravel with Blade or Inertia (rejected: two separate apps, separate console origin and server-held session are required); plain React with Vite (rejected: no server rendering for public pages).
