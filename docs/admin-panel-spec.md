# Nertura — Admin Panel Specification

> Enterprise internal operations console at `admin.nertura.com`. Separate Next.js app; hardened access; full audit trail.

**Status:** Pre-implementation · **Owner:** CTO + CPO  
**Permissions:** [`admin-permission-matrix.md`](admin-permission-matrix.md)

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Salesforce density when needed** | Data tables, filters, bulk actions |
| **Stripe clarity** | Obvious money and subscription states |
| **Palantir auditability** | Every action logged; impersonation visible |
| **Zero accidental publish** | Approval queues with confirm steps |
| **Role least privilege** | Nine admin roles; Super Admin rare |

Visual: shadcn/ui; dark mode default; Nertura Void `#0B1220` shell; Signal `#2DDAAF` accents.

---

## Access Model

- Host: `admin.nertura.com`
- Auth: Supabase Auth with `platform_admin=true` claim OR `admin_users` table lookup
- **MFA mandatory** before any module access
- Optional: Cloudflare Zero Trust in front
- Session timeout: 30 minutes idle
- IP allowlist: configurable for Super Admin operations (V2)

---

## Shell Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Nertura Admin · [Env: PROD]                    Search ⌘K    🔔  Admin ▾ │
├──────────────┬───────────────────────────────────────────────────────────┤
│  NAV         │  Breadcrumb / Page title                    [Actions]     │
│  (240px)     ├───────────────────────────────────────────────────────────┤
│              │                                                           │
│  Dashboard   │                    MODULE CONTENT                         │
│  Users       │                                                           │
│  Orgs        │                                                           │
│  ...         │                                                           │
└──────────────┴───────────────────────────────────────────────────────────┘
```

---

## Module Catalog

### 1. Admin Dashboard

| Widget | Data |
|--------|------|
| Active orgs / users (24h) | Supabase aggregates |
| MRR / new subscriptions | Stripe |
| AI inferences (24h) / credit burn | Brain metrics |
| Open support tickets | Helpdesk |
| Pending approvals count | Approval queue |
| System health | Sentry, uptime, Supabase |
| Security alerts (7d) | Audit log |

### 2. User Management

Search users by email, id, org. View profile, org membership, last login, MFA status, consent summary.

Actions: deactivate, force password reset, revoke sessions, trigger export, view audit trail.  
**Impersonation:** Super Admin only; banner + audit.

### 3. Organization Management

List/filter orgs by tier, status, country, created date. View farms count, users, subscription, credit balance.

Actions: suspend, change tier (override), add credit grant, assign success manager note.

### 4. Farm Management (Support)

Read-only field/farm view for support tickets. GPS visible only with Support Admin + ticket reference logged.

### 5. AI Conversation Logs

Search `ai_interactions` by org, user, date, channel, feedback. View full thread, provider, tokens, cost, sources.

Redact: provider API keys never shown.  
Export: Legal Admin + audit.

### 6. Photo Diagnosis Review

Queue: low-confidence diagnoses, user-flagged wrong, expert review requested (V2).

UI: side-by-side photo + AI result + field context. Actions: validate, override label, assign agronomist, notify user.

Role: AI Review Admin.

### 7. Content Approval Center

Unified queue for social posts, blog drafts, newsletter, AI-generated media (V3).

States: draft → pending → approved → scheduled → published / rejected.  
Founder approval required L0 at launch per [`../product/approval-workflow.md`](../product/approval-workflow.md).

Role: Content Admin.

### 8. Social Media Post Approval

Sub-view of Content Approval filtered `domain=social`. Preview per platform (IG, TikTok, LinkedIn). Schedule datetime.

### 9. WhatsApp Message Center (V2)

Inbound/outbound log, template manager, broadcast approval, opt-in status per user, delivery stats.

Role: Marketing Admin + Legal review for new templates.

### 10. Email Campaign Center (V2)

Template editor, segment builder, send approval, unsubscribe sync, Resend delivery stats.

### 11. Credit Management

Grant/adjust credits per org or user. View ledger. Reason code required. Finance Admin approval >10K credits.

### 12. Subscription Management

Stripe Customer link, tier, trial end, cancel at period end, apply coupon, view invoices.

### 13. Payment Logs

Stripe events mirror: payment succeeded/failed, disputes, refunds. Filter by org, amount, date.

### 14. Security Logs

Failed logins, rate limit hits, WAF blocks (Cloudflare API), injection blocks, suspicious exports.

Role: Security Admin.

### 15. Audit Logs

Full [`audit-log-system.md`](audit-log-system.md) UI. Export with Legal approval.

### 16. Consent Records

Search by user, purpose, version, granted/revoked. Immutable display. Export for regulatory request.

Role: Legal Admin.

### 17. Legal Document Versioning

Upload markdown/HTML policy versions; set effective date; locales EN/TR; publish to `nertura.com/legal/*`.

Requires Legal Admin + second approver for production publish.

### 18. Support Tickets

Integrate Intercom or Plain (V2). MVP: lightweight internal ticket table linked to user/org.

Assign, status, priority, internal notes.

### 19. System Health

Sentry issue count, Vercel deployment status, Supabase CPU/connections, Brain latency p95, webhook failure queue depth, Stripe webhook lag.

### 20. Feature Flags

Flags by org, tier, percentage rollout. Kill switches: Brain, uploads, registrations, WhatsApp.

Super Admin + Engineering.

### 21. Role Permissions

UI to view matrix; Super Admin edits role → permission mapping (stored in DB, cached).

### 22. Admin Notification Center

Approvals pending, security alerts, failed payments, system degradation. Email digest to on-call.

---

## MVP Admin Scope (Day 90)

| Module | Ship |
|--------|------|
| Dashboard (basic) | ✓ |
| Users | ✓ |
| Organizations | ✓ |
| AI conversation logs | ✓ |
| Diagnosis review (basic list) | ✓ |
| Audit logs (read) | ✓ |
| Consent records (read) | ✓ |
| Subscription / payments (Stripe link) | ✓ |
| System health (basic) | ✓ |
| Feature flags (Brain kill switch) | ✓ |
| Content / social / WA / email centers | V2/V3 |

---

## Technical Implementation

- `apps/admin` Next.js App Router
- All data via Route Handlers + service role; **never** expose service key
- Each action calls `audit.emit()`
- Shared `@nertura/ui` components
- E2E tests on critical paths: login MFA, impersonation audit, credit grant

---

*Admin Panel Specification v1.0 — Pre-implementation.*
