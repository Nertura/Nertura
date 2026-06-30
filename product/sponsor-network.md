# Nertura — Sponsor Network

> Future agriculture advertising and partnership ecosystem — where input suppliers, equipment makers, and agribusiness brands reach farmers through **contextual, credit-funded, measurable sponsorship** embedded in the Nertura intelligence OS.

---

## Vision

Traditional ag advertising sprays banners at unrelated eyeballs. The Nertura Sponsor Network delivers **sponsored intelligence at the moment of decision** — a seed company funding diagnosis credits during planting season, a fertilizer brand supporting irrigation optimization tips when soil moisture drops — measurable, consent-based, and aligned with farmer outcomes.

```
Sponsor funds credits + contextual content
        → Farmer receives free AI value
        → Sponsor earns trust + measurable engagement
        → Nertura earns platform revenue without ads that annoy
```

**Phase:** 5 (Months 24–36), pilot in Phase 4. Architecture defined now.

---

## Strategic Objectives

| Objective | Outcome |
|-----------|---------|
| **Farmer value** | Sponsored credits reduce cost barrier for smallholders |
| **Sponsor ROI** | Measurable reach tied to crop context and season |
| **Nertura revenue** | High-margin channel beyond SaaS and credits |
| **Ethical advertising** | No deceptive agronomy; labeled sponsorship |
| **Moat** | Sponsor performance data improves targeting loop |
| **Independence** | Sponsorship never overrides AI accuracy |

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NERTURA SPONSOR NETWORK                         │
├─────────────────────────────────────────────────────────────────┤
│  SPONSOR PORTAL     │  Campaigns, budgets, creative, reporting    │
│  TARGETING ENGINE   │  Crop, region, season, persona, co-op       │
│  CREDIT INJECTION   │  Sponsor-funded farmer credit pools         │
│  CONTENT SPONSORSHIP│  Labeled tips, guides, Media Engine slots   │
│  MARKETPLACE ADS    │  Featured listings, supplier prominence     │
│  ATTRIBUTION        │  Engagement, conversion, outcome metrics    │
│  COMPLIANCE         │  Labeling, agronomic review, consent        │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Credit System      AI Agents (disclosure)   Marketplace
   Community Network  Media Engine             CRM
```

---

## Sponsor Types

| Type | Examples | Primary goal |
|------|----------|--------------|
| **Input supplier** | Seed, fertilizer, crop protection | Product awareness at decision point |
| **Equipment OEM** | Tractors, irrigation, drones | Consideration during equipment season |
| **Financial services** | Ag credit, insurance | Seasonal financial products |
| **Cooperative / association** | Industry bodies | Member benefit programs |
| **Export / trade** | Port authorities, trade boards | Market access programs |
| **Nertura strategic** | Platform growth | Credit subsidies for acquisition |

---

## Sponsorship Products

### 1. Sponsored Credit Pools

Sponsor pre-purchases credit bundles distributed to targeted farmers.

| Parameter | Example |
|-----------|---------|
| Sponsor | AgriChem Ltd |
| Pool | 50,000 VISION credits |
| Target | Corn farmers, TR-Central, planting season |
| Farmer experience | "Your photo diagnoses this month are sponsored by AgriChem" |
| Cap per farmer | 20 VISION/month |

**Credit injection flow:**

```
Sponsor purchases pool (Stripe invoice)
    → Campaign activated in Targeting Engine
    → Eligible farmer uses VISION diagnosis
    → Credit consumed from sponsor pool (not farmer balance)
    → Attribution logged
    → Farmer sees disclosure label
```

Farmer opt-out: use own credits instead; decline sponsor pool in settings.

### 2. Contextual Sponsored Insights

AI Farmer / Agronomist surfaces **labeled** sponsor content when contextually relevant:

```
"Soil moisture is low in Field 5. Consider irrigation adjustment.
 ── Sponsored tip from Netafim: Drip scheduling guide → [link]"
```

| Rule | Enforcement |
|------|-------------|
| Label | "Sponsored" always visible |
| Relevance | Crop + season + context match required |
| Accuracy | AI Agronomist validates; no false claims |
| Override | Organic/restricted farms excluded by org policy |
| Frequency cap | Max 1 sponsored insight / day / user |

**Hard block:** Sponsor content never changes diagnosis result or yield prediction.

### 3. Marketplace Prominence

| Placement | Description |
|-----------|-------------|
| **Featured supplier** | Top of browse for relevant crop/region |
| **Sponsored listing badge** | Visible label on marketplace card |
| **Buyer requirement match** | Sponsor priority in search ranking (labeled) |

Organic search ranking unchanged for non-sponsored; sponsored slots capped at 20% of above-fold results.

### 4. Media & Content Sponsorship

| Placement | Description |
|-----------|-------------|
| **Sponsored reel series** | "Irrigation week powered by [Sponsor]" — approval workflow |
| **Newsletter slot** | Single labeled block in cooperative bulletin |
| **Community highlight** | Validated practice from sponsor agronomist (expert badge) |

All content through `/product/approval-workflow.md` + sponsor legal review.

### 5. Cooperative Programs

Sponsor funds **entire cooperative member credit pool**:

```
Sponsor × Cooperative agreement
    → 320 members receive +50 TEXT, +10 VISION/month for 6 months
    → Co-op admin dashboard shows utilization
    → Sponsor receives aggregate engagement report (no individual PII)
```

---

## Sponsor Portal

### Dashboard (`/app/sponsor` or external portal)

| Section | Features |
|---------|----------|
| **Campaigns** | Create, pause, budget caps |
| **Targeting** | Crop, region, org type, season window, co-op |
| **Creative** | Tips, links, media assets, compliance docs |
| **Credit pools** | Balance, burn rate, per-farmer cap |
| **Analytics** | Impressions, engagements, credit burn, marketplace clicks |
| **Billing** | Invoices, prepaid balance, ROAS estimates |
| **Compliance** | Submitted labels, agronomic review status |

### Targeting dimensions

| Dimension | Granularity |
|-----------|-------------|
| Geography | Country, province, climate zone |
| Crop | Catalog crop + growth stage window |
| Organization type | Farm, co-op, supplier |
| Farm size | Hectare bands |
| Season | Planting, vegetative, harvest |
| Language | Content localization |
| Exclusion | Organic-certified, competitor customers |

No targeting on individual farmer PII without explicit program opt-in.

---

## Attribution & Analytics

### SponsorCampaignMetrics

| Metric | Definition |
|--------|------------|
| **Credit impressions** | Farmer saw sponsored credit available |
| **Credit redemptions** | Diagnoses/questions funded by sponsor |
| **Insight impressions** | Sponsored tip shown |
| **Insight engagements** | Click, save, follow-through |
| **Marketplace clicks** | From sponsored placement |
| **Conversion proxy** | CRM interaction or order within 30d |
| **Brand lift** | Optional survey cohort [Enterprise sponsors] |

Aggregate reporting default; individual farmer data only with program consent.

---

## Compliance & Ethics

### Agricultural advertising rules

| Rule | Implementation |
|------|----------------|
| **Clear labeling** | "Sponsored" / "Paid partnership" on all formats |
| **No diagnosis influence** | Sponsor ID excluded from model inference |
| **Product claims** | Must match registered label (pesticides) |
| **Organic exclusion** | Auto-exclude restricted inputs for organic farms |
| **Minor users** | No sponsorship targeting operators under 18 |
| **Regional law** | Campaign geo-gated to permitted jurisdictions |

### Agronomic review gate

Sponsor creative reviewed by Nertura ag science team before activation — same rigor as AI content approval.

### Farmer consent

| Consent | Required for |
|---------|--------------|
| `sponsor_programs` | Receive sponsored credits/insights |
| Cooperative bulk | Co-op admin accepts on behalf with member notification |
| Opt-out | Always available; core AI unchanged |

---

## Pricing Models

| Model | Structure | Best for |
|-------|-----------|----------|
| **CPM credits** | $X per 1,000 vision credits delivered | Input suppliers |
| **Flat campaign** | $Y for season + region + crop | Brand awareness |
| **Marketplace CPC** | $Z per click to listing | Suppliers with catalog |
| **Co-op bundle** | $W per member per month | Large programs |
| **Enterprise annual** | Custom | Global OEMs |

Target Nertura gross margin on sponsor revenue: **>70%**.

---

## Integration with Credit System

| Event | Ledger |
|-------|--------|
| Sponsor prepay | `CreditTransaction` + sponsor pool balance |
| Farmer redemption | Debit sponsor pool; not farmer balance |
| Pool exhausted | Campaign pauses; farmer uses own credits |
| Unused pool expiry | Roll per contract terms |

New credit source type: `sponsor_pool_id` on transaction.

---

## Integration with AI Agents

| Agent | Sponsorship behavior |
|-------|---------------------|
| AI Farmer | May surface labeled tips; never alter diagnosis |
| AI Agronomist | Blocks inaccurate sponsor claims |
| AI Finance | No sponsor products (conflict) |
| AI Support | Explains sponsor program opt-out |
| AI Content / Social | Sponsored series labeled in approval queue |

Agent system prompts include: `SPONSOR_CONTENT_IS_NEVER_FACTUAL_AUTHORITY`.

---

## Knowledge Graph

```
Sponsor ──FUNDS──> CreditPool ──DISTRIBUTED_TO──> Organization/Farmer segment
Sponsor ──SPONSORS──> Campaign ──TARGETS──> CropCatalog + Region
CommunityPost ──SPONSORED_BY──> Sponsor (labeled)
MarketplaceListing ──PROMOTED_BY──> Sponsor
```

---

## Phased Rollout

| Phase | Scope |
|-------|-------|
| **4 pilot** | 3 sponsors; VISION credit pools only; TR region |
| **5a** | Sponsor portal; contextual insights; marketplace featured |
| **5b** | Co-op bulk programs; multi-region |
| **5c** | Media sponsorship; community expert programs |
| **6** | Self-serve sponsor onboarding; API for programmatic |

---

## Success Metrics

| Metric | Year 1 sponsor network |
|--------|------------------------|
| Active sponsors | 50 |
| Sponsor revenue | $2M ARR |
| Farmers receiving sponsored credits | 100,000 |
| Opt-out rate | <10% |
| Sponsor ROAS (self-reported) | >3× |
| Agronomic compliance incidents | 0 |
| Farmer NPS impact | Neutral or positive vs control |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Perceived bias in AI | Hard separation inference vs sponsorship layer |
| Regulatory (ag chem ads) | Geo-gating; label compliance review |
| Sponsor overreach | Frequency caps; farmer opt-out |
| Small farm exploitation | Credit pools benefit farmers first |
| Competitor sponsor conflicts | Category exclusivity optional per campaign |

---

## Competitive Moat

Sponsors follow **farmers with operational context** — not banner impressions on unrelated sites. Performance data from sponsored credit redemption + marketplace conversion creates a targeting loop competitors cannot replicate without Nertura's graph, memory, and multi-stakeholder network.

The Sponsor Network completes the commerce plane:

**SaaS + Credits + Marketplace + Sponsorship = full-stack Ag intelligence monetization.**

---

*Document owner: Chief AI Platform Architect / Partnerships*  
*Last updated: June 2026*  
*Companion: `/product/credit-system.md`, `/product/community-network.md`, `/ai/data-moat-strategy.md`*
