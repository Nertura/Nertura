# Nertura Enterprise Production Readiness Program v1

> **Document ID:** NERTURA-EPR-v1  
> **Version:** 1.0  
> **Date:** June 2026  
> **Owner:** Engineering & Operations  
> **Scope:** AI Agriculture SaaS — marketing (`nertura.com`), dashboard (`app.nertura.com`), admin (`admin.nertura.com`)  
> **Stack:** Vercel · Cloudflare · Supabase · Google Workspace · GitHub · Next.js monorepo · Gemini AI · Stripe · Resend

---

## 1. Executive Summary

Nertura is an **AI-powered Agriculture Intelligence Platform** serving Turkish farmers through a guest marketing experience, a authenticated multi-tenant dashboard, and a privileged admin growth engine. This program defines **312 enterprise-grade production readiness checks** across infrastructure, security, compliance, AI safety, and launch gates.

**Current readiness snapshot:**

| Metric | Value |
|--------|-------|
| Total checklist items | 312 |
| P0 Critical items | 105 |
| P0 completed | 3 |
| Status DONE | 3 |
| Status IN_PROGRESS | 21 |
| Status TODO | 288 |
| Status BLOCKED | 0 |

**Gate question (from Constitution):** Does this make Nertura safer, faster, more reliable, or easier to operate in production? Every item must answer yes before launch.

**Primary launch blockers (typical):**

1. Hosted Supabase redirect URLs and RLS verification on production project  
2. `ADMIN_AUTH_DISABLED=false` on admin production  
3. Cloudflare DNS + TLS for all three domains  
4. Google OAuth and email auth on `app.nertura.com`  
5. KVKK/legal pages linked from auth flows  
6. AI cost controls and Turkish language QA  

---

## 2. Current Infrastructure Status

| Component | Target state | Production domain / endpoint | Owner | Notes |
|-----------|--------------|------------------------------|-------|-------|
| Marketing app | Vercel + Cloudflare | `https://nertura.com` | Product / Eng | Guest doctor, SEO, legal |
| Dashboard app | Vercel + Cloudflare | `https://app.nertura.com` | Eng | Auth, AI Doctor, billing |
| Admin app | Vercel + Cloudflare | `https://admin.nertura.com` | Ops / Growth | Platform admin only |
| Database & Auth | Supabase hosted | Project ref in env | Eng | Shared across apps |
| AI primary | Google Gemini | `gemini-2.5-flash` | Eng | Server-side only |
| AI optional | OpenAI | gpt-4o-mini | Eng | Optional fallback |
| Email auth | Supabase / SMTP | — | Eng | Registration, reset |
| Email outreach | Resend | Verified domain | Ops | Approval-gated |
| Payments | Stripe | Webhook on dashboard | Eng | Credit packs |
| Maps | Mapbox | Client token restricted | Eng | Farm map |
| Source control | GitHub | Monorepo | Eng | PR checks required |
| DNS / CDN / WAF | Cloudflare | nertura.com zone | Ops | Full strict SSL |

### Checklist

> **Items in this section:** 15

#### INF-001 — Three Vercel projects mapped to marketing, dashboard, admin

- **ID:** INF-001
- **Category:** Infrastructure
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Launch blocked without three-app separation
- **Description:** Three Vercel projects mapped to marketing, dashboard, admin
- **Why it matters:** Nertura is a monorepo with distinct surfaces and blast-radius isolation requirements.
- **How to verify:** Vercel dashboard shows three projects with correct root directories.
- **How to fix:** Create projects per docs/production-deploy.md; link GitHub repo branches.
- **Expected result:** Independent deploy pipelines for nertura.com, app, admin.

#### INF-002 — Production env vars documented and set per app in Vercel

- **ID:** INF-002
- **Category:** Infrastructure
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Wrong env vars break auth and AI in production
- **Description:** Production env vars documented and set per app in Vercel
- **Why it matters:** Each app has different NEXT_PUBLIC_* and server secrets.
- **How to verify:** Compare Vercel env to docs/environment-variables.md for each app.
- **How to fix:** Import env from .env.example; mark secrets as Sensitive.
- **Expected result:** All apps boot with correct URLs and keys.

#### INF-003 — Hosted Supabase project linked with migrations applied

- **ID:** INF-003
- **Category:** Infrastructure
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Hosted Supabase misconfiguration breaks OAuth
- **Description:** Hosted Supabase project linked with migrations applied
- **Why it matters:** Auth, RLS, and storage depend on production Supabase state.
- **How to verify:** pnpm supabase:verify && supabase:verify:rls against production.
- **How to fix:** pnpm supabase:push; verify auth URL config.
- **Expected result:** Schema matches repo; RLS policies active.

#### INF-004 — Cloudflare DNS records for apex, app, admin CNAME to Vercel

- **ID:** INF-004
- **Category:** Infrastructure
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS mispoint causes outage or cert errors
- **Description:** Cloudflare DNS records for apex, app, admin CNAME to Vercel
- **Why it matters:** Users reach apps via nertura.com domains only.
- **How to verify:** dig nertura.com, app.nertura.com, admin.nertura.com.
- **How to fix:** Add CNAME records per production-deploy.md; SSL Full Strict.
- **Expected result:** All domains resolve with valid TLS.

#### INF-005 — Google Workspace / Resend domains verified for transactional email

- **ID:** INF-005
- **Category:** Infrastructure
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Email deliverability failure for auth and outreach
- **Description:** Google Workspace / Resend domains verified for transactional email
- **Why it matters:** Registration, reset, and admin outreach require trusted senders.
- **How to verify:** Send test auth email and check SPF/DKIM pass.
- **How to fix:** Configure DNS TXT/MX; verify domain in Resend.
- **Expected result:** Auth emails land in inbox not spam.

#### INF-006 — GitHub Actions or Vercel checks run typecheck, build, test on PR

- **ID:** INF-006
- **Category:** Infrastructure
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** CI gaps allow broken builds to ship
- **Description:** GitHub Actions or Vercel checks run typecheck, build, test on PR
- **Why it matters:** Monorepo regressions must be caught pre-merge.
- **How to verify:** Open PR; confirm required checks pass.
- **How to fix:** Add workflow running pnpm typecheck, build, check, test.
- **Expected result:** Merge blocked on failing quality gates.

#### INF-007 — Staging Vercel preview or dedicated staging projects exist

- **ID:** INF-007
- **Category:** Infrastructure
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** No staging environment increases production risk
- **Description:** Staging Vercel preview or dedicated staging projects exist
- **Why it matters:** Validate migrations and OAuth before production cutover.
- **How to verify:** Deploy preview URL with staging Supabase branch.
- **How to fix:** Create staging projects; use Supabase branching or second project.
- **Expected result:** Safe rehearsal environment for releases.

#### INF-008 — All secrets in Vercel/GitHub Secrets; none in git

- **ID:** INF-008
- **Category:** Infrastructure
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Secret sprawl in local .env files
- **Description:** All secrets in Vercel/GitHub Secrets; none in git
- **Why it matters:** Leaked keys compromise tenant and AI billing.
- **How to verify:** git log --all -- .env.local; secret scanning enabled.
- **How to fix:** Rotate any exposed keys; enable GitHub secret scanning.
- **Expected result:** Zero secrets in repository history.

#### INF-009 — Turborepo remote cache configured for Vercel builds

- **ID:** INF-009
- **Category:** Infrastructure
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Turbo cache misconfig slows deploys
- **Description:** Turborepo remote cache configured for Vercel builds
- **Why it matters:** Three-app monorepo builds benefit from shared cache.
- **How to verify:** Vercel build logs show cache hits.
- **How to fix:** Link Turbo remote cache to Vercel team.
- **Expected result:** Faster CI and deploy times.

#### INF-010 — Infrastructure changes documented in decision archive

- **ID:** INF-010
- **Category:** Infrastructure
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** No IaC for DNS or Supabase drift
- **Description:** Infrastructure changes documented in decision archive
- **Why it matters:** Enterprise ops requires auditable change history.
- **How to verify:** Check docs/foundation/10-decision-archive for infra changes.
- **How to fix:** Log DNS/Supabase changes after each modification.
- **Expected result:** Recoverable knowledge of production state.

#### INF-011 — Google Cloud project billing alerts for Gemini API

- **ID:** INF-011
- **Category:** Infrastructure
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Gemini API quota exhaustion
- **Description:** Google Cloud project billing alerts for Gemini API
- **Why it matters:** AI Doctor is core product; outage blocks value delivery.
- **How to verify:** GCP console billing alerts configured.
- **How to fix:** Set budget alerts; quota limits per project.
- **Expected result:** Early warning before AI cost or quota failure.

#### INF-012 — Stripe live mode products and webhooks configured

- **ID:** INF-012
- **Category:** Infrastructure
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Stripe misconfig blocks revenue
- **Description:** Stripe live mode products and webhooks configured
- **Why it matters:** Credit purchases require live checkout and webhooks.
- **How to verify:** Test purchase in live mode with test card disabled.
- **How to fix:** Configure webhook at app.nertura.com/api/webhooks/stripe.
- **Expected result:** Credits granted after successful payment.

#### INF-013 — Mapbox token URL-restricted to production domains

- **ID:** INF-013
- **Category:** Infrastructure
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Mapbox token abuse
- **Description:** Mapbox token URL-restricted to production domains
- **Why it matters:** Public token in dashboard bundle can be scraped.
- **How to verify:** Mapbox dashboard URL restrictions list app.nertura.com.
- **How to fix:** Add HTTP referrer restrictions on token.
- **Expected result:** Token unusable from unauthorized origins.

#### INF-014 — CRON_SECRET set on admin Vercel project

- **ID:** INF-014
- **Category:** Infrastructure
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Admin cron unprotected
- **Description:** CRON_SECRET set on admin Vercel project
- **Why it matters:** Outreach cron must not be publicly triggerable.
- **How to verify:** curl admin cron route without auth returns 401.
- **How to fix:** Set CRON_SECRET; verify 401 without Bearer token.
- **Expected result:** Only Vercel Cron can invoke outreach jobs.

#### INF-015 — ADMIN_AUTH_DISABLED=false on admin production

- **ID:** INF-015
- **Category:** Infrastructure
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin auth bypass in production
- **Description:** ADMIN_AUTH_DISABLED=false on admin production
- **Why it matters:** Admin panel controls growth engine and sensitive data.
- **How to verify:** Check Vercel env for admin project.
- **How to fix:** Set ADMIN_AUTH_DISABLED=false; redeploy.
- **Expected result:** Unauthenticated users cannot access admin routes.

---

## 3. Production Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Cloudflare (DNS/WAF)       │
                    └───────────┬─────────────┬───────────┘
                                │             │
              nertura.com       │  app.*      │  admin.*
                                ▼             ▼
                    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                    │ Vercel        │ │ Vercel        │ │ Vercel        │
                    │ apps/marketing│ │ apps/dashboard│ │ apps/admin    │
                    │ :3000         │ │ :3001         │ │ :3002         │
                    └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
                            │                 │                 │
                            └────────────┬────┴─────────────────┘
                                         ▼
                              ┌─────────────────────┐
                              │ Supabase (Auth+DB+  │
                              │ Storage) + RLS      │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              Google Gemini          Stripe              Resend
              (AI Doctor)           (Credits)           (Outreach)
```

**Monorepo packages:** `@nertura/ui`, `@nertura/utils`, `@nertura/ai`, `@nertura/types`, `@nertura/geo`

**Cross-app URL policy:** `packages/utils/src/nertura-urls.ts` — never hardcode localhost in production paths.

### Checklist

> **Items in this section:** 12

#### ARCH-001 — Document three-app boundary: marketing guest, dashboard tenant, admin platform

- **ID:** ARCH-001
- **Category:** Architecture
- **Priority:** P0 Critical
- **Status:** DONE
- **Risk:** Architectural confusion during incidents
- **Description:** Document three-app boundary: marketing guest, dashboard tenant, admin platform
- **Why it matters:** Clear ownership speeds debugging and security reviews.
- **How to verify:** Read docs/production-deploy.md and NERTURA_ARCHITECTURE_BIBLE.md.
- **How to fix:** Keep architecture docs updated with each new surface.
- **Expected result:** Team understands data flow across apps.

#### ARCH-002 — Shared URL helper packages/utils/nertura-urls.ts used for all cross-app links

- **ID:** ARCH-002
- **Category:** Architecture
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Cross-app URL leaks in production
- **Description:** Shared URL helper packages/utils/nertura-urls.ts used for all cross-app links
- **Why it matters:** Prevents localhost and open-redirect bugs.
- **How to verify:** pnpm test:mobile-lan-urls && test:dashboard-auth-urls.
- **How to fix:** Route all auth/marketing links through nertura-urls.
- **Expected result:** Production URLs always use correct domains.

#### ARCH-003 — Marketing guest API uses service role server-only with rate limits

- **ID:** ARCH-003
- **Category:** Architecture
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Service role exposure from marketing guest doctor
- **Description:** Marketing guest API uses service role server-only with rate limits
- **Why it matters:** Guest doctor is high-abuse surface.
- **How to verify:** Confirm SUPABASE_SERVICE_ROLE_KEY not in client bundle.
- **How to fix:** Audit apps/marketing API routes; server-only imports.
- **Expected result:** Service role never shipped to browser.

#### ARCH-004 — Single Supabase project with RLS tenant isolation documented

- **ID:** ARCH-004
- **Category:** Architecture
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Shared Supabase project blast radius
- **Description:** Single Supabase project with RLS tenant isolation documented
- **Why it matters:** All apps share auth and data layer.
- **How to verify:** Review RLS policies per organization_id.
- **How to fix:** Run supabase:verify:rls before launch.
- **Expected result:** Tenant A cannot read Tenant B data.

#### ARCH-005 — Monorepo packages (@nertura/ui, utils, ai) versioned via workspace

- **ID:** ARCH-005
- **Category:** Architecture
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Package dependency confusion
- **Description:** Monorepo packages (@nertura/ui, utils, ai) versioned via workspace
- **Why it matters:** Consistent design system and AI pipeline across apps.
- **How to verify:** pnpm why @nertura/ai in each app.
- **How to fix:** Avoid duplicate AI logic in apps; use packages/ai.
- **Expected result:** Single source for AI behaviour.

#### ARCH-006 — Middleware and API routes use correct Next.js runtime

- **ID:** ARCH-006
- **Category:** Architecture
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge vs Node runtime misassignment
- **Description:** Middleware and API routes use correct Next.js runtime
- **Why it matters:** Supabase SSR requires Node in some routes.
- **How to verify:** Review export const runtime on API routes.
- **How to fix:** Set runtime nodejs where Supabase server client used.
- **Expected result:** No Edge incompatibility errors in production.

#### ARCH-007 — Stripe and Supabase webhooks use HTTPS production URLs only

- **ID:** ARCH-007
- **Category:** Architecture
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Webhook endpoints unreachable
- **Description:** Stripe and Supabase webhooks use HTTPS production URLs only
- **Why it matters:** Billing and auth sync depend on webhooks.
- **How to verify:** Stripe dashboard shows successful webhook deliveries.
- **How to fix:** Update webhook URLs to app.nertura.com.
- **Expected result:** Events processed within seconds.

#### ARCH-008 — Admin content engine documents Gemini primary, Anthropic optional

- **ID:** ARCH-008
- **Category:** Architecture
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Admin AI optional providers unclear
- **Description:** Admin content engine documents Gemini primary, Anthropic optional
- **Why it matters:** Ops team must know which keys are required.
- **How to verify:** Read admin README and env.example.
- **How to fix:** Document required vs optional keys in production-readiness.
- **Expected result:** Clear key dependency matrix.

#### ARCH-009 — pnpm check:i18n passes on release branch

- **ID:** ARCH-009
- **Category:** Architecture
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** i18n Turkish farmer-facing leaks
- **Description:** pnpm check:i18n passes on release branch
- **Why it matters:** English leaks erode trust with Turkish farmers.
- **How to verify:** Run pnpm check:i18n in CI.
- **How to fix:** Fix banned strings in farmer-facing UI.
- **Expected result:** Zero banned English in production UI.

#### ARCH-010 — /intake redirect documented as build-time env limitation

- **ID:** ARCH-010
- **Category:** Architecture
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Intake redirect env-only on LAN
- **Description:** /intake redirect documented as build-time env limitation
- **Why it matters:** Mobile LAN QA must use direct dashboard URLs.
- **How to verify:** Read DEV_MOBILE_TESTING.md intake note.
- **How to fix:** Use app.nertura.com/intake in production.
- **Expected result:** No surprise redirects in prod.

#### ARCH-011 — Knowledge ingestion scripts tested against staging Supabase

- **ID:** ARCH-011
- **Category:** Architecture
- **Priority:** P2 Medium
- **Status:** IN_PROGRESS
- **Risk:** Knowledge ingestion pipeline untested in prod
- **Description:** Knowledge ingestion scripts tested against staging Supabase
- **Why it matters:** Admin knowledge base feeds AI Doctor evidence.
- **How to verify:** pnpm test:knowledge-ingestion against staging.
- **How to fix:** Run ingestion dry-run before prod content push.
- **Expected result:** Validated ingestion without prod corruption.

#### ARCH-012 — Geo package integrated only where farm context required

- **ID:** ARCH-012
- **Category:** Architecture
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Geo intelligence package unused in prod paths
- **Description:** Geo package integrated only where farm context required
- **Why it matters:** Reduces unused code and attack surface.
- **How to verify:** Audit imports of @nertura/geo in production routes.
- **How to fix:** Remove dead geo endpoints if any.
- **Expected result:** Minimal geo API exposure.

---

## 4. Domain & DNS Readiness

### Checklist

> **Items in this section:** 15


#### DOM-001 — Apex nertura.com resolves to marketing Vercel

- **ID:** DOM-001
- **Category:** Domain & DNS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** Apex nertura.com resolves to marketing Vercel
- **Why it matters:** Primary marketing entry
- **How to verify:** dig nertura.com
- **How to fix:** CNAME @ to Vercel
- **Expected result:** Apex nertura.com resolves to marketing Vercel — verified in production.

#### DOM-002 — app.nertura.com resolves to dashboard Vercel

- **ID:** DOM-002
- **Category:** Domain & DNS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** app.nertura.com resolves to dashboard Vercel
- **Why it matters:** Farmer product surface
- **How to verify:** dig app.nertura.com
- **How to fix:** CNAME app to dashboard project
- **Expected result:** app.nertura.com resolves to dashboard Vercel — verified in production.

#### DOM-003 — admin.nertura.com resolves to admin Vercel

- **ID:** DOM-003
- **Category:** Domain & DNS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** admin.nertura.com resolves to admin Vercel
- **Why it matters:** Platform ops surface
- **How to verify:** dig admin.nertura.com
- **How to fix:** CNAME admin to admin project
- **Expected result:** admin.nertura.com resolves to admin Vercel — verified in production.

#### DOM-004 — WWW redirect policy defined (www → apex or reverse)

- **ID:** DOM-004
- **Category:** Domain & DNS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** WWW redirect policy defined (www → apex or reverse)
- **Why it matters:** SEO and cookie consistency
- **How to verify:** curl -I https://www.nertura.com
- **How to fix:** Cloudflare redirect rule
- **Expected result:** WWW redirect policy defined (www → apex or reverse) — verified in production.

#### DOM-005 — TLS certificates valid on all three domains

- **ID:** DOM-005
- **Category:** Domain & DNS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** TLS certificates valid on all three domains
- **Why it matters:** Trust and browser security
- **How to verify:** SSL Labs test A rating
- **How to fix:** Enable Full Strict SSL in Cloudflare
- **Expected result:** TLS certificates valid on all three domains — verified in production.

#### DOM-006 — HSTS enabled at Cloudflare for all domains

- **ID:** DOM-006
- **Category:** Domain & DNS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** HSTS enabled at Cloudflare for all domains
- **Why it matters:** Downgrade attack prevention
- **How to verify:** Check Strict-Transport-Security header
- **How to fix:** Cloudflare SSL/TLS HSTS settings
- **Expected result:** HSTS enabled at Cloudflare for all domains — verified in production.

#### DOM-007 — DNSSEC evaluated for nertura.com zone

- **ID:** DOM-007
- **Category:** Domain & DNS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** DNSSEC evaluated for nertura.com zone
- **Why it matters:** DNS spoofing mitigation
- **How to verify:** Cloudflare DNSSEC status
- **How to fix:** Enable DNSSEC if registrar supports
- **Expected result:** DNSSEC evaluated for nertura.com zone — verified in production.

#### DOM-008 — Email MX records for Google Workspace

- **ID:** DOM-008
- **Category:** Domain & DNS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** Email MX records for Google Workspace
- **Why it matters:** Founder and support email
- **How to verify:** dig MX nertura.com
- **How to fix:** Configure Google Workspace MX
- **Expected result:** Email MX records for Google Workspace — verified in production.

#### DOM-009 — SPF record includes Google and Resend

- **ID:** DOM-009
- **Category:** Domain & DNS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** SPF record includes Google and Resend
- **Why it matters:** Email authentication
- **How to verify:** dig TXT nertura.com SPF
- **How to fix:** Add v=spf1 include records
- **Expected result:** SPF record includes Google and Resend — verified in production.

#### DOM-010 — DKIM configured for Workspace and Resend

- **ID:** DOM-010
- **Category:** Domain & DNS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** DKIM configured for Workspace and Resend
- **Why it matters:** Deliverability
- **How to verify:** Send test; check Authentication-Results
- **How to fix:** Add DKIM CNAME/TXT records
- **Expected result:** DKIM configured for Workspace and Resend — verified in production.

#### DOM-011 — DMARC policy published (p=none then quarantine)

- **ID:** DOM-011
- **Category:** Domain & DNS
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** DMARC policy published (p=none then quarantine)
- **Why it matters:** Spoofing protection
- **How to verify:** dig TXT _dmarc.nertura.com
- **How to fix:** Publish DMARC record
- **Expected result:** DMARC policy published (p=none then quarantine) — verified in production.

#### DOM-012 — No dangling DNS records to old hosts

- **ID:** DOM-012
- **Category:** Domain & DNS
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** No dangling DNS records to old hosts
- **Why it matters:** Subdomain takeover risk
- **How to verify:** Audit all DNS records in Cloudflare
- **How to fix:** Remove unused CNAME/A records
- **Expected result:** No dangling DNS records to old hosts — verified in production.

#### DOM-013 — API subdomain policy (no public api.nertura.com unless intended)

- **ID:** DOM-013
- **Category:** Domain & DNS
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** API subdomain policy (no public api.nertura.com unless intended)
- **Why it matters:** Attack surface reduction
- **How to verify:** Confirm no unintended subdomains
- **How to fix:** Document allowed subdomains only
- **Expected result:** API subdomain policy (no public api.nertura.com unless intended) — verified in production.

#### DOM-014 — Lower TTL plan for cutover documented

- **ID:** DOM-014
- **Category:** Domain & DNS
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** Lower TTL plan for cutover documented
- **Why it matters:** Rollback speed during DNS migration
- **How to verify:** Review TTL values pre-launch
- **How to fix:** Set TTL 300 before migration
- **Expected result:** Lower TTL plan for cutover documented — verified in production.

#### DOM-015 — Domain registrar lock enabled

- **ID:** DOM-015
- **Category:** Domain & DNS
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** DNS/TLS misconfiguration causes outage or trust loss
- **Description:** Domain registrar lock enabled
- **Why it matters:** Domain hijacking prevention
- **How to verify:** Check registrar lock status
- **How to fix:** Enable transfer lock
- **Expected result:** Domain registrar lock enabled — verified in production.

---

## 5. Vercel Deployment Readiness

### Checklist

> **Items in this section:** 20


#### VER-001 — Marketing project root apps/marketing

- **ID:** VER-001
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Marketing project root apps/marketing
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Marketing project root apps/marketing — confirmed.

#### VER-002 — Dashboard project root apps/dashboard

- **ID:** VER-002
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Dashboard project root apps/dashboard
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Dashboard project root apps/dashboard — confirmed.

#### VER-003 — Admin project root apps/admin

- **ID:** VER-003
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Admin project root apps/admin
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Admin project root apps/admin — confirmed.

#### VER-004 — Build command uses pnpm filter for each app

- **ID:** VER-004
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Build command uses pnpm filter for each app
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Build command uses pnpm filter for each app — confirmed.

#### VER-005 — Node.js 20+ engine enforced

- **ID:** VER-005
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Node.js 20+ engine enforced
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Node.js 20+ engine enforced — confirmed.

#### VER-006 — Production branch protection (main only)

- **ID:** VER-006
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Production branch protection (main only)
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Production branch protection (main only) — confirmed.

#### VER-007 — Preview deployments enabled for PRs

- **ID:** VER-007
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Preview deployments enabled for PRs
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Preview deployments enabled for PRs — confirmed.

#### VER-008 — Vercel env scoped Production vs Preview

- **ID:** VER-008
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Vercel env scoped Production vs Preview
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Vercel env scoped Production vs Preview — confirmed.

#### VER-009 — Sensitive env vars marked Sensitive in Vercel

- **ID:** VER-009
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Sensitive env vars marked Sensitive in Vercel
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Sensitive env vars marked Sensitive in Vercel — confirmed.

#### VER-010 — No NEXT_PUBLIC_ prefix on service role or Stripe secret

- **ID:** VER-010
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** No NEXT_PUBLIC_ prefix on service role or Stripe secret
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: No NEXT_PUBLIC_ prefix on service role or Stripe secret — confirmed.

#### VER-011 — Function region appropriate (iad1 or closest to Supabase)

- **ID:** VER-011
- **Category:** Vercel Deployment
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Function region appropriate (iad1 or closest to Supabase)
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Function region appropriate (iad1 or closest to Supabase) — confirmed.

#### VER-012 — Vercel Analytics enabled on marketing and dashboard

- **ID:** VER-012
- **Category:** Vercel Deployment
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Vercel Analytics enabled on marketing and dashboard
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Vercel Analytics enabled on marketing and dashboard — confirmed.

#### VER-013 — Speed Insights enabled for Core Web Vitals

- **ID:** VER-013
- **Category:** Vercel Deployment
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Speed Insights enabled for Core Web Vitals
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Speed Insights enabled for Core Web Vitals — confirmed.

#### VER-014 — Deployment notifications to Slack/email

- **ID:** VER-014
- **Category:** Vercel Deployment
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Deployment notifications to Slack/email
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Deployment notifications to Slack/email — confirmed.

#### VER-015 — Rollback procedure tested (promote previous deployment)

- **ID:** VER-015
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Rollback procedure tested (promote previous deployment)
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Rollback procedure tested (promote previous deployment) — confirmed.

#### VER-016 — Custom domains attached with valid certs

- **ID:** VER-016
- **Category:** Vercel Deployment
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Custom domains attached with valid certs
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Custom domains attached with valid certs — confirmed.

#### VER-017 — Redirects in next.config reviewed for production URLs

- **ID:** VER-017
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Redirects in next.config reviewed for production URLs
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Redirects in next.config reviewed for production URLs — confirmed.

#### VER-018 — Image optimization domains whitelisted

- **ID:** VER-018
- **Category:** Vercel Deployment
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Image optimization domains whitelisted
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Image optimization domains whitelisted — confirmed.

#### VER-019 — Serverless function timeout adequate for AI routes

- **ID:** VER-019
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Serverless function timeout adequate for AI routes
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Serverless function timeout adequate for AI routes — confirmed.

#### VER-020 — Vercel Cron jobs configured for admin outreach

- **ID:** VER-020
- **Category:** Vercel Deployment
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Deploy failure or misconfiguration blocks launch
- **Description:** Vercel Cron jobs configured for admin outreach
- **Why it matters:** Vercel hosts all three Nertura production surfaces.
- **How to verify:** Inspect Vercel project settings against production-deploy.md.
- **How to fix:** Update project settings; redeploy.
- **Expected result:** Vercel: Vercel Cron jobs configured for admin outreach — confirmed.

---

## 6. Cloudflare Security & Performance

### Checklist

> **Items in this section:** 18


#### CF-001 — Proxy enabled (orange cloud) for public web traffic

- **ID:** CF-001
- **Category:** Cloudflare
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Proxy enabled (orange cloud) for public web traffic
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Proxy enabled (orange cloud) for public web traffic — active.

#### CF-002 — SSL/TLS Full (strict) mode

- **ID:** CF-002
- **Category:** Cloudflare
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** SSL/TLS Full (strict) mode
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** SSL/TLS Full (strict) mode — active.

#### CF-003 — Always Use HTTPS enabled

- **ID:** CF-003
- **Category:** Cloudflare
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Always Use HTTPS enabled
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Always Use HTTPS enabled — active.

#### CF-004 — Automatic HTTPS Rewrites enabled

- **ID:** CF-004
- **Category:** Cloudflare
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Automatic HTTPS Rewrites enabled
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Automatic HTTPS Rewrites enabled — active.

#### CF-005 — Bot Fight Mode or Super Bot Fight Mode evaluated

- **ID:** CF-005
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Bot Fight Mode or Super Bot Fight Mode evaluated
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Bot Fight Mode or Super Bot Fight Mode evaluated — active.

#### CF-006 — Rate limiting rules on /api/auth and /api/ai

- **ID:** CF-006
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Rate limiting rules on /api/auth and /api/ai
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Rate limiting rules on /api/auth and /api/ai — active.

#### CF-007 — WAF managed ruleset enabled

- **ID:** CF-007
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** WAF managed ruleset enabled
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** WAF managed ruleset enabled — active.

#### CF-008 — Challenge passage for suspicious login bursts

- **ID:** CF-008
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Challenge passage for suspicious login bursts
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Challenge passage for suspicious login bursts — active.

#### CF-009 — Cache rules: static assets long TTL, HTML short/no cache

- **ID:** CF-009
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Cache rules: static assets long TTL, HTML short/no cache
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Cache rules: static assets long TTL, HTML short/no cache — active.

#### CF-010 — Bypass cache for authenticated dashboard routes

- **ID:** CF-010
- **Category:** Cloudflare
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Bypass cache for authenticated dashboard routes
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Bypass cache for authenticated dashboard routes — active.

#### CF-011 — Cloudflare Access considered for admin.nertura.com

- **ID:** CF-011
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Cloudflare Access considered for admin.nertura.com
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Cloudflare Access considered for admin.nertura.com — active.

#### CF-012 — IP allowlist optional for admin (founder IPs)

- **ID:** CF-012
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** IP allowlist optional for admin (founder IPs)
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** IP allowlist optional for admin (founder IPs) — active.

#### CF-013 — Page Rules or Transform Rules for security headers backup

- **ID:** CF-013
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Page Rules or Transform Rules for security headers backup
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Page Rules or Transform Rules for security headers backup — active.

#### CF-014 — DDoS protection alert notifications

- **ID:** CF-014
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** DDoS protection alert notifications
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** DDoS protection alert notifications — active.

#### CF-015 — Real User Monitoring optional integration

- **ID:** CF-015
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Real User Monitoring optional integration
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Real User Monitoring optional integration — active.

#### CF-016 — Argo Smart Routing evaluated for Turkey latency

- **ID:** CF-016
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Argo Smart Routing evaluated for Turkey latency
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Argo Smart Routing evaluated for Turkey latency — active.

#### CF-017 — Firewall rule blocking known bad ASNs if needed

- **ID:** CF-017
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Firewall rule blocking known bad ASNs if needed
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Firewall rule blocking known bad ASNs if needed — active.

#### CF-018 — Logpush to SIEM optional for enterprise

- **ID:** CF-018
- **Category:** Cloudflare
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Edge security gap exposes origin or enables abuse
- **Description:** Logpush to SIEM optional for enterprise
- **Why it matters:** Cloudflare is first line of defense for nertura.com properties.
- **How to verify:** Cloudflare dashboard settings audit.
- **How to fix:** Apply recommended Cloudflare configuration.
- **Expected result:** Logpush to SIEM optional for enterprise — active.

---

## 7. Supabase Production Readiness

### Checklist

> **Items in this section:** 22


#### SUP-001 — Production project separate from dev experiments

- **ID:** SUP-001
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Production project separate from dev experiments
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Production project separate from dev experiments — verified.

#### SUP-002 — All migrations applied via pnpm supabase:push

- **ID:** SUP-002
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** All migrations applied via pnpm supabase:push
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: All migrations applied via pnpm supabase:push — verified.

#### SUP-003 — verify-migrations.sql passes

- **ID:** SUP-003
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** verify-migrations.sql passes
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: verify-migrations.sql passes — verified.

#### SUP-004 — verify-rls.sql passes

- **ID:** SUP-004
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** verify-rls.sql passes
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: verify-rls.sql passes — verified.

#### SUP-005 — verify-auth.sql passes

- **ID:** SUP-005
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** verify-auth.sql passes
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: verify-auth.sql passes — verified.

#### SUP-006 — Site URL https://app.nertura.com

- **ID:** SUP-006
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Site URL https://app.nertura.com
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Site URL https://app.nertura.com — verified.

#### SUP-007 — Redirect URLs include app and admin callbacks

- **ID:** SUP-007
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Redirect URLs include app and admin callbacks
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Redirect URLs include app and admin callbacks — verified.

#### SUP-008 — Google OAuth provider enabled with prod credentials

- **ID:** SUP-008
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Google OAuth provider enabled with prod credentials
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Google OAuth provider enabled with prod credentials — verified.

#### SUP-009 — Apple OAuth evaluated or explicitly disabled

- **ID:** SUP-009
- **Category:** Supabase
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Apple OAuth evaluated or explicitly disabled
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Apple OAuth evaluated or explicitly disabled — verified.

#### SUP-010 — Email confirmations enabled for signup

- **ID:** SUP-010
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Email confirmations enabled for signup
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Email confirmations enabled for signup — verified.

#### SUP-011 — Leaked password protection enabled

- **ID:** SUP-011
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Leaked password protection enabled
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Leaked password protection enabled — verified.

#### SUP-012 — JWT expiry appropriate (3600s or policy)

- **ID:** SUP-012
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** JWT expiry appropriate (3600s or policy)
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: JWT expiry appropriate (3600s or policy) — verified.

#### SUP-013 — Refresh token rotation enabled

- **ID:** SUP-013
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Refresh token rotation enabled
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Refresh token rotation enabled — verified.

#### SUP-014 — Anonymous sign-ins disabled

- **ID:** SUP-014
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Anonymous sign-ins disabled
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Anonymous sign-ins disabled — verified.

#### SUP-015 — SMS auth disabled until CAPTCHA and provider ready

- **ID:** SUP-015
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** SMS auth disabled until CAPTCHA and provider ready
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: SMS auth disabled until CAPTCHA and provider ready — verified.

#### SUP-016 — Database backups enabled (PITR on Pro)

- **ID:** SUP-016
- **Category:** Supabase
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Database backups enabled (PITR on Pro)
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Database backups enabled (PITR on Pro) — verified.

#### SUP-017 — Connection pooling configured for serverless

- **ID:** SUP-017
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Connection pooling configured for serverless
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Connection pooling configured for serverless — verified.

#### SUP-018 — Supabase Storage buckets created with policies

- **ID:** SUP-018
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Supabase Storage buckets created with policies
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Supabase Storage buckets created with policies — verified.

#### SUP-019 — Realtime disabled on tables unless required

- **ID:** SUP-019
- **Category:** Supabase
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Realtime disabled on tables unless required
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Realtime disabled on tables unless required — verified.

#### SUP-020 — Edge Functions audited or none deployed

- **ID:** SUP-020
- **Category:** Supabase
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Edge Functions audited or none deployed
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Edge Functions audited or none deployed — verified.

#### SUP-021 — Supabase audit logs enabled

- **ID:** SUP-021
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Supabase audit logs enabled
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Supabase audit logs enabled — verified.

#### SUP-022 — Service role key rotation procedure documented

- **ID:** SUP-022
- **Category:** Supabase
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Data breach, auth bypass, or data loss
- **Description:** Service role key rotation procedure documented
- **Why it matters:** Supabase is system of record for users, farms, cases, and AI history.
- **How to verify:** Supabase dashboard + pnpm supabase:verify scripts.
- **How to fix:** Apply Supabase dashboard settings and run migrations.
- **Expected result:** Supabase: Service role key rotation procedure documented — verified.

---

## 8. Authentication & Authorization

### Checklist

> **Items in this section:** 18


#### AUTH-001 — Google OAuth redirectTo uses production app origin only

- **ID:** AUTH-001
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Google OAuth redirectTo uses production app origin only
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Google OAuth redirectTo uses production app origin only — enforced in production.

#### AUTH-002 — Auth callback route sanitizes next param (no open redirect)

- **ID:** AUTH-002
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** DONE
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Auth callback route sanitizes next param (no open redirect)
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Auth callback route sanitizes next param (no open redirect) — enforced in production.

#### AUTH-003 — Signout uses request origin not localhost env

- **ID:** AUTH-003
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** DONE
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Signout uses request origin not localhost env
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Signout uses request origin not localhost env — enforced in production.

#### AUTH-004 — Session cookies HttpOnly Secure SameSite

- **ID:** AUTH-004
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Session cookies HttpOnly Secure SameSite
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Session cookies HttpOnly Secure SameSite — enforced in production.

#### AUTH-005 — Password minimum length enforced (12+ chars)

- **ID:** AUTH-005
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Password minimum length enforced (12+ chars)
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Password minimum length enforced (12+ chars) — enforced in production.

#### AUTH-006 — Email verification required before full access

- **ID:** AUTH-006
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Email verification required before full access
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Email verification required before full access — enforced in production.

#### AUTH-007 — Rate limit on OTP send route

- **ID:** AUTH-007
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Rate limit on OTP send route
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Rate limit on OTP send route — enforced in production.

#### AUTH-008 — Rate limit on login attempts via Supabase

- **ID:** AUTH-008
- **Category:** Authentication & Authorization
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Rate limit on login attempts via Supabase
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Rate limit on login attempts via Supabase — enforced in production.

#### AUTH-009 — Platform admin role assigned only to founders

- **ID:** AUTH-009
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Platform admin role assigned only to founders
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Platform admin role assigned only to founders — enforced in production.

#### AUTH-010 — Admin middleware validates platform_admin claim

- **ID:** AUTH-010
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Admin middleware validates platform_admin claim
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Admin middleware validates platform_admin claim — enforced in production.

#### AUTH-011 — Multi-factor auth roadmap for admin accounts

- **ID:** AUTH-011
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Multi-factor auth roadmap for admin accounts
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Multi-factor auth roadmap for admin accounts — enforced in production.

#### AUTH-012 — OAuth state parameter validated by Supabase

- **ID:** AUTH-012
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** OAuth state parameter validated by Supabase
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** OAuth state parameter validated by Supabase — enforced in production.

#### AUTH-013 — PKCE flow for OAuth (Supabase default)

- **ID:** AUTH-013
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** PKCE flow for OAuth (Supabase default)
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** PKCE flow for OAuth (Supabase default) — enforced in production.

#### AUTH-014 — Forgot password redirectTo production callback

- **ID:** AUTH-014
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Forgot password redirectTo production callback
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Forgot password redirectTo production callback — enforced in production.

#### AUTH-015 — Register emailRedirectTo production callback

- **ID:** AUTH-015
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Register emailRedirectTo production callback
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Register emailRedirectTo production callback — enforced in production.

#### AUTH-016 — Magic link / OTP redirect LAN and prod URLs allowlisted

- **ID:** AUTH-016
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Magic link / OTP redirect LAN and prod URLs allowlisted
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Magic link / OTP redirect LAN and prod URLs allowlisted — enforced in production.

#### AUTH-017 — Session refresh on dashboard middleware

- **ID:** AUTH-017
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** Session refresh on dashboard middleware
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** Session refresh on dashboard middleware — enforced in production.

#### AUTH-018 — No auth tokens in URL fragments logged to analytics

- **ID:** AUTH-018
- **Category:** Authentication & Authorization
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Account takeover or unauthorized admin access
- **Description:** No auth tokens in URL fragments logged to analytics
- **Why it matters:** Farmers trust Nertura with farm and location data.
- **How to verify:** Manual OAuth flow + pnpm test:dashboard-auth-urls.
- **How to fix:** Implement per docs/security and nertura-urls helpers.
- **Expected result:** No auth tokens in URL fragments logged to analytics — enforced in production.

---

## 9. Email & SMTP Production Setup

### Checklist

> **Items in this section:** 12


#### SMTP-001 — Google Workspace for founder @nertura.com addresses

- **ID:** SMTP-001
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Google Workspace for founder @nertura.com addresses
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Google Workspace for founder @nertura.com addresses — operational.

#### SMTP-002 — Resend API key for admin outreach only

- **ID:** SMTP-002
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Resend API key for admin outreach only
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Resend API key for admin outreach only — operational.

#### SMTP-003 — RESEND_FROM_EMAIL on verified domain

- **ID:** SMTP-003
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** RESEND_FROM_EMAIL on verified domain
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** RESEND_FROM_EMAIL on verified domain — operational.

#### SMTP-004 — Auth emails via Supabase SMTP or custom SMTP configured

- **ID:** SMTP-004
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Auth emails via Supabase SMTP or custom SMTP configured
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Auth emails via Supabase SMTP or custom SMTP configured — operational.

#### SMTP-005 — Email templates Turkish farmer-facing copy reviewed

- **ID:** SMTP-005
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Email templates Turkish farmer-facing copy reviewed
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Email templates Turkish farmer-facing copy reviewed — operational.

#### SMTP-006 — Unsubscribe/suppression for marketing outreach

- **ID:** SMTP-006
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Unsubscribe/suppression for marketing outreach
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Unsubscribe/suppression for marketing outreach — operational.

#### SMTP-007 — do_not_contact flag honored in outreach engine

- **ID:** SMTP-007
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** do_not_contact flag honored in outreach engine
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** do_not_contact flag honored in outreach engine — operational.

#### SMTP-008 — Bounce handling configured in Resend

- **ID:** SMTP-008
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Bounce handling configured in Resend
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Bounce handling configured in Resend — operational.

#### SMTP-009 — No PII in email subject lines for sensitive flows

- **ID:** SMTP-009
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** No PII in email subject lines for sensitive flows
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** No PII in email subject lines for sensitive flows — operational.

#### SMTP-010 — SPF/DKIM/DMARC aligned for sending domains

- **ID:** SMTP-010
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** SPF/DKIM/DMARC aligned for sending domains
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** SPF/DKIM/DMARC aligned for sending domains — operational.

#### SMTP-011 — Email send audit log in admin for outreach

- **ID:** SMTP-011
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Email send audit log in admin for outreach
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Email send audit log in admin for outreach — operational.

#### SMTP-012 — Test registration and reset emails in production

- **ID:** SMTP-012
- **Category:** Email & SMTP
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Users cannot register or recover accounts
- **Description:** Test registration and reset emails in production
- **Why it matters:** Email is critical path for auth and compliance.
- **How to verify:** Send test emails; check headers and inbox placement.
- **How to fix:** Configure Supabase SMTP and Resend per docs.
- **Expected result:** Test registration and reset emails in production — operational.

---

## 10. AI Platform Safety & Cost Controls

### Checklist

> **Items in this section:** 20


#### AI-001 — Gemini primary model gemini-2.5-flash in production

- **ID:** AI-001
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Gemini primary model gemini-2.5-flash in production
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Gemini primary model gemini-2.5-flash in production — verified.

#### AI-002 — GEMINI_API_KEY server-only on all apps

- **ID:** AI-002
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** GEMINI_API_KEY server-only on all apps
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: GEMINI_API_KEY server-only on all apps — verified.

#### AI-003 — OpenAI optional fallback documented and disabled if unused

- **ID:** AI-003
- **Category:** AI Platform Safety & Cost
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** OpenAI optional fallback documented and disabled if unused
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: OpenAI optional fallback documented and disabled if unused — verified.

#### AI-004 — Per-user credit limits enforced before AI calls

- **ID:** AI-004
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Per-user credit limits enforced before AI calls
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Per-user credit limits enforced before AI calls — verified.

#### AI-005 — Usage debits logged to credit_transactions

- **ID:** AI-005
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Usage debits logged to credit_transactions
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Usage debits logged to credit_transactions — verified.

#### AI-006 — Guest marketing doctor rate limited separately

- **ID:** AI-006
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Guest marketing doctor rate limited separately
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Guest marketing doctor rate limited separately — verified.

#### AI-007 — AI Doctor Turkish language guard (test:doctor-language)

- **ID:** AI-007
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** AI Doctor Turkish language guard (test:doctor-language)
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: AI Doctor Turkish language guard (test:doctor-language) — verified.

#### AI-008 — Vision pipeline validates image MIME and size

- **ID:** AI-008
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Vision pipeline validates image MIME and size
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Vision pipeline validates image MIME and size — verified.

#### AI-009 — No raw model prompts exposed to client

- **ID:** AI-009
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** No raw model prompts exposed to client
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: No raw model prompts exposed to client — verified.

#### AI-010 — Confidence and uncertainty surfaced per AI constitution

- **ID:** AI-010
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Confidence and uncertainty surfaced per AI constitution
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Confidence and uncertainty surfaced per AI constitution — verified.

#### AI-011 — Evidence citations from knowledge bank when available

- **ID:** AI-011
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Evidence citations from knowledge bank when available
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Evidence citations from knowledge bank when available — verified.

#### AI-012 — Agricultural safety disclaimers in AI responses

- **ID:** AI-012
- **Category:** AI Platform Safety & Cost
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Agricultural safety disclaimers in AI responses
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Agricultural safety disclaimers in AI responses — verified.

#### AI-013 — Prompt injection mitigation on user messages

- **ID:** AI-013
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Prompt injection mitigation on user messages
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Prompt injection mitigation on user messages — verified.

#### AI-014 — Max tokens and timeout limits on API routes

- **ID:** AI-014
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Max tokens and timeout limits on API routes
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Max tokens and timeout limits on API routes — verified.

#### AI-015 — Cost dashboard in GCP for Gemini usage

- **ID:** AI-015
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Cost dashboard in GCP for Gemini usage
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Cost dashboard in GCP for Gemini usage — verified.

#### AI-016 — Fallback message when AI provider unavailable

- **ID:** AI-016
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Fallback message when AI provider unavailable
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Fallback message when AI provider unavailable — verified.

#### AI-017 — No PII sent to AI beyond necessary farm context

- **ID:** AI-017
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** No PII sent to AI beyond necessary farm context
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: No PII sent to AI beyond necessary farm context — verified.

#### AI-018 — Photo consent acknowledged at registration

- **ID:** AI-018
- **Category:** AI Platform Safety & Cost
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Photo consent acknowledged at registration
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Photo consent acknowledged at registration — verified.

#### AI-019 — Admin growth AI separate quota from farmer doctor

- **ID:** AI-019
- **Category:** AI Platform Safety & Cost
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Admin growth AI separate quota from farmer doctor
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Admin growth AI separate quota from farmer doctor — verified.

#### AI-020 — Model version pinned; upgrade procedure documented

- **ID:** AI-020
- **Category:** AI Platform Safety & Cost
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Runaway cost, unsafe advice, or data leak via AI
- **Description:** Model version pinned; upgrade procedure documented
- **Why it matters:** AI Doctor is core product; failures harm users and brand.
- **How to verify:** Run pnpm test:doctor-language; monitor GCP billing.
- **How to fix:** Apply packages/ai guards and usage-limits.
- **Expected result:** AI: Model version pinned; upgrade procedure documented — verified.

---

## 11. Database Security, RLS & Backups

### Checklist

> **Items in this section:** 18


#### RLS-001 — RLS enabled on all public tenant tables

- **ID:** RLS-001
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** RLS enabled on all public tenant tables
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** RLS enabled on all public tenant tables — passing verification.

#### RLS-002 — users table scoped to auth.uid()

- **ID:** RLS-002
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** users table scoped to auth.uid()
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** users table scoped to auth.uid() — passing verification.

#### RLS-003 — memberships scoped by organization_id

- **ID:** RLS-003
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** memberships scoped by organization_id
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** memberships scoped by organization_id — passing verification.

#### RLS-004 — farms fields crops scoped by org membership

- **ID:** RLS-004
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** farms fields crops scoped by org membership
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** farms fields crops scoped by org membership — passing verification.

#### RLS-005 — field_cases and conversations scoped by user/org

- **ID:** RLS-005
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** field_cases and conversations scoped by user/org
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** field_cases and conversations scoped by user/org — passing verification.

#### RLS-006 — credit_transactions readable by owner only

- **ID:** RLS-006
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** credit_transactions readable by owner only
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** credit_transactions readable by owner only — passing verification.

#### RLS-007 — Admin tables use is_platform_admin()

- **ID:** RLS-007
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Admin tables use is_platform_admin()
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Admin tables use is_platform_admin() — passing verification.

#### RLS-008 — No policy allows anon read of tenant data

- **ID:** RLS-008
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** No policy allows anon read of tenant data
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** No policy allows anon read of tenant data — passing verification.

#### RLS-009 — Service role bypass only in server routes

- **ID:** RLS-009
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Service role bypass only in server routes
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Service role bypass only in server routes — passing verification.

#### RLS-010 — Insert policies validate org membership role

- **ID:** RLS-010
- **Category:** Database Security & RLS
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Insert policies validate org membership role
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Insert policies validate org membership role — passing verification.

#### RLS-011 — Update policies prevent cross-tenant writes

- **ID:** RLS-011
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Update policies prevent cross-tenant writes
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Update policies prevent cross-tenant writes — passing verification.

#### RLS-012 — Delete policies soft-delete where applicable

- **ID:** RLS-012
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Delete policies soft-delete where applicable
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Delete policies soft-delete where applicable — passing verification.

#### RLS-013 — Storage policies match table RLS boundaries

- **ID:** RLS-013
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Storage policies match table RLS boundaries
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Storage policies match table RLS boundaries — passing verification.

#### RLS-014 — verify-rls.sql run in CI against staging

- **ID:** RLS-014
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** verify-rls.sql run in CI against staging
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** verify-rls.sql run in CI against staging — passing verification.

#### RLS-015 — New migrations include RLS in same PR

- **ID:** RLS-015
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** New migrations include RLS in same PR
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** New migrations include RLS in same PR — passing verification.

#### RLS-016 — Supabase linter security warnings resolved

- **ID:** RLS-016
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Supabase linter security warnings resolved
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Supabase linter security warnings resolved — passing verification.

#### RLS-017 — Database indexes on RLS filter columns

- **ID:** RLS-017
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Database indexes on RLS filter columns
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Database indexes on RLS filter columns — passing verification.

#### RLS-018 — Periodic RLS audit quarterly scheduled

- **ID:** RLS-018
- **Category:** Database Security & RLS
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Cross-tenant data leak — existential for SaaS
- **Description:** Periodic RLS audit quarterly scheduled
- **Why it matters:** Multi-tenant agriculture data requires strict isolation.
- **How to verify:** pnpm supabase:verify:rls
- **How to fix:** Add/fix policies in supabase/migrations.
- **Expected result:** Periodic RLS audit quarterly scheduled — passing verification.

---

## 12. Storage & File Upload Security

### Checklist

> **Items in this section:** 12


#### STOR-001 — Doctor photo uploads validated server-side

- **ID:** STOR-001
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Doctor photo uploads validated server-side
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Doctor photo uploads validated server-side — enforced.

#### STOR-002 — 5MB max file size enforced

- **ID:** STOR-002
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** 5MB max file size enforced
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** 5MB max file size enforced — enforced.

#### STOR-003 — Allowed MIME types jpeg png webp only

- **ID:** STOR-003
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Allowed MIME types jpeg png webp only
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Allowed MIME types jpeg png webp only — enforced.

#### STOR-004 — Upload paths include user/org scoping

- **ID:** STOR-004
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Upload paths include user/org scoping
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Upload paths include user/org scoping — enforced.

#### STOR-005 — No public buckets for farmer photos

- **ID:** STOR-005
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** No public buckets for farmer photos
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** No public buckets for farmer photos — enforced.

#### STOR-006 — Signed URLs expire within policy window

- **ID:** STOR-006
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Signed URLs expire within policy window
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Signed URLs expire within policy window — enforced.

#### STOR-007 — Virus scan roadmap documented

- **ID:** STOR-007
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Virus scan roadmap documented
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Virus scan roadmap documented — enforced.

#### STOR-008 — EXIF stripping considered for privacy

- **ID:** STOR-008
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** EXIF stripping considered for privacy
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** EXIF stripping considered for privacy — enforced.

#### STOR-009 — Storage quota per org planned

- **ID:** STOR-009
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Storage quota per org planned
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Storage quota per org planned — enforced.

#### STOR-010 — Delete photo on account deletion procedure

- **ID:** STOR-010
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Delete photo on account deletion procedure
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Delete photo on account deletion procedure — enforced.

#### STOR-011 — CORS on storage buckets restricted

- **ID:** STOR-011
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** CORS on storage buckets restricted
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** CORS on storage buckets restricted — enforced.

#### STOR-012 — Upload rate limit per user

- **ID:** STOR-012
- **Category:** Storage & File Upload
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Malware upload or unauthorized file access
- **Description:** Upload rate limit per user
- **Why it matters:** Farm photos may reveal location and business intelligence.
- **How to verify:** Upload test file; attempt cross-org access.
- **How to fix:** Apply packages/utils image-validation and bucket policies.
- **Expected result:** Upload rate limit per user — enforced.

---

## 13. API Security

### Checklist

> **Items in this section:** 18


#### API-001 — All /api routes require session or secret

- **ID:** API-001
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** All /api routes require session or secret
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** All /api routes require session or secret — verified.

#### API-002 — Stripe webhook signature verified

- **ID:** API-002
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Stripe webhook signature verified
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Stripe webhook signature verified — verified.

#### API-003 — Cron routes require CRON_SECRET Bearer

- **ID:** API-003
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Cron routes require CRON_SECRET Bearer
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Cron routes require CRON_SECRET Bearer — verified.

#### API-004 — AI routes check credits before model call

- **ID:** API-004
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** AI routes check credits before model call
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** AI routes check credits before model call — verified.

#### API-005 — OTP send rate limited per IP and email

- **ID:** API-005
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** OTP send rate limited per IP and email
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** OTP send rate limited per IP and email — verified.

#### API-006 — Input validation with zod on POST bodies

- **ID:** API-006
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Input validation with zod on POST bodies
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Input validation with zod on POST bodies — verified.

#### API-007 — No stack traces returned to clients in prod

- **ID:** API-007
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** No stack traces returned to clients in prod
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** No stack traces returned to clients in prod — verified.

#### API-008 — Consistent error JSON shape per API conventions

- **ID:** API-008
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Consistent error JSON shape per API conventions
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Consistent error JSON shape per API conventions — verified.

#### API-009 — CORS restricted to known origins

- **ID:** API-009
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** CORS restricted to known origins
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** CORS restricted to known origins — verified.

#### API-010 — Admin API routes check platform_admin

- **ID:** API-010
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Admin API routes check platform_admin
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Admin API routes check platform_admin — verified.

#### API-011 — Webhook idempotency for Stripe events

- **ID:** API-011
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Webhook idempotency for Stripe events
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Webhook idempotency for Stripe events — verified.

#### API-012 — Request size limits on JSON bodies

- **ID:** API-012
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Request size limits on JSON bodies
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Request size limits on JSON bodies — verified.

#### API-013 — Doctor API conversation ownership verified

- **ID:** API-013
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Doctor API conversation ownership verified
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Doctor API conversation ownership verified — verified.

#### API-014 — Field case API scoped to org membership

- **ID:** API-014
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Field case API scoped to org membership
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Field case API scoped to org membership — verified.

#### API-015 — Onboarding complete API idempotent

- **ID:** API-015
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Onboarding complete API idempotent
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Onboarding complete API idempotent — verified.

#### API-016 — Memory/outcomes API authenticated

- **ID:** API-016
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** Memory/outcomes API authenticated
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** Memory/outcomes API authenticated — verified.

#### API-017 — No sensitive data in URL query params

- **ID:** API-017
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** No sensitive data in URL query params
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** No sensitive data in URL query params — verified.

#### API-018 — API versioning strategy documented

- **ID:** API-018
- **Category:** API Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Unauthorized API access or data exfiltration
- **Description:** API versioning strategy documented
- **Why it matters:** APIs expose AI, billing, and farm operations.
- **How to verify:** Pen test unauthenticated calls; review each route.
- **How to fix:** Add auth middleware and zod schemas.
- **Expected result:** API versioning strategy documented — verified.

---

## 14. Frontend Security Headers

### Checklist

> **Items in this section:** 12


#### HDR-001 — X-Frame-Options or CSP frame-ancestors

- **ID:** HDR-001
- **Category:** Frontend Security Headers
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** X-Frame-Options or CSP frame-ancestors
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** X-Frame-Options or CSP frame-ancestors — present on responses.

#### HDR-002 — X-Content-Type-Options nosniff

- **ID:** HDR-002
- **Category:** Frontend Security Headers
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** X-Content-Type-Options nosniff
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** X-Content-Type-Options nosniff — present on responses.

#### HDR-003 — Referrer-Policy strict-origin-when-cross-origin

- **ID:** HDR-003
- **Category:** Frontend Security Headers
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Referrer-Policy strict-origin-when-cross-origin
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Referrer-Policy strict-origin-when-cross-origin — present on responses.

#### HDR-004 — Permissions-Policy restricts camera geolocation as needed

- **ID:** HDR-004
- **Category:** Frontend Security Headers
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Permissions-Policy restricts camera geolocation as needed
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Permissions-Policy restricts camera geolocation as needed — present on responses.

#### HDR-005 — Content-Security-Policy roadmap documented

- **ID:** HDR-005
- **Category:** Frontend Security Headers
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Content-Security-Policy roadmap documented
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Content-Security-Policy roadmap documented — present on responses.

#### HDR-006 — Strict CSP for admin app prioritized

- **ID:** HDR-006
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Strict CSP for admin app prioritized
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Strict CSP for admin app prioritized — present on responses.

#### HDR-007 — No inline script unless nonce strategy

- **ID:** HDR-007
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** No inline script unless nonce strategy
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** No inline script unless nonce strategy — present on responses.

#### HDR-008 — HSTS via Cloudflare

- **ID:** HDR-008
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** HSTS via Cloudflare
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** HSTS via Cloudflare — present on responses.

#### HDR-009 — Cross-Origin-Opener-Policy for OAuth popups

- **ID:** HDR-009
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Cross-Origin-Opener-Policy for OAuth popups
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Cross-Origin-Opener-Policy for OAuth popups — present on responses.

#### HDR-010 — Cross-Origin-Resource-Policy evaluated

- **ID:** HDR-010
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Cross-Origin-Resource-Policy evaluated
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Cross-Origin-Resource-Policy evaluated — present on responses.

#### HDR-011 — Security headers on all three apps

- **ID:** HDR-011
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** Security headers on all three apps
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** Security headers on all three apps — present on responses.

#### HDR-012 — next.config headers reviewed per app

- **ID:** HDR-012
- **Category:** Frontend Security Headers
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** XSS, clickjacking, or MIME sniffing attacks
- **Description:** next.config headers reviewed per app
- **Why it matters:** Headers are baseline browser-side defense.
- **How to verify:** securityheaders.com scan per domain.
- **How to fix:** Add headers in next.config.ts per app.
- **Expected result:** next.config headers reviewed per app — present on responses.

---

## 15. Monitoring, Logging & Alerting

### Checklist

> **Items in this section:** 18


#### MON-001 — Vercel deployment failure alerts

- **ID:** MON-001
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Vercel deployment failure alerts
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Vercel deployment failure alerts — operational.

#### MON-002 — Supabase dashboard health monitoring

- **ID:** MON-002
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Supabase dashboard health monitoring
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Supabase dashboard health monitoring — operational.

#### MON-003 — Uptime check on nertura.com every 5 min

- **ID:** MON-003
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Uptime check on nertura.com every 5 min
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Uptime check on nertura.com every 5 min — operational.

#### MON-004 — Uptime check on app.nertura.com

- **ID:** MON-004
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Uptime check on app.nertura.com
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Uptime check on app.nertura.com — operational.

#### MON-005 — Error tracking (Sentry or similar) on dashboard

- **ID:** MON-005
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Error tracking (Sentry or similar) on dashboard
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Error tracking (Sentry or similar) on dashboard — operational.

#### MON-006 — AI route error rate alert

- **ID:** MON-006
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** AI route error rate alert
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** AI route error rate alert — operational.

#### MON-007 — Stripe webhook failure alert

- **ID:** MON-007
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Stripe webhook failure alert
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Stripe webhook failure alert — operational.

#### MON-008 — GCP Gemini quota alert

- **ID:** MON-008
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** GCP Gemini quota alert
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** GCP Gemini quota alert — operational.

#### MON-009 — Log retention policy defined

- **ID:** MON-009
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Log retention policy defined
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Log retention policy defined — operational.

#### MON-010 — PII redaction in application logs

- **ID:** MON-010
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** PII redaction in application logs
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** PII redaction in application logs — operational.

#### MON-011 — Admin audit log for outreach approve/send

- **ID:** MON-011
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Admin audit log for outreach approve/send
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Admin audit log for outreach approve/send — operational.

#### MON-012 — Security log for failed auth bursts

- **ID:** MON-012
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Security log for failed auth bursts
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Security log for failed auth bursts — operational.

#### MON-013 — On-call rotation documented

- **ID:** MON-013
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** On-call rotation documented
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** On-call rotation documented — operational.

#### MON-014 — Status page planned (status.nertura.com)

- **ID:** MON-014
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Status page planned (status.nertura.com)
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Status page planned (status.nertura.com) — operational.

#### MON-015 — Synthetic login test daily

- **ID:** MON-015
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Synthetic login test daily
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Synthetic login test daily — operational.

#### MON-016 — Synthetic doctor question test daily

- **ID:** MON-016
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Synthetic doctor question test daily
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Synthetic doctor question test daily — operational.

#### MON-017 — Database connection pool monitoring

- **ID:** MON-017
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Database connection pool monitoring
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Database connection pool monitoring — operational.

#### MON-018 — Weekly production health review meeting

- **ID:** MON-018
- **Category:** Monitoring & Alerting
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Outages undetected until user reports
- **Description:** Weekly production health review meeting
- **Why it matters:** Enterprise SaaS requires observable production.
- **How to verify:** Trigger test alert; confirm notification received.
- **How to fix:** Integrate monitoring tools and runbooks.
- **Expected result:** Weekly production health review meeting — operational.

---

## 16. Performance & Core Web Vitals

### Checklist

> **Items in this section:** 12


#### PERF-001 — LCP under 2.5s on marketing mobile

- **ID:** PERF-001
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** LCP under 2.5s on marketing mobile
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** LCP under 2.5s on marketing mobile — within target.

#### PERF-002 — INP under 200ms on dashboard doctor

- **ID:** PERF-002
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** INP under 200ms on dashboard doctor
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** INP under 200ms on dashboard doctor — within target.

#### PERF-003 — CLS under 0.1 on all apps

- **ID:** PERF-003
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** CLS under 0.1 on all apps
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** CLS under 0.1 on all apps — within target.

#### PERF-004 — Marketing homepage bundle size audited

- **ID:** PERF-004
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Marketing homepage bundle size audited
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Marketing homepage bundle size audited — within target.

#### PERF-005 — Dashboard doctor route code-split

- **ID:** PERF-005
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Dashboard doctor route code-split
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Dashboard doctor route code-split — within target.

#### PERF-006 — Images use next/image with proper sizes

- **ID:** PERF-006
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Images use next/image with proper sizes
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Images use next/image with proper sizes — within target.

#### PERF-007 — Turbo build cache enabled

- **ID:** PERF-007
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Turbo build cache enabled
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Turbo build cache enabled — within target.

#### PERF-008 — Supabase queries indexed for hot paths

- **ID:** PERF-008
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Supabase queries indexed for hot paths
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Supabase queries indexed for hot paths — within target.

#### PERF-009 — No N+1 queries in farm and case lists

- **ID:** PERF-009
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** No N+1 queries in farm and case lists
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** No N+1 queries in farm and case lists — within target.

#### PERF-010 — Edge caching only for static marketing pages

- **ID:** PERF-010
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Edge caching only for static marketing pages
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Edge caching only for static marketing pages — within target.

#### PERF-011 — pnpm test:marketing-css and dashboard-css pass

- **ID:** PERF-011
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** pnpm test:marketing-css and dashboard-css pass
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** pnpm test:marketing-css and dashboard-css pass — within target.

#### PERF-012 — Load test doctor API at expected beta concurrency

- **ID:** PERF-012
- **Category:** Performance & Core Web Vitals
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Poor mobile performance loses Turkish farmers
- **Description:** Load test doctor API at expected beta concurrency
- **Why it matters:** Farmers often use mid-range phones on rural networks.
- **How to verify:** PageSpeed Insights and Vercel Speed Insights.
- **How to fix:** Optimize bundles, images, and queries.
- **Expected result:** Load test doctor API at expected beta concurrency — within target.

---

## 17. SEO & Indexing

### Checklist

> **Items in this section:** 10


#### SEO-001 — Marketing sitemap.xml generated and submitted

- **ID:** SEO-001
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Marketing sitemap.xml generated and submitted
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Marketing sitemap.xml generated and submitted — configured.

#### SEO-002 — robots.txt allows marketing, disallows app/admin

- **ID:** SEO-002
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** robots.txt allows marketing, disallows app/admin
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** robots.txt allows marketing, disallows app/admin — configured.

#### SEO-003 — Canonical URLs on marketing pages

- **ID:** SEO-003
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Canonical URLs on marketing pages
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Canonical URLs on marketing pages — configured.

#### SEO-004 — Open Graph tags on homepage

- **ID:** SEO-004
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Open Graph tags on homepage
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Open Graph tags on homepage — configured.

#### SEO-005 — Turkish meta titles and descriptions

- **ID:** SEO-005
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Turkish meta titles and descriptions
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Turkish meta titles and descriptions — configured.

#### SEO-006 — Structured data for organization optional

- **ID:** SEO-006
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Structured data for organization optional
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Structured data for organization optional — configured.

#### SEO-007 — app.nertura.com not indexed (noindex)

- **ID:** SEO-007
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** app.nertura.com not indexed (noindex)
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** app.nertura.com not indexed (noindex) — configured.

#### SEO-008 — admin.nertura.com not indexed

- **ID:** SEO-008
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** admin.nertura.com not indexed
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** admin.nertura.com not indexed — configured.

#### SEO-009 — Google Search Console verified

- **ID:** SEO-009
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Google Search Console verified
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Google Search Console verified — configured.

#### SEO-010 — Legal pages indexed: privacy, terms, kvkk

- **ID:** SEO-010
- **Category:** SEO & Indexing
- **Priority:** P2 Medium
- **Status:** TODO
- **Risk:** Wrong pages indexed or poor discoverability
- **Description:** Legal pages indexed: privacy, terms, kvkk
- **Why it matters:** Marketing growth depends on SEO; app must stay private.
- **How to verify:** Search Console coverage and robots.txt fetch.
- **How to fix:** Update apps/marketing sitemap and metadata.
- **Expected result:** Legal pages indexed: privacy, terms, kvkk — configured.

---

## 18. Legal, KVKK, GDPR & AI Disclaimer

### Checklist

> **Items in this section:** 14


#### LEG-001 — Privacy policy published at nertura.com/privacy

- **ID:** LEG-001
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Privacy policy published at nertura.com/privacy
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Privacy policy published at nertura.com/privacy — published and linked.

#### LEG-002 — Terms of service at nertura.com/terms

- **ID:** LEG-002
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Terms of service at nertura.com/terms
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Terms of service at nertura.com/terms — published and linked.

#### LEG-003 — KVKK aydınlatma metni at nertura.com/kvkk

- **ID:** LEG-003
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** KVKK aydınlatma metni at nertura.com/kvkk
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** KVKK aydınlatma metni at nertura.com/kvkk — published and linked.

#### LEG-004 — Cookie policy and consent banner functional

- **ID:** LEG-004
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Cookie policy and consent banner functional
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Cookie policy and consent banner functional — published and linked.

#### LEG-005 — Photo consent at registration linked

- **ID:** LEG-005
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Photo consent at registration linked
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Photo consent at registration linked — published and linked.

#### LEG-006 — AI disclaimer: not a substitute for agronomist

- **ID:** LEG-006
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** AI disclaimer: not a substitute for agronomist
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** AI disclaimer: not a substitute for agronomist — published and linked.

#### LEG-007 — Data processing agreement template for B2B

- **ID:** LEG-007
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Data processing agreement template for B2B
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Data processing agreement template for B2B — published and linked.

#### LEG-008 — Data export flow documented

- **ID:** LEG-008
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P0 Critical
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Data export flow documented
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Data export flow documented — published and linked.

#### LEG-009 — Account deletion flow at delete-account page

- **ID:** LEG-009
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Account deletion flow at delete-account page
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Account deletion flow at delete-account page — published and linked.

#### LEG-010 — Retention policy for conversations and photos

- **ID:** LEG-010
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Retention policy for conversations and photos
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Retention policy for conversations and photos — published and linked.

#### LEG-011 — Subprocessor list includes Supabase Google OpenAI

- **ID:** LEG-011
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Subprocessor list includes Supabase Google OpenAI
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Subprocessor list includes Supabase Google OpenAI — published and linked.

#### LEG-012 — Consent records stored with timestamps

- **ID:** LEG-012
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Consent records stored with timestamps
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Consent records stored with timestamps — published and linked.

#### LEG-013 — Turkish farmer-facing legal copy reviewed

- **ID:** LEG-013
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** Turkish farmer-facing legal copy reviewed
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** Turkish farmer-facing legal copy reviewed — published and linked.

#### LEG-014 — GDPR lawful basis documented for EU users if applicable

- **ID:** LEG-014
- **Category:** Legal, KVKK, GDPR & AI Disclaimer
- **Priority:** P1 High
- **Status:** IN_PROGRESS
- **Risk:** Regulatory fines and loss of user trust
- **Description:** GDPR lawful basis documented for EU users if applicable
- **Why it matters:** Turkey KVKK and AI transparency are launch requirements.
- **How to verify:** Legal review + manual QA of consent flows.
- **How to fix:** Update marketing legal pages and auth consent links.
- **Expected result:** GDPR lawful basis documented for EU users if applicable — published and linked.

---

## 19. Admin Panel Security

### Checklist

> **Items in this section:** 12


#### ADM-001 — ADMIN_AUTH_DISABLED=false in production

- **ID:** ADM-001
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** ADMIN_AUTH_DISABLED=false in production
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** ADMIN_AUTH_DISABLED=false in production — enforced.

#### ADM-002 — Admin login separate from farmer OAuth

- **ID:** ADM-002
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin login separate from farmer OAuth
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin login separate from farmer OAuth — enforced.

#### ADM-003 — Platform admin RBAC enforced on all admin routes

- **ID:** ADM-003
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Platform admin RBAC enforced on all admin routes
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Platform admin RBAC enforced on all admin routes — enforced.

#### ADM-004 — Outreach send requires explicit approval

- **ID:** ADM-004
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Outreach send requires explicit approval
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Outreach send requires explicit approval — enforced.

#### ADM-005 — No auto-send email without founder click

- **ID:** ADM-005
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** No auto-send email without founder click
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** No auto-send email without founder click — enforced.

#### ADM-006 — Admin CRON protected by CRON_SECRET

- **ID:** ADM-006
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin CRON protected by CRON_SECRET
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin CRON protected by CRON_SECRET — enforced.

#### ADM-007 — Admin env secrets separate from dashboard

- **ID:** ADM-007
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin env secrets separate from dashboard
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin env secrets separate from dashboard — enforced.

#### ADM-008 — Admin session timeout policy

- **ID:** ADM-008
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin session timeout policy
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin session timeout policy — enforced.

#### ADM-009 — Admin IP restriction optional via Cloudflare

- **ID:** ADM-009
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin IP restriction optional via Cloudflare
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin IP restriction optional via Cloudflare — enforced.

#### ADM-010 — Admin actions logged with user id and timestamp

- **ID:** ADM-010
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Admin actions logged with user id and timestamp
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Admin actions logged with user id and timestamp — enforced.

#### ADM-011 — Growth AI drafts marked draft until approved

- **ID:** ADM-011
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** Growth AI drafts marked draft until approved
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** Growth AI drafts marked draft until approved — enforced.

#### ADM-012 — No farmer PII in admin search without justification

- **ID:** ADM-012
- **Category:** Admin Panel Security
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Admin compromise affects all tenants and outreach
- **Description:** No farmer PII in admin search without justification
- **Why it matters:** Admin is highest privilege surface.
- **How to verify:** Attempt admin routes without auth; review audit logs.
- **How to fix:** Enforce middleware and approval gates.
- **Expected result:** No farmer PII in admin search without justification — enforced.

---

## 20. Incident Response & Rollback

### Checklist

> **Items in this section:** 10


#### INC-001 — Incident severity levels defined (SEV1-3)

- **ID:** INC-001
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Incident severity levels defined (SEV1-3)
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Incident severity levels defined (SEV1-3) — documented and tested.

#### INC-002 — Rollback: Vercel promote previous deployment documented

- **ID:** INC-002
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Rollback: Vercel promote previous deployment documented
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Rollback: Vercel promote previous deployment documented — documented and tested.

#### INC-003 — Rollback: Supabase migration revert procedure

- **ID:** INC-003
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Rollback: Supabase migration revert procedure
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Rollback: Supabase migration revert procedure — documented and tested.

#### INC-004 — Communication template for user-facing outage

- **ID:** INC-004
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Communication template for user-facing outage
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Communication template for user-facing outage — documented and tested.

#### INC-005 — Security incident contact list

- **ID:** INC-005
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Security incident contact list
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Security incident contact list — documented and tested.

#### INC-006 — API key rotation runbook

- **ID:** INC-006
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** API key rotation runbook
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** API key rotation runbook — documented and tested.

#### INC-007 — Database restore drill from backup

- **ID:** INC-007
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Database restore drill from backup
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Database restore drill from backup — documented and tested.

#### INC-008 — Post-incident review template

- **ID:** INC-008
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Post-incident review template
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Post-incident review template — documented and tested.

#### INC-009 — On-call escalation path to founder

- **ID:** INC-009
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** On-call escalation path to founder
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** On-call escalation path to founder — documented and tested.

#### INC-010 — Status page update procedure

- **ID:** INC-010
- **Category:** Incident Response & Rollback
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Slow recovery amplifies downtime and trust loss
- **Description:** Status page update procedure
- **Why it matters:** Production incidents will occur; response must be rehearsed.
- **How to verify:** Tabletop exercise with team.
- **How to fix:** Write runbooks in docs/production-readiness.
- **Expected result:** Status page update procedure — documented and tested.

---

## 21. Launch Readiness

### Checklist

> **Items in this section:** 14


#### LAU-001 — Production smoke test checklist completed

- **ID:** LAU-001
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Production smoke test checklist completed
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Production smoke test checklist completed — signed off.

#### LAU-002 — Beta user onboarding path tested end-to-end

- **ID:** LAU-002
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Beta user onboarding path tested end-to-end
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Beta user onboarding path tested end-to-end — signed off.

#### LAU-003 — Google OAuth on production domain tested

- **ID:** LAU-003
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Google OAuth on production domain tested
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Google OAuth on production domain tested — signed off.

#### LAU-004 — Credit purchase flow tested in Stripe live

- **ID:** LAU-004
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Credit purchase flow tested in Stripe live
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Credit purchase flow tested in Stripe live — signed off.

#### LAU-005 — Guest marketing doctor limits verified

- **ID:** LAU-005
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Guest marketing doctor limits verified
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Guest marketing doctor limits verified — signed off.

#### LAU-006 — Mobile Safari QA on real iPhone completed

- **ID:** LAU-006
- **Category:** Launch Readiness
- **Priority:** P0 Critical
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Mobile Safari QA on real iPhone completed
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Mobile Safari QA on real iPhone completed — signed off.

#### LAU-007 — Turkish copy QA on all farmer surfaces

- **ID:** LAU-007
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Turkish copy QA on all farmer surfaces
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Turkish copy QA on all farmer surfaces — signed off.

#### LAU-008 — Support email hello@nertura.com monitored

- **ID:** LAU-008
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Support email hello@nertura.com monitored
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Support email hello@nertura.com monitored — signed off.

#### LAU-009 — Founder platform_admin access confirmed

- **ID:** LAU-009
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Founder platform_admin access confirmed
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Founder platform_admin access confirmed — signed off.

#### LAU-010 — No TODO console.log in production bundles

- **ID:** LAU-010
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** No TODO console.log in production bundles
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** No TODO console.log in production bundles — signed off.

#### LAU-011 — Error pages localized Turkish

- **ID:** LAU-011
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Error pages localized Turkish
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Error pages localized Turkish — signed off.

#### LAU-012 — Load test passed at beta target users

- **ID:** LAU-012
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Load test passed at beta target users
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Load test passed at beta target users — signed off.

#### LAU-013 — Launch comms draft approved

- **ID:** LAU-013
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Launch comms draft approved
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Launch comms draft approved — signed off.

#### LAU-014 — Go/no-go meeting held with checklist scores

- **ID:** LAU-014
- **Category:** Launch Readiness
- **Priority:** P1 High
- **Status:** TODO
- **Risk:** Launch with critical broken flows
- **Description:** Go/no-go meeting held with checklist scores
- **Why it matters:** Final gate before public beta.
- **How to verify:** Execute docs/testing/MANUAL_QA_CHECKLIST_v1.md.
- **How to fix:** Resolve blockers; re-run smoke tests.
- **Expected result:** Go/no-go meeting held with checklist scores — signed off.

---

## 22. Future Scaling

### Checklist

> **Items in this section:** 10


#### SCL-001 — Supabase Pro plan headroom for 10k MAU estimated

- **ID:** SCL-001
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Supabase Pro plan headroom for 10k MAU estimated
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Supabase Pro plan headroom for 10k MAU estimated — planned.

#### SCL-002 — Vercel Pro/concurrent function limits reviewed

- **ID:** SCL-002
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Vercel Pro/concurrent function limits reviewed
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Vercel Pro/concurrent function limits reviewed — planned.

#### SCL-003 — CDN strategy for Turkish users optimized

- **ID:** SCL-003
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** CDN strategy for Turkish users optimized
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** CDN strategy for Turkish users optimized — planned.

#### SCL-004 — Read replicas considered for analytics

- **ID:** SCL-004
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Read replicas considered for analytics
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Read replicas considered for analytics — planned.

#### SCL-005 — Queue for async AI jobs if latency requires

- **ID:** SCL-005
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Queue for async AI jobs if latency requires
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Queue for async AI jobs if latency requires — planned.

#### SCL-006 — Multi-region disaster recovery roadmap

- **ID:** SCL-006
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Multi-region disaster recovery roadmap
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Multi-region disaster recovery roadmap — planned.

#### SCL-007 — Tenant sharding strategy documented if needed

- **ID:** SCL-007
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Tenant sharding strategy documented if needed
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Tenant sharding strategy documented if needed — planned.

#### SCL-008 — Enterprise SSO (SAML) on roadmap

- **ID:** SCL-008
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Enterprise SSO (SAML) on roadmap
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Enterprise SSO (SAML) on roadmap — planned.

#### SCL-009 — SOC 2 preparation checklist started

- **ID:** SCL-009
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** SOC 2 preparation checklist started
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** SOC 2 preparation checklist started — planned.

#### SCL-010 — Dedicated support tier operations defined

- **ID:** SCL-010
- **Category:** Future Scaling
- **Priority:** P3 Low
- **Status:** TODO
- **Risk:** Unexpected growth causes outage
- **Description:** Dedicated support tier operations defined
- **Why it matters:** Plan before scale forces reactive firefighting.
- **How to verify:** Capacity model spreadsheet updated quarterly.
- **How to fix:** Upgrade plans and architecture per triggers.
- **Expected result:** Dedicated support tier operations defined — planned.

---

## Production Readiness Scoring

Scores are computed from checklist status: **DONE = 1.0**, **IN_PROGRESS = 0.5**, **TODO/BLOCKED = 0**.  
Recalculate after each sprint by updating item statuses in this document.

| Score | Value | Weight | Notes |
|-------|-------|--------|-------|
| **Infrastructure Score** | **5/100** | 20% | Vercel, Cloudflare, DNS, monorepo deploy |
| **Security Score** | **3/100** | 25% | Auth, API, headers, admin, storage |
| **Supabase Score** | **0/100** | 20% | Migrations, RLS, backups, auth config |
| **AI Score** | **0/100** | 10% | Gemini safety, credits, Turkish guard |
| **Monitoring Score** | **0/100** | 10% | Alerts, incident response, logging |
| **Performance Score** | **0/100** | 5% | CWV, SEO, bundle size |
| **Launch Score** | **18/100** | 10% | Legal, email, launch QA |
| **Overall Production Score** | **4/100** | 100% | Weighted composite |

### Launch recommendation

| Overall score | Recommendation |
|---------------|----------------|
| ≥ 90 | Ready for public production launch |
| 75–89 | Ready for limited beta with documented exceptions |
| 60–74 | Not ready — resolve P0 items first |
| < 60 | Pre-production — continue hardening |

**Current recommendation:** Pre-production stage — significant work remaining.

---

## Related documents

- [production-deploy.md](../production-deploy.md)
- [PRODUCTION_SECURITY_CHECKLIST.md](../security/PRODUCTION_SECURITY_CHECKLIST.md)
- [DEV_MOBILE_TESTING.md](../development/DEV_MOBILE_TESTING.md)
- [MOBILE_LAN_QA_CHECKLIST.md](../testing/MOBILE_LAN_QA_CHECKLIST.md)
- [NERTURA_CORE.md](../foundation/NERTURA_CORE.md)
- [CONSTITUTION.md](../foundation/CONSTITUTION.md)

---

## Revision history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | June 2026 | Engineering | Initial enterprise program — 312 items |

