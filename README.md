# Nertura

> **The AI Brain for Agriculture** — production monorepo foundation.

**Documentation:** [`docs/foundation/CONSTITUTION.md`](docs/foundation/CONSTITUTION.md) — Foundation is supreme law. [`docs/foundation/README.md`](docs/foundation/README.md) — five books.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database / Auth | Supabase (Postgres 15) |
| Monorepo | pnpm workspaces + Turborepo |
| Lint / Format | ESLint 9 + Prettier |

## Repository structure

```
apps/
  marketing/   → marketing.nertura.com (port 3000)
  dashboard/   → app.nertura.com (port 3001)
  admin/       → admin.nertura.com (port 3002)

packages/
  ui/          → Shared shadcn/ui components and design tokens
  types/       → Shared TypeScript types
  utils/       → Shared utilities
  ai/          → Brain client (server-side gateway placeholder)

supabase/
  migrations/  → Database migrations
  functions/   → Edge functions
  seed/        → Local seed data

docs/          → Product and architecture documentation
brand/         → Logo and brand assets
```

## Prerequisites

- **Node.js** ≥ 20 ([`.nvmrc`](.nvmrc))
- **pnpm** ≥ 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- **Supabase CLI** (optional, for local database): [install guide](https://supabase.com/docs/guides/cli)

## Getting started

```bash
# Install dependencies
pnpm install

# Copy environment templates
cp .env.example .env.local
cp apps/marketing/.env.example apps/marketing/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# Start all apps in development
pnpm dev
```

### Production domains

| App | Domain | Local dev |
|-----|--------|-----------|
| Marketing | https://marketing.nertura.com | http://localhost:3000 |
| Dashboard | https://app.nertura.com | http://localhost:3001 |
| Admin | https://admin.nertura.com | http://localhost:3002 |
| Supabase Studio (local) | http://localhost:54323 |

Run a single app:

```bash
pnpm --filter @nertura/marketing dev
pnpm --filter @nertura/dashboard dev
pnpm --filter @nertura/admin dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Production build for all packages and apps |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting without writing |

## Supabase (local)

```bash
# Start local Supabase stack (requires Docker)
supabase start

# Apply migrations + seed
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > packages/types/src/database.ts
```

### Phase 2 schema

| Table | Purpose |
|-------|---------|
| `organizations` | Tenant root |
| `users` | Profile extension of `auth.users` |
| `memberships` | Org access + RBAC roles |
| `farms` | Farm operations |
| `fields` | Field boundaries (PostGIS) |
| `crops` | Crop seasons on fields |
| `subscriptions` | Billing (Stripe via service role) |
| `ai_conversations` | AI assistant sessions |
| `audit_logs` | Append-only audit trail |

RLS policies: `supabase/policies/` · Migrations: `supabase/migrations/`

### Seed credentials (local)

| Email | Role | Password |
|-------|------|----------|
| `owner@demo.nertura.local` | owner | `NerturaDev2026!` |
| `operator@demo.nertura.local` | operator | `NerturaDev2026!` |
| `viewer@demo.nertura.local` | viewer | `NerturaDev2026!` |
| `admin@demo.nertura.local` | platform admin | `NerturaDev2026!` |

## Shared UI package

Components live in `packages/ui`. Add shadcn components from any app:

```bash
cd apps/dashboard
pnpm dlx shadcn@latest add button
```

Apps import shared styles via `@nertura/ui/globals.css` and components via `@nertura/ui`.

## Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| Void | `#0B1220` | Primary dark / brand background |
| Signal | `#2DDAAF` | Accent / CTA |

See [`docs/design-system.md`](docs/design-system.md) for full design system documentation.

## Engineering phases

| Phase | Status |
|-------|--------|
| **Phase 1** — Monorepo foundation | ✅ Complete |
| **Phase 2** — Database schema + RLS | ✅ Complete |
| **Phase 3** — Supabase project + auth architecture | ✅ Complete |
| **Phase 4** — Authentication UI | ✅ Complete |
| Phase 5 — Dashboard modules (MVP) | Planned |

Product scope is defined in [`docs/mvp-definition.md`](docs/mvp-definition.md). Architecture reference: [`docs/final-production-blueprint.md`](docs/final-production-blueprint.md).

### Phase 3 documentation

| Doc | Purpose |
|-----|---------|
| [`docs/supabase-setup-guide.md`](docs/supabase-setup-guide.md) | Connect production Supabase, apply migrations |
| [`docs/auth-architecture.md`](docs/auth-architecture.md) | Email/password, magic link, MFA, sessions, onboarding |
| [`docs/environment-variables.md`](docs/environment-variables.md) | Full env var reference for all apps |

## License

Proprietary — Nertura. All rights reserved.
