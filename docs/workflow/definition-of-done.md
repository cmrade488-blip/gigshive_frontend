# Definition of Done

From the Frontend MVP Plan section 10.

## Task level
- [ ] Merged to `main` through a reviewed pull request with green GitHub checks and a passing local `pnpm run check`.
- [ ] Tests for new behaviour, including loading, empty, error and forbidden states and every status the screen can show; business-rule IDs cited where relevant.
- [ ] Accessibility: axe passes; keyboard path verified; labels, focus and errors correct.
- [ ] Responsive at 360 px (web); console usable on tablet.
- [ ] Generated types current; no hand-edited generated code; no unjustified `any`.
- [ ] No restricted data in rendering beyond permitted screens, browser storage, logs or analytics.
- [ ] User-facing text in the feature's `copy/` folder; error codes mapped to messages.
- [ ] Import boundaries respected; Data and State Design updated if the client model changed.
- [ ] `docs/tasks/TASKS.md` status updated.

## Slice level
- [ ] All slice tasks done; acceptance criteria demonstrated on staging against the real API.
- [ ] Backend counterpart reviewed the integration.
- [ ] Design reviewed the implemented screens.
- [ ] Blueprint, data design and plan updated for decisions taken.
- [ ] Mocks updated to match the final spec.

## Money-related work (additional)
- [ ] Idempotency proven by tests: double click, retry with same key after network error, refresh during in-flight request, changed body gets a new key.
- [ ] No client-side arithmetic produces any amount charged, credited or paid.
- [ ] Confirmation dialogs restate amount and consequence.
- [ ] 409 and stale-state paths tested, including auto-release while the page is open.
- [ ] Polling bounded, pauses when hidden, has a tested timeout state.
- [ ] Funding return correct from a cold open of the contract page; forged query parameters ignored.
- [ ] Write-only values absent from cache, storage, URLs and logs after submission.
