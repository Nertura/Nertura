# Nertura — Payment & Billing System

> Stripe-native subscription, credit, and invoice architecture.

**Status:** Pre-implementation · **Owner:** CTO + Finance  
**Companion:** [`subscription-model.md`](subscription-model.md), [`../product/credit-system.md`](../product/credit-system.md)

---

## Overview

```
User / Org ──► Stripe Customer ──► Subscription ──► Invoice ──► Payment
                    │                    │
                    ▼                    ▼
              Supabase mirror      Webhook sync
              subscriptions        audit + entitlements
                    │
                    ▼
              Credit ledger (AI consumption)
```

**PCI scope:** SAQ A — Stripe Checkout and Customer Portal; no card data on Nertura servers.

---

## Stripe Configuration

| Item | Value |
|------|-------|
| Mode | Live + Test projects |
| Products | Starter, Professional, Business (V2), Enterprise custom |
| Prices | Monthly + annual per [`subscription-model.md`](subscription-model.md) |
| Trial | 14 days Professional (MVP) |
| Customer Portal | Enabled: update payment, cancel, invoices |
| Tax | Stripe Tax V2; MVP manual or US-only |
| Webhooks | `checkout.session.completed`, `customer.subscription.*`, `invoice.*`, `charge.disputed` |

Webhook endpoint: `https://app.nertura.com/api/webhooks/stripe` — signature verified; idempotent via `stripe_events` table.

---

## Database Mirror

| Table | Source |
|-------|--------|
| `stripe_customers` | org_id ↔ stripe_customer_id |
| `subscriptions` | status, tier, period_end, cancel_at |
| `invoices` | amount, status, pdf_url |
| `payments` | charge id, status |
| `credit_ledger` | grants, debits, balance |

Entitlements computed: `getOrgEntitlements(org_id)` — cached 60s.

---

## Subscription Flows

### New subscription

1. User selects plan on pricing or in-app upgrade
2. Redirect Stripe Checkout (mode=subscription)
3. Webhook `checkout.session.completed` → create/update subscription row
4. Grant monthly credits per tier
5. Unlock modules via entitlements
6. Email receipt via Stripe + Resend confirmation

### Upgrade / downgrade

- Stripe Customer Portal or in-app proration via API
- Webhook updates tier; credit grant adjusted pro-rata
- Downgrade effective end of period if feature loss

### Cancel

- `cancel_at_period_end` default
- Data retention per [`data-retention-policy.md`](data-retention-policy.md)
- Export offered before deletion

---

## Credit System Integration

| Event | Credit action |
|-------|---------------|
| Subscription renew | Monthly grant per tier |
| One-time purchase | Credit pack SKU (V2) |
| AI inference | Debit TEXT/VISION/WA |
| Admin grant | Manual ledger entry + audit |
| Failed payment | Soft block AI; read-only app after grace |

Brain checks balance before inference — see [`../product/credit-system.md`](../product/credit-system.md).

---

## Local Payment Providers (Future)

| Region | Provider | Phase |
|--------|----------|-------|
| Turkey | iyzico / PayTR | V2 if Stripe insufficient |
| Brazil | Stripe local methods | V2 |
| India | Stripe India | V3 |

Abstract `PaymentProvider` interface; Stripe remains default.

---

## Admin & Finance

Admin modules: Subscription Management, Payment Logs, Credit Management ([`admin-panel-spec.md`](admin-panel-spec.md)).

Finance Admin: refunds via Stripe Dashboard link; dispute tracking; MRR export.

---

## Dunning

| Day | Action |
|-----|--------|
| 0 | Payment failed — email user |
| 3 | Retry + in-app banner |
| 7 | AI features suspended |
| 14 | Account read-only |
| 30 | Account suspended; data retained per policy |

Stripe Smart Retries enabled.

---

## Enterprise Billing (V3)

- Custom Stripe invoices or wire transfer
- Manual subscription in admin
- Contract tier in `organizations.enterprise_contract` JSONB

---

## Security

- Webhook secret rotation quarterly
- No Stripe secret keys in client
- Refund actions audit logged
- Radar rules enabled for fraud

---

## MVP Scope (Day 90)

- Starter + Professional Stripe prices
- Checkout + Customer Portal
- Webhook sync subscriptions
- Basic credit grant on subscribe
- Admin view subscription status (Stripe link OK)

---

*Payment & Billing System v1.0 — Pre-implementation.*
