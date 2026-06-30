# Nertura — Export Company Dashboard

> UX specification for agricultural export operations directors sourcing, tracing, and shipping product internationally.

---

## Persona Anchor

**Primary user:** Sophie Laurent — export operations director, fresh produce and grains, port-based trade hub.

**Job to be done:** *"Show me what supply is coming, what's at risk, and what I need to document before the container sails."*

---

## Design Philosophy

| Influence | Application |
|-----------|-------------|
| **Salesforce** | Pipeline-centric; account health; deal stages; activity timeline |
| **Stripe** | Precise status indicators; timeline components; document clarity |
| **Notion** | Flexible views — switch between shipment list and supply calendar |

**Shift from farmer/cooperative:** Zero field operations. Marketplace sourcing, CRM supplier health, compliance deadlines, and market intelligence dominate.

---

## Screen: Export Company Dashboard (Web)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Export operations · Nertura Trade Ltd           [Destination: EU ▾]      │
│ 14 active shipments · 3 documents due this week                          │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ SUPPLY      │ │ SHIPMENTS   │ │ COMPLIANCE  │ │ MARGIN      │        │
│ │ PIPELINE    │ │ IN TRANSIT  │ │ STATUS      │ │ FORECAST    │        │
│ │ 2,400 t     │ │ 6 active    │ │ 3 due       │ │ +8.2%       │        │
│ │ 4 sourcing  │ │ 2 delayed   │ │ 1 overdue   │ │ vs last mo  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├────────────────────────────────────────────┬─────────────────────────────┤
│ SHIPMENT TIMELINE (14 days)                  │ MARKET INTELLIGENCE         │
│ ┌────────────────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ Mon   Tue   Wed   Thu   Fri   Sat  Sun │ │ │ Corn (EU)               │ │
│ │ ──●───●───●───────●───●───               │ │ │ $210/t ▲ 3.2% (30d)    │ │
│ │    SHP-042  SHP-039      SHP-045        │ │ │ [ Sell window: Good ]   │ │
│ │    ✓ docs  ⚠ phyto  ● sail              │ │ │─────────────────────────│ │
│ └────────────────────────────────────────┘ │ │ Soy (CN)                │ │
│ Legend: ● sailing ⚠ doc due ✓ complete     │ │ $480/t ▼ 1.1%           │ │
├────────────────────────────────────────────┤ └─────────────────────────┘ │
│ SUPPLIER HEALTH                    View all →│                             │
│ ┌────────────────────────────────────────┐ │ SOURCING OPPORTUNITIES      │
│ │ ● Cooperativa Valle · Score 92       │ │ 3 listings match EU corn  │
│ │   800t committed · harvest on track   │ │ req · 1 new today           │
│ │────────────────────────────────────────│ │ [ Browse marketplace → ]  │
│ │ ● Finca del Sur · Score 71 ⚠         │ └─────────────────────────────┘
│ │   Quality data stale · [ Request ]    │                             │
│ └────────────────────────────────────────┘ │ ✦ AI INSIGHT                │
│                                            │ "SHP-039 phytosanitary cert │
├────────────────────────────────────────────┤  expires in 48h. 3 suppliers │
│ ACTIVE ORDERS & DEALS            View all →│  in Region A harvest ready  │
│ ┌──────────────────────────────────────────────────────────────────┐   │  — consolidate listing?"    │
│ │ ORD-8821 · Corn 500t · Valle Verde · Delivery Jul 2 · Contract  │   │ [ View shipment ] [ Act ]   │
│ │ ORD-8814 · Soy 200t · Finca del Sur · Negotiating · Offer open  │   └─────────────────────────────┘
│ └──────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                             │
│  [ Post requirement ] [ New order ] [ Traceability report ] [ Doc pack ]│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## KPI Cards (Export-Specific)

| Card | Primary | Secondary | Drill-down |
|------|---------|-----------|------------|
| **Supply pipeline** | Total tonnes committed | Deals in sourcing stage | CRM pipeline + Marketplace |
| **Shipments in transit** | Active count | Delayed count (red) | Orders filtered in-transit |
| **Compliance status** | Docs due this week | Overdue (red badge) | Compliance queue |
| **Margin forecast** | Predicted margin % | vs prior period | Reports → export P&L |

---

## Shipment Timeline Widget

14-day horizontal timeline (Stripe-style status progression):

| Marker | Meaning |
|--------|---------|
| ● Green | On schedule; docs complete |
| ⚠ Amber | Document due or quality flag |
| ✕ Red | Delayed or compliance block |
| ○ Gray | Planned, not yet active |

Click shipment → Order detail with full document checklist.

### Shipment Detail Document Checklist

```
SHP-039 · Corn 500t → Rotterdam
─────────────────────────────────
☑ Purchase contract
☑ Quality certificate
☐ Phytosanitary certificate     Due: 21 Jun  ⚠
☐ Certificate of origin
☐ Bill of lading
─────────────────────────────────
[ Generate doc pack ]  [ Request from supplier ]
```

---

## Supplier Health Score

Composite score 0–100 per supplier account:

| Factor | Weight |
|--------|--------|
| On-time delivery history | 25% |
| Quality grade consistency | 25% |
| Traceability data completeness | 20% |
| Response time | 15% |
| Documentation compliance | 15% |

| Band | Score | UI |
|------|-------|-----|
| Excellent | 90–100 | Green dot |
| Good | 75–89 | Default |
| At risk | 60–74 | Amber + warning |
| Critical | <60 | Red + action required |

Row actions: `View account`, `Request update`, `Message`.

---

## Market Intelligence Panel

Per commodity + destination:

| Element | Description |
|---------|-------------|
| Current price | With 30-day trend arrow |
| AI forecast | 1-month direction [Business+] |
| Sell/hold badge | Good / Neutral / Wait |
| Spread vs other destinations | Optional comparison |

Click → full market report with price chart.

---

## Sourcing Opportunities Widget

Matches active buyer requirements against new Marketplace listings:
- "3 listings match EU corn req"
- New today count badge
- CTA to filtered Marketplace browse

---

## Active Orders & Deals Table

Compact table (max 5 rows):

| Column | Content |
|--------|---------|
| Order ID | Link to detail |
| Product | Crop + quantity |
| Supplier | CRM account link |
| Status | Stage badge |
| Delivery | Date or "TBD" |
| Next action | Inline CTA |

---

## AI Insights (Export Tone)

| Type | Example | CTA |
|------|---------|-----|
| **Compliance** | "SHP-039 phytosanitary cert expires in 48h." | View shipment |
| **Sourcing** | "3 suppliers in Region A harvest-ready — consolidate?" | Browse listings |
| **Market** | "EU corn premium widening — forward contract recommended." | View forecast |
| **Risk** | "Supplier Finca del Sur quality data 30 days stale." | Request update |

Formal, precise language. No colloquialisms.

---

## Quick Actions (Export Set)

| Action | Route |
|--------|-------|
| **Post requirement** | Marketplace → new buyer requirement |
| **New order** | Create order from accepted offer |
| **Traceability report** | Reports → traceability (pre-filled recent shipment) |
| **Doc pack** | Bulk document generation wizard |

---

## Default Landing Alternative

Export users may set **Marketplace** as default landing instead of dashboard:

Settings → Preferences → "Start page: Dashboard / Marketplace"

---

## CRM Integration (Export View)

Dashboard CRM widgets deep-link to exporter-configured pipeline:

| Stage | Export meaning |
|-------|----------------|
| Lead | New supplier discovered |
| Qualified | Traceability verified |
| Proposal | Offer submitted |
| Negotiation | Price/terms discussion |
| Won | Order confirmed |
| Lost | Deal closed unsuccessfully |

---

## Traceability Flow (Dashboard Entry)

```
Dashboard → Quick action "Traceability report"
    → Select order or shipment
    → Auto-populate: farm origin, crop plan, inputs, harvest date, quality tests
    → Preview PDF (farm-to-container chain)
    → Export / send to buyer
```

Visual chain (Stripe timeline style):

```
Farm La Esperanza → Harvest 12 Jun → Storage Valle → Container MSKU1234 → Rotterdam
     ✓ traceable         ✓ logged          ✓ verified        ● in transit
```

---

## Mobile: Export Home

```
┌─────────────────────────┐
│ Nertura Trade        🔔 │
│ 6 shipments · 3 docs due│
├─────────────────────────┤
│ ⚠ PHYTO due SHP-039     │
│    48 hours · Action →  │
├─────────────────────────┤
│ KPI carousel            │
├─────────────────────────┤
│ SHIPMENTS THIS WEEK     │
│ Tue SHP-042 ✓           │
│ Thu SHP-039 ⚠ phyto     │
├─────────────────────────┤
│ EU Corn $210/t ▲ 3.2%   │
├─────────────────────────┤
│ [Requirement] [Orders]  │
│ [Traceability] [Docs]   │
└─────────────────────────┘
```

Tab bar: Home · Marketplace · Orders · Alerts · More

---

## Destination Filter

Top-bar **Destination** switcher filters:
- Market intelligence prices
- Compliance requirements (EU vs US vs APAC doc sets)
- Sourcing opportunities (delivery destination match)

---

## Compliance Module Surface

Documents tracked per shipment:

| Document | Typical deadline |
|----------|------------------|
| Phytosanitary certificate | 72h before sail |
| Certificate of origin | 48h before sail |
| Quality certificate | At loading |
| Bill of lading | At departure |
| Import permit | Varies by destination |

Overdue docs trigger critical alerts + dashboard banner.

---

## Empty States

### No Active Shipments

```
┌─────────────────────────────────────────┐
│   Start sourcing supply                 │
│   Post a buyer requirement or browse    │
│   cooperative listings in your region.  │
│   [ Post requirement ]  [ Browse ]      │
└─────────────────────────────────────────┘
```

### No Suppliers in CRM

```
┌─────────────────────────────────────────┐
│   Build your supplier network           │
│   Add accounts manually or auto-create  │
│   from Marketplace transactions.        │
│        [ Add supplier ]                 │
└─────────────────────────────────────────┘
```

---

## Tier Variations

| Feature | Business | Enterprise |
|---------|----------|------------|
| Margin forecast KPI | Basic | Full P&L integration |
| Market intelligence | 1-month forecast | 3-month + sentiment |
| Doc pack generation | Standard templates | Custom + API to trade systems |
| Supplier health | Manual + transaction data | + API quality feed |
| Destination filter | 3 destinations | Unlimited |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Doc deadline miss rate | <2% |
| Dashboard → compliance action | >60% of due docs actioned same day |
| Sourcing opportunity click-through | >25% |
| Traceability report generation time | <3 min (vs 45 min manual) |
| Supplier health improvement (at-risk) | 50% resolve within 30 days |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Parent: `/ui/dashboard-layout-system.md`*
