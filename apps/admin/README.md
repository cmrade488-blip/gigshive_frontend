# apps/admin

Staff console for verification, moderation, support and finance. Next.js App Router.

- `src/app`: routes and layouts only. `src/features`: feature modules (see each README). `src/lib`: app glue (session, providers).
- Separate origin and session from the marketplace web app.
- Environment: copy `.env.example` to `.env.local`.
- Must not import from `apps/web`.
- `error.tsx`, `global-error.tsx` and `not-found.tsx` use the shared FE-009 state components and public copy; they never render server text.
- Spec: Blueprint sections 2 to 6, Data and State Design section 6 (routes).

## Scripts

```bash
pnpm --filter @gigshive/admin dev      # http://localhost:3001
pnpm --filter @gigshive/admin build
pnpm --filter @gigshive/admin typecheck
pnpm --filter @gigshive/admin lint
```
