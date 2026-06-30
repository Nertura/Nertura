# Nertura — Production Launch Checklist

> Strict pre-launch and GA gates. Every item must be checked before production traffic.s

**Status:** Living document · **Owner:** CTO (coordination)  
**Environments:** `staging` sign-off required before `production`  
**MVP alignment:** [`mvp-definition.md`](mvp-definition.md)

---

## Phase 0 — Documentation & Sign-Off (Pre-Code Complete)

- [ ] [`final-production-blueprint.md`](final-production-blueprint.md) reviewed by CTO
- [ ] [`infrastructure-stack.md`](infrastructure-stack.md) approved
- [ ] [`security-master-plan.md`](security-master-plan.md) approved by CSO
- [ ] [`legal-compliance-master-plan.md`](legal-compliance-master-plan.md) approved
- [ ] Legal drafts sent to external counsel
- [ ] [`admin-panel-spec.md`](admin-panel-spec.md) + [`admin-permission-matrix.md`](admin-permission-matrix.md) approved
- [ ] [`mvp-definition.md`](mvp-definition.md) scope locked for GA

---

## Security Checklist

- [ ] Cloudflare DNS proxied; SSL Full (Strict); HSTS enabled
- [ ] WAF OWASP rules enabled; rate limits configured
- [ ] Bot protection on `/login`, `/register`, `/api/auth/*`
- [ ] All Vercel env vars set; no secrets in repository
- [ ] Supabase service role **never** in client bundles (verify build scan)
- [ ] RLS enabled on all tenant tables; CI policy tests pass
- [ ] [`database-security-rules.md`](database-security-rules.md) checklist per migration
- [ ] Password min 12 chars; leaked password protection on
- [ ] Admin MFA **mandatory** for all admin users
- [ ] CSP headers configured on all three apps
- [ ] Stripe webhook signature verification live
- [ ] File upload MIME + size validation + EXIF strip
- [ ] Brain prompt injection filter enabled
- [ ] Credit gate and rate limits on AI endpoints
- [ ] [`audit-log-system.md`](audit-log-system.md) emitting on auth, export, admin, AI actions
- [ ] [`incident-response-plan.md`](incident-response-plan.md) published internally; on-call rotation set
- [ ] security@nertura.com monitored
- [ ] Dependency scan clean (no critical CVEs)
- [ ] Pen test scheduled or waived in writing for MVP (document risk acceptance)

---

## SEO Checklist

- [ ] Canonical domain `nertura.com` verified in Search Console
- [ ] `robots.txt` live; `app.*` disallowed
- [ ] `sitemap.xml` submitted
- [ ] Homepage meta title, description, OG image (1200×630)
- [ ] Product pages indexed-ready
- [ ] Legal pages indexable with canonicals
- [ ] Core Web Vitals pass on homepage (mobile)
- [ ] JSON-LD Organization + WebSite on homepage
- [ ] FAQ schema on homepage FAQ section
- [ ] 404 page designed; no soft 404s
- [ ] GA4 receiving pageviews
- [ ] Cookie consent blocks non-essential scripts (EU test)

---

## Legal Checklist

- [ ] **External lawyer sign-off** on Privacy, Terms, Cookie, AI Usage, Retention policies
- [ ] Policies published at `/legal/*` with version date
- [ ] Registration flow requires Terms + Privacy acknowledgment
- [ ] AI training opt-in **separate** checkbox (default OFF)
- [ ] Marketing email opt-in separate (default OFF)
- [ ] Cookie banner functional (EU/UK/TR test IPs)
- [ ] privacy@ and legal@ mailboxes active
- [ ] Data export flow tested end-to-end
- [ ] Account deletion flow tested with 30-day grace
- [ ] Consent records writing to database
- [ ] Sub-processor page published
- [ ] VERBIS registration (if launching Turkey)
- [ ] Stripe merchant agreement active
- [ ] Supabase DPA signed

---

## Admin Checklist

- [ ] `admin.nertura.com` deployed; not indexed
- [ ] Cloudflare Access or IP restriction (optional MVP)
- [ ] All nine roles seeded in `admin_role_permissions`
- [ ] Super Admin accounts provisioned (≤3 people)
- [ ] MFA enforced on admin login
- [ ] Dashboard widgets show live data
- [ ] User/org search working
- [ ] AI log viewer working (redaction verified)
- [ ] Audit log viewer working
- [ ] Consent record viewer working
- [ ] Feature flag: Brain kill switch tested
- [ ] Impersonation logs to audit (if enabled)
- [ ] Admin actions emit audit events (spot check 10 actions)

---

## Database Checklist

- [ ] Production Supabase project separate from dev/staging
- [ ] Migrations applied via CI; version tracked
- [ ] RLS policies verified with test users (cross-tenant negative test)
- [ ] Indexes on `organization_id`, foreign keys
- [ ] Connection pooling configured (Supavisor)
- [ ] PITR backups enabled (Pro plan)
- [ ] Seed data **not** in production
- [ ] `audit_logs` partition strategy in place
- [ ] GDPR export function tested
- [ ] Deletion job tested on staging

---

## Payment Checklist

- [ ] Stripe live mode products/prices match [`subscription-model.md`](subscription-model.md)
- [ ] Webhook endpoint registered; all events logged
- [ ] Checkout flow: Starter subscription completes
- [ ] Checkout flow: Professional trial starts
- [ ] Customer Portal: cancel, update card
- [ ] Entitlements update on webhook within 60s
- [ ] Credit grant on subscription verified
- [ ] Failed payment dunning email tested
- [ ] Refund process documented for Finance Admin
- [ ] Stripe Radar enabled

---

## Email Checklist

- [ ] Google Workspace DNS (MX, SPF, DKIM, DMARC) verified
- [ ] Resend domain `mail.nertura.com` verified
- [ ] Templates: verify, reset, weather alert, task digest, export ready
- [ ] Transactional emails deliver to Gmail, Outlook, Yahoo (test matrix)
- [ ] Unsubscribe link on marketing templates (V2)
- [ ] SPF/DMARC not failing on security@ reports
- [ ] Bounce handling configured in Resend

---

## WhatsApp Checklist (Phase 3 — N/A for Day 90 MVP)

- [ ] Meta Business verification complete
- [ ] WABA phone number active
- [ ] Webhook verified with challenge
- [ ] Double opt-in flow tested
- [ ] Template messages pre-approved
- [ ] STOP keyword revokes consent within 60s
- [ ] WA credits deduct correctly
- [ ] Admin WA center operational

*Skip for MVP GA; mark N/A.*

---

## AI Checklist

- [ ] Brain gateway live; no direct provider keys in client
- [ ] 100% interactions stored
- [ ] Credit gate blocks at zero balance
- [ ] Consent checked before inference
- [ ] Disease detection: 4 crops live
- [ ] Feedback confirm/wrong writes to learning events
- [ ] Provider failover tested (primary down → secondary)
- [ ] Prompt injection test cases pass (internal red team)
- [ ] AI disclaimers visible in UI and Terms
- [ ] Confidence displayed on diagnoses
- [ ] Task creation from AI requires user confirm
- [ ] Kill switch disables Brain globally (tested)

---

## Monitoring Checklist

- [ ] Sentry projects: web, app, admin, API routes
- [ ] Source maps uploaded (hidden from public)
- [ ] Axiom/log drain connected
- [ ] Uptime monitors: nertura.com, app, admin
- [ ] Alert routing to Slack #incidents
- [ ] On-call schedule documented
- [ ] Supabase disk/CPU alerts configured
- [ ] Stripe webhook failure alert
- [ ] Error budget defined (99.9% MVP)

---

## Backup Checklist

- [ ] Supabase PITR verified — restore drill completed in staging
- [ ] Backup restore documented (RTO/RPO in [`security-master-plan.md`](security-master-plan.md))
- [ ] Storage bucket lifecycle rules set
- [ ] Git repository backed up (GitHub)
- [ ] Vercel project export documented
- [ ] Secrets inventory in 1Password

---

## Deployment Checklist

- [ ] `main` branch protection; require PR + CI pass
- [ ] CI: lint, typecheck, test, RLS tests
- [ ] Staging deploy automatic on merge to `develop` or manual promote
- [ ] Production deploy manual approval (CTO)
- [ ] Environment variables parity checklist staging ↔ prod
- [ ] Smoke tests post-deploy:
  - [ ] Homepage 200
  - [ ] Register + verify email
  - [ ] Login app
  - [ ] Create farm + field
  - [ ] Upload observation photo
  - [ ] AI question (Pro test account)
  - [ ] Disease photo
  - [ ] Stripe checkout test mode → live smoke with real $0.50 test (optional)
- [ ] Rollback procedure documented (Vercel instant rollback)
- [ ] Status page updated for launch
- [ ] Internal launch comms sent

---

## Post-Launch (First 72 Hours)

- [ ] Monitor Sentry error rate hourly
- [ ] Monitor Stripe webhooks
- [ ] Monitor Brain latency and cost
- [ ] Review audit logs for anomalies
- [ ] Founder review of first 50 AI interactions
- [ ] Support queue response SLA met
- [ ] Search Console crawl errors checked

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | | | |
| CSO | | | |
| Legal Counsel | | | |
| CPO | | | |
| CGO | | | |
| CEO | | | |

**GA is authorized only when all applicable MVP items are checked and Legal sign-off obtained.**

---

*Production Launch Checklist v1.0 — Pre-implementation.*
