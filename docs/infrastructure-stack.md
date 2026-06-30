# Nertura — Infrastructure Stack

> Production technology stack, service boundaries, and operational configuration for all Nertura surfaces.

**Status:** Pre-implementation · **Owner:** CTO  
**Companion:** [`final-production-blueprint.md`](final-production-blueprint.md), [`security-master-plan.md`](security-master-plan.md)

---

## Stack Summary

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui | Marketing, app, admin |
| **Hosting** | Vercel | Edge SSR, serverless functions, previews |
| **Edge / DNS / WAF** | Cloudflare | DNS, TLS, WAF, bot protection, caching |
| **Database** | Supabase Postgres 15+ | OLTP, RLS, realtime (select) |
| **Auth** | Supabase Auth | JWT, email/password, OAuth (V2), MFA |
| **Storage** | Supabase Storage | Photos, exports, media assets |
| **Payments** | Stripe | Subscriptions, invoices, Customer Portal |
| **Email (company)** | Google Workspace | @nertura.com mail |
| **Email (product)** | Resend (primary) or SendGrid | Transactional + lifecycle |
| **AI inference** | OpenAI, Google Gemini, Anthropic Claude | Routed via Brain |
| **Voice** | ElevenLabs, OpenAI TTS | Media Factory (V3) |
| **Video** | Runway, Google Veo, Kling | Media Factory (V3) |
| **Automation** | n8n (self-hosted or cloud), Make.com | Marketing ops, webhooks |
| **WhatsApp** | Meta WhatsApp Cloud API | Primary; Twilio fallback |
| **Analytics** | GA4, PostHog, Vercel Analytics | Product + marketing |
| **Monitoring** | Sentry, Axiom (Logtail), Better Stack uptime | Errors, logs, SLA |
| **Secrets** | Vercel env + Supabase Vault | No repo secrets |

---

## Frontend Architecture

### Three Next.js applications

| App | Domain | Auth | Notes |
|-----|--------|------|-------|
| `apps/web` | nertura.com | Public + optional session for blog comments V2 | ISR/SSG for SEO pages |
| `apps/app` | app.nertura.com | Supabase Auth required | PWA manifest, offline queue |
| `apps/admin` | admin.nertura.com | Supabase Auth + admin role claim | Cloudflare Access optional |

### Shared packages

- `@nertura/ui` — shadcn components, design tokens (`#0B1220`, `#2DDAAF`)
- `@nertura/db` — Generated types from Supabase, query helpers
- `@nertura/brain-client` — Typed Brain API client for Route Handlers

### Rendering strategy

| Surface | Strategy |
|---------|----------|
| Marketing static pages | SSG + revalidate 3600 |
| Marketing blog | ISR on-demand revalidation |
| Dashboard | SSR + client components; React Query for data |
| Admin | SSR; heavy tables virtualized |

---

## Cloudflare Configuration

### DNS records

| Type | Name | Target |
|------|------|--------|
| CNAME | `@` | Vercel apex |
| CNAME | `www` | Vercel |
| CNAME | `app` | Vercel |
| CNAME | `admin` | Vercel |
| CNAME | `status` | Better Stack or Statuspage |
| TXT | `@` | SPF, DMARC, domain verification |
| MX | `@` | Google Workspace |

### Security features (enabled)

- **SSL/TLS:** Full (strict); minimum TLS 1.2; HSTS preload eligible
- **WAF:** OWASP Core Ruleset; custom rules for admin paths
- **Bot Fight Mode:** On for marketing; challenge on auth endpoints
- **Rate limiting:** `/auth/*` 10 req/min/IP; `/api/brain/*` 30 req/min/user; global 1000 req/min/IP
- **DDoS:** Automatic L3/L4/L7
- **Page Rules / Cache Rules:** Cache static assets; bypass cache for `app.*` and `admin.*`

### Admin hardening (recommended)

- Cloudflare Zero Trust Access on `admin.nertura.com` — Google Workspace SSO + device posture (V2)

---

## Supabase — Database

### Projects

| Project | Environment |
|---------|-------------|
| `nertura-dev` | Local + preview |
| `nertura-staging` | Staging |
| `nertura-prod` | Production |

**Region:** Select at launch for primary market (e.g., EU Frankfurt for GDPR-first, or US East; TR users may require EU or dedicated V3).

### Connection patterns

| Client | Key | Usage |
|--------|-----|-------|
| Browser (app) | `anon` + user JWT | RLS-enforced queries via Supabase JS |
| Server (Route Handlers) | `service_role` | Admin ops, webhooks, Brain side effects — **never exposed to client** |
| Migrations | CLI service role | CI/CD only |

### Extensions enabled

- `uuid-ossp` or `pgcrypto` — UUID generation
- `pg_trgm` — search
- `postgis` — field boundaries (optional MVP; GeoJSON JSONB acceptable Day 90)
- `pg_cron` — scheduled jobs (report emails, cleanup) via Supabase

### Realtime

Enable selectively: notifications channel per user; disable blanket table subscriptions.

---

## Supabase — Storage

### Buckets

| Bucket | Access | Content | Max size |
|--------|--------|---------|----------|
| `observations` | Private RLS | Field photos | 10 MB |
| `avatars` | Private RLS | User/org avatars | 2 MB |
| `exports` | Private RLS | GDPR export ZIPs | 500 MB |
| `media-factory` | Private admin | Generated content V3 | 100 MB |
| `legal-assets` | Public read | Published policy PDFs | 5 MB |

### Upload flow

1. Client requests signed upload URL via Route Handler (auth + quota check)
2. Validate MIME whitelist: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
3. Server-side virus scan hook (ClamAV lambda or third-party API) before marking `clean`
4. EXIF strip on images server-side; GPS removed unless user opts in for field tagging
5. Object path: `{org_id}/{entity_type}/{entity_id}/{uuid}.{ext}`

---

## Authentication

### Supabase Auth configuration

| Setting | Value |
|---------|-------|
| Email confirmation | Required |
| Password min length | 12 |
| Leaked password protection | Enabled (HaveIBeenPwned) |
| JWT expiry | 3600s access; refresh rotation |
| Redirect URLs | `app.nertura.com/**`, `admin.nertura.com/**` |
| MFA | TOTP; required for admin roles |

### Application roles (stored in `profiles.role` + `organization_members.role`)

See [`admin-permission-matrix.md`](admin-permission-matrix.md) for admin; app roles: `owner`, `admin`, `manager`, `operator`, `viewer`.

### OAuth (V2)

Google, Apple — configured in Supabase Auth providers; account linking policy documented in Terms.

### Session security

- HttpOnly cookies via `@supabase/ssr`
- SameSite=Lax; Secure flag in production
- Server-side session validation on every protected Route Handler

---

## Email System

### Google Workspace

- Addresses: `hello@`, `support@`, `legal@`, `security@`, `billing@`, `privacy@`
- DMARC: `p=quarantine` → `p=reject` after 30 days monitoring
- SPF includes Google; DKIM configured

### Resend (transactional product email)

| Template | Trigger |
|----------|---------|
| `auth.verify` | Signup |
| `auth.reset` | Password reset |
| `alert.weather` | Frost/rain critical |
| `task.digest` | Daily task summary |
| `billing.receipt` | Stripe invoice paid |
| `privacy.export_ready` | GDPR export link |
| `privacy.deletion_confirmed` | Account deleted |

Domain: `mail.nertura.com` with DKIM/SPF/DMARC aligned.

### SendGrid

Documented as hot-standby if Resend SLA insufficient; same template IDs abstracted in `@nertura/email`.

---

## WhatsApp System

**MVP:** Not live. Architecture pre-provisioned.

| Component | Service |
|-----------|---------|
| BSP | Meta WhatsApp Cloud API (direct) |
| Fallback | Twilio WhatsApp API |
| Webhook | `api.nertura.com/webhooks/whatsapp` — Vercel function |
| Queue | Supabase `whatsapp_inbound_queue` + edge function worker |
| Templates | Meta Business Manager pre-approval |
| Opt-in | Double opt-in stored in `consent_records` |

Full spec: [`../automation/whatsapp-integration.md`](../automation/whatsapp-integration.md).

---

## AI Brain Infrastructure

Brain runs as **server-side service** — not embedded in Next.js bundle.

| Option | MVP | Scale |
|--------|-----|-------|
| Vercel serverless Route Handlers | ✓ | To ~1M inferences/mo |
| Dedicated Node service on Railway/Fly | V2 | Higher concurrency |
| Queue: Supabase pg_boss or Inngest | V2 | Long vision jobs |

Brain responsibilities: provider routing, memory retrieval, credit gate, consent gate, prompt injection filter, audit log write, response streaming.

Canonical: [`nertura-brain-architecture.md`](nertura-brain-architecture.md).

---

## Analytics

| Tool | Scope | Events |
|------|-------|--------|
| **GA4** | Marketing site | Page views, conversions, UTM |
| **PostHog** | App + admin (product) | Feature usage, funnels, session replay (sampled, consent-gated) |
| **Vercel Analytics** | All Next.js apps | Web vitals |
| **Stripe Dashboard** | Revenue | MRR, churn |
| **Brain metrics** | Internal | Inference latency, credit burn, feedback rate |

PostHog: EU cloud instance if primary users EU; cookie consent required per [`cookie-policy-draft.md`](cookie-policy-draft.md).

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Frontend + server errors; release tracking; performance |
| **Axiom** | Structured logs from Vercel, Brain, webhooks |
| **Better Stack** | Uptime on nertura.com, app, admin, api webhooks |
| **Supabase Dashboard** | DB metrics, slow queries |
| **Stripe Radar** | Payment fraud |

Alert routing: PagerDuty or Slack `#incidents` — see [`incident-response-plan.md`](incident-response-plan.md).

### SLIs (production)

| SLI | Target |
|-----|--------|
| App availability | 99.9% |
| Brain p95 latency (text) | <8s |
| Brain p95 latency (vision) | <30s |
| Error rate | <0.1% of requests |

---

## Deployment

### Vercel

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Preview | Every PR |
| Node version | 20 LTS |
| Regions | `iad1` primary; edge globally |
| Environment variables | Per environment; production protected |

### CI/CD (GitHub Actions)

```
push → lint + typecheck + test
     → supabase db lint (migration validate)
     → deploy preview (Vercel)
merge main → deploy production
           → run smoke tests
           → notify Slack
```

### Database migrations

- Supabase CLI migrations in `supabase/migrations/`
- Never edit production manually
- Rollback plan: down migration or forward fix only

### Backup

| Asset | Frequency | Retention |
|-------|-----------|-----------|
| Supabase Postgres | Daily automatic + PITR (Pro plan) | 30 days PITR |
| Storage | Cross-region replication (V2) | Lifecycle 7yr legal hold bucket |
| Stripe | Provider-managed | — |

---

## Automation (n8n / Make)

| Workflow | Tool | Phase |
|----------|------|-------|
| Stripe → Slack notify | n8n | MVP |
| New signup → CRM sheet | Make | V2 |
| Content approval → social queue | n8n | V3 |
| WhatsApp inbound → Brain | Internal | V2 |

Internal workflow engine (V4): replace n8n for core product automations.

---

## Cost Model (Initial Production)

| Service | Est. monthly (100 orgs) |
|---------|-------------------------|
| Vercel Pro | $20–100 |
| Supabase Pro | $25–75 |
| Cloudflare Pro | $20 |
| Resend | $20 |
| Sentry Team | $26 |
| PostHog | $0–50 |
| OpenAI/Claude API | Variable (largest) |
| Stripe | 2.9% + 30¢ |

---

*Infrastructure Stack v1.0 — Pre-implementation.*
