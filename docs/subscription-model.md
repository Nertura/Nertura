# Nertura — Subscription Model

> SaaS pricing architecture for the Nertura Agriculture Operating System. Designed for global markets, land-scale flexibility, and clear upgrade paths from individual farmers to enterprise agribusiness.

---

## Pricing Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Value-aligned** | Price scales with farm count, team size, and intelligence depth |
| **Accessible entry** | Starter tier priced for individual farmers and smallholders |
| **Clear upgrade path** | Each tier unlocks modules and limits that match persona growth |
| **Global parity** | Regional pricing adjustments (PPP) without feature discrimination |
| **Transparent limits** | All quotas visible in-app; no surprise overages on lower tiers |
| **Annual incentive** | ~17% discount for annual billing to improve retention |

---

## Tier Overview

| Tier | Target Persona | Positioning |
|------|----------------|-------------|
| **Starter** | Individual farmer, smallholder | Essential tools to digitize one farm |
| **Professional** | Farm manager, growing operation | Full operations + AI for multi-field farms |
| **Business** | Cooperative, supplier, mid-size ag company | Multi-farm, commerce, CRM, advanced analytics |
| **Enterprise** | Agricultural company, exporter, large cooperative | Unlimited scale, SSO, API, dedicated support |

---

## Tier 1: Starter

### Target

Individual farmers and smallholders managing a single farm with basic operational needs.

### Price

| Billing | USD | Notes |
|---------|-----|-------|
| **Monthly** | $29/month | |
| **Annual** | $290/year ($24.17/month) | 2 months free |

*Regional PPP adjustments: -20% to -50% in designated emerging markets.*

### Included

| Category | Limit / Feature |
|----------|-----------------|
| **Farms** | 1 |
| **Fields** | Up to 10 |
| **Users** | 3 (owner + 2 team) |
| **Storage** | 5 GB (photos, documents) |
| **Modules** | Dashboard, Farm Management, Crop Management, Weather Intelligence (basic), Inventory (basic), Notifications (in-app + email), Billing, User Management |
| **Weather** | Daily forecast (7-day), basic alerts (frost, rain) |
| **Inventory** | Up to 50 SKUs |
| **Marketplace** | Browse listings; view prices (no listing or trading) |
| **Reports** | 5 standard reports |
| **AI** | Weather Risk Alerts (basic); no AI Assistant |
| **Support** | Community forum, knowledge base, email (48h response) |
| **Mobile app** | Full access with offline observation logging |
| **Integrations** | None |
| **API access** | None |

### Upgrade Triggers

- Needs more than 1 farm or 10 fields
- Wants to list products on Marketplace
- Needs AI Assistant or disease detection
- Team grows beyond 3 users
- Requires irrigation module

---

## Tier 2: Professional

### Target

Commercial farm managers, estate operators, and growing farms managing multiple sites with AI-driven decision support.

### Price

| Billing | USD | Notes |
|---------|-----|-------|
| **Monthly** | $99/month | |
| **Annual** | $990/year ($82.50/month) | 2 months free |

### Included

Everything in Starter, plus:

| Category | Limit / Feature |
|----------|-----------------|
| **Farms** | Up to 5 |
| **Fields** | Unlimited per farm |
| **Users** | 10 |
| **Storage** | 25 GB |
| **Modules** | + Irrigation, Inventory (full), Marketplace (full), CRM (basic) |
| **Weather** | 14-day forecast, hourly (48h), agricultural indices (GDD, ET), spray window, custom alert thresholds |
| **Inventory** | Unlimited SKUs, batch tracking, barcode scanning |
| **Marketplace** | Create listings, make/receive offers, messaging (3% transaction fee) |
| **CRM** | Up to 100 accounts, interaction logging |
| **Reports** | All standard reports + dashboard export |
| **AI** | AI Assistant (100 queries/day), Crop Disease Detection (top 4 crops), Irrigation Optimization (advisory), Weather Risk Alerts (ML-enhanced) |
| **Dashboard** | Customizable widget layout |
| **Notifications** | In-app + push + email |
| **Support** | Email (24h response), live chat (business hours) |
| **Integrations** | Weather station IoT (up to 5 devices) |
| **API access** | Read-only API (1,000 calls/month) |

### Upgrade Triggers

- Manages more than 5 farms or 10 users
- Needs custom reports or yield prediction
- Cooperative member management required
- SMS notifications needed
- Requires CRM for 100+ accounts

---

## Tier 3: Business

### Target

Cooperatives, agricultural input suppliers, mid-size agribusiness, and exporters needing multi-farm operations, commerce, and advanced analytics.

### Price

| Billing | USD | Notes |
|---------|-----|-------|
| **Monthly** | $349/month | |
| **Annual** | $3,490/year ($290.83/month) | 2 months free |

*Volume pricing available for cooperatives with 50+ member farms.*

### Included

Everything in Professional, plus:

| Category | Limit / Feature |
|----------|-----------------|
| **Farms** | Unlimited |
| **Fields** | Unlimited |
| **Users** | 50 |
| **Storage** | 100 GB |
| **Modules** | + CRM (full), Reports (custom builder), Billing (member billing) |
| **Weather** | Seasonal outlook, historical multi-year analysis, field-level microclimate |
| **Marketplace** | Group listings, buyer requirements, priority placement (2% transaction fee) |
| **CRM** | Unlimited accounts, pipeline management, deal tracking, bulk messaging |
| **Reports** | Custom report builder, scheduled delivery, comparative analysis |
| **Billing** | Member dues management, bulk invoicing (cooperative) |
| **AI** | AI Assistant (500 queries/day), Disease Detection (all launch crops), Yield Prediction, Market Price Forecasting, Irrigation Optimization (semi-auto) |
| **Notifications** | + SMS alerts |
| **Support** | Priority email (12h), live chat (extended hours), onboarding call |
| **Integrations** | IoT devices (up to 50), ERP export (CSV/API) |
| **API access** | Full read/write API (10,000 calls/month) |
| **Audit log** | 90-day retention |

### Upgrade Triggers

- More than 50 users
- SSO / SAML required
- Dedicated infrastructure or data residency
- API volume exceeds 10K calls/month
- Custom AI model training
- SLA requirements

---

## Tier 4: Enterprise

### Target

Large agricultural companies, major cooperatives, export operations, and organizations requiring enterprise security, unlimited scale, and custom deployment.

### Price

| Billing | USD | Notes |
|---------|-----|-------|
| **Custom** | Starting at $1,500/month | Annual contracts; custom pricing based on scale |

*Pricing factors: user count, farm count, API volume, AI usage, data residency, support SLA.*

### Included

Everything in Business, plus:

| Category | Limit / Feature |
|----------|-----------------|
| **Farms** | Unlimited |
| **Users** | Unlimited |
| **Storage** | 1 TB+ (negotiable) |
| **Modules** | All modules with no feature restrictions |
| **Marketplace** | Negotiable transaction fee (0.5–1.5%) |
| **AI** | Unlimited AI Assistant queries, custom knowledge base, custom model training (disease, yield), Irrigation Optimization (full-auto with IoT) |
| **Notifications** | + Webhook delivery, escalation rules |
| **Support** | Dedicated account manager, 4h SLA, phone support, quarterly business reviews |
| **Security** | SSO/SAML, MFA enforcement, IP allowlisting, custom session policies |
| **Integrations** | Custom ERP/BI integrations, machinery telematics, unlimited IoT |
| **API access** | Unlimited API calls, webhook subscriptions, SDK access |
| **Audit log** | Unlimited retention, SIEM export |
| **Deployment** | Optional dedicated instance, data residency selection, white-label |
| **Compliance** | SOC 2 Type II report, GDPR DPA, custom compliance documentation |
| **Training** | Custom onboarding program, admin training, field team training |

---

## Feature Comparison Matrix

| Feature | Starter | Professional | Business | Enterprise |
|---------|:-------:|:------------:|:--------:|:----------:|
| **Farms** | 1 | 5 | Unlimited | Unlimited |
| **Users** | 3 | 10 | 50 | Unlimited |
| **Fields** | 10 | Unlimited | Unlimited | Unlimited |
| **Storage** | 5 GB | 25 GB | 100 GB | 1 TB+ |
| | | | | |
| **Dashboard** | Standard | Customizable | Customizable | Customizable |
| **Farm Management** | ✓ | ✓ | ✓ | ✓ |
| **Crop Management** | ✓ | ✓ | ✓ | ✓ |
| **Weather Intelligence** | Basic | Full | Full + historical | Full + historical |
| **Irrigation** | — | ✓ | ✓ | ✓ + full-auto |
| **Inventory** | Basic (50 SKU) | Full | Full | Full |
| **Marketplace** | Browse only | Full (3% fee) | Full (2% fee) | Full (custom fee) |
| **CRM** | — | Basic (100) | Full | Full |
| **Reports** | 5 standard | All standard | Custom builder | Custom + API export |
| **Notifications** | In-app + email | + Push | + SMS | + Webhook |
| **Billing** | Self-serve | Self-serve | + Member billing | Custom |
| **User Management** | Basic | Basic | Full | + SSO/SAML |
| | | | | |
| **AI Assistant** | — | 100/day | 500/day | Unlimited |
| **Disease Detection** | — | Top 4 crops | All crops | + Custom models |
| **Yield Prediction** | — | — | ✓ | ✓ |
| **Irrigation AI** | — | Advisory | Semi-auto | Full-auto |
| **Weather Risk AI** | Basic | ML-enhanced | ML-enhanced | ML-enhanced |
| **Market Forecasting** | — | — | ✓ | ✓ |
| | | | | |
| **IoT devices** | — | 5 | 50 | Unlimited |
| **API access** | — | Read (1K/mo) | Full (10K/mo) | Unlimited |
| **Audit log** | — | — | 90 days | Unlimited |
| **SSO/SAML** | — | — | — | ✓ |
| **Dedicated support** | — | — | Onboarding call | Account manager |
| **SLA** | — | — | — | 4h response |
| **White-label** | — | — | — | ✓ |
| **Data residency** | Shared | Shared | Shared | Dedicated option |

---

## Usage Limits & Overages

### Hard Limits (Blocked at Limit)

| Metric | Starter | Professional | Business | Enterprise |
|--------|---------|--------------|----------|------------|
| Farms | 1 | 5 | Unlimited | Unlimited |
| Users | 3 | 10 | 50 | Unlimited |
| Fields | 10 | Unlimited | Unlimited | Unlimited |
| Inventory SKUs | 50 | Unlimited | Unlimited | Unlimited |
| CRM accounts | — | 100 | Unlimited | Unlimited |

When a hard limit is reached, the admin sees an upgrade prompt. No soft overage billing on lower tiers.

### Soft Limits (Overage Billing on Business+)

| Metric | Business Included | Overage Rate |
|--------|-------------------|--------------|
| API calls | 10,000/month | $0.01 per call |
| AI queries | 500/day | $0.05 per query |
| SMS notifications | 500/month | $0.03 per SMS |
| Storage | 100 GB | $0.10/GB/month |

Enterprise: overage rates negotiated in contract.

---

## Trial & Onboarding

| Element | Policy |
|---------|--------|
| **Free trial** | 14 days on Professional tier (no credit card required) |
| **Trial conversion** | Auto-downgrade to Starter if no payment method added |
| **Onboarding** | Guided wizard for all tiers; live onboarding call for Business+ |
| **Migration assistance** | Import from CSV/KML (all tiers); dedicated migration for Enterprise |
| **Money-back guarantee** | 30 days on first paid subscription |

---

## Billing Mechanics

### Payment Methods

| Method | Availability |
|--------|-------------|
| Credit/debit card (Visa, MC, Amex) | Global |
| Bank transfer (ACH, SEPA) | US, EU |
| Local payment methods | Region-specific (Pix, M-Pesa, UPI — phased rollout) |
| Purchase order / invoice | Enterprise only |

### Billing Cycle

- Monthly: billed on signup anniversary
- Annual: billed upfront; prorated credit on mid-cycle upgrade
- Enterprise: annual or multi-year contracts

### Upgrade / Downgrade

| Action | Behavior |
|--------|----------|
| **Upgrade** | Immediate access to new tier; prorated charge for remainder of cycle |
| **Downgrade** | Takes effect at next billing cycle; data preserved but modules gated |
| **Cancellation** | Access until period end; 90-day data export window; deletion after 180 days |

### Multi-Entity Billing (Cooperative / Enterprise)

| Feature | Tier |
|---------|------|
| Member sub-accounts with individual farm data | Business+ |
| Consolidated billing with per-member cost allocation | Business+ |
| Intercompany billing across org entities | Enterprise |

---

## Marketplace Transaction Fees

| Tier | Fee | Notes |
|------|-----|-------|
| Starter | N/A | Browse only |
| Professional | 3.0% | Per completed order |
| Business | 2.0% | Per completed order |
| Enterprise | 0.5–1.5% | Negotiated |

Fees collected at order completion; deducted from seller payout (V2) or invoiced monthly.

---

## Regional Pricing Strategy

| Region Tier | PPP Adjustment | Example (Professional monthly) |
|-------------|---------------|------------------------------|
| **Tier 1** (US, EU, AU, CA) | Full price | $99 |
| **Tier 2** (LATAM, Eastern EU, SEA) | -30% | $69 |
| **Tier 3** (Africa, South Asia) | -50% | $49 |
| **Tier 4** (Subsidized programs) | Custom | NGO/government partnership pricing |

Regional tier determined by organization country at registration. Enterprise pricing always custom.

---

## Partner & Channel Pricing

| Channel | Model |
|---------|-------|
| **Agricultural cooperatives (bulk)** | 15% discount for 20+ member farms on Business tier |
| **Input suppliers (referral)** | Revenue share on referred farmer subscriptions (15% year 1) |
| **Government / NGO programs** | Custom per-seat pricing; potential white-label |
| **System integrators** | 20% margin on Enterprise deals they source |
| **Resellers** | Tiered partner program (registered → silver → gold) |

---

## Revenue Projections Framework

| Metric | Year 1 Target | Year 3 Target |
|--------|---------------|---------------|
| **Paid organizations** | 500 | 25,000 |
| **Average revenue per account (ARPA)** | $75/month | $120/month |
| **Tier mix** | 60% Starter, 30% Pro, 8% Business, 2% Enterprise | 40% Starter, 35% Pro, 18% Business, 7% Enterprise |
| **Marketplace GMV** | $2M | $100M |
| **Marketplace fee revenue** | $50K | $2M |
| **Net revenue retention** | 110% | 125% |
| **Annual churn** | <15% | <10% |

---

## Competitive Pricing Reference

| Competitor | Entry Price | Mid Tier | Enterprise |
|------------|-------------|----------|------------|
| FarmLogs | $25/field/month | — | Custom |
| Granular | — | ~$1,000+/farm/year | Custom |
| Agworld | ~$15/hectare/year | — | Custom |
| Conservis | — | — | $50K+/year |
| **Nertura Starter** | **$29/month flat** | — | — |
| **Nertura Professional** | — | **$99/month** | — |
| **Nertura Business** | — | — | **$349/month** |
| **Nertura Enterprise** | — | — | **$1,500+/month** |

Nertura's flat-rate model (vs per-hectare/per-field) provides predictable costs that appeal to SMB farmers and simplifies cooperative billing.

---

*Document owner: Product Architecture / Revenue*  
*Last updated: June 2026*  
*Status: Approved foundation*
