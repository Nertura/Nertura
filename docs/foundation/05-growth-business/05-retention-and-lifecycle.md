# Chapter 05 — Retention & Lifecycle

## Purpose

Define how Nertura **keeps growers engaged after activation** — from first field case through expansion revenue and churn prevention. Retention is not a email drip; it is **compounding field memory** that makes leaving painful in the right way.

---

## Principles

1. **Memory is the moat** — Cases, fields, and season history are the retention product.
2. **Engagement follows the crop calendar** — Notifications align with growth stages and follow-up dates, not arbitrary drip schedules.
3. **Expansion is earned** — Credit purchases and tier upgrades come after demonstrated value.
4. **Churn is data** — Every cancellation teaches us where the loop broke.
5. **Neutral advisor at every lifecycle stage** — Retention emails never push marketplace or input deals.

---

## Architecture / Structure

### Lifecycle stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ ACQUIRE  │──►│ ACTIVATE │──►│ ENGAGE   │──►│ EXPAND   │──►│ RETAIN   │
│ guest    │   │ field +  │   │ return   │   │ credits  │   │ season   │
│ signup   │   │ case     │   │ visits   │   │ upgrade  │   │ memory   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    │              │
                                    └──── CHURN ───┘
                                         (win-back)
```

### Stage definitions

| Stage | Definition | Primary signal | Target (Year 1) |
|-------|------------|----------------|-----------------|
| **Acquisition** | Account created | `users.created_at` | Baseline funnel |
| **Activation** | ≥1 field + ≥1 open/monitoring case | `field_cases` + `fields` join | 40% of signups within 7 days |
| **Engagement** | ≥2 Doctor sessions in 30 days OR case update | `credit_transactions.ai_question`, case `updated_at` | 25% of activated |
| **Expansion** | Credit purchase OR plan upgrade | `credit_transactions.purchase`, Stripe | 8% of activated |
| **Retention** | Active case or new case in new season | Case activity跨 90 days | 60% quarterly retention of activated |

### Activation (days 0–7)

**Goal:** User completes the loop from [Chapter 03](03-growth-loops-and-activation.md).

| Day | Touchpoint | Channel |
|-----|------------|---------|
| 0 | Welcome + continue diagnosis | In-app + transactional email |
| 1 | "Add your field" nudge if no field | In-app banner |
| 3 | Case save prompt if Doctor used but no case | In-app |
| 7 | Follow-up on open cases with `follow_up_date` | Email + in-app |

**Credits:** 10 signup bonus covers activation week without purchase pressure.

### Engagement (days 8–90)

**Goal:** Habit — user returns when crop problem evolves or follow-up is due.

| Mechanism | Implementation |
|-----------|----------------|
| Case monitoring status | `field_cases.status = 'monitoring'` |
| Follow-up reminders | `follow_up_date` → notification (Chapter 06) |
| Doctor memory | `memoryContextBlock` in pipeline — prior cases inform answers |
| Weather/context hooks | Future — frost, spray window alerts |

**Engagement metric:** WAU/MAU ratio among activated users; case update rate.

### Expansion (day 30+)

**Goal:** User pays because free credits are exhausted **and** they have active cases worth continuing.

| Trigger | Offer |
|---------|-------|
| `limitReached: true` (402) | Credit pack checkout — Starter/Pro/Business |
| 3+ monitoring cases | Seasonal report (premium credits, when enabled) |
| Team invite attempt | Business tier (future subscription) |

**Expansion anti-pattern:** Paywall on case *creation* — never implement.

### Churn signals

| Signal | Detection | Response |
|--------|-----------|----------|
| Credit balance 0, no return 14d | `credits_balance = 0`, no recent `ai_question` | Calm email: case summary + credit offer |
| All cases `resolved`, no new case 60d | Case status query | Seasonal re-engagement: "New growth stage?" |
| No login 30d | Auth last_seen | Win-back with field snapshot (no guilt) |
| Payment failed | Stripe webhook (future) | Dunning sequence per payment-billing-system |
| Account deletion request | Privacy workflow | Export cases + fields first |

### Churn prevention (product)

Retention is primarily **product retention**:

- Field cases persist across seasons
- Diagnosis history visible on field map
- Evidence cards build trust on return visits
- Photo timeline on cases (future)

Email supports product — it does not replace it.

---

## Decision Rationale

### Why activation = field + case, not signup alone?

Signup without field/case is **tourist behavior** — high churn within 7 days. The North Star (Chapter 08) measures fields with active cases because that state correlates with 90-day retention in comparable ag-advisory products.

### Why soft block before hard block on credits?

`debit_user_credit` returns `insufficient_credits` — user can still view cases, fields, and past diagnoses. Hard-blocking the entire app at zero credits destroys retention for users considering purchase.

Future subscription dunning: soft block AI at day 7, read-only app at day 14 ([payment-billing-system](../../payment-billing-system.md)).

### Why no marketplace in lifecycle emails?

Input recommendations in retention emails create conflict of interest and train users to expect deals — undermining neutral advisor positioning permanently.

---

## Examples

### Good retention email

**Subject:** *Follow-up on Field 3 — rust monitoring*

*"Your case 'Wheat rust — north parcel' is due for a check-in today. Last observation: moderate risk, recommended scouting in 7 days. Open your field case to add new photos or ask the Doctor what changed after last week's rain."*

### Bad retention email

**Subject:** *We miss you!!! 🌾🚀*

*"You haven't logged in lately! Buy Pro now — 50% off today only! Also check out our partner seed deals!"*

### Good expansion moment

User with 0 credits, 2 monitoring cases, last active 2 days ago → in-app modal: *"Continue tracking rust on Field 3 — 100 credits for $9.99."*

### Good churn win-back

90 days inactive, 1 resolved case → email with case summary PDF (free) + invitation to open new case for new season — no discount code.

---

## Best Practices

- Tie lifecycle messaging to **case and field data** — personalized, not generic drips.
- Measure activation at 7 days, not 24 hours — crop decisions aren't daily for all growers.
- Offer data export before any account suspension.
- Log lifecycle email sends in audit trail; respect marketing consent.
- Track expansion revenue per activated user (ARPA-A), not per signup.

## Bad Practices

- Daily "come back!" emails without new agricultural value.
- Auto-resolving cases to hide inactive users from metrics.
- Discount codes as default retention lever (trains wait-for-sale behavior).
- Deleting field data immediately on cancel — retention policy + legal require grace period.
- Lifecycle campaigns promoting marketplace listings.

---

## Future Considerations

| Feature | Phase |
|---------|-------|
| Automated onboarding drip (Resend + n8n) | V2 |
| Seasonal program subscriptions | V2 |
| Cooperative admin dashboards (org retention) | V2 |
| NPS / CSAT after case resolution | V2 |
| Predictive churn model (case decay signals) | V3 |
| WhatsApp re-engagement (consent-gated) | V3 |

---

## Cross-References

- [Growth Loops & Activation](03-growth-loops-and-activation.md)
- [Credits & Subscriptions](02-credits-and-subscriptions.md)
- [Notifications & Email](06-notifications-and-email.md)
- [Analytics & KPIs](08-analytics-and-kpis.md)
- Code: `field_cases`, `debit_user_credit`, `credit_transactions`
