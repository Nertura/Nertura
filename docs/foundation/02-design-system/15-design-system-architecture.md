# Design System Architecture

**Version:** 1.0 · 2026-06-28  
**Status:** Single source of truth for all Nertura web surfaces

---

## Principle

There is **one** visual design system. Marketing, dashboard, admin, and future mobile/PWA must share it.

**Source of truth:** `packages/ui/src/styles/`

Apps must not duplicate tokens, Tailwind entry, or component-layer CSS.

---

## Directory structure

```
packages/ui/src/styles/
  globals.css      ← Tailwind entry + ordered module imports
  tokens.css       ← CSS variables (light/dark, semantic, z-index, shadows)
  typography.css   ← Base body / border defaults
  layout.css       ← Shell / page containers
  forms.css        ← Shared form focus helpers
  buttons.css      ← Touch-target helpers
  cards.css        ← Empty states, card primitives
  chat.css         ← Composer + message bubbles
  doctor.css       ← Case status badges, doctor-specific
  overlays.css     ← Modal/dropdown z-index helpers
  animations.css   ← Fade/slide + reduced-motion
  utilities.css    ← sr-only and small shared helpers

packages/ui/src/tokens/
  colors.ts spacing.ts radius.ts typography.ts shadows.ts index.ts
  ← Mirror CSS variables for future React Native / Expo
```

---

## App integration rule

### `app/layout.tsx` (required)

```tsx
import './globals.css';
```

### `app/globals.css` (required — import only)

```css
@import "@nertura/ui/globals.css";
```

### Forbidden in app `layout.tsx`

```tsx
import '@nertura/ui/globals.css';
import '@nertura/ui/styles/globals.css';
```

### Forbidden in app `globals.css`

- `@tailwind base/components/utilities` (owned by shared package)
- Duplicated token blocks or one-off color definitions
- Copy-pasted chat/doctor/card classes

---

## Tailwind

Each app `tailwind.config.ts` must scan:

- `./src/**/*.{ts,tsx}`
- `../../packages/ui/src/**/*.{ts,tsx}`

Use `@nertura/ui/tailwind.config` as the shared theme base.

---

## Regression prevention

| Guard | Command |
|-------|---------|
| CSS import architecture | `pnpm check:css-imports` |
| Marketing CSS smoke | `pnpm test:marketing-css` (requires `:3000`) |
| Dashboard CSS smoke | `pnpm test:dashboard-css` (requires `:3001`) |
| Admin CSS smoke | `pnpm test:admin-css` (requires `:3002`) |

**Dev server startup (CSS smoke):**

```bash
pnpm --filter @nertura/marketing dev:fresh   # :3000
pnpm --filter @nertura/dashboard dev:fresh  # :3001
pnpm --filter @nertura/admin dev:fresh      # :3002
pnpm test:marketing-css && pnpm test:dashboard-css && pnpm test:admin-css
```

Do **not** run `pnpm build` while dev servers are active — concurrent `.next` writes cause 500s.

---

## Adding new styles

1. Identify the module (`chat.css`, `doctor.css`, etc.)
2. Add classes in `@layer components` or `@layer utilities`
3. Prefer existing `--nertura-*` / shadcn HSL tokens — no random hex in components
4. If a new token is needed, add to `tokens.css` **and** `packages/ui/src/tokens/`
5. Run `pnpm check:css-imports` + CSS smoke tests

---

## Future mobile

TypeScript tokens in `packages/ui/src/tokens/` mirror CSS variables conceptually. When building Expo/React Native, import tokens from `@nertura/ui/tokens` — do not fork colors per app.

---

## Related

- Visual spec: [`docs/design-system.md`](../../design-system.md)
- Book 02 chapters: [`docs/foundation/02-design-system/`](./)
- CI notes: [`docs/deployment/CI_CD_README.md`](../../deployment/CI_CD_README.md)
