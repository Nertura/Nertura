# CI/CD — Nertura Monorepo

## GitHub Actions

Workflow: `.github/workflows/ci.yml`

Runs on push/PR to `main`, `master`, `develop`:

| Step | Command | Notes |
|------|---------|-------|
| CSS import architecture | `pnpm check:css-imports` | App layouts → local globals → shared `@nertura/ui/styles` |
| Legacy chat guard | `pnpm test:no-legacy-chat` | No callers; route returns 410 |
| Tier navigation | `pnpm test:tier-navigation` | Free/Plus/dev override |
| Typecheck | `pnpm typecheck` | All packages |
| Build | `pnpm build` | marketing, dashboard, admin |
| i18n | `pnpm check:i18n` | Farmer-facing English guard |
| Doctor language | `pnpm test:doctor-language` | Requires Supabase secrets in CI |
| Vision language | `pnpm test:doctor-vision-language` | Optional in CI (`continue-on-error`) |
| Projects engine | `pnpm test:projects-engine` | Optional in CI (`continue-on-error`) |
| Interactions | `pnpm test:dashboard-interactions` | Static layout guard |

### Required CI secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## CSS smoke tests (local / staging)

CSS tests hit live HTTP ports and are **not** run in CI by default.

```bash
pnpm build
pnpm --filter @nertura/marketing start   # :3000
pnpm --filter @nertura/dashboard start   # :3001

pnpm test:marketing-css
pnpm test:dashboard-css
pnpm check:css-imports
```

### CSS regression rule

Every Next.js app **must** import `./globals.css` in root `app/layout.tsx`.

Never import `@nertura/ui/globals.css` directly — PostCSS/Tailwind will not run.

## Local full matrix before beta

```bash
pnpm typecheck
pnpm build
pnpm check:i18n
pnpm check:css-imports
pnpm test:no-legacy-chat
pnpm test:tier-navigation
pnpm test:doctor-language
pnpm test:doctor-vision-language
pnpm test:dashboard-doctor
pnpm test:projects-engine
pnpm test:dashboard-interactions
pnpm test:marketing-css
pnpm test:dashboard-css
```

## Dev tier override

Set in `apps/dashboard/.env.local`:

```
NEXT_PUBLIC_NERTURA_DEV_TIER=plus
```

Restart dashboard dev server. Plus nav unlocks without fake Stripe state.
