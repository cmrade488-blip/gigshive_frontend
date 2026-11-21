# Contributing

This is the short version. Details are in [docs/workflow/](docs/workflow/). AI agents also read [AGENTS.md](AGENTS.md).

## The loop

1. **Task.** Every change starts from a task in [docs/tasks/TASKS.md](docs/tasks/TASKS.md) and its GitHub issue (`FE-013: ...`). New work gets a new FE number first.
2. **Branch.** From latest `main`: `<type>/<FE-id>-<description>`, e.g. `feat/FE-013-register-screen`. Types: `feat fix refactor perf test docs chore ci`.
3. **Commit.** Conventional Commits, lower-case imperative, scope = feature or package: `feat(auth): add register screen`.
4. **Check.** `pnpm run check` must pass locally.
5. **Pull request.** Fill in the template. Title uses the same format and becomes the squash commit. One task per PR; open early as a draft if you want feedback.
6. **Review.** The other frontend engineer reviews. Money-flow changes (funding, contracts, wallet, payouts) also need a backend reviewer.
7. **Merge.** Squash and merge after green CI and approval. The branch is deleted. Update the task status in `TASKS.md` in the same PR.

## Keeping in sync

- Rebase on `main` before pushing: `git fetch origin && git rebase origin/main`. Use `--force-with-lease` only on your own feature branch.
- If your change alters the client data model, routes or a recorded decision, amend the specification in the [gigshive_doc](https://github.com/cmrade488-blip/gigshive_doc) repository in a linked PR and note it in the PR template.
- Generated API types are regenerated, never edited. `pnpm run generate:check` catches drift locally.

## Branch protection and CI

`main` is protected: pull requests only, required checks green, one approval, linear history. GitHub Actions runs repository, secret-scan and PR-title checks only; run `pnpm run check` locally. Setup checklist: [docs/workflow/github-setup.md](docs/workflow/github-setup.md). Pipeline details: [docs/workflow/ci-pipeline.md](docs/workflow/ci-pipeline.md).

## Reporting problems

Use the Bug issue template. Include the request id from the error screen; never paste personal or financial data.
