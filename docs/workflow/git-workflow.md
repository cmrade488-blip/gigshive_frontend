# Git workflow

Trunk-based development with short-lived branches and pull requests (Blueprint 12.2). `main` is always deployable.

## 1. Task to issue
Every change maps to a task in [../tasks/TASKS.md](../tasks/TASKS.md). Each task has a GitHub issue titled `FE-013: Register and email OTP verification screens`, created from the **Task** template. New work gets a new FE number added to `TASKS.md` first (in a `docs` PR).

## 2. Branches
Create from the latest `main`:

```
<type>/<FE-id>-<short-kebab-description>
feat/FE-013-register-screen
fix/FE-039-payment-return-timeout
docs/FE-063-handover-runbook
chore/repo-update-node-lts        (no task: chore, docs, ci only)
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`. One task per branch. Delete the branch after merge (automatic).

## 3. Commits
Conventional Commits, imperative, lower-case summary, 72 characters or fewer:

```
<type>(<scope>): <summary>

<optional body: why, not what>

Refs: FE-013
```

Scope is a feature module or package: `web admin auth profiles verification media catalog jobs proposals contracts payments wallet admin-ops api-client ui config testing docs ci deps repo`.

Examples: `feat(auth): add register screen`, `fix(payments): ignore forged query string on return page`, `ci: add gitleaks scan`.

Branch commits may be messy; the **PR title** becomes the squash commit on `main`, so the title must be clean.

## 4. Stay in sync
```bash
git fetch origin
git rebase origin/main        # before pushing and before requesting review
git push --force-with-lease   # own feature branch only, never main, never a shared branch
```

## 5. Pull request
- Open early as a **draft** if you want feedback; mark ready when `pnpm run check` passes.
- Fill the template: task ID, `Closes #issue`, BR ids, tests, checklist.
- Title: `type(scope): summary` (checked by CI).
- Keep it small: one task, ideally under about 400 changed lines excluding generated code.

## 6. Review and merge
- GitHub checks green (repository checks, secret scan, PR title, task reference) and the author has run `pnpm run check` locally.
- One approval from the other frontend engineer. Money-flow changes (labelled `money-flow` automatically) also need a backend reviewer.
- Review comments are addressed with new commits; resolve conversations.
- **Squash and merge** only. No merge commits, no direct pushes to `main`, no self-merge.
- Same PR flips the task to `done` in `TASKS.md`.

## 7. After merge
Merging to `main` deploys to staging once hosting is set up (see [release-and-environments.md](release-and-environments.md)). The issue closes through `Closes #n`.

## 8. Hotfix
Same flow with `fix/...`, label `hotfix`, expedited review. Never skip the PR or CI.

## 9. Spec changes
If the client data model, routes or a decision changes, update the specification in `gigshive_doc` in a linked PR (state its URL in the template) before or together with the code.
