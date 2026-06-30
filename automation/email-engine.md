# Nertura — Email Engine

> Dual-layer email architecture: Google Workspace for human company communication; Resend/SendGrid for transactional, lifecycle, alert, and AI-assisted outreach email at scale.

---

## Purpose

Email serves three distinct functions in Nertura — each with appropriate infrastructure:

| Function | Infrastructure | Examples |
|----------|----------------|----------|
| **Company / human email** | Google Workspace | founder@nertura.com, support@, partnerships@ |
| **Transactional / product email** | Resend (primary) or SendGrid (fallback) | Verification, alerts, reports, billing |
| **Marketing / lifecycle** | Resend + approval workflow | Onboarding drips, newsletters, AI outreach |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL ENGINE                              │
├────────────────────────────┬────────────────────────────────────┤
│  GOOGLE WORKSPACE          │  RESEND / SENDGRID (API)           │
│  · Human mailboxes         │  · Transactional                   │
│  · Calendar, Drive         │  · Lifecycle automation            │
│  · Internal team           │  · AI-generated (approved)         │
│                            │  · Webhooks (delivery, bounce)     │
└────────────────────────────┴────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Email Service     │
                    │  · Template render │
                    │  · Queue           │
                    │  · Consent check   │
                    │  · Audit log       │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Onboarding      Alerts/Reports   Newsletters
```

---

## Google Workspace (Company Email)

### Scope

| Mailbox | Owner | Use |
|---------|-------|-----|
| `hello@nertura.com` | Founders | General inbound |
| `support@nertura.com` | Support team | Customer tickets (sync to CRM) |
| `security@nertura.com` | Security | Vulnerability reports |
| `privacy@nertura.com` | DPO | KVKK/GDPR requests |
| `partnerships@nertura.com` | BD | Coops, sponsors, integrations |

### Integration with product

- Support emails create `CRMInteraction` when forwarded via automation rule
- Privacy@ triggers data subject request workflow
- **No product transactional email through Workspace** — keeps deliverability isolated

---

## Resend / SendGrid (Transactional Layer)

### Provider strategy

| Provider | Role |
|----------|------|
| **Resend** | Primary — developer experience, React Email templates |
| **SendGrid** | Fallback — enterprise scale, advanced analytics |

Automatic failover if primary returns 5xx or bounce rate >5%.

### Domain authentication

| Record | Purpose |
|--------|---------|
| SPF | Include resend/sendgrid |
| DKIM | 2048-bit keys per subdomain |
| DMARC | `p=quarantine` launch → `p=reject` at scale |
| Sending domain | `mail.nertura.com` (transactional) |
| Marketing domain | `news.nertura.com` (lifecycle) |

Separate domains protect transactional reputation.

---

## Email Categories

### 1. Transactional (no marketing consent required)

| Email | Trigger | Template |
|-------|---------|----------|
| Email verification | Registration | `auth.verify` |
| Password reset | Request | `auth.reset` |
| Invite to org | Admin invite | `org.invite` |
| Invoice receipt | Stripe webhook | `billing.invoice` |
| Payment failed | Stripe dunning | `billing.failed` |
| Credit purchase confirm | Payment success | `credits.purchased` |
| Data export ready | GDPR export job | `privacy.export` |
| Security alert | New login, MFA change | `security.alert` |

Always sent regardless of marketing opt-out.

### 2. Operational alerts (product consent)

| Email | Trigger | Frequency cap |
|-------|---------|---------------|
| Frost / weather critical | Weather engine | Max 3/day |
| Task overdue digest | Daily cron | 1/day |
| Low stock | Inventory threshold | 1/day per SKU |
| Marketplace offer received | Real-time | Unlimited |
| Approval pending (founder) | Approval queue | Immediate |
| Irrigation recommendation | AI advisory | User preference |

Respects `notification_preferences.email` and quiet hours.

### 3. Reports (scheduled)

| Report | Delivery | Format |
|--------|----------|--------|
| Weekly ops summary | Scheduled | HTML + PDF attach |
| Harvest report | On generation | Link + attach |
| Cooperative member report | Admin schedule | PDF |
| Credit usage summary | Monthly | HTML |

### 4. Onboarding lifecycle

| Day | Email | Goal |
|-----|-------|------|
| 0 | Welcome + verify | Activate |
| 1 | Add your first field | Activation |
| 3 | Try AI diagnosis (5 free) | AI habit |
| 7 | Credit balance + tips | Engagement |
| 14 | Trial ending [if trial] | Convert |
| 30 | Feature discovery: WhatsApp | Expand channel |

Drip pauses on unsubscribe from marketing; transactional continues.

### 5. Newsletters (approval-required)

| Type | Audience | Approval |
|------|----------|----------|
| Nertura brand newsletter | Opt-in marketing list | Founder/marketing |
| Cooperative bulletin | Member emails | Co-op admin |
| AI-generated outreach | Segment | Admin + approval workflow |

---

## AI-Generated Outreach

Brain drafts personalized emails for CRM segments:

```
Trigger: CRM segment "Inactive members 14d"
    → Brain generates personalized subject + body per recipient
       (context: member name, crop, last activity)
    → Batch stored as EmailCampaignDraft
    → ApprovalRequest (domain: email)
    → On approve: Resend batch send with rate limit
    → Track opens/clicks → CRMInteraction
```

**Never send AI outreach without approval at launch.**

---

## Template System

React Email components; version controlled:

```
/emails
  /components   Layout, Button, Header
  /templates
    auth.verify.tsx
    alert.frost.tsx
    lifecycle.day3-ai.tsx
    report.weekly.tsx
```

| Feature | Support |
|---------|---------|
| i18n | TR, EN, PT, ES strings |
| Personalization | `{{first_name}}`, `{{farm_name}}`, `{{credit_balance}}` |
| Dark mode | CSS media query |
| Plain text | Auto-generated from HTML |

---

## EmailLog Entity

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `organization_id` | |
| `user_id` | Recipient |
| `category` | transactional, alert, report, marketing |
| `template_slug` | |
| `subject` | |
| `provider` | resend, sendgrid |
| `provider_message_id` | |
| `status` | queued, sent, delivered, bounced, complained |
| `opened_at` | |
| `clicked_at` | |
| `metadata` | JSONB |
| `created_at` | |

Append-only. Retention 24 months.

---

## Consent & Unsubscribe

| List | Unsubscribe behavior |
|------|---------------------|
| Marketing | One-click; honored in 48h |
| Lifecycle drips | Treated as marketing |
| Operational alerts | Cannot unsubscribe critical; can reduce frequency |
| Transactional | No unsubscribe (required for service) |

List-Unsubscribe header on all marketing emails (RFC 8058).

---

## Deliverability Monitoring

| Metric | Alert threshold |
|--------|-----------------|
| Bounce rate | >2% |
| Complaint rate | >0.1% |
| Open rate (marketing) | <15% investigate |
| Domain reputation | Google Postmaster Tools weekly review |

---

## Security

| Control | Implementation |
|---------|----------------|
| SPF/DKIM/DMARC | Required before production send |
| No secrets in email | Links use signed tokens with TTL |
| BCC on bulk | Prohibited — individual sends or proper list API |
| PII in logs | Subject/body not logged; template slug + IDs only |
| Phishing | Brand templates; report phishing@ documented |

---

## Integration Points

| System | Integration |
|--------|-------------|
| Approval workflow | Newsletters gated |
| CRM | Outbound logged as interaction |
| Credit system | Low balance emails |
| WhatsApp | Email as fallback if WA opt-out |
| AI Media Engine | Cross-promote content in newsletter |

---

## Volumes (Projected)

| Phase | Monthly sends |
|-------|---------------|
| 1–2 | 50K transactional |
| 3 | 200K + alerts |
| 4 | 500K + newsletters |
| 5 | 2M+ multi-region |

SendGrid tier upgrade trigger at 500K/month.

---

*Document owner: Chief Systems Architect / Platform*  
*Last updated: June 2026*  
*Companion: `/automation/whatsapp-integration.md`, `/product/approval-workflow.md`*
