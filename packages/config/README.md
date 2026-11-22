# packages/config

Shared ESLint (including import-boundary rules), tsconfig and Tailwind presets.

- Tasks: FE-001, FE-010 (boundary lint rules and architecture tests). Owner (proposed): FE1.
- TypeScript strict. Versions pinned in `.nvmrc` and `package.json`.

## Usage

### TypeScript

```json
// apps/web/tsconfig.json
{
  "extends": "@gigshive/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Available presets:

| Path | Use for |
|---|---|
| `@gigshive/config/tsconfig/base.json` | Shared base (strict) |
| `@gigshive/config/tsconfig/nextjs.json` | Next.js apps |
| `@gigshive/config/tsconfig/react-library.json` | Shared React packages |

### ESLint

```js
// apps/web/eslint.config.js
import nextjs from "@gigshive/config/eslint/nextjs";
export default [...nextjs];
```

| Path | Use for |
|---|---|
| `@gigshive/config/eslint/base` | Non-React packages |
| `@gigshive/config/eslint/nextjs` | apps/web, apps/admin |
| `@gigshive/config/eslint/react-library` | packages/ui |

Boundary / architecture rules are added in FE-010.
