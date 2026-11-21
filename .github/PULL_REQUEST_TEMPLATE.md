## Task

<!-- Task ID from docs/tasks/TASKS.md, e.g. FE-013. Use "N/A" only for chore, docs or ci changes. -->
Task: FE-___
Closes #___

## What and why

<!-- What changed and why. One task per PR. -->

## How it was tested

<!-- Commands run, screens checked, test names. -->

## Business rules and docs touched

- Business rules reflected (BR-nn):
- Spec documents affected (gigshive_doc): <!-- link a docs PR if the client model, routes or decisions changed -->

## Checklist (Definition of Done)

- [ ] Title follows Conventional Commits: `type(scope): imperative summary` (becomes the squash commit)
- [ ] `pnpm run check` passes locally (GitHub Actions does not run it)
- [ ] Tests added for new behaviour, including loading, empty, error and forbidden states
- [ ] Accessibility checked (axe, keyboard path) on changed screens
- [ ] Responsive at 360 px (web) or tablet (console)
- [ ] No restricted data rendered, stored in the browser, logged or sent to analytics
- [ ] User-facing text is in the feature's `copy/` folder
- [ ] Import boundaries respected (features use only each other's `index.ts`)
- [ ] Generated API code not edited by hand; types regenerated if the spec changed
- [ ] `docs/tasks/TASKS.md` status updated if this PR finishes a task

## Money-flow changes only (funding, contracts, wallet, payouts, idempotency)

- [ ] Idempotency tested: double click, retry with same key, refresh in flight, changed body gets a new key
- [ ] No client-side arithmetic produces any amount the user is charged or paid
- [ ] Confirmation dialog restates amount and consequence
- [ ] 409 and stale-state paths tested
- [ ] A backend reviewer has been requested: @___
