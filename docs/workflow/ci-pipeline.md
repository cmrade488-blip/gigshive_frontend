# CI pipeline

Implemented in `.github/workflows/`. GitHub Actions currently runs **no package-manager steps** (no pnpm or Node install). The app quality gates run locally with `pnpm run check` until a CI build stage is added.

## What runs in GitHub today

| Workflow / job | Checks |
|---|---|
| `ci.yml` / **Repository checks** | Required files exist; `package.json` and every YAML file parse; no `.env` files committed (only `.env.example`). |
| `ci.yml` / **Secret scan** | gitleaks over the full history of the branch. |
| `pr-checks.yml` / **Conventional PR title** | Title is `type(scope): lower-case summary`. |
| `pr-checks.yml` / **Task reference present** | `feat`, `fix`, `refactor`, `perf` PRs mention an `FE-nnn` task id. |
| `pr-checks.yml` / **Label by changed paths** | Adds `area:*`, `pkg:*`, `docs`, `ci`, `money-flow` labels. |
| Dependabot | Weekly npm and Actions update PRs (prefix `chore(deps)` / `ci`). |

## What must pass locally before every push

```bash
pnpm run check   # format:check, lint, typecheck, test, build
```

Authors and reviewers treat a failing local check as a blocker; the PR template asks the author to confirm it.

## Stages from Blueprint 12.3 not yet in GitHub Actions

| Stage | Where it will come from |
|---|---|
| Install with frozen lockfile, cached | Added together with the first build job |
| Generate API types, fail on drift | FE-004 (`generate:check`) |
| Lint, type-check, format check | FE-001, FE-002 |
| Unit and component tests with axe | FE-012 |
| Build both apps, bundle budgets | FE-002, FE-003 |
| Dependency audit | With the build job |
| End-to-end on preview build | FE-012, FE-058 |
| Deploy preview, staging, production | After the hosting decision (FOI-02, FE-064) |

When these are added they become required status checks and this page is updated in the same PR.

## Required status checks (set in branch protection)
`Repository checks`, `Secret scan`, `Conventional PR title`, `Task reference present`.

## Quality gates (Blueprint 12.5), enforced by review until automated
Types unchanged from committed output; no lint, type or boundary errors; all tests and accessibility checks pass; bundle budgets respected; no high-severity dependency advisories without a documented exception; PR references the task id and rule ids.
