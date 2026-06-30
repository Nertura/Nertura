# Nertura — Free-to-Paid Model

> Growth architecture converting anonymous visitors into registered users, credit buyers, and SaaS subscribers — the acquisition funnel for a global Ag intelligence platform.

---

## Purpose

Nertura's intelligence layer creates a natural **product-led growth funnel**: users experience AI value before paying for platform or credits. This document defines segment progression, conversion triggers, and economic design.

---

## User Progression Ladder

```
┌─────────────────────────────────────────────────────────────────┐
│  L0: ANONYMOUS VISITOR                                          │
│  Marketing site · public agronomy content · no AI                │
└───────────────────────────────┬─────────────────────────────────┘
                                │ sign up
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  L1: REGISTERED FREE                                            │
│  50 TEXT + 5 VISION credits/mo · 1 farm · basic dashboard       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ credit exhaust / module need
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  L2: CREDIT BUYER (à la carte)                                  │
│  Top-up packs without subscription                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │ operational need
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  L3: STARTER / PROFESSIONAL SUBSCRIBER                          │
│  Full modules + monthly credit grant + rollover                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ team / scale
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  L4: BUSINESS / ENTERPRISE                                      │
│  Multi-farm · CRM · WhatsApp · pooled credits · SSO             │
└─────────────────────────────────────────────────────────────────┘
```

---

## L0: Anonymous Visitor

### Access

| Allowed | Blocked |
|---------|---------|
| Marketing pages, blog, public crop guides | AI Assistant |
| Pricing page, credit pack preview | Photo diagnosis |
| Register CTA everywhere | Farm management |

### Conversion hooks

- "Ask Nertura AI" teaser with blurred response → register wall
- "Diagnose this leaf" upload → register to see result
- Regional crop calendar PDF → email capture

---

## L1: Registered Free

### Included

| Feature | Limit |
|---------|-------|
| AI text credits | 50/month |
| AI vision credits | 5/month |
| Farms | 1 |
| Fields | 3 |
| Crop plans | 1 active |
| Weather | 7-day basic |
| Storage | 500 MB |
| History | 30-day AI interaction retention |

### Restrictions

| Feature | Gate |
|---------|------|
| WhatsApp AI | Paid only |
| Media generation | Paid only |
| Marketplace listing | Professional+ |
| CRM | Professional+ |
| Export reports | Watermarked PDF |
| Team members | Solo only |

### Conversion triggers (in-app)

| Trigger | CTA |
|---------|-----|
| 0 credits remaining | "Buy Vision Pack $8" or "Upgrade to Pro" |
| 5th successful diagnosis | "Unlock unlimited fields with Starter" |
| Second farm attempt | "Upgrade to manage multiple farms" |
| 30-day active streak | Limited-time Pro trial offer |
| Export report click | "Remove watermark — upgrade" |

---

## L2: Credit Buyer

Users who purchase top-ups without subscribing — important in emerging markets where monthly SaaS is barrier.

### Strategy

| Element | Design |
|---------|--------|
| Entry pack | Low friction: $3 text boost |
| Payment methods | Card + local (Pix, M-Pesa) [regional] |
| No subscription required | Credits work on free tier |
| Upsell path | "Your credit spend this month: $12 — Pro is $99 with 10× credits" |

### Target

8% of registered free users purchase credits within 90 days.

---

## L3: Paid Subscriber

### Value proposition vs credits-only

| Benefit | Subscriber | Credit-only |
|---------|------------|-------------|
| Monthly credit grant | ✓ | ✗ |
| Credit rollover | 1 month | N/A |
| Module access | Full tier | Minimal |
| Support | Email/chat | Community |
| WhatsApp | Business+ | ✗ |
| Rollover farm data | Unlimited retention | 30-day cap |

### Trial design

| Parameter | Value |
|-----------|-------|
| Trial tier | Professional (14 days) |
| Credit card | Not required |
| Trial credits | Full Pro grant |
| Downgrade on expiry | → L1 free (data preserved) |
| Extension | Sales-assist for cooperatives |

---

## L4: Enterprise

Direct sales motion; not self-serve PLG.

| Entry | Motion |
|-------|--------|
| Business tier outgrow | In-app "Talk to sales" at 50 users |
| Export/cooperative | Outbound + pilot program |
| Credit pool | Custom annual contract |

---

## Channel-Specific Acquisition

| Channel | L0 → L1 hook |
|---------|--------------|
| **Organic / SEO** | Crop disease lookup landing pages |
| **Social media** | Nertura AI Media Engine content → link in bio |
| **WhatsApp** | "Save our number" campaign [Phase 3] |
| **Cooperative** | Bulk invite; admin pays Business tier |
| **Referral** | Give 50 TEXT, get 50 TEXT on friend signup |
| **Field demo** | Offline-first mobile; sync triggers register |

---

## Referral & Viral Mechanics

### Farmer referral program

| Actor | Reward |
|-------|--------|
| Referrer | 50 TEXT + 5 VISION on friend activation |
| Referee | +25 TEXT bonus on top of free grant |
| Cap | 500 TEXT/month from referrals |

### Cooperative viral loop

Admin invites members → members use AI → members hit credit limit → cooperative buys Business pool OR member converts individually.

---

## Pricing Psychology

| Tactic | Implementation |
|--------|----------------|
| **Anchor** | Show Enterprise on pricing page |
| **Decoy** | Credit packs make Pro subscription look efficient |
| **Loss aversion** | "Your crop history deletes in 7 days on free tier" (soft) |
| **Social proof** | "847 farmers in your region use Nertura" |
| **Progress** | "You've saved an estimated 12 hours this month" |

---

## Metrics Funnel

| Stage | Metric | Target |
|-------|--------|--------|
| L0 → L1 | Visitor → register | 12% |
| L1 activation | First AI use within 24h | 60% |
| L1 → L2 | Free → credit purchase (90d) | 8% |
| L1 → L3 | Free → paid sub (90d) | 5% |
| L2 → L3 | Credit buyer → subscriber (180d) | 25% |
| Trial → paid | Trial conversion | 35% |
| Net revenue retention | Paid cohort | >110% |

---

## Data Retention as Conversion Lever

| Tier | AI interaction history | Photos |
|------|------------------------|--------|
| Free | 30 days | 90 days |
| Paid | Unlimited | Unlimited |
| Lapsed paid | 12 months read-only | 12 months |

Export always available (GDPR); full history restoration on resubscribe.

---

## Anti-Churn (Paid)

| Signal | Intervention |
|--------|--------------|
| Credits unused 30d | "Your 847 text credits expire in 5 days" |
| Usage drop 50% | Email: new feature + credit bonus |
| Cancel intent | Survey + 1-month pause option |
| Downgrade | Preserve data; show feature loss preview |

---

## Alignment with Credit System

See `/product/credit-system.md` for grant amounts and pack pricing.

| Segment | Primary monetization |
|---------|---------------------|
| L1 free | Conversion to L2/L3 |
| L2 credit buyer | Margin on credit packs |
| L3 subscriber | SaaS ARR + credit top-up attach |
| L4 enterprise | Contract + pool overages |

---

## Phase Rollout

| Phase | Funnel capability |
|-------|-------------------|
| **1** | L0 marketing; L1 free with manual AI (approval era) |
| **2** | Full credit system; L2 packs; trials |
| **3** | WhatsApp acquisition; referral program |
| **4** | Social content → L0 traffic; media as top of funnel |
| **5** | Marketplace + sponsor network monetization |
| **6** | Proprietary AI as premium differentiator |

---

*Document owner: Chief Systems Architect / Growth*  
*Last updated: June 2026*  
*Companion: `/product/credit-system.md`, `/docs/subscription-model.md`*
