# Book 05 — Nertura Growth & Business Manual

> **How Nertura acquires, converts, retains, and monetizes growers — without compromising trust.**

---

## Purpose

This book defines **pricing philosophy, credit economics, growth loops, brand voice, lifecycle messaging, and KPIs** for Nertura. It is the canonical business playbook for product, growth, and leadership. Every monetization decision, marketing campaign, and retention experiment must align with these chapters.

Nertura is a **neutral AI advisor for agriculture** — not a marketplace, not an input seller, not a hype-driven agtech startup. Growth follows trust; revenue follows memory.

---

## Version

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Status | Canonical |
| Last updated | June 2026 |
| Owner | Chief Growth Officer + CPO |

---

## Chapters

See [`table-of-contents.md`](table-of-contents.md) for the full index.

| # | Chapter | Summary |
|---|---------|---------|
| 01 | [Pricing & Premium Philosophy](01-pricing-and-premium-philosophy.md) | Value alignment, neutral advisor, free vs paid |
| 02 | [Credits & Subscriptions](02-credits-and-subscriptions.md) | `user_usage_limits`, `credit_transactions`, Stripe checkout |
| 03 | [Growth Loops & Activation](03-growth-loops-and-activation.md) | Guest Doctor → signup → field → case |
| 04 | [Brand Voice & Marketing](04-brand-voice-and-marketing.md) | Calm, premium, agricultural — not tech jargon |
| 05 | [Retention & Lifecycle](05-retention-and-lifecycle.md) | Activation, engagement, expansion, churn |
| 06 | [Notifications & Email](06-notifications-and-email.md) | Resend, transactional vs marketing, approval gates |
| 07 | [SEO, Community & Content](07-seo-community-and-content.md) | Content engine draft-only, no auto-publish |
| 08 | [Analytics & KPIs](08-analytics-and-kpis.md) | North Star, KPI table, review cadence |

---

## Code Ground Truth (June 2026)

| Domain | Primary paths |
|--------|---------------|
| Guest limits | `packages/ai/src/types.ts` — `GUEST_QUESTION_LIMIT = 3` |
| Usage & credits | `apps/dashboard/src/lib/ai/usage-limits.ts`, `supabase/migrations/20250628000000_production_credits.sql` |
| Stripe checkout | `apps/dashboard/src/app/api/billing/checkout/route.ts` |
| Stripe webhook | `apps/dashboard/src/app/api/webhooks/stripe/route.ts` |
| Growth AI admin | `apps/admin/src/components/growth/`, `apps/admin/src/lib/growth/stats.ts` |
| Outreach approval | `apps/admin/src/components/outreach-approval-client.tsx`, `apps/admin/src/lib/outreach/send-approved.ts` |
| Content engine | `apps/admin/src/app/api/content-engine/generate/route.ts`, `packages/ai/src/content-engine.ts` |
| Field cases | `supabase/migrations/20250706000000_field_cases.sql` |
| Subscription plans (DB) | `public.subscription_plans` |

---

## Related Books

- Product law → [Book 01 — Product Bible](../01-product-bible/)
- AI consumption rules → [Book 04 — AI Behaviour Manual](../04-ai-behaviour/)
- Engineering implementation → [Book 03 — Engineering Standards](../03-engineering-standards/)

---

## Legacy References

This book operationalizes and supersedes narrative sections of:

- [`docs/payment-billing-system.md`](../../payment-billing-system.md)
- [`docs/marketing-growth-system.md`](../../marketing-growth-system.md)
- [`docs/subscription-model.md`](../../subscription-model.md)
- [`product/credit-system.md`](../../../product/credit-system.md)
- [`product/free-to-paid-model.md`](../../../product/free-to-paid-model.md)
- [`automation/email-engine.md`](../../../automation/email-engine.md)

When legacy docs conflict with this book, **Book 05 wins** for growth and business decisions.

---
