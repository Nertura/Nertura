# Chapter 03 — Growth Loops & Activation

## Purpose

Define the **primary acquisition and activation loop** for Nertura: how an anonymous visitor becomes a retained grower with field memory. Every product and marketing decision should strengthen this loop — not add parallel funnels.

---

## Principles

1. **One front door** — Guest Doctor on the marketing site; ask, upload, photograph.
2. **Signup is a save action** — Account creation preserves cases, fields, and history — not a billing gate.
3. **Field = patient file** — A field without a case is geography; a field with a case is memory.
4. **Activation before monetization** — Credit purchase prompts appear after value is demonstrated.
5. **No marketplace detours** — Growth loops never route through input catalogs or affiliate offers.

---

## Architecture / Structure

### Primary loop

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NERTURA ACTIVATION LOOP                               │
└─────────────────────────────────────────────────────────────────────────┘

  MARKETING SITE                    DASHBOARD APP
  (apps/marketing)                  (apps/dashboard)

  ┌──────────────┐                  ┌──────────────┐
  │ Guest Doctor │ ─── signup ───►  │  Registered  │
  │ 3 questions  │      CTA         │  10 credits  │
  └──────┬───────┘                  └──────┬───────┘
         │                                 │
         │ trust                           │ onboarding
         ▼                                 ▼
  ┌──────────────┐                  ┌──────────────┐
  │ Photo / text │                  │ Create field │
  │  diagnosis   │                  │  on map      │
  └──────┬───────┘                  └──────┬───────┘
         │                                 │
         └─────────────┬───────────────────┘
                       ▼
                ┌──────────────┐
                │ Field case   │  ← North Star precursor
                │ open/monitor │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Return visits│
                │ follow-up    │
                │ credit buy   │
                └──────────────┘
```

### Stage 1 — Guest Doctor (anonymous)

**Surface:** Marketing homepage — ask / upload / photo only ([Book 01 — Home Page Philosophy](../01-product-bible/11-home-page-philosophy.md)).

**Limits:**

| Mechanism | Detail |
|-----------|--------|
| Constant | `GUEST_QUESTION_LIMIT = 3` |
| DB | `guest_usage.question_count` vs `free_limit` (default 3) |
| Cookie | `nertura_guest_id`, `nertura_guest_count` fallback |
| Code | `apps/marketing/src/lib/guest-usage.ts` |

**Goal:** Deliver a complete, evidence-backed answer with disclaimer. Prove competence in under 60 seconds.

**Conversion trigger:** After question 2 or at limit — calm CTA: *"Save this diagnosis and track your field — create a free account."*

### Stage 2 — Signup (identity)

**Surface:** Supabase auth on dashboard app (`apps/dashboard`).

**On signup:**

1. `on_public_user_init_credits` trigger fires.
2. `user_usage_limits` row created with `credits_balance = 10`.
3. `credit_transactions` row: `signup_bonus`, +10 credits.

**Goal:** User lands in dashboard with enough credits to continue the conversation from Guest Doctor (via intake handoff or fresh Doctor session).

**UTM capture:** Store attribution on `users.utm_attribution` JSONB per [`docs/marketing-growth-system.md`](../../marketing-growth-system.md) — enables channel ROI in Book 08.

### Stage 3 — Field creation (context)

**Surface:** Farm map + field intake (`apps/dashboard/src/components/farm/`).

**Goal:** User pins a field — name, crop, area, location. This transforms a one-off question into **spatial memory**.

**Activation metric:** User with ≥1 field in `fields` table linked to their organization.

Field creation is **free and unlimited** on MVP tiers — gating geography would kill the loop.

### Stage 4 — Field case (memory)

**Surface:** Doctor → case save flow; field case list.

**Schema:** `field_cases` (`supabase/migrations/20250706000000_field_cases.sql`):

| Column | Purpose |
|--------|---------|
| `field_id` | Links problem to geography |
| `conversation_id` | Links to AI thread |
| `status` | `open` → `monitoring` → `resolved` |
| `symptom`, `diagnosis_summary`, `treatment_plan` | Patient file contents |
| `follow_up_date` | Re-engagement hook |

**Goal:** User has an ongoing "patient file" — reason to return next week, next season.

**North Star connection:** Active case on a field = activated grower. See [Chapter 08](08-analytics-and-kpis.md).

### Secondary loops (supporting)

| Loop | Trigger | Outcome |
|------|---------|---------|
| **Photo → case** | Vision diagnosis | Higher trust, higher credit consumption |
| **Follow-up date → notification** | `follow_up_date` due | Return visit (see Chapter 06) |
| **Credit exhaustion → purchase** | `limitReached: true` (402) | Stripe checkout |
| **Referral (future)** | Share field report | New guest → signup |

---

## Decision Rationale

### Why guest → signup → field → case (in that order)?

Each step increases **switching cost and memory depth**:

- Guest: zero commitment, maximum reach
- Signup: identity + credit wallet
- Field: spatial anchor ("my north parcel")
- Case: temporal anchor ("the rust issue from March")

Skipping field/case produces chatbot churn — users treat Nertura like a search engine. The loop is designed to prevent that.

### Why 3 guest questions, not 1 or 10?

- **1** is too thin to build trust (single answer could be luck).
- **10** replaces signup for casual users — no identity, no field memory, no retention data.
- **3** allows: initial question → clarifying follow-up → photo analysis or depth question.

### Why field cases are free?

Cases are the retention engine. Paywalling case creation would optimize for short-term credit revenue at the cost of North Star metrics. Monetize **depth** (reports, monitoring credits, seasonal programs) — not **existence** of cases.

---

## Examples

### Good activation journey

1. Guest asks: *"Tomato leaves curling upward in greenhouse"* — gets structured answer with risk level.
2. Uploads photo on question 2 — vision pipeline adds evidence cards.
3. Hits limit — signs up; intake pre-fills symptom from session.
4. Creates "Greenhouse Block A" field, 0.3 ha.
5. Saves case as `monitoring` with follow-up in 7 days.
6. Returns on follow-up date notification — asks about progress — debits 1 credit.

### Bad activation journey

1. Guest hits paywall on first question.
2. User signs up but lands on empty dashboard with no prompt to continue diagnosis.
3. User gets good answer but no path to save field — never returns.

### Good upgrade moment (within loop)

User with 2 active cases and 0 credits remaining sees: *"You've been tracking rust on Field 3 for three weeks. Add 100 credits to continue monitoring — $9.99."*

---

## Best Practices

- Pre-fill intake from Guest Doctor session metadata on signup handoff.
- Show field + case creation as **the next step** after first registered Doctor answer — not billing.
- Track funnel events: `guest_question`, `signup`, `field_created`, `case_created` (PostHog/GA4).
- Respect `GUEST_QUESTION_LIMIT` server-side — never trust cookie count alone.
- Display remaining guest questions in UI: *"2 of 3 free questions remaining"*

## Bad Practices

- Forcing credit card before first registered Doctor answer.
- Auto-creating fields without user consent (wrong boundaries on map).
- Closing cases automatically to inflate "resolved" metrics.
- Routing activation CTAs to marketplace or input partners.
- A/B testing shorter guest limits below 3 before trust metrics are baseline-established.

---

## Future Considerations

| Enhancement | Phase |
|-------------|-------|
| Guest → signup session handoff token | MVP+ |
| WhatsApp Doctor as guest entry | V2 |
| Cooperative invite links (bulk signup) | V2 |
| Seasonal re-activation campaigns tied to `field_cases` | V2 |
| Mobile app install as activation step | V2 |
| Demo mode for agronomists (multi-field preview) | V3 |

---

## Cross-References

- [Book 01 — First 30 Seconds](../01-product-bible/10-first-30-seconds.md)
- [Credits & Subscriptions](02-credits-and-subscriptions.md)
- [Retention & Lifecycle](05-retention-and-lifecycle.md)
- [Analytics & KPIs](08-analytics-and-kpis.md)
- Code: `supabase/migrations/20250706000000_field_cases.sql`
