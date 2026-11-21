# GitHub repository settings checklist

These cannot be committed as files. A repository admin sets them once. Tick them off.

## Settings > General
- [ ] Pull requests: allow **squash merging** only (default message: pull request title and description). Disable merge commits and rebase merging.
- [ ] Automatically delete head branches.
- [ ] Always suggest updating pull request branches.

## Settings > Branches > Branch protection rule for `main`
- [ ] Require a pull request before merging; require **1 approval**; dismiss stale approvals on new commits; require review from Code Owners.
- [ ] Require status checks to pass; require branches to be up to date. Add: `Repository checks`, `Secret scan`, `Conventional PR title`, `Task reference present`.
- [ ] Require conversation resolution before merging.
- [ ] Require linear history.
- [ ] Do not allow force pushes or deletions. Include administrators.

## Settings > Code security
- [ ] Dependabot alerts and security updates on (version updates come from `.github/dependabot.yml`).
- [ ] Secret scanning and **push protection** on.

## Settings > Actions
- [ ] Workflow permissions: read repository contents by default (workflows request more where needed).
- [ ] Allow GitHub Actions to create pull requests: off.

## Settings > Environments (when hosting is decided)
- [ ] `staging`: no approval needed.
- [ ] `production`: required reviewers (both frontend engineers); deployment secrets stored here.

## Labels
Create once (the labeler workflow adds the `area:*`, `pkg:*`, `docs`, `ci`, `money-flow` labels automatically):
`type:task`, `type:bug`, `hotfix`, `blocked`, `slice:0`, `slice:A` ... `slice:K`, `p0`, `p1`, `needs-spec`.

## Access
- [ ] Both frontend engineers: Write. Backend reviewers: Triage or Write (so they can be requested as reviewers). Update `.github/CODEOWNERS` with real handles.
- [ ] Make sure the Claude/GitHub connector has Contents and Pull requests write access if agents are to open PRs directly.
