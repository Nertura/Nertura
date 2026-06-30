# Nertura — Credit System

> Metered AI consumption architecture modeled on ChatGPT, Claude, and Suno — transparent credits for every intelligence action across web, mobile, WhatsApp, and media generation.

---

## Purpose

Nertura separates **platform access** (SaaS subscription) from **intelligence consumption** (credits). Subscriptions unlock modules and baseline allocations; credits govern variable-cost AI operations. Users always know what actions cost before they spend.

---

## Dual Revenue Model

```
┌─────────────────────────────────────────────────────────┐
│  SUBSCRIPTION (recurring)                                │
│  Modules · farms · users · support · base credit grant   │
├─────────────────────────────────────────────────────────┤
│  CREDITS (consumption)                                   │
│  AI queries · vision · media · voice · WhatsApp · top-up │
└─────────────────────────────────────────────────────────┘
```

See `/docs/subscription-model.md` for SaaS tiers. This document defines the credit layer.

---

## User Segments & Default Allocations

| Segment | Identification | Monthly credit grant | Purchase top-up |
|---------|----------------|----------------------|-----------------|
| **Anonymous / free** | No account | None (trial teaser only) | No |
| **Registered free** | Account, no payment | 50 text · 5 vision | Yes (limited packs) |
| **Starter subscriber** | Paid Starter | 200 text · 20 vision | Yes |
| **Professional** | Paid Pro | 1,000 text · 100 vision · 10 media | Yes |
| **Business** | Paid Business | 5,000 text · 500 vision · 50 media · 500 WhatsApp | Yes |
| **Enterprise** | Custom contract | Pooled org credits · negotiated | Invoice |

Credits reset on billing cycle anniversary. Unused credits roll over **one month** on paid tiers; expire on free tier.

---

## Credit Types

| Credit type | Code | Used for |
|-------------|------|----------|
| **Text** | `TEXT` | AI Assistant Q&A, report generation, script writing |
| **Vision** | `VISION` | Photo disease detection, image analysis, field scouting AI |
| **Media** | `MEDIA` | Image gen, short video gen, social asset packs |
| **Voice** | `VOICE` | Voiceover seconds (TTS via ElevenLabs, OpenAI, Google) |
| **WhatsApp** | `WA` | AI-powered WhatsApp messages, diagnosis via WA |
| **Premium** | `PREMIUM` | Unified bucket for Enterprise flexibility |

---

## Credit Cost Table (Launch)

| Action | Credit type | Cost | Notes |
|--------|-------------|------|-------|
| AI text question (standard) | TEXT | 1 | <2K tokens equivalent |
| AI text question (deep) | TEXT | 3 | RAG + long context |
| Disease photo analysis | VISION | 2 | Includes storage |
| Multi-photo batch (≤5) | VISION | 8 | WhatsApp batch |
| Yield / market AI report | TEXT | 5 | Structured output |
| Social image generation | MEDIA | 3 | Per image |
| Short video (≤30s) | MEDIA | 15 | Runway/Veo/Kling |
| Voiceover | VOICE | 1 per 30s | Rounded up |
| Full social post pack | MEDIA | 10 | Script + image + caption + hashtags |
| WhatsApp AI reply | WA | 1 | Inbound + outbound pair |
| WhatsApp photo diagnosis | WA + VISION | 2 + 2 | Channel + analysis |

Costs visible in UI before action: *"This will use 2 Vision credits (98 remaining)."*

---

## Credit Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ GRANT    │────►│ BALANCE  │────►│ RESERVE  │────►│ SETTLE   │
│ monthly  │     │ available│     │ at request│     │ on complete│
│ top-up   │     │          │     │          │     │ or REFUND  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### States

| State | Description |
|-------|-------------|
| `available` | Spendable balance |
| `reserved` | Held during inference (prevent double-spend) |
| `consumed` | Deducted on success |
| `refunded` | Returned on system/provider failure |

### Atomicity

Credit operations use database transactions with row-level lock on `CreditBalance`. Reserve → infer → settle in single flow; reservation TTL 120s with auto-release.

---

## Data Model

### CreditBalance

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `organization_id` | UUID | Tenant |
| `user_id` | UUID | Null for org pool (Enterprise) |
| `credit_type` | ENUM | TEXT, VISION, MEDIA, VOICE, WA, PREMIUM |
| `available` | DECIMAL(12,4) | |
| `reserved` | DECIMAL(12,4) | |
| `period_start` | TIMESTAMPTZ | |
| `period_end` | TIMESTAMPTZ | |

### CreditTransaction

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | |
| `organization_id` | UUID | |
| `user_id` | UUID | |
| `credit_type` | ENUM | |
| `amount` | DECIMAL | Negative = consume, positive = grant |
| `balance_after` | DECIMAL | |
| `reason` | ENUM | grant, topup, consume, refund, expire, rollover |
| `reference_type` | VARCHAR | interaction, subscription, purchase |
| `reference_id` | UUID | |
| `created_at` | TIMESTAMPTZ | |

Append-only ledger — never update or delete transactions.

---

## Top-Up Packs (À La Carte)

| Pack | Credits | Price (USD) | Target segment |
|------|---------|-------------|----------------|
| Text Boost | 500 TEXT | $5 | Registered free, Starter |
| Vision Pack | 50 VISION | $8 | All paid |
| Media Studio | 30 MEDIA + 60 VOICE | $25 | Pro, Business |
| WhatsApp Bundle | 1,000 WA | $15 | Business |
| Power Pack | 2,000 TEXT + 200 VISION | $35 | Pro, Business |

Purchased credits expire in 12 months. Subscription grants take precedence (consumed first).

---

## Enterprise Pool

Enterprise organizations receive a **shared credit pool**:

| Feature | Behavior |
|---------|----------|
| Pool admin | Allocate sub-limits per team/user |
| Overages | Invoice monthly at negotiated rate |
| Reporting | Usage by user, department, credit type |
| API metering | Separate API credit schedule |

---

## UI Surfaces

### Credit Indicator (Persistent)

Web header / mobile profile area:

```
✦ 847 text · 42 vision · 12 media     [ Buy credits ]
```

Low balance warning at 20%; blocking modal at 0 for paid actions (free tier sees upgrade CTA).

### Pre-Action Confirmation

```
┌─────────────────────────────────────────┐
│  Photo analysis                         │
│  Uses 2 Vision credits                  │
│  Balance after: 40 Vision               │
│  [ Cancel ]              [ Analyze ]    │
└─────────────────────────────────────────┘
```

Skip confirmation toggle for Professional+ (user preference) except MEDIA and VOICE.

### Usage Dashboard (`/app/billing/credits`)

| Section | Content |
|---------|---------|
| Current balances | All credit types with progress bars |
| Usage this period | Chart by day and type |
| Transaction history | Filterable ledger |
| Top-up | Pack purchase |
| Projections | "At current rate, credits last ~12 days" |

---

## Integration with AI Brain

Every Brain request:

1. Router returns `CreditEstimate`
2. Credit Gate reserves amount
3. On success: settle actual (may be less than estimate)
4. On failure: full refund + log reason
5. Write `CreditTransaction` linked to `interaction_id`

See `/ai/nertura-ai-brain.md`.

---

## Integration with Subscription

On subscription create/renew:

| Tier | Auto-grant job |
|------|----------------|
| Starter | +200 TEXT, +20 VISION |
| Professional | +1000 TEXT, +100 VISION, +10 MEDIA |
| Business | +5000 TEXT, +500 VISION, +50 MEDIA, +500 WA |

Grant job idempotent per billing period. Upgrade mid-cycle: prorated bonus credits.

---

## Abuse Prevention

| Control | Implementation |
|---------|----------------|
| Rate limit | Max 60 TEXT/hour free; 300/hour paid |
| Duplicate photo hash | Same image within 24h = 0 additional vision charge (cached result) |
| Bot detection | CAPTCHA on free tier registration |
| Negative balance | Impossible — reserve fails if insufficient |
| Refund policy | System errors only; user error consumes credits |

---

## Financial Alignment

| Metric | Target |
|--------|--------|
| Credit revenue / total AI provider cost | >2.5× gross margin |
| Top-up attach rate (paid users) | >15% |
| Free → first top-up conversion | >8% |
| Credit exhaustion → upgrade conversion | >20% |

Internal `cost_usd` on each interaction enables margin dashboard.

---

## WhatsApp & Channel Metering

WhatsApp messages metered separately because Meta charges per conversation:

| Event | Credits |
|-------|---------|
| User-initiated AI session (24h window) | 1 WA at first AI reply |
| Template message (reminder) | 0.5 WA |
| Photo diagnosis in WA | 2 VISION + 1 WA |

---

## Phase Rollout

| Phase | Scope |
|-------|-------|
| **2** | TEXT + VISION credits; subscription grants; basic top-up |
| **3** | WA credits; WhatsApp metering |
| **4** | MEDIA + VOICE credits; media engine integration |
| **5** | Enterprise pool; API credit schedule |
| **6** | Dynamic pricing by model cost; credit marketplace for partners |

See `/docs/system-roadmap.md`.

---

*Document owner: Chief Systems Architect / Product*  
*Last updated: June 2026*  
*Companion: `/product/free-to-paid-model.md`, `/docs/subscription-model.md`*
