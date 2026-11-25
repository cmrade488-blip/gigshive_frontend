# packages/ui

Design system: accessible components built on top of the official brand tokens.

- Tasks: FE-006 (tokens and base components), FE-009 (standard screen states), FE-037 (money components), FE-040 (status badges). Owner (proposed): FE1.
- **Brand tokens, logos, icons and images live in `packages/brand` (`@gigshive/brand`).** Import the Tailwind preset and `tokens.css` from there. This package no longer carries a placeholder palette (FOI-05 is closed).
- Must not import from apps or features. Console-only components live here but are tree-shaken from the web app.
- Spec: Blueprint section 9.

## Quick start

```ts
// tailwind.config.ts
import brandPreset from '@gigshive/brand/tokens/tailwind.preset';
export default { presets: [brandPreset], content: ['./src/**/*.{ts,tsx}'] };
```

```css
/* globals.css */
@import '@gigshive/brand/tokens/tokens.css';
```

## Standard screen states (FE-009)

`StateMessage` is the presentational base. Use `LoadingState`, `EmptyState`, `NotFoundState`, `ForbiddenState`, `ErrorState`, `OfflineBanner` and `ActionToast` for the states every screen must handle. They accept all user-facing copy from the caller; pass fixed public strings, never a server message, error code or URL. `errorCopyFor()` in `@gigshive/shared/error-copy` supplies the shared fallback copy for API error kinds.
