# @gigshive/brand

Official GigsHive brand kit (v1.0). Colour tokens, Tailwind preset, logos, favicons, icons and illustration pack.

> Source of truth for the design assets lives in [`gigshive_doc/brand`](https://github.com/cmrade488-blip/gigshive_doc/tree/main/brand). This package is the copy that the frontend monorepo actually imports.

## Brand idea

A hexagon (a hive cell) holding a **G**. Honey amber is the brand colour; deep ink navy carries text and trust.

## What's in this package

| Path | Contents |
|------|----------|
| `tokens/` | `colors.json`, `tokens.css` (CSS variables), `tailwind.preset.ts` |
| `logo/` | Mark + horizontal + stacked logos (colour / reversed / mono) |
| `favicon/` | SVG, ICO, PNG app icons |
| `icons/` | 69 SVG icons + sprite + icons.json |
| `images/` | Illustrations, avatars, empty states, hex pattern |
| `social/` | OG image (SVG + PNG) |

## Colour tokens (quick reference)

| Role | Token | Value |
|------|-------|-------|
| Brand | honey-500 | `#F5A000` |
| Brand ink | ink-900 | `#0F1626` |
| Page background | `--gh-bg` | ink-50 / ink-950 |
| Primary button | `--gh-primary` | honey-500 |
| Secondary button | `--gh-secondary` | ink-900 |
| Links | `--gh-link` | blue-600 `#1D4ED8` |

Full palette + light/dark semantic sets are in `tokens/colors.json` and `tokens/tokens.css`.

## Typography

- **Inter** for UI text (400 / 500 / 600)
- **Poppins** Bold for the wordmark and large display headings only

Load with `next/font/google` so they are self-hosted.

## Usage in the apps

```ts
// tailwind.config.ts (apps/web or apps/admin)
import type { Config } from 'tailwindcss';
import brandPreset from '@gigshive/brand/tokens/tailwind.preset';

const config: Config = {
  presets: [brandPreset],
  content: ['./src/**/*.{ts,tsx}'],
  // ...
};
export default config;
```

```css
/* globals.css */
@import '@gigshive/brand/tokens/tokens.css';
```

Dark mode follows the system setting, or force it with `data-theme="dark"` / `data-theme="light"` on `<html>`.

Icons use `currentColor`:

```tsx
import Home from '@gigshive/brand/icons/home.svg';
<Home className="size-5 text-gh-text-muted" />
```

## Copying the remaining assets

The token files are already committed. The binary/SVG asset folders (`logo/`, `favicon/`, `icons/`, `images/`, `social/`) should be copied from the docs repo:

```bash
# from the root of both clones
cp -R ../gigshive_doc/brand/logo packages/brand/
cp -R ../gigshive_doc/brand/favicon packages/brand/
cp -R ../gigshive_doc/brand/icons packages/brand/
cp -R ../gigshive_doc/brand/images packages/brand/
cp -R ../gigshive_doc/brand/social packages/brand/
```

Then commit them on this branch (or a follow-up PR).

## Logo rules (short)

- Clear space ≥ height of the hexagon G on every side
- Minimum sizes: mark 16 px, horizontal logo 96 px wide
- Use colour logo on light backgrounds, reversed on dark, mono for single-colour print
- Do not recolour, stretch, rotate or retype the wordmark
