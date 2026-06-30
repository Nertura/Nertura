# Chapter 01 — Pricing & Premium Philosophy

## Purpose

Define **what Nertura charges for, what stays free, and why** — grounded in the current codebase and aligned with the neutral-advisor positioning. This chapter is the business constitution for monetization decisions.

---

## Principles

1. **Trust before transaction** — The first diagnosis must feel complete, not truncated for upsell.
2. **Premium sells memory and depth** — Ongoing field intelligence, not a paywall on basic Q&A.
3. **Credits align cost with compute** — Every AI action has a visible, predictable cost.
4. **Neutral advisor forever (Phase 0–3)** — No marketplace, no input affiliate links, no branded chemical recommendations.
5. **Regional parity, not feature discrimination** — PPP adjustments later; core intelligence available everywhere.
6. **Gate until production-ready** — Stripe and premium reports ship behind configuration flags until webhooks and UX are verified.

---

## Architecture / Structure

### Dual revenue model

Nertura separates **platform access** (future recurring subscriptions) from **intelligence consumption** (credits today):

```
┌─────────────────────────────────────────────────────────┐
│  SUBSCRIPTION (recurring — roadmap)                      │
│  Modules · farms · users · support · monthly credit grant│
├─────────────────────────────────────────────────────────┤
│  CREDITS (live in code — June 2026)                      │
│  AI Doctor questions · vision · reports · top-up packs   │
└─────────────────────────────────────────────────────────┘
```

**Current implementation:** Stripe Checkout in **payment mode** (one-time credit packs), not subscription mode yet. See [`02-credits-and-subscriptions.md`](02-credits-and-subscriptions.md).

### Free tier (acquisition)

| Capability | Limit | Code / data reference |
|------------|-------|------------------------|
| Guest Doctor (marketing site) | 3 questions | `GUEST_QUESTION_LIMIT` in `packages/ai/src/types.ts`; `guest_usage` table |
| Registered free | 10 signup credits + usage tracking | `REGISTERED_FREE_LIMIT`; `init_user_credits()` trigger grants 10 via `signup_bonus` |
| Field creation | Included | Intake + map flows |
| Field cases | Included | `field_cases` — the retention anchor |
| Basic evidence cards | Included | `buildEvidenceCards` in `@nertura/ai` |

### Premium tier (monetization)

| Capability | Model | Status |
|------------|-------|--------|
| Credit top-up packs | Stripe one-time purchase | **Live scaffold** — Starter / Pro / Business |
| Extended AI usage | Debit from `credits_balance` | **Live** — `debit_user_credit` RPC |
| Premium PDF reports | 60–100+ credits | Gated: `NEXT_PUBLIC_PREMIUM_REPORTS_ENABLED` |
| Recurring subscriptions | Stripe subscription mode | **Planned** — see `docs/payment-billing-system.md` |
| Seasonal monitoring programs | Subscription + credits | Future |
| Team / business tier | Org-level entitlements | Future |

### Credit pack pricing (live)

Defined in `apps/dashboard/src/lib/stripe/config.ts`:

| Package | Credits | Price (USD) | Stripe mode |
|---------|---------|-------------|-------------|
| Starter | 100 | $9.99 | `payment` |
| Pro | 500 | $29.99 | `payment` |
| Business | 2,000 | $99.99 | `payment` |

Database mirror in `subscription_plans` (`supabase/migrations/20250625000000_knowledge_vectors_and_plans.sql`, updated in production credits migration).

### Strategic tier roadmap

Long-form SaaS pricing lives in [`docs/subscription-model.md`](../../subscription-model.md). Book 05 treats that document as the **target architecture**; code implements the credit-pack MVP first.

| Tier | Target persona | Monthly (roadmap) |
|------|----------------|-------------------|
| Free | Trial growers | $0 |
| Starter | Individual farmer | $29 |
| Professional | Farm manager | $99 |
| Business | Cooperative / mid-size | $299 |
| Enterprise | Large agribusiness | Custom |

---

## Decision Rationale

### Why free Guest Doctor?

Anonymous users on the marketing site (`apps/marketing`) can ask **3 questions** before signup. This mirrors ChatGPT's "try before account" pattern adapted for agriculture: a grower with yellowing wheat leaves needs an answer *now*, not a registration form.

Three questions is enough to demonstrate competence; not enough to replace a season of monitoring.

### Why credits instead of per-question billing?

Variable AI cost (text vs vision vs future media) maps cleanly to a debit ledger. Farmers understand "I have 47 credits left" better than opaque API metering. The append-only `credit_transactions` table provides auditability for finance and support.

### Why neutral advisor?

Charging for basic diagnosis before trust exists kills conversion. Recommending branded inputs creates **conflict of interest** that destroys the AI Doctor positioning. Premium intelligence — seasonal reports, case monitoring, field memory — has no such conflict.

See [Book 01 — MVP & Premium Philosophy](../01-product-bible/08-mvp-and-premium-philosophy.md).

---

## Examples

### Good monetization moment

A grower has three `field_cases` in `monitoring` status across two fields. Nertura offers a premium seasonal PDF summarizing disease risk, irrigation notes, and follow-up dates — priced in credits, preview shown before purchase.

### Bad monetization moment

A grower's first photo upload hits a paywall before any observation text appears.

### Good pricing communication

Billing page shows: *"100 credits · ~100 Doctor questions · $9.99 · Balance after purchase: 147"*

### Bad pricing communication

*"Upgrade to Pro AI™ for unlimited neural insights!"*

---

## Best Practices

- Show credit balance **before** debit operations (Doctor route, future vision).
- Use calm, agricultural language on pricing pages — hectares, seasons, fields, not "tokens" or "inference units."
- Test Stripe webhooks with duplicate `checkout.session.completed` events — idempotency via `stripe_session_id` is mandatory.
- Grandfather early beta users generously when public pricing launches.
- Keep `isStripeConfigured()` guard — return 503, not a broken checkout redirect.

## Bad Practices

- Hiding free limits until the user hits a wall without prior warning.
- Premium reports that auto-recommend specific branded chemicals or retailers.
- Launching subscription billing before Doctor retention metrics are stable.
- Discounting through marketplace commissions or affiliate kickbacks.
- Using "AI" or "ML" as the primary value prop on pricing pages.

---

## Future Considerations

| Item | Phase | Notes |
|------|-------|-------|
| Stripe subscription mode | V2 | `mode: 'subscription'` + Customer Portal |
| iyzico / PayTR (Turkey) | V2 | If Stripe coverage insufficient |
| Cooperative bulk licensing | V2 | Org-level credit pool |
| PPP regional pricing | V2 | -20% to -50% emerging markets |
| Insurance / government B2B2C | V3 | Subsidized access programs |
| Enterprise custom invoicing | V3 | Wire + manual subscription in admin |

---

## Cross-References

- [Credits & Subscriptions](02-credits-and-subscriptions.md)
- [Growth Loops & Activation](03-growth-loops-and-activation.md)
- [Analytics & KPIs](08-analytics-and-kpis.md)
- Legacy: [`docs/payment-billing-system.md`](../../payment-billing-system.md)
- Legacy: [`product/free-to-paid-model.md`](../../../product/free-to-paid-model.md)
