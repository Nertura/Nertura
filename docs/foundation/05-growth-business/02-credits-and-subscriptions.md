# Chapter 02 — Credits & Subscriptions

## Purpose

Document the **live credit ledger, usage limits, and Stripe checkout flow** as implemented in code — the operational layer beneath pricing philosophy. Engineers, support, and finance use this chapter to understand how AI consumption is metered and how purchases grant credits.

---

## Principles

1. **Append-only ledger** — `credit_transactions` rows are never updated or deleted.
2. **Atomic debit/grant** — All balance changes go through security-definer RPCs with row locks.
3. **Idempotent purchases** — Duplicate Stripe webhook deliveries must not double-grant credits.
4. **Guest ≠ registered** — Guest limits live in `guest_usage`; registered limits in `user_usage_limits`.
5. **Signup bonus once** — Every new user receives exactly one `signup_bonus` transaction (10 credits).
6. **Service role for grants** — Purchases and admin grants use `grant_user_credits`; users cannot self-grant.

---

## Architecture / Structure

### Data model overview

```
                    ┌─────────────────────┐
                    │   guest_usage       │  ← anonymous (marketing site)
                    │   guest_id (uuid)   │
                    │   question_count    │
                    │   free_limit = 3    │
                    └─────────────────────┘

┌──────────────┐    ┌─────────────────────┐    ┌──────────────────────┐
│ Stripe       │───►│ user_usage_limits   │◄───│ credit_transactions  │
│ Checkout     │    │ credits_balance     │    │ (append-only ledger) │
│ Webhook      │    │ question_count      │    │ signup_bonus         │
└──────────────┘    │ free_limit = 10     │    │ ai_question (-1)     │
                    └─────────────────────┘    │ purchase (+N)          │
                              ▲                │ admin_grant          │
                              │                └──────────────────────┘
                    debit_user_credit()
                    grant_user_credits()
```

### Constants (application layer)

From `packages/ai/src/types.ts`:

| Constant | Value | Meaning |
|----------|-------|---------|
| `GUEST_QUESTION_LIMIT` | **3** | Max anonymous Doctor questions |
| `REGISTERED_FREE_LIMIT` | **10** | Default free tier reference; signup bonus size |

Re-exported by `apps/dashboard/src/lib/ai/usage-limits.ts` and `apps/marketing/src/lib/guest-usage.ts`.

### Table: `user_usage_limits`

Created in `supabase/migrations/20250621000000_ai_doctor_foundation.sql`; extended in `20250624000000_credits_foundation.sql`:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Unique per user |
| `credits_balance` | integer | Spendable AI credits |
| `question_count` | integer | Lifetime questions debited |
| `free_limit` | integer | Default 10 — reference limit |
| `organization_id` | UUID | Optional org link |
| `period_start` | timestamptz | Future period reset anchor |

RLS: users can **select** own row; inserts/updates via RPC only (direct user updates revoked in `20250628110000_credit_balance_rls_fix.sql`).

### Table: `credit_transactions`

From `supabase/migrations/20250628000000_production_credits.sql`:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Owner |
| `amount` | integer | Positive = grant, negative = consume |
| `balance_after` | integer | Snapshot after transaction |
| `transaction_type` | text | `signup_bonus`, `ai_question`, `purchase`, `admin_grant`, `refund`, `adjustment` |
| `stripe_session_id` | text | Idempotency key for checkout |
| `reference_id` | text | Payment intent or AI request ID |
| `description` | text | Human-readable audit trail |

RLS: authenticated users can **select own** transactions only. Inserts via security-definer functions.

### Table: `guest_usage`

| Column | Type | Description |
|--------|------|-------------|
| `guest_id` | UUID | Cookie `nertura_guest_id` |
| `question_count` | integer | Incremented per Doctor question |
| `free_limit` | integer | Default **3** (= `GUEST_QUESTION_LIMIT`) |
| `last_question_at` | timestamptz | Rate/abuse signal |

Guest flow does **not** use `credit_transactions` — guests have no user account.

### RPC: `debit_user_credit`

Called from dashboard Doctor routes via `debitUserCredit()` in `usage-limits.ts`:

1. Ensure user row exists (bootstrap with 10 credits if missing).
2. Ensure `signup_bonus` exists (backfill for legacy users).
3. Lock row `FOR UPDATE`.
4. If `credits_balance <= 0` → return `{ success: false, error: 'insufficient_credits' }`.
5. Decrement balance by 1; increment `question_count`.
6. Insert `credit_transactions` row with `transaction_type = 'ai_question'`, `amount = -1`.

HTTP response when limit reached: **402** with `{ limitReached: true, usage }` (see `apps/dashboard/src/app/api/ai/chat/route.ts`).

### RPC: `grant_user_credits`

Called from Stripe webhook and admin tools:

1. Reject non-positive amounts.
2. If `stripe_session_id` already exists → return `{ duplicate: true }` (idempotent).
3. Lock user row; add credits; insert ledger row.

### Stripe checkout flow

**Route:** `POST /api/billing/checkout` (`apps/dashboard/src/app/api/billing/checkout/route.ts`)

```
User selects package (starter | pro | business)
    → Authenticated via getDashboardContext()
    → stripe.checkout.sessions.create({ mode: 'payment', ... })
    → metadata: { user_id, package_slug, credits }
    → Redirect to Stripe hosted checkout
    → success_url: /billing/success?session_id={CHECKOUT_SESSION_ID}
```

**Webhook:** `POST /api/webhooks/stripe` (`apps/dashboard/src/app/api/webhooks/stripe/route.ts`)

```
checkout.session.completed
    → Parse metadata (user_id, credits, package_slug)
    → admin.rpc('grant_user_credits', { stripe_session_id: session.id, ... })
    → Log duplicate or success
```

**Configuration required:**

| Env var | Purpose |
|---------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe client |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client checkout (if embedded) |
| `STRIPE_WEBHOOK_SECRET` | Signature verification |

If not configured: checkout returns **503** — payments disabled, app remains usable on free credits.

### Table: `subscription_plans`

Read-only catalog for UI and future subscription mode:

| slug | monthly_credits (post-migration) | price_cents | features |
|------|----------------------------------|-------------|----------|
| free | 0 (10 via signup bonus) | 0 | `guest_limit: 3` |
| starter | 100 | 999 | `credit_pack: 100` |
| pro | 500 | 2999 | `credit_pack: 500`, `priority_ai` |
| business | 2000 | 9999 | `credit_pack: 2000`, `team_seats: 5` |
| enterprise | custom | 0 | `custom: true` |

**Note:** Live checkout uses hardcoded `CREDIT_PACKAGES` in TypeScript; DB plans are the source of truth for display and future sync.

### Table: `subscriptions` (org-level — future)

Core schema exists (`supabase/migrations/20250619000200_core_schema.sql`) with Stripe mirror fields. Mutations are **service-role only** (no authenticated INSERT/UPDATE policies). Subscription renew → monthly credit grant is documented in [`docs/payment-billing-system.md`](../../payment-billing-system.md) but not yet wired in webhook handler (only `checkout.session.completed` for packs today).

---

## Decision Rationale

### Why one credit = one text question (MVP)?

Simplicity for launch. Vision, media, and WhatsApp will debit different amounts per [`product/credit-system.md`](../../../product/credit-system.md) — but the RPC and ledger already support arbitrary `amount` values.

### Why guest limits in a separate table?

Guests have no `auth.users` row. Cookie-based tracking (`nertura_guest_id`, `nertura_guest_count`) with DB backing prevents trivial limit bypass while avoiding anonymous Supabase auth complexity.

### Why 10 signup credits?

Enough for a full onboarding session: ask about a problem, upload a photo, create a field, open a case — without immediate paywall. Matches `REGISTERED_FREE_LIMIT` constant.

---

## Examples

### Usage status object (registered user)

```typescript
{
  used: 4,           // question_count
  limit: 10,         // REGISTERED_FREE_LIMIT reference
  remaining: 6,      // credits_balance
  limitReached: false,
  credits: 6
}
```

### Successful purchase ledger entry

```
transaction_type: purchase
amount: +500
balance_after: 506
description: Stripe purchase — pro (500 credits)
stripe_session_id: cs_test_...
```

### Guest limit reached

Marketing Doctor returns upgrade CTA after `question_count >= free_limit` (3). Cookie and DB stay in sync via `incrementGuestUsageDb`.

---

## Best Practices

- Always call `debit_user_credit` **before** running inference — never debit after failure without refund logic.
- Surface `usage.remaining` in Doctor UI header — growers should never be surprised.
- Monitor `credit_transactions` where `transaction_type = 'purchase'` for revenue reconciliation.
- Use `stripe_session_id` uniqueness index for webhook idempotency — never remove it.
- Admin grants must include `description` and `transaction_type = 'admin_grant'` for audit.

## Bad Practices

- Incrementing `question_count` without a matching ledger debit.
- Allowing authenticated users to UPDATE `user_usage_limits` directly (RLS fix explicitly removed this).
- Granting credits without checking duplicate `stripe_session_id`.
- Conflating `free_limit` column with `credits_balance` — balance is the spendable truth.
- Showing "unlimited AI" on any tier before infrastructure supports it.

---

## Future Considerations

| Feature | Implementation path |
|---------|----------------------|
| Subscription renew grants | Extend webhook for `invoice.paid` → `grant_user_credits` with `transaction_type = 'grant'` |
| Credit types (TEXT/VISION/MEDIA) | Extend ledger with `credit_type` enum per product doc |
| Org-level credit pool | Enterprise: `organization_id` on balance row, pooled debits |
| Period reset | Cron to reset monthly grants per `subscription_plans.monthly_credits` |
| Failed payment dunning | Soft block AI at day 7 per payment-billing-system dunning table |
| Low balance warning | UI at 20% remaining; modal at 0 |

---

## Cross-References

- [Pricing & Premium Philosophy](01-pricing-and-premium-philosophy.md)
- [Retention & Lifecycle](05-retention-and-lifecycle.md)
- Code: `apps/dashboard/src/lib/ai/usage-limits.ts`
- Code: `apps/dashboard/src/lib/stripe/config.ts`
- Legacy: [`product/credit-system.md`](../../../product/credit-system.md)
