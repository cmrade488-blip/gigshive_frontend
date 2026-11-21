# Releases and environments

Hosting, CI host and error tracker details are decision FOI-02. The planning default is two separate hosting projects (marketplace and console) on separate domains with a Node runtime. Deploy workflows are added when the host is confirmed (FE-064).

| Environment | API target | Trigger | Purpose |
|---|---|---|---|
| Local | MSW mocks or local backend | Developer | Day-to-day work |
| Preview | Staging API | Every pull request | Design and QA review |
| Staging | Staging API with provider sandboxes | Merge to `main` (automatic) | Slice acceptance, end-to-end runs |
| Production | Production API | Manual approval | Live users |

## Release process (Blueprint 13.4)
1. Merge to `main` deploys to staging.
2. Run the slice acceptance checklist (MVP Plan section 11) on staging.
3. Promote to production by manual approval. Money-flow changes need both frontend engineers and a backend reviewer.
4. Watch error rates and web vitals for the first hour; roll back on regression (instant rollback to the previous build).
5. Tag the production release: `web-vMAJOR.MINOR.PATCH` and `admin-vMAJOR.MINOR.PATCH`. Breaking API changes (v2) are coordinated with the backend; v1 stays additive.

## Configuration
Environment variables per app, documented in each `.env.example`. No secrets in the repository. Secrets live in the host's secret store and GitHub environment secrets. Required settings: API base URL, public site URL, session secret and cookie settings, allowed gateway redirect host, error tracker keys, feature flags for P1 modules.
