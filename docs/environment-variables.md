# Nertura — Environment Variables

> Complete environment variable reference for local development and production deployment across all apps and services.

**Status:** Phase 3 · **Owner:** Engineering  
**Companion:** [`supabase-setup-guide.md`](supabase-setup-guide.md), [`auth-architecture.md`](auth-architecture.md)

---

## Classification

| Class | Rule | Example |
|-------|------|---------|
| **Public** (`NEXT_PUBLIC_*`) | Safe in browser bundle | Supabase URL, anon key |
| **Server secret** | Vercel encrypted env; never in client | Service role key, Stripe secret |
| **CI secret** | GitHub Actions / Vercel build only | `SUPABASE_ACCESS_TOKEN` |
| **Local only** | `.env.local`; gitignored | All secrets during dev |

**Never commit:** `.env.local`, `.env`, `supabase/.env`, or any file containing real keys.

---

## Quick start (local)

```bash
cp .env.example .env.local
cp apps/marketing/.env.example apps/marketing/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp supabase/.env.example supabase/.env
```

Fill Supabase values from **Dashboard → Project Settings → API** or `supabase status` (local).

---

## Root monorepo (`.env.local`)

Used by Supabase CLI, scripts, and shared tooling.

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Local dev | API URL. Local: `http://127.0.0.1:54321`. Prod: `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Public anon JWT key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Secret.** Bypasses RLS. Server/CLI only |
| `SUPABASE_DB_PASSWORD` | CLI | Database password for `supabase link` / migrations |
| `SUPABASE_PROJECT_ID` | CLI | Project reference ID |
| `SUPABASE_ACCESS_TOKEN` | CLI | Personal access token for `supabase login` |
| `OPENAI_API_KEY` | Phase 4+ | Brain inference (server only) |
| `ANTHROPIC_API_KEY` | Phase 4+ | Brain inference (server only) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Phase 4+ | Brain inference (server only) |
| `STRIPE_SECRET_KEY` | Billing | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Billing | Webhook signature verification |
| `RESEND_API_KEY` | Email | Transactional email |
| `SENTRY_DSN` | Optional | Error monitoring |
| `SENTRY_AUTH_TOKEN` | CI | Source map upload |

---

## Marketing app (`apps/marketing/.env.local`)

**Domain:** `marketing.nertura.com` · **Vercel project:** `nertura-marketing`

| Variable | Public | Required | Description |
|----------|--------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | ✅ | Yes | `http://localhost:3000` / `https://marketing.nertura.com` |
| `NEXT_PUBLIC_APP_DOMAIN` | ✅ | Yes | `marketing.nertura.com` |
| `NEXT_PUBLIC_DASHBOARD_URL` | ✅ | Yes | Link to app login/register |
| `NEXT_PUBLIC_DASHBOARD_DOMAIN` | ✅ | Yes | `app.nertura.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Optional | Only if marketing needs Auth-aware components |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Optional | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | No | Marketing should not use service role |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ✅ | Optional | Google Analytics 4 |
| `NEXT_PUBLIC_POSTHOG_KEY` | ✅ | Optional | Product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | ✅ | Optional | PostHog host URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Optional | Pricing page (Phase 4+) |

---

## Dashboard app (`apps/dashboard/.env.local`)

**Domain:** `app.nertura.com` · **Vercel project:** `nertura-dashboard`

| Variable | Public | Required | Description |
|----------|--------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | ✅ | Yes | `http://localhost:3001` / `https://app.nertura.com` |
| `NEXT_PUBLIC_APP_DOMAIN` | ✅ | Yes | `app.nertura.com` |
| `NEXT_PUBLIC_MARKETING_URL` | ✅ | Yes | Marketing site URL |
| `NEXT_PUBLIC_MARKETING_DOMAIN` | ✅ | Yes | `marketing.nertura.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | **Yes** | Anon key for client Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | **Yes** | Server Route Handlers, webhooks, RPC |
| `BRAIN_API_SECRET` | ❌ | Phase 4+ | Internal Brain gateway auth |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Billing | Stripe.js |
| `STRIPE_SECRET_KEY` | ❌ | Billing | Checkout, portal |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Billing | `/api/webhooks/stripe` |
| `RESEND_API_KEY` | ❌ | Email | Transactional notifications |

---

## Admin app (`apps/admin/.env.local`)

**Domain:** `admin.nertura.com` · **Vercel project:** `nertura-admin`

| Variable | Public | Required | Description |
|----------|--------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | ✅ | Yes | `http://localhost:3002` / `https://admin.nertura.com` |
| `NEXT_PUBLIC_APP_DOMAIN` | ✅ | Yes | `admin.nertura.com` |
| `NEXT_PUBLIC_DASHBOARD_URL` | ✅ | Yes | Farmer app URL |
| `NEXT_PUBLIC_DASHBOARD_DOMAIN` | ✅ | Yes | `app.nertura.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | **Yes** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | **Yes** | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | **Yes** | Admin operations, audit queries |
| `CF_ACCESS_CLIENT_ID` | ❌ | Optional | Cloudflare Access (V2) |
| `CF_ACCESS_CLIENT_SECRET` | ❌ | Optional | Cloudflare Access (V2) |

---

## Supabase CLI (`supabase/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_PROJECT_ID` | Yes | Project ref for `supabase link` |
| `SUPABASE_ACCESS_TOKEN` | Yes | CLI authentication |
| `SUPABASE_DB_PASSWORD` | Yes | Remote database password |

---

## Production deployment matrix

### Vercel environment scoping

| Variable | Marketing | Dashboard | Admin | Notes |
|----------|-----------|-----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview, Prod | Preview, Prod | Preview, Prod | Same Supabase project per env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview, Prod | Preview, Prod | Preview, Prod | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Preview, Prod | Preview, Prod | **Never on Marketing** |
| `STRIPE_*` | Publishable only | All | — | |
| `RESEND_API_KEY` | — | Prod | — | |

### Staging vs production

Use **separate Supabase projects** per environment. Never reuse `SUPABASE_SERVICE_ROLE_KEY` across staging and production.

| Environment | Supabase project | Vercel branch |
|-------------|------------------|---------------|
| Local | `supabase start` | — |
| Staging | `nertura-staging` | `develop` |
| Production | `nertura-production` | `main` |

---

## Auth-related variables (Phase 4)

These are not yet in `.env.example` but will be required when auth UI is built:

| Variable | App | Description |
|----------|-----|-------------|
| `NEXT_PUBLIC_AUTH_REDIRECT_URL` | Dashboard, Admin | OAuth/magic link callback base |
| `AUTH_SESSION_IDLE_TIMEOUT_MS` | Admin | Default: `1800000` (30 min) |
| `AUTH_SESSION_IDLE_TIMEOUT_MS` | Dashboard | Default: `28800000` (8 hr) |

Auth secrets (MFA, sessions) are managed by Supabase — no additional env vars required.

---

## Security rules

1. **`SUPABASE_SERVICE_ROLE_KEY`** — Route Handlers and server actions only; never import in client components
2. **`NEXT_PUBLIC_*`** — Never prefix secrets with `NEXT_PUBLIC_`
3. **Vercel** — Enable "Sensitive" flag on all secret variables
4. **Rotation** — Rotate service role key if exposed; update all Vercel projects within 15 minutes
5. **CI** — Use GitHub environment secrets; scope `SUPABASE_ACCESS_TOKEN` to deployment workflows only

---

## Verification commands

After setting variables:

```bash
# Confirm Supabase connection (local)
supabase status

# Verify schema + auth DB layer
pnpm supabase:verify

# Verify RLS (local with seed)
pnpm supabase:verify:rls

# Generate typed client
supabase gen types typescript --linked > packages/types/src/database.ts
```

---

## Template files

| File | Purpose |
|------|---------|
| [`.env.example`](../.env.example) | Root monorepo template |
| [`apps/marketing/.env.example`](../apps/marketing/.env.example) | Marketing app |
| [`apps/dashboard/.env.example`](../apps/dashboard/.env.example) | Dashboard app |
| [`apps/admin/.env.example`](../apps/admin/.env.example) | Admin app |
| [`supabase/.env.example`](../supabase/.env.example) | Supabase CLI |

---

*Environment Variables v1.0 — Phase 3*
