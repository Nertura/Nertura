# Chapter 08 — Analytics & KPIs

## Purpose

Define **what Nertura measures, how often, and why** — with a single North Star metric that aligns product, growth, and business teams. Vanity metrics (raw signups, page views) are secondary to **activated field intelligence**.

---

## Principles

1. **One North Star** — The whole company optimizes for field memory, not traffic.
2. **Funnel integrity** — Measure guest → signup → field → case → purchase without skipping stages.
3. **Code-grounded definitions** — KPIs map to Supabase tables and admin dashboards, not spreadsheet fiction.
4. **Weekly tactical, quarterly strategic** — Growth dashboard weekly; board metrics quarterly.
5. **Approval-aware metrics** — Track draft queue depth; penalize auto-send zero, not draft volume.

---

## Architecture / Structure

### North Star Metric

> **Weekly Active Fields with Active Cases**

**Definition:** Count of distinct `fields.id` where:

- Field belongs to an organization with ≥1 authenticated user active in last 7 days, AND
- Field has ≥1 `field_cases` row with `status IN ('open', 'monitoring')` updated or created in last 30 days

**Why this metric:**

| Alternative | Problem |
|-------------|---------|
| Total signups | Tourist accounts, no retention |
| Doctor questions | One-off chatbot use |
| MRR alone | Revenue without product value |
| Page views | Marketing noise |

**North Star connects:**

- Product value (case = patient file)
- Retention (active case = reason to return)
- Monetization potential (engaged users buy credits)
- Neutral advisor positioning (cases ≠ marketplace GMV)

**SQL sketch (reporting):**

```sql
select count(distinct fc.field_id) as north_star_fields
from public.field_cases fc
join public.fields f on f.id = fc.field_id
join public.organizations o on o.id = fc.organization_id
where fc.status in ('open', 'monitoring')
  and fc.updated_at >= now() - interval '30 days'
  and fc.field_id is not null
  and f.deleted_at is null;
```

Extend with user activity join on `auth.users` last sign-in for "weekly active" qualifier.

### Supporting metric hierarchy

```
NORTH STAR: Weekly Active Fields with Active Cases
    │
    ├── INPUT: Guest Doctor completions (guest_usage)
    ├── INPUT: Signups (users)
    ├── INPUT: Fields created (fields)
    │
    ├── ACTIVATION RATE: signups → field + case within 7d
    │
    ├── ENGAGEMENT: Doctor credits debited (credit_transactions)
    ├── ENGAGEMENT: Case updates (field_cases.updated_at)
    │
    ├── REVENUE: Credit purchases (credit_transactions.purchase)
    └── REVENUE: MRR (subscriptions — future)
```

---

## KPI Table

### Acquisition & activation

| KPI | Definition | Source | Target (Year 1) | Review |
|-----|------------|--------|-----------------|--------|
| Guest Doctor questions | `guest_usage.question_count` increments | Supabase | Baseline | Weekly |
| Guest → signup rate | Signups with guest cookie / total guest limit hits | PostHog + UTM | 15% | Weekly |
| New signups | `users.created_at` | Supabase | Growth trend | Weekly |
| Signup bonus grants | `credit_transactions.signup_bonus` | Supabase | = signups | Audit |
| Fields created | `fields` insert count | Supabase | 50% of signups | Weekly |
| Cases created | `field_cases` insert count | Supabase | 40% of signups | Weekly |
| **Activation rate** | Users with ≥1 field + ≥1 active case in 7d / signups | Join query | **40%** | Weekly |
| Time to first case | Median minutes signup → first case | Event tracking | <24h | Monthly |

### Engagement & retention

| KPI | Definition | Source | Target (Year 1) | Review |
|-----|------------|--------|-----------------|--------|
| **North Star** | WA fields with active cases | SQL above | +10% QoQ | Weekly |
| WAU (activated) | Active users with case in 7d | Auth + cases | 30% of activated | Weekly |
| Doctor questions / user | `ai_question` debits / WAU | `credit_transactions` | 3+/week engaged | Weekly |
| Case update rate | Cases with `updated_at` in 14d | `field_cases` | 25% monitoring | Monthly |
| Credit exhaustion rate | Users hitting 402 / WAU | API logs | Monitor | Weekly |
| 90-day retention | Activated users active day 90 | Cohort | 60% | Quarterly |

### Revenue & expansion

| KPI | Definition | Source | Target (Year 1) | Review |
|-----|------------|--------|-----------------|--------|
| Credit purchases | `transaction_type = 'purchase'` count | `credit_transactions` | Growth trend | Weekly |
| Purchase conversion | Purchasers / activated users | Join | 8% | Monthly |
| ARPA-A | Revenue / activated users | Stripe + SQL | Baseline | Monthly |
| Starter / Pro / Business mix | Package slug in metadata | Stripe webhook | Monitor | Monthly |
| MRR | Active subscriptions | `subscriptions` | V2 target | Monthly |
| Churn rate | Cancelled / active subs | Stripe | <5% monthly | Monthly |

### Marketing & growth ops

| KPI | Definition | Source | Target (Year 1) | Review |
|-----|------------|--------|-----------------|--------|
| Signups by channel | UTM on registration | PostHog + `utm_attribution` | Baseline | Weekly |
| Content-attributed signups | utm_medium=organic/social → signup | GA4 | 15% post-V2 | Quarterly |
| Outreach drafts pending | `email_log.status = 'taslak'` | Admin stats | <48h SLA | Daily |
| Outreach sent / approved | sent / onaylandi ratio | `email_log` | Monitor quality | Weekly |
| Email bounce rate | Bounced / sent | Resend + admin | **<5%** | Weekly |
| Content drafts in queue | `media_content_queue.status = 'draft'` | Admin | Review weekly | Weekly |
| CAC by channel | Ad spend / signups | Finance + UTM | V2 paid | Monthly |

### Product quality (growth-related)

| KPI | Definition | Source | Target | Review |
|-----|------------|--------|--------|--------|
| Doctor 402 rate | Limit reached responses / total Doctor | API | Monitor friction | Weekly |
| Avg credits at purchase | Balance before first purchase | SQL | Insight | Monthly |
| Guest limit hit rate | Guests at 3 questions / total guests | `guest_usage` | Conversion signal | Weekly |
| Knowledge citation rate | Doctor answers with KB hits | AI logs | Quality | Monthly |

---

## Dashboards & tooling

### Admin Growth Dashboard (live)

**Path:** `apps/admin` → Growth AI dashboard  
**Data:** `getGrowthDashboardStats()` in `apps/admin/src/lib/growth/stats.ts`

| Card | Query basis |
|------|-------------|
| New Leads Today | `leads.created_at` |
| Emails Generated | Drafts created |
| Pending Approvals | `email_log` taslak |
| Sent / Delivered / Opened / Clicked | `email_log` sent |
| New Users | `users` today |
| Premium Conversions | Credit purchases today |
| Bounce Rate / Spam Score | Compliance tables |

### External analytics

| Tool | Purpose | Phase |
|------|---------|-------|
| **PostHog** | Product funnel, feature flags | MVP |
| **GA4** | Marketing site, content paths | MVP |
| **Stripe Dashboard** | Revenue, disputes | Live |
| **Resend** | Email delivery analytics | Live |
| **Supabase SQL** | North Star, cohort reports | Live |

### Event taxonomy (recommended)

| Event | Properties | Funnel stage |
|-------|------------|--------------|
| `guest_question` | `guest_id`, `question_n` | Acquire |
| `guest_limit_reached` | `guest_id` | Acquire |
| `signup_completed` | `utm_*` | Activate |
| `field_created` | `field_id`, `area` | Activate |
| `case_created` | `case_id`, `field_id`, `status` | Activate |
| `doctor_question` | `credits_remaining` | Engage |
| `credit_purchase_started` | `package` | Expand |
| `credit_purchase_completed` | `package`, `credits` | Expand |

---

## Decision Rationale

### Why fields with active cases, not MAU?

MAU counts logins — a user checking billing counts. A **field with an open rust case** counts only when the product is doing its job: holding agricultural memory that matters this season.

### Why track pending approvals?

Growth AI produces drafts. If pending queue grows unbounded, either review capacity is insufficient or generation quality is poor — both are business risks before they are engineering issues.

### Why separate ARPA-A from ARPU?

Average revenue per **activated** user tells whether monetization works on retained growers. ARPU diluted by tourist signups hides failure to convert engaged users.

---

## Review Cadence

| Meeting | Audience | Metrics |
|---------|----------|---------|
| **Daily standup (growth)** | Founder + CGO | Pending approvals, bounce rate, signups yesterday |
| **Weekly growth review** | Product + growth | North Star, activation rate, funnel, channel UTMs |
| **Monthly business review** | Leadership | Revenue, ARPA-A, cohort retention, CAC |
| **Quarterly board** | Investors | North Star QoQ, MRR (V2), strategic KPIs |

Book 01 quarterly review includes Book 05 KPI refresh ([foundation README](../README.md)).

---

## Examples

### Good weekly growth memo

*"North Star up 8% WoW to 142 active fields. Activation rate flat at 38% — bottleneck is field creation (52%) vs case save (38%). Guest limit hit rate 22%; signup conversion 14%. 6 outreach drafts pending >48h — scheduling review block. Zero auto-publishes."*

### Bad KPI dashboard

*"10,000 page views! 500 signups! 2 purchases."* (No activation, no North Star, no case context)

### Good experiment readout

*"Reduced guest limit A/B test rejected — activation dropped 4pp without meaningful purchase lift. Keeping GUEST_QUESTION_LIMIT = 3."*

---

## Best Practices

- Report North Star first in every growth meeting.
- Segment all retention metrics by activation (field+case) vs non-activated.
- Cross-check Stripe revenue against `credit_transactions.purchase` sums.
- Track 402 rate alongside purchase conversion — high 402 + low purchase = pricing/UX problem.
- Export KPI definitions to Metabase/PostHog dashboards with SQL comments.

## Bad Practices

- Optimizing signup count with low-friction fake emails.
- Counting resolved cases as "active" for North Star.
- Reporting MRR before subscription webhooks are live.
- Ignoring outreach bounce rate until domain is blocklisted.
- Single-metric obsession on signups while North Star declines.

---

## Future Considerations

| Enhancement | Phase |
|-------------|-------|
| Automated North Star dashboard in admin | V2 |
| Cohort retention charts (PostHog) | MVP+ |
| LTV / CAC modeling by channel | V2 |
| Content ROI attribution pipeline | V2 |
| Enterprise org-level North Star (coops) | V3 |
| Public investor metrics page | V4 |

---

## Cross-References

- [Growth Loops & Activation](03-growth-loops-and-activation.md)
- [Retention & Lifecycle](05-retention-and-lifecycle.md)
- [Credits & Subscriptions](02-credits-and-subscriptions.md)
- [Book 01 — Decision Principles](../01-product-bible/06-decision-principles.md)
- Code: `apps/admin/src/lib/growth/stats.ts`
- Code: `field_cases`, `credit_transactions`, `guest_usage`
- Legacy: [`docs/marketing-growth-system.md`](../../marketing-growth-system.md)
