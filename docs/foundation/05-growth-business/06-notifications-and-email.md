# Chapter 06 — Notifications & Email

## Purpose

Define **how Nertura communicates with growers and prospects** — separating transactional product email from marketing outreach, routing all AI-generated sends through approval gates, and standardizing on Resend for programmatic delivery.

---

## Principles

1. **Transactional is sacred** — Verification, billing, and security emails must deliver regardless of marketing opt-out.
2. **Marketing requires consent and approval** — No AI outreach or newsletter sends without human review (live in admin).
3. **Resend for product; Workspace for humans** — API email vs founder@ inboxes stay isolated.
4. **Agricultural value in every send** — Even transactional emails reinforce field/case context where appropriate.
5. **Audit everything** — Outreach lives in `email_log`; delivery status tracked for compliance.

---

## Architecture / Structure

### Dual-layer email system

From [`automation/email-engine.md`](../../../automation/email-engine.md):

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL LAYER                               │
├────────────────────────────┬────────────────────────────────────┤
│  GOOGLE WORKSPACE          │  RESEND (API)                      │
│  hello@, support@          │  Transactional product email       │
│  privacy@, security@       │  Approved outreach & campaigns     │
│  Human replies             │  Webhooks: delivery, bounce        │
└────────────────────────────┴────────────────────────────────────┘
```

**Rule:** No product transactional email through Workspace — protects deliverability isolation.

### Email categories

| Category | Examples | Consent | Approval | Provider |
|----------|----------|---------|----------|----------|
| **Transactional** | Email verify, password reset, Stripe receipt, export ready | Not required (service) | Template only | Resend |
| **Product alert** | Follow-up reminder, frost alert, task digest | Implied by product use | Template only | Resend |
| **Lifecycle marketing** | Welcome series, win-back, newsletter | Explicit opt-in | Human review V2+ | Resend |
| **AI outreach** | B2B lead emails, coop invitations | Lead + no `do_not_contact` | **Founder approve each draft** | Resend |
| **Admin notification** | New signup alert, failed payment | Internal | N/A | Resend → `OUTREACH_NOTIFY_EMAIL` |

### Resend configuration (live)

**Outreach module:** `apps/admin/src/lib/outreach/resend.ts`

| Env var | Purpose |
|---------|---------|
| `RESEND_API_KEY` | API authentication |
| `OUTREACH_FROM_EMAIL` | Verified sender (e.g. `hello@mail.nertura.com`) |
| `OUTREACH_NOTIFY_EMAIL` | Internal founder alerts |

`isResendConfigured()` gates all sends — status endpoint returns:

> *"Resend is configured. Test sends require founder approval on each draft."*

(`apps/admin/src/app/api/outreach/status/route.ts`)

### Outreach approval pipeline (live)

```
Lead discovered (growth-ai/lead-discovery)
    → AI generates draft (claude.ts / pipeline.ts)
    → Insert email_log status = 'taslak' (draft)
    → Founder reviews in OutreachApprovalClient
        → Edit subject/body (PATCH)
        → Approve → status = 'onaylandi'
        → Reject → status = 'reddedildi'
    → sendApprovedDrafts() — ONLY 'onaylandi' rows
        → do_not_contact check on lead
        → sendOutreachEmail via Resend
        → status = 'sent', sent_at = now
```

**Critical:** There is no code path that sends `taslak` (draft) emails. `send-approved.ts` explicitly filters `draft.status !== 'onaylandi'` → skip.

**Statuses** (`apps/admin/src/lib/outreach/db.ts`):

| Status | Meaning |
|--------|---------|
| `taslak` | Draft — not sendable |
| `onaylandi` | Approved — eligible for send queue |
| `reddedildi` | Rejected |
| `sent` | Delivered via Resend |

### Transactional email (product — roadmap + MVP)

MVP transactional set per [`docs/production-checklist.md`](../../production-checklist.md):

| Template | Trigger |
|----------|---------|
| Email verification | Supabase auth signup |
| Password reset | Auth request |
| Stripe purchase confirmation | Webhook success + optional Resend |
| Data export ready | Export job complete |
| Weather / task alert | Alert engine (V2) |

Domain: `mail.nertura.com` — SPF, DKIM, DMARC verified before launch.

### In-app notifications

Parallel channel to email — not replaced by it:

| Type | Surface |
|------|---------|
| Credit low warning | Dashboard header |
| Limit reached (402) | Doctor modal |
| Case follow-up due | Dashboard home + optional email |
| Billing issue | Banner (future dunning) |

In-app first for time-sensitive; email for async re-engagement.

### Growth dashboard email metrics

`getGrowthDashboardStats()` tracks:

- Emails generated (drafts created)
- Pending approvals (`taslak` count)
- Approved queue (`onaylandi`)
- Sent today, delivered, opened, clicked
- Bounce rate, spam score

Used for weekly growth review — see Chapter 08.

---

## Decision Rationale

### Why approval on outreach but not on password reset?

Outreach is **persuasive and reputational** — wrong copy damages domain reputation and brand. Password reset is **functional** — template-fixed, user-initiated, legally required to deliver.

### Why Resend over Workspace for product email?

API delivery, webhooks, bounce handling, and template versioning at scale. Workspace is for human conversation — mixing bulk send through Workspace destroys corporate inbox reputation.

### Why check `do_not_contact` at send time?

Lead data changes. Opt-out must be enforced at the last moment before `resend.emails.send` — implemented in `send-approved.ts`.

---

## Examples

### Good transactional email

**Subject:** *Confirm your Nertura account*

*"Tap below to verify your email and save your field diagnosis. This link expires in 24 hours."*

Short, functional, one CTA.

### Good approved outreach

Founder edits AI draft to remove jargon, adds specific cooperative name and crop region, approves, sends to 12 opted-in leads.

### Bad outreach

Cron job auto-sends all `taslak` rows at midnight — **does not exist in codebase and must never be added.**

### Good admin notification

`sendAdminNotification` on premium conversion: *"New credit purchase: Pro pack (500 credits) — user ID …"* to founder — not to customer.

---

## Best Practices

- Verify Resend domain before any production outreach batch.
- Test deliverability matrix: Gmail, Outlook, Yahoo before launch.
- Include unsubscribe on marketing templates (V2 legal requirement).
- Log Resend message ID on `email_log` after send for support lookup.
- Keep outreach HTML simple — plain paragraphs via `sendOutreachEmail` text-to-HTML mapping.
- 48h founder SLA on pending approvals ([marketing-growth-system](../../marketing-growth-system.md)).

## Bad Practices

- Sending marketing email through `support@` Workspace mailbox.
- Bypassing approval queue for "just this once" AI outreach.
- Buying email lists — leads come from discovery pipeline with sector targeting only.
- Sending treatment dosage advice in outreach emails without disclaimer.
- Ignoring bounce rate >5% — pause campaigns and clean list.

---

## Future Considerations

| Feature | Phase |
|---------|-------|
| React Email templates in monorepo | V2 |
| SendGrid failover | V2 |
| Newsletter consent + double opt-in | V2 |
| WhatsApp utility messages (Meta templates) | V3 |
| n8n → internal workflow engine migration | V4 |
| Per-region sender domains (TR, EU) | V2 |

---

## Cross-References

- [Brand Voice & Marketing](04-brand-voice-and-marketing.md)
- [Retention & Lifecycle](05-retention-and-lifecycle.md)
- [SEO, Community & Content](07-seo-community-and-content.md)
- Code: `apps/admin/src/lib/outreach/`
- Legacy: [`automation/email-engine.md`](../../../automation/email-engine.md)
- Legacy: [`docs/marketing-growth-system.md`](../../marketing-growth-system.md)
