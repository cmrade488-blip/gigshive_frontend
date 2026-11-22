# apps/web

Marketplace web app for visitors, clients and workers. Next.js App Router.

- `src/app`: routes and layouts only. `src/features`: feature modules (see each README). `src/lib`: app glue (session, providers).
- Public pages (jobs, workers) are server rendered; authenticated pages are client rendered behind the session proxy.
- Environment: copy `.env.example` to `.env.local`.
- Must not import from `apps/admin`.
- Spec: Blueprint sections 2 to 6, Data and State Design section 6 (routes).

## Scripts

```bash
pnpm --filter @gigshive/web dev      # http://localhost:3000
pnpm --filter @gigshive/web build
pnpm --filter @gigshive/web typecheck
pnpm --filter @gigshive/web lint
```
