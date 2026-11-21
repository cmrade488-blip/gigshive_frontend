# Pull requests and review

## Author checklist
Use the template in `.github/PULL_REQUEST_TEMPLATE.md`. Do not delete sections; mark non-applicable items "N/A".

## Reviewer checklist (Blueprint 15.4)
- [ ] Import boundaries respected; only `api/` calls the client.
- [ ] Loading, empty, error, forbidden states handled.
- [ ] Accessibility: labels, focus, keyboard path, axe.
- [ ] No sensitive data in rendering, storage, URLs, logs or analytics.
- [ ] Money handled through the shared utilities; no client arithmetic on charged or paid amounts.
- [ ] Generated types regenerated, not hand-edited.
- [ ] Copy externalised; error codes mapped.
- [ ] Tests meaningful (not only coverage); business-rule IDs cited where relevant.
- [ ] Task status and docs updated.

## Money-flow changes
Anything in `payments`, `wallet`, `contracts`, idempotency or the session proxy: both frontend engineers and a backend reviewer sign off (MVP Plan 5.2, Blueprint 13.4). The PR template's money-flow section must be fully ticked.

## Etiquette
Review within one working day. Prefer questions to commands. Block only on correctness, security, accessibility, spec conflicts or missing tests. Style belongs to Prettier and ESLint, not review.
