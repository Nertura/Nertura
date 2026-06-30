# Chapter 08 — MVP & Premium Philosophy

## Purpose

Define **what is free, what is premium, and why** — without building a marketplace or redesigning the business model beyond what exists in code and strategy docs.

---

## Principles

1. **Free tier must deliver real value** — not a crippled demo
2. **Premium sells memory and depth** — not basic diagnosis
3. **Credits align cost with AI compute** — transparent consumption
4. **Neutral advisor** — premium is intelligence, not product discounts
5. **Gate until tested** — Stripe and reports behind flags until production-ready

---

## MVP Scope (What Ships Free)

| Capability | Limit | Code reference |
|------------|-------|----------------|
| Guest Doctor questions | 3 (`GUEST_QUESTION_LIMIT`) | `packages/ai/src/pipeline.ts` |
| Registered free questions | Tier limit (`REGISTERED_FREE_LIMIT`) | `user_usage_limits` |
| Basic text Q&A | Included in free tier | Doctor route |
| Photo analysis | Included; may consume credits later | Vision pipeline |
| Field creation | Included | Intake + map |
| Field cases | Included | `field_cases` |
| Basic evidence cards | Included | `buildEvidenceCards` |

**MVP is not "minimal features."** MVP is **minimal friction to trust**.

---

## Premium Scope (Credits & Subscriptions)

| Capability | Model | Status |
|------------|-------|--------|
| Extended AI usage | Credits / subscription tier | Scaffold |
| Premium PDF reports | 60–100+ credits | Gated: `NEXT_PUBLIC_PREMIUM_REPORTS_ENABLED` |
| Detailed care plans | Credits | Future |
| Seasonal monitoring programs | Subscription | Future |
| Satellite / NDVI reports | Credits | Future |
| Team / business tier | Stripe plans: starter, pro, business | Checkout scaffold |

**Philosophy:** Premium features extend **memory, monitoring, and report depth** — things that compound over a season.

---

## Pricing Philosophy

| Belief | Implementation |
|--------|----------------|
| Farmers pay for **outcomes and continuity** | Case monitoring, seasonal memory |
| Surprise bills destroy trust | Credit balance visible; soft block before hard block |
| Regional parity matters | Turkey entry pricing ≠ US enterprise pricing (future) |
| Free tier is acquisition | Guest Doctor → signup → field → retention |

See [Book 05 — Credits](../05-growth-business/02-credits-and-subscriptions.md) for operational detail.

---

## Marketplace Rule (Permanent for Phase 0–3)

**Nertura does not sell agricultural inputs.**

| Forbidden | Allowed |
|-----------|---------|
| Pesticide store | Treatment *guidance* with disclaimers |
| Fertilizer affiliate links | Fertilizer *plan drafts* (premium, reviewed) |
| Seed catalog | Crop *variety context* from Knowledge Bank |

Marketplace is a **future placeholder only** — deferred V2 minimum.

---

## Decision Rationale

Charging for basic "what's wrong with my plant?" before trust exists **kills conversion**. Charging for **ongoing field intelligence** after trust aligns value with price.

Staying neutral on inputs avoids **conflict of interest** in recommendations — a structural advantage over input manufacturers' apps.

---

## Examples

### Good monetization moment

User has saved 3 field cases over a season → offered premium PDF seasonal report with irrigation and disease risk summary.

### Bad monetization moment

User's first photo → paywall before showing any observation.

---

## Best Practices

- Show credit balance **before** expensive operations
- Grandfather beta users generously when pricing launches
- Test Stripe in staging with real webhook idempotency

## Bad Practices

- Hiding free limits until user hits wall without warning
- Premium reports that auto-recommend specific branded chemicals
- Launching pricing before Doctor retention is stable

---

## Future Considerations

- **iyzico / PayTR** for Turkey if Stripe coverage insufficient
- **Cooperative bulk licensing** — org-level credits
- **Insurance / government subsidies** — B2B2C pricing models

---

## Cross-References

- [AI-First & Trust Philosophy](09-ai-first-and-trust-philosophy.md)
- [Book 05 — Pricing](../05-growth-business/01-pricing-and-premium-philosophy.md)
- Legacy: `docs/payment-billing-system.md`
