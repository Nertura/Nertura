# Nertura — Marketplace Screens

> Complete UX specification for B2B agricultural commerce. Stripe-grade transaction clarity with Salesforce pipeline patterns for negotiations.

---

## Marketplace IA Overview

```
Marketplace
├── Browse (default)
├── Search results
├── Listing detail
├── Create / edit listing
├── Buyer requirements
├── Offers & negotiations
├── Orders
└── Messages
```

**Default landing by org type:**
- Farmer / Cooperative → Browse (seller-leaning)
- Exporter / Buyer → Requirements + Browse (buyer-leaning)
- Supplier → Browse (input products)

---

## Screen 1: Browse (`/app/marketplace`)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Marketplace                    [ Post requirement ]  [ + Create listing ] │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search crops, regions, sellers...          [ Filters ▾ ]  [ Map · Grid ]│
├──────────────────────────────────────────────────────────────────────────┤
│ Active filters: Corn ×  EU ×  >100t ×                    Clear all      │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐             │
│ │ [photo]         │ │ [photo]         │ │ [photo]         │             │
│ │ Yellow Corn     │ │ Soybean Grade 2 │ │ Organic Wheat   │             │
│ │ 500t · $210/t   │ │ 200t · $480/t   │ │ 150t · $195/t   │             │
│ │ Valle Verde ✓   │ │ Finca del Sur   │ │ Cooperativa Norte│             │
│ │ Minas Gerais    │ │ Buenos Aires    │ │ Porto Alegre    │             │
│ │ ★ Traceable     │ │ ★ Verified      │ │ ★ Organic cert  │             │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘             │
│ ┌─────────────────┐ ┌─────────────────┐ ...                              │
│ │ ...             │ │ ...             │                                  │
│ └─────────────────┘ └─────────────────┘                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ Showing 48 listings · Sort: [ Newest ▾ ]                    [ Load more ] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Listing Card Anatomy

| Element | Spec |
|---------|------|
| Photo | 16:9, placeholder crop icon if none |
| Title | Crop + grade, 2 lines max |
| Quantity · Price | Tabular numbers; currency localized |
| Seller | Org name + verified badge if applicable |
| Location | Region/country (not full address) |
| Badges | Traceable, Organic, Verified, Group listing |

### Filter Panel (Drawer)

| Filter | Type |
|--------|------|
| Crop | Multi-select chips |
| Region / country | Cascading select |
| Quantity range | Min–max slider |
| Price range | Min–max + currency |
| Quality grade | Select |
| Certification | Multi-checkbox |
| Delivery terms | FOB, CIF, pickup |
| Seller type | Farm, cooperative, company |
| Availability | Date range |

---

## Screen 2: Search Results (`/app/marketplace/search`)

Same as Browse with query highlighted in results. Empty state:

```
No listings match "organic corn eu 500t"
[ Broaden search ]  [ Post a requirement instead ]
```

---

## Screen 3: Map View

Full-width map with listing pins. Cluster at zoom <8. Pin popup:

```
┌─────────────────────┐
│ Yellow Corn · 500t  │
│ $210/t · Valle Verde│
│ [ View listing ]    │
└─────────────────────┘
```

Toggle: Grid ↔ Map ↔ List (table for exporters).

---

## Screen 4: Listing Detail (`/app/marketplace/listings/:id`)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Back to Marketplace                                                     │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ┌────────────────────────────────────────┐ │ LISTING                     │
│ │                                        │ │ Yellow Corn Grade 2         │
│ │         [Photo gallery]                │ │ 500 tonnes                  │
│ │                                        │ │ $210.00 / tonne             │
│ └────────────────────────────────────────┘ │ USD · Negotiable            │
│                                            │                             │
│ DESCRIPTION                                │ SELLER                      │
│ Premium yellow corn, harvest June 2026.    │ Valle Verde Cooperative ✓   │
│ Moisture max 14%. Stored in certified silo.│ 312 members · Est. 1987    │
│                                            │ Minas Gerais, Brazil        │
│ SPECIFICATIONS                             │ ★ 4.8 (24 trades)           │
│ ┌──────────────┬───────────────────────┐   │ [ View seller ] [ Message ] │
│ │ Crop         │ Corn                  │   ├─────────────────────────────┤
│ │ Grade        │ Grade 2               │   │ DELIVERY                    │
│ │ Moisture     │ Max 14%               │   │ FOB · Available Jul 1–15    │
│ │ Certification│ Non-GMO               │   │ Pickup: Valle Verde silo    │
│ │ Origin       │ Minas Gerais, BR      │   ├─────────────────────────────┤
│ └──────────────┴───────────────────────┘   │ TRACEABILITY                │
│                                            │ Farm → Harvest → Storage    │
│ TRACEABILITY CHAIN                         │ [ View full chain ]         │
│ Farm La Esperanza → Harvest 12 Jun → ...   ├─────────────────────────────┤
│ [Expand full chain]                        │                             │
│                                            │ ┌─────────────────────────┐ │
│                                            │ │ $105,000 total          │ │
│                                            │ │ [ Make offer ]          │ │
│                                            │ │ [ Message seller ]      │ │
│                                            │ │ [ Add to watchlist ]    │ │
│                                            │ └─────────────────────────┘ │
└────────────────────────────────────────────┴─────────────────────────────┘
```

### Sticky CTA (Mobile)

Bottom bar: price summary + **Make offer** primary button.

---

## Screen 5: Create Listing (`/app/marketplace/listings/new`)

### Step Wizard

| Step | Title | Fields |
|------|-------|--------|
| 1 | Product | Source: inventory / manual; crop, grade, quantity, unit |
| 2 | Pricing | Price per unit, currency, negotiable toggle |
| 3 | Quality | Specs table, certifications, photos (min 1) |
| 4 | Logistics | Delivery terms, location, availability window |
| 5 | Visibility | Public / cooperative only / private buyers |
| 6 | Review | Summary preview → Publish |

### Inventory-Linked Listing

Pre-fills from harvest record: quantity, crop, traceability auto-attached.

### Group Listing (Cooperative)

```
┌─────────────────────────────────────────┐
│ Group listing                           │
│ Aggregate from member contributions:    │
│ ☑ José M. · 120t                        │
│ ☑ Ana R. · 80t                          │
│ ☐ Pedro S. · 200t (pending confirm)     │
│ Total: 200t confirmed · 200t pending    │
│ [ Request contributions ]               │
└─────────────────────────────────────────┘
```

---

## Screen 6: Make Offer (Modal)

```
┌─────────────────────────────────────────┐
│ Make offer · Yellow Corn 500t           │
├─────────────────────────────────────────┤
│ Quantity      [ 500    ] tonnes         │
│ Price         [ 205.00 ] / tonne  USD   │
│ Total         $102,500                  │
│ Delivery      [ CIF Rotterdam ▾ ]       │
│ Needed by     [ 15 Jul 2026 ]           │
│ Message       ___________________       │
│               ___________________       │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Send offer ]  │
└─────────────────────────────────────────┘
```

Validation: quantity ≤ listing quantity; price within reasonable band (warn if >20% below listing).

---

## Screen 7: Buyer Requirements (`/app/marketplace/requirements`)

### Feed Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Buyer requirements                              [ + Post requirement ]    │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ WANTED · Corn Grade 2 · 1,000t                                     │   │
│ │ Max $215/t · CIF EU · Needed by Aug 2026                           │   │
│ │ Nertura Trade Ltd ✓ · Posted 2 days ago                            │   │
│ │ [ View ] [ Submit listing match ]                                  │   │
│ └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

Sellers see matching score badge if their inventory fits.

---

## Screen 8: Offers & Negotiations (`/app/marketplace/offers`)

### Tab Structure

`Received` · `Sent` · `Active negotiations` · `Closed`

### Negotiation Thread

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Offer #OFR-4421 · Yellow Corn · Valle Verde ↔ Nertura Trade              │
│ Status: Countered                                         Expires: 3 days │
├──────────────────────────────────────────────────────────────────────────┤
│ TIMELINE                                                                  │
│ ● 19 Jun — You offered $205/t for 500t                                   │
│ ● 18 Jun — Seller countered $208/t                                       │
│ ● 17 Jun — You offered $200/t for 500t                                   │
│ ● 16 Jun — Seller listed at $210/t                                       │
├──────────────────────────────────────────────────────────────────────────┤
│ MESSAGES                                                                  │
│ [Message thread — same as CRM messaging component]                       │
├──────────────────────────────────────────────────────────────────────────┤
│ Current offer: $208/t · 500t · $104,000                                  │
│ [ Accept ]  [ Counter ]  [ Decline ]                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 9: Orders (`/app/marketplace/orders`)

### List View

| Column | Content |
|--------|---------|
| Order ID | ORD-XXXX |
| Product | Crop + qty |
| Counterparty | Buyer or seller name |
| Status | Badge |
| Total | Currency formatted |
| Delivery | Date |
| Actions | View |

### Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| Confirmed | Blue | Offer accepted |
| In transit | Purple | Shipment active |
| Delivered | Green | Received |
| Completed | Gray | Settled |
| Disputed | Red | Issue open |
| Cancelled | Gray strikethrough | Void |

---

## Screen 10: Order Detail (`/app/marketplace/orders/:id`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Order ORD-8821                                          Status: Confirmed  │
├──────────────────────────────────────────────────────────────────────────┤
│ PROGRESS                                                                  │
│ ● Offer accepted ── ● Contract signed ── ○ In transit ── ○ Complete       │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ORDER DETAILS                              │ PARTIES                     │
│ Product: Yellow Corn Grade 2               │ Seller: Valle Verde Co-op   │
│ Quantity: 500 tonnes                       │ Buyer: Nertura Trade Ltd    │
│ Price: $210/t · Total: $105,000 USD        │ [ Message ]                 │
│ Delivery: CIF Rotterdam · Jul 15           │                             │
├────────────────────────────────────────────┤ DOCUMENTS                   │
│ LOGISTICS                                  │ ☑ Contract                  │
│ Tracking: ________________                 │ ☐ Bill of lading            │
│ Carrier: ________________                  │ ☐ Quality certificate       │
│ [ Update logistics ]                       │ [ Upload ] [ Generate ]     │
├────────────────────────────────────────────┴─────────────────────────────┤
│ [ Mark delivered ]  [ Raise dispute ]  [ Download summary ]               │
└──────────────────────────────────────────────────────────────────────────┘
```

Stripe-inspired status timeline with clear next action.

---

## Screen 11: Messages (`/app/marketplace/messages`)

Split pane (desktop): thread list | active thread. Mobile: list → thread.

Thread always linked to listing or order context header.

---

## Mobile Screens

### Browse (`/m/marketplace`)

Single column cards; filter as bottom sheet; FAB: Create listing (sellers).

### Listing Detail

Photo carousel top; sticky bottom CTA bar.

### Offers

Card list with status badge; tap → thread.

---

## Trust & Verification UI

| Badge | Criteria |
|-------|----------|
| ✓ Verified seller | KYC completed, 3+ completed orders |
| ★ Traceable | Full farm-to-listing chain |
| Organic | Certification uploaded |
| Group | Cooperative aggregate listing |

Badge tooltips explain criteria on hover.

---

## Empty States

| Screen | Message | CTA |
|--------|---------|-----|
| Browse (no results) | No listings match filters | Clear filters / Post requirement |
| My listings (none) | List your harvest to reach buyers | Create listing |
| Offers (none) | No active negotiations | Browse marketplace |
| Orders (none) | Completed orders appear here | Browse / View offers |

---

## Tier Gating

| Feature | Starter | Professional | Business |
|---------|---------|--------------|----------|
| Browse | ✓ | ✓ | ✓ |
| Create listing | — | ✓ | ✓ |
| Make offer | — | ✓ | ✓ |
| Group listing | — | — | ✓ |
| Transaction fee | — | 3% | 2% |

Upgrade prompt on locked CTAs — not hidden pages.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Listing view → offer | >8% |
| Offer → order conversion | >35% |
| Time to create listing | <5 min |
| Traceability view rate | >50% on listing detail |
| Message response time | <24h median |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Routes: `/wireframes/platform-sitemap.md`*
