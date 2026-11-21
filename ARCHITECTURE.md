# Architecture

pnpm workspaces monorepo: two Next.js apps (apps/web, apps/admin) and shared packages (api-client, ui, config, testing).

## Boundary rules
1. A feature must not import another feature's folders; use its index.ts or a shared package.
2. Only a feature's api/ folder calls the API client.
3. Routes import screens; screens import components; components never import routes.
4. Shared packages must not import from apps or features.
5. apps/web and apps/admin must not import from each other.
6. Restricted types exist only in the console.

See gigshive_doc/docs/frontend/GigsHive_Frontend_Engineering_Blueprint_v1_1.md sections 4 and 5.
