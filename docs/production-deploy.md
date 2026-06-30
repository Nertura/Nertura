# Nertura Production Deployment

Deploy three separate Vercel projects from this monorepo.

## Apps

| App | Root directory | Domain | Port (local) |
|-----|----------------|--------|--------------|
| Marketing | `apps/marketing` | `nertura.com` | 3000 |
| Dashboard | `apps/dashboard` | `app.nertura.com` | 3001 |
| Admin | `apps/admin` | `admin.nertura.com` | 3002 |

## Vercel settings (each app)

- **Framework:** Next.js
- **Install command:** `pnpm install` (from repo root; set Root Directory to app folder)
- **Build command:** `cd ../.. && pnpm --filter @nertura/<app> build`
- **Output:** default (`.next`)

Or use Turborepo remote cache with `pnpm turbo run build --filter=@nertura/marketing`.

## Environment variables

See `docs/environment-variables.md`. Critical production vars:

### Marketing (`apps/marketing`)
- `NEXT_PUBLIC_SITE_URL=https://nertura.com`
- `NEXT_PUBLIC_DASHBOARD_URL=https://app.nertura.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (server only)
- `GEMINI_MODEL=gemini-2.5-flash`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, guest doctor)

### Dashboard (`apps/dashboard`)
- `NEXT_PUBLIC_APP_URL=https://app.nertura.com`
- `NEXT_PUBLIC_SITE_URL=https://nertura.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED=true`
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `STRIPE_SECRET_KEY` (optional, billing)
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Admin (`apps/admin`)
- `NEXT_PUBLIC_APP_URL=https://admin.nertura.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_AUTH_DISABLED=false` (**required in production**)
- `CRON_SECRET` (outreach weekly cron)
- `ANTHROPIC_API_KEY` (optional, draft generation)
- `RESEND_API_KEY` (optional, email send)
- `GEMINI_API_KEY` (content engine)

## DNS (Cloudflare)

| Type | Name | Value |
|------|------|-------|
| CNAME | `@` | Vercel marketing project |
| CNAME | `app` | Vercel dashboard project |
| CNAME | `admin` | Vercel admin project |

SSL: Full (strict). Enable proxy as needed.

## Supabase

1. Run migrations: `pnpm supabase:push`
2. Auth → URL Configuration:
   - Site URL: `https://app.nertura.com`
   - Redirect URLs:
     - `https://app.nertura.com/auth/callback`
     - `https://admin.nertura.com/auth/callback`
     - `http://localhost:3001/auth/callback` (dev)
     - `http://localhost:3002/auth/callback` (dev)
3. Google OAuth: see `docs/google-oauth-setup.md`
4. Assign `platform_admin` role to founder account (custom claim or users metadata per `isPlatformAdmin` implementation)

## Stripe

1. Create products for credit packs
2. Webhook endpoint: `https://app.nertura.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Set `STRIPE_WEBHOOK_SECRET` in dashboard Vercel env

## Resend (admin outreach)

1. Verify sending domain
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
3. Outreach sends **only** after founder approval in admin UI

## Production smoke test

1. Marketing: homepage loads, 3 guest questions, signup CTA
2. Dashboard: Google OAuth → onboarding → doctor question with farm context
3. Admin: login as platform_admin, outreach approve flow (no send without approval)
4. Credits: new user has 10 credits, debit on doctor question
5. Cron: `GET /api/cron/outreach-weekly` without `Authorization: Bearer $CRON_SECRET` → 401

## Security checklist

- [ ] `ADMIN_AUTH_DISABLED=false` on admin production
- [ ] No `NEXT_PUBLIC_*` vars contain secrets
- [ ] RLS enabled (verify: `pnpm supabase:verify:rls`)
- [ ] Service role keys server-only
- [ ] Security headers active (next.config.ts)
