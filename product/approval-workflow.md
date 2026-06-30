# Nertura — Approval Workflow

> Human-in-the-loop governance for AI-generated content and high-impact actions. Trust is earned before autonomy is granted.

---

## Purpose

Nertura generates content, recommendations, and proposed actions at scale — but **publishing and execution require explicit human approval at launch**. This document defines the approval architecture that protects brand reputation, regulatory compliance, and user trust while enabling a future path to autonomous operation.

---

## Approval Domains

| Domain | Examples | Launch mode | Future mode |
|--------|----------|-------------|-------------|
| **Social media posts** | Instagram, TikTok, YouTube Shorts | Founder approval required | Rule-based auto-publish |
| **AI media assets** | Generated images, videos | Approval before use | Auto for templated content |
| **Email campaigns** | Newsletters, AI outreach | Admin approval | Segmented auto |
| **WhatsApp broadcasts** | Cooperative bulk messages | Admin approval | Opt-in auto reminders |
| **Platform actions** | Create task, schedule irrigation | User confirm per action | Policy-based auto |
| **Marketplace listings** | AI-drafted listings | Seller confirm | Seller auto with review |

---

## State Machine

```
                    ┌─────────────┐
                    │   DRAFT     │
                    │ (AI generated)│
                    └──────┬──────┘
                           │ submit
                           ▼
                    ┌─────────────┐
         ┌─────────│   PENDING   │─────────┐
         │ reject  │   REVIEW    │ approve │
         ▼         └──────┬──────┘         ▼
  ┌─────────────┐         │          ┌─────────────┐
  │  REJECTED   │         │ edit     │  APPROVED   │
  │ (+ reason)  │         ▼          └──────┬──────┘
  └─────────────┘  ┌─────────────┐         │
                   │   REVISION  │         │ schedule
                   │  (re-draft) │         ▼
                   └──────┬──────┘  ┌─────────────┐
                          │         │  SCHEDULED  │
                          └────────►│  (queued)   │
                                    └──────┬──────┘
                                           │ publish time
                                           ▼
                                    ┌─────────────┐
                                    │  PUBLISHED  │
                                    └──────┬──────┘
                                           │ on failure
                                           ▼
                                    ┌─────────────┐
                                    │   FAILED    │
                                    │ (retry queue)│
                                    └─────────────┘
```

---

## Approval Entity Model

### ApprovalRequest

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `organization_id` | UUID | |
| `domain` | ENUM | social, email, whatsapp, media, action |
| `entity_type` | VARCHAR | social_post, email_campaign, etc. |
| `entity_id` | UUID | Linked content record |
| `status` | ENUM | draft, pending, approved, rejected, revision, scheduled, published, failed |
| `submitted_by` | UUID | User or system (AI) |
| `reviewer_id` | UUID | Assigned approver |
| `reviewed_at` | TIMESTAMPTZ | |
| `rejection_reason` | TEXT | |
| `revision_notes` | TEXT | |
| `priority` | ENUM | low, normal, high, urgent |
| `due_by` | TIMESTAMPTZ | SLA for review |
| `metadata` | JSONB | Platform, scheduled time, preview URLs |
| `created_at` | TIMESTAMPTZ | |

---

## Review Queue UI (`/app/approvals`)

### Wireframe Concept

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Approval queue · 7 pending                          [ Filters ▾ ]         │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Social (4) ] [ Email (1) ] [ WhatsApp (2) ] [ Media (0) ]              │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ 📱 Instagram · Reel · Due today                                    │   │
│ │ "5 signs your corn needs nitrogen before week 8"                   │   │
│ │ [Video preview thumbnail]  AI generated · 2 media credits used    │   │
│ │ [ Preview ] [ Edit ] [ ✓ Approve ] [ ✕ Reject ]                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ 📧 Newsletter · Weekly agronomy tips · Scheduled Mon 9 AM          │   │
│ │ Recipients: 12,400 · [ Preview email ] [ Approve ] [ Reject ]      │   │
│ └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Review Actions

| Action | Result |
|--------|--------|
| **Approve** | Move to scheduled or immediate publish |
| **Approve with edits** | Inline edit → re-preview → approve |
| **Reject** | Return to draft with reason; optional AI regenerate |
| **Request revision** | Assign back to content team / AI with notes |
| **Delegate** | Reassign reviewer |

---

## Role-Based Approvers

| Domain | Default approver | Escalation |
|--------|------------------|------------|
| Social media (Nertura brand) | Founder / marketing lead | — |
| Social media (org white-label) | Org admin | — |
| Email newsletter | Marketing admin | Founder if >10K recipients |
| WhatsApp broadcast | Org admin | Cooperative board if >500 members |
| AI platform actions | Acting user | Manager for bulk actions |
| Enterprise media | Customer admin | Nertura CS for template setup |

---

## Notification Flow

| Event | Notify |
|-------|--------|
| Item submitted for review | Approver: push + email |
| Pending >24h | Reminder to approver |
| Approved | Submitter: confirmation |
| Rejected | Submitter: reason + link to edit |
| Publish failed | Approver + engineering alert |

Founder mobile push for social posts at launch — non-negotiable SLA.

---

## Preview Requirements

Before approval, reviewer must see:

| Content type | Preview includes |
|--------------|-------------------|
| Social post | Full caption, hashtags, image/video, platform mockup |
| Email | Rendered HTML + plain text + subject line |
| WhatsApp | Message text + media + recipient count |
| Video | Inline player + script + voiceover audio |
| Platform action | Diff of what will change (task list, schedule) |

No approve button until preview loaded.

---

## Audit Trail

Every state transition logged:

```
2026-06-19 14:32  AI generated draft POST-4421
2026-06-19 14:33  Submitted for review by system
2026-06-19 15:10  Viewed by founder@nertura.com
2026-06-19 15:12  Approved by founder@nertura.com
2026-06-19 15:12  Scheduled for 2026-06-20 09:00 TRT
2026-06-20 09:00  Published to Instagram · post_id ext_8821
```

Immutable. Exportable for compliance.

---

## Path to Autonomous Mode

### Trust Levels

| Level | Name | Behavior |
|-------|------|----------|
| **L0** | Manual only | All items require human approval (launch default) |
| **L1** | Trusted templates | Pre-approved templates auto-publish; new content manual |
| **L2** | Category auto | e.g. "Weather tip" category auto; "Product promo" manual |
| **L3** | Full auto with guardrails | AI publishes; human audits sample post-hoc |
| **L4** | Autonomous | AI manages calendar end-to-end; alerts on anomaly only |

### Graduation Criteria (L0 → L1)

| Criterion | Threshold |
|-----------|-----------|
| Approved posts without edit | ≥50 consecutive |
| Rejection rate | <5% |
| Engagement vs manual posts | Within 20% |
| Zero compliance incidents | 90 days |
| Founder explicit enable | Required |

Each platform and content category graduates independently.

### Guardrails (Auto Mode)

| Guardrail | Action |
|-----------|--------|
| Brand keyword blocklist | Block publish; queue for review |
| Competitor mention | Always manual |
| Medical/legal claims | Always manual |
| Engagement drop >30% | Pause auto; alert |
| User report | Immediate pause + review |

---

## Integration Points

| System | Integration |
|--------|-------------|
| AI Media Engine | Submits drafts to approval queue |
| Social automation | Publishes only `approved` + `scheduled` items |
| Email engine | Campaigns gated on approval status |
| WhatsApp | Broadcast templates require approval |
| AI Brain | Action proposals use same confirm pattern |

---

## SLA Targets (Launch)

| Metric | Target |
|--------|--------|
| Founder review time (social) | <24 hours |
| Queue depth alert | >10 pending |
| Time from approve to publish | <5 minutes |
| Failed publish retry | 3 attempts exponential backoff |

---

*Document owner: Chief Systems Architect / Product*  
*Last updated: June 2026*  
*Companion: `/automation/ai-media-engine.md`, `/automation/social-media-automation.md`*
