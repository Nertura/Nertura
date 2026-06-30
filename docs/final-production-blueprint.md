# Nertura — Final Production Blueprint

> Master architecture for production-grade delivery of the Nertura AI agriculture intelligence operating system. **Documentation only — no application code in this phase.**

**Status:** Pre-implementation canonical reference  
**Authority:** [`founder-decisions.md`](founder-decisions.md) (strategy) · [`mvp-definition.md`](mvp-definition.md) (Day 90 scope) · this document (production architecture)  
**Stack:** Next.js · TypeScript · Tailwind · shadcn/ui · Vercel · Cloudflare · Supabase · Stripe  
**Last updated:** June 2026

---

## Executive Summary

Nertura ships as **three customer-facing surfaces**, **one internal admin plane**, and **one intelligence plane** — unified by Supabase Postgres, Supabase Auth, Supabase Storage, and the Nertura Brain API layer.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE EDGE                                    │
│  DNS · TLS · WAF · Bot Fight · Rate Limit · DDoS · Cache · Zero Trust (admin)│
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  MARKETING    │         │  APPLICATION    │         │  ADMIN PANEL    │
│  nertura.com  │         │  app.nertura.com│         │  admin.nertura  │
│  Next.js/Vercel│        │  Next.js/Vercel │         │  Next.js/Vercel │
└───────┬───────┘         └────────┬────────┘         └────────┬────────┘
        │                          │                           │
        └──────────────────────────┼───────────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │  API / SERVER ACTIONS LAYER   │
                    │  Next.js Route Handlers       │
                    │  Supabase Service Role (admin)│
                    └──────────────┬───────────────┘
                                   │
     ┌─────────────────────────────┼─────────────────────────────┐
     ▼                             ▼                             ▼
┌─────────────┐           ┌───────────────┐           ┌─────────────────┐
│  SUPABASE   │           │  NERTURA BRAIN │           │  INTEGRATIONS   │
│  Postgres   │◄─────────►│  AI Gateway    │──────────►│  Stripe         │
│  Auth       │           │  Agents        │           │  Resend/SendGrid│
│  Storage    │           │  Memory/Graph  │           │  Meta WA API    │
│  RLS        │           │  Credit Gate   │           │  OpenAI/Gemini  │
└─────────────┘           └───────────────┘           │  Claude         │
                                                      │  ElevenLabs     │
                                                      │  Runway/Veo/Kling│
                                                      │  n8n / Make     │
                                                      │  GA4 / PostHog  │
                                                      │  Sentry / Axiom │
                                                      └─────────────────┘
```

---

## Twenty Production Domains

| # | Domain | Primary doc | Day 90 MVP | V2+ |
|---|--------|-------------|------------|-----|
| 1 | Front Website | [`frontend-website-spec.md`](frontend-website-spec.md) | Homepage, pricing, auth, legal | Blog CMS, enterprise, demo |
| 2 | Admin Panel | [`admin-panel-spec.md`](admin-panel-spec.md) | Users, orgs, AI logs, audit, health | Full approval centers |
| 3 | User Dashboard | [`../ui/dashboard-wireframe.md`](../ui/dashboard-wireframe.md) | Farmer PWA + web | Multi-role |
| 4 | AI Brain | [`nertura-brain-architecture.md`](nertura-brain-architecture.md) | Assistant + vision | Full agents |
| 5 | CRM | [`../wireframes/crm-screens.md`](../wireframes/crm-screens.md) | — | V2 module |
| 6 | Marketing Engine | [`marketing-growth-system.md`](marketing-growth-system.md) | Static + UTM | Media Factory |
| 7 | SEO Engine | [`seo-engine-spec.md`](seo-engine-spec.md) | Technical SEO base | Programmatic pages |
| 8 | Security | [`security-master-plan.md`](security-master-plan.md) | Full baseline | SOC 2 |
| 9 | Privacy / KVKK / GDPR | [`legal-compliance-master-plan.md`](legal-compliance-master-plan.md) | Full baseline | DPA enterprise |
| 10 | Legal Documents | Policy drafts in `/docs/` | Publish v1 | Lawyer-finalized |
| 11 | Database | [`database-blueprint.md`](database-blueprint.md) + [`database-security-rules.md`](database-security-rules.md) | MVP schema | Full schema |
| 12 | Storage | [`infrastructure-stack.md`](infrastructure-stack.md) § Storage | Photos, avatars | Media pipeline |
| 13 | Authentication | [`infrastructure-stack.md`](infrastructure-stack.md) § Auth | Supabase Auth | OAuth, SSO |
| 14 | Payments | [`payment-billing-system.md`](payment-billing-system.md) | Stripe Starter/Pro | Business tier |
| 15 | Email | [`infrastructure-stack.md`](infrastructure-stack.md) § Email | Transactional | Campaigns |
| 16 | WhatsApp | [`../automation/whatsapp-integration.md`](../automation/whatsapp-integration.md) | — | Phase 3 |
| 17 | Social Automation | [`marketing-growth-system.md`](marketing-growth-system.md) | — | Phase 4 |
| 18 | Analytics | [`infrastructure-stack.md`](infrastructure-stack.md) § Analytics | GA4 + PostHog | Full funnels |
| 19 | Monitoring | [`infrastructure-stack.md`](infrastructure-stack.md) § Monitoring | Sentry + uptime | Axiom full |
| 20 | Deployment | [`infrastructure-stack.md`](infrastructure-stack.md) § Deployment | Vercel prod | Multi-env |

---

## Application Topology

### Domains and routing

| Host | App | Purpose |
|------|-----|---------|
| `nertura.com` | Marketing site (Next.js) | SEO, conversion, legal, blog |
| `www.nertura.com` | 301 → apex | Canonical |
| `app.nertura.com` | User dashboard (Next.js) | Authenticated AgOS |
| `admin.nertura.com` | Admin panel (Next.js) | Internal operations |
| `api.nertura.com` | API gateway (optional V2) | Webhooks, public API |
| `status.nertura.com` | Status page | Uptime transparency |

All hosts proxied through **Cloudflare**. Origin: **Vercel**.

### Monorepo structure (recommended)

```
nertura/
├── apps/
│   ├── web/          # nertura.com marketing
│   ├── app/          # app.nertura.com dashboard
│   └── admin/        # admin.nertura.com
├── packages/
│   ├── ui/           # shadcn + design tokens
│   ├── db/           # Supabase types, RLS policies (SQL migrations)
│   ├── brain/        # Brain client SDK (calls Brain service)
│   └── config/       # Shared eslint, tsconfig
├── supabase/
│   ├── migrations/
│   └── seed/
└── docs/             # This blueprint
```

Single Turborepo; shared TypeScript types generated from Supabase schema.

---

## Data Flow Principles

1. **Browser never holds service role keys** — only anon key + user JWT
2. **Brain never called from browser directly** — Route Handlers proxy with credit/consent gates
3. **Stripe webhooks** — dedicated route, signature verified, idempotent
4. **WhatsApp webhooks** — Meta signature, queue to Brain async
5. **All mutations** — audit log append via database trigger or application middleware
6. **File uploads** — signed URL from Supabase Storage; MIME + size validated server-side

---

## Environment Strategy

| Environment | Purpose | Data |
|-------------|---------|------|
| `local` | Developer machines | Supabase local or dev project |
| `preview` | Vercel PR previews | Isolated Supabase branch (V2) or dev |
| `staging` | Pre-prod QA | Anonymized subset |
| `production` | GA | Live data, separate Supabase project |

Secrets: **Vercel Environment Variables** + **Supabase Vault** for DB-side secrets. No secrets in git. Rotation calendar in [`security-master-plan.md`](security-master-plan.md).

---

## Phased Delivery Alignment

### Phase A — Day 90 GA (MVP)

- Marketing site + app + minimal admin
- Supabase Auth, RLS, MVP schema
- Brain: Q&A + disease vision
- Stripe Starter/Pro
- Resend transactional email
- Cloudflare WAF + rate limits
- Legal v1 published (lawyer review in parallel)
- Sentry + basic uptime

### Phase B — Months 4–9 (V2)

- CRM, Marketplace, WhatsApp center
- Admin approval centers full
- OAuth providers
- PostHog funnels, programmatic SEO
- n8n marketing workflows

### Phase C — Months 10–18 (V3)

- Social automation, Media Factory
- Enterprise SSO, data residency
- Public API, SOC 2 path

---

## Cross-Reference Index

| Topic | Document |
|-------|----------|
| Master index | [`nertura-index.md`](nertura-index.md) |
| Infrastructure | [`infrastructure-stack.md`](infrastructure-stack.md) |
| Security | [`security-master-plan.md`](security-master-plan.md) |
| Legal | [`legal-compliance-master-plan.md`](legal-compliance-master-plan.md) |
| Admin | [`admin-panel-spec.md`](admin-panel-spec.md) + [`admin-permission-matrix.md`](admin-permission-matrix.md) |
| Launch gates | [`production-checklist.md`](production-checklist.md) |
| Design | [`design-system.md`](design-system.md) |
| Brand | [`../brand/README.md`](../brand/README.md) |

---

## Sign-Off Requirements (Pre-Code)

| Role | Approves |
|------|----------|
| CTO | Infrastructure stack, deployment, database |
| CSO | Security master plan, incident response |
| Legal Architect | Legal drafts submitted for external review |
| CPO | MVP scope alignment, admin UX |
| CGO | Marketing, SEO, growth systems |

**Gate:** All nineteen companion documents reviewed · [`production-checklist.md`](production-checklist.md) Phase 0 complete · External counsel engaged for legal v1.

---

*Nertura Final Production Blueprint v1.0 — Pre-implementation. No application code.*
