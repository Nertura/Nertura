# Nertura — Supabase Setup Guide

> Connect the production Supabase project, apply migrations, configure Auth, and verify security before deployment.

**Status:** Phase 3 · **Owner:** Engineering  
**Companion:** [`auth-architecture.md`](auth-architecture.md), [`environment-variables.md`](environment-variables.md), [`database-security-rules.md`](database-security-rules.md)

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| [Supabase account](https://supabase.com) | Pro plan recommended for production |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | v2.x |
| [Docker Desktop](https://docs.docker.com/desktop/) | Local dev only |
| Node.js ≥ 20, pnpm ≥ 9 | Monorepo tooling |

---

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Configure:
   - **Name:** `nertura-production` (or `nertura-staging` for preview)
   - **Database password:** Generate and store in password manager
   - **Region:** `eu-central-1` (Frankfurt) or closest to primary users — align with `organizations.region_code`
3. Wait for provisioning (~2 minutes)
4. Record from **Project Settings → General**:
   - **Project ID** (reference)
   - **Project URL** → `https://<ref>.supabase.co`
   - **API keys** → anon (public) and service_role (secret)

---

## 2. Link the monorepo

```bash
# Install CLI (if needed)
npm install -g supabase

# Authenticate
supabase login

# From repo root
cd /path/to/Nertura
supabase link --project-ref <YOUR_PROJECT_REF>
```

Copy credentials:

```bash
cp supabase/.env.example supabase/.env
# Edit: SUPABASE_PROJECT_ID, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD
```

Update `supabase/config.toml` for local parity:

```toml
project_id = "<YOUR_PROJECT_REF>"
```

---

## 3. Apply migrations to production

### Migration inventory

| File | Purpose |
|------|---------|
| `20250619000000_extensions.sql` | PostGIS, pgcrypto, private schema |
| `20250619000100_enums_and_helpers.sql` | Enums, timestamp triggers |
| `20250619000200_core_schema.sql` | 9 core tables |
| `20250619000250_security_functions.sql` | RLS helpers, auth.users sync |
| `20250619000300_indexes_and_triggers.sql` | Indexes, audit triggers, soft delete |
| `20250619000400_enable_rls.sql` | Enable + force RLS |
| `20250619000500_apply_policies.sql` | All RLS policies |
| `20250620000000_auth_production.sql` | Onboarding function, auth audit helper |

### Push to remote

```bash
# Dry run — review diff
supabase db diff --linked

# Apply all pending migrations
supabase db push
```

**Do not run seed on production.** `supabase/seed/seed.sql` is local development only.

### Verify migrations

```bash
pnpm supabase:verify
```

Expected output: `VERIFICATION PASSED` for schema, RLS, and auth database layer.

---

## 4. Configure Auth (Dashboard)

Navigate to **Authentication → Providers → Email**.

| Setting | Production value |
|---------|------------------|
| Enable Email provider | ✅ On |
| Confirm email | ✅ On |
| Secure email change | ✅ On |
| Minimum password length | **12** |
| Leaked password protection | ✅ On (Pro plan) |

Navigate to **Authentication → URL Configuration**.

| Setting | Value |
|---------|-------|
| Site URL | `https://app.nertura.com` |
| Redirect URLs | See table below |

### Redirect URLs (add all)

```
https://app.nertura.com/**
https://admin.nertura.com/**
https://marketing.nertura.com/**
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3002/**
```

Navigate to **Authentication → MFA**.

| Setting | Value |
|---------|-------|
| TOTP (Authenticator app) | ✅ Enabled |
| Max enrolled factors | 10 |

**Admin policy:** Set `users.mfa_required = true` for admin panel users (via service role after first login). Admin app must block module access until MFA enrolled.

Navigate to **Authentication → Email Templates**.

Customize (optional at launch):
- Confirm signup
- Magic Link
- Reset password
- Change email address

Use Nertura branding; sender domain must match Resend/`mail.nertura.com` when custom SMTP is configured.

---

## 5. Magic link (OTP email)

Magic link uses Supabase `signInWithOtp`. No separate provider toggle — it is part of the Email provider.

Local config (`supabase/config.toml`):

```toml
[auth.email]
otp_length = 6
otp_expiry = 3600
```

Production: OTP expiry and rate limits are managed in Dashboard under **Authentication → Rate Limits**.

**Flow:** User enters email → receives link or 6-digit code → redirects to `app.nertura.com/auth/callback` (Route Handler to implement in Phase 4).

---

## 6. Environment variables

Set secrets in **Vercel** (per app) and locally. Full reference: [`environment-variables.md`](environment-variables.md).

Minimum for Auth to work on dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

---

## 7. Generate TypeScript types

After migrations are applied:

```bash
supabase gen types typescript --linked > packages/types/src/database.ts
```

Commit the generated types file when schema changes.

---

## 8. Verify RLS policies

```bash
# Local (requires Docker + seed)
supabase db reset
pnpm supabase:verify:rls
```

### Policy coverage matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `organizations` | member | authenticated (creator) | admin | soft only |
| `users` | self + org admin | self | self + admin | soft only |
| `memberships` | member | admin + bootstrap owner | admin | soft only |
| `farms` | member | operator+ | operator+ | soft only |
| `fields` | member | operator+ | operator+ | soft only |
| `crops` | member | operator+ | operator+ | soft only |
| `subscriptions` | owner/admin | service role only | service role only | — |
| `ai_conversations` | own + admin | own | own | soft only |
| `audit_logs` | admin | insert only | — | — |

Policy source files: `supabase/policies/*.sql`

---

## 9. Verify auth flows (checklist)

Run `supabase/scripts/verify-auth.sql` for database-layer checks, then complete manual verification in Dashboard + staging app.

| Flow | Verification |
|------|--------------|
| Email/password signup | User created in `auth.users`; row synced to `public.users` via trigger |
| Email confirmation | Unconfirmed user cannot access dashboard |
| Email/password login | JWT issued; session cookie set via `@supabase/ssr` (Phase 4) |
| Magic link / OTP | Email received; link redirects to callback URL |
| Password reset | Reset email sent; password updates in Auth |
| MFA enrollment | TOTP factor in `auth.mfa_factors`; `mfa_required` respected |
| MFA challenge | AAL2 required for admin routes |
| Logout | Session revoked; cookies cleared |
| Org onboarding | `create_organization_with_owner()` creates org + membership + trial subscription |
| Session refresh | Refresh token rotation; no expired access token accepted |

---

## 10. Production deployment checklist

- [ ] Migrations applied (`supabase db push`)
- [ ] `pnpm supabase:verify` passes
- [ ] Auth URLs configured for all three domains
- [ ] Email confirmation enabled
- [ ] MFA enabled (TOTP)
- [ ] Password min length ≥ 12
- [ ] Service role key in Vercel **server-only** env
- [ ] RLS verification passed locally
- [ ] TypeScript types generated and committed
- [ ] Seed **not** run on production
- [ ] Database backups enabled (Supabase default)
- [ ] Connection pooling enabled (Supabase Pooler / transaction mode for serverless)

---

## 11. Staging vs production

| | Staging | Production |
|--|---------|------------|
| Supabase project | `nertura-staging` | `nertura-production` |
| Vercel env | Preview | Production |
| Auth site URL | `https://staging-app.nertura.com` | `https://app.nertura.com` |
| Seed data | Optional | Never |

Use separate Supabase projects — never share service role keys across environments.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `db push` fails on PostGIS | Enable PostGIS in Dashboard → Database → Extensions |
| RLS blocks all queries | Confirm user has `memberships` row; check JWT `sub` |
| Auth redirect loop | Add exact callback URL to Redirect URLs list |
| `create_organization_with_owner` permission denied | Call via authenticated client or RPC with user JWT |
| Migration version conflict | `supabase migration repair` — contact engineering |

---

*Supabase Setup Guide v1.0 — Phase 3*
