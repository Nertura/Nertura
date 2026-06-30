# Nertura — Cooperative Dashboard

> UX specification for cooperative administrators managing member farms, collective sales, and shared services. Salesforce-style aggregate visibility with Notion-grade clarity.

---

## Persona Anchor

**Primary user:** Elena Vasquez — 320 member farms, 12 staff, cooperative manager.

**Job to be done:** *"Show me how the cooperative is performing as a whole and which members need support."*

---

## Design Philosophy

| Influence | Application |
|-----------|-------------|
| **Salesforce** | Aggregate KPIs, member roll-ups, pipeline-style deal tracking for collective sales |
| **Stripe** | Clean metric cards; restrained color; trustworthy numbers |
| **Notion** | Member drill-down without losing cooperative context |

**Shift from farmer dashboard:** Individual field detail deprioritized. Member activity, collective volume, and group commerce surface first.

---

## Screen: Cooperative Dashboard (Web)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Cooperative overview · Valle Verde              [Season: 2026 Spring ▾]  │
│ 312 active members · 94% engaged this week                               │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ MEMBERS     │ │ COLLECTIVE  │ │ MARKETPLACE │ │ DELIVERIES  │        │
│ │ ACTIVE      │ │ VOLUME      │ │ PIPELINE    │ │ ON TRACK    │        │
│ │ 312 / 320   │ │ 1,240 t     │ │ $420K       │ │ 87%         │        │
│ │ ▲ 8 new     │ │ ▲ 15% YoY   │ │ 3 deals     │ │ 12 overdue  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├────────────────────────────────────────────┬─────────────────────────────┤
│ MEMBERS NEEDING ATTENTION          View all →│ COLLECTIVE WEATHER         │
│ ┌────────────────────────────────────────┐ │ Risk summary across region │
│ │ José M. · No delivery logged 14d       │ │ ⚠ Frost: 45 farms Thu      │
│ │ Farm La Esperanza · [ Contact ]        │ │ 🌧 Heavy rain: 12 farms Mon│
│ │────────────────────────────────────────│ │ [ Weather map → ]          │
│ │ Ana R. · Yield 40% below cooperative   │ └────────────────────────────┘
│ │ avg · Field data stale · [ Support ]   │
│ │────────────────────────────────────────│ │ GROUP LISTINGS             │
│ │ 3 more members...                      │ │ Active: 2 · Offers: 5      │
│ └────────────────────────────────────────┘ │ Corn bulk · 800t · $210/t   │
│                                            │ [ Manage listings → ]      │
├────────────────────────────────────────────┤                             │
│ MEMBER ACTIVITY (7 days)                   │ ✦ AI INSIGHT                │
│ [Bar chart: logins, tasks, deliveries      │ "18 members haven't logged  │
│  by member tier: active / moderate / low]  │  input applications. Bulk   │
│                                            │  purchase window closes Fri."│
├────────────────────────────────────────────┴─────────────────────────────┤
│ COLLECTIVE SALES PIPELINE                                    [ + Deal ]   │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐                 │
│ │ Sourcing │ Negotiat.│ Contract │ Delivery │ Complete │                 │
│ │    2     │    1     │    1     │    3     │    12    │                 │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘                 │
├──────────────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                             │
│  [ Message members ] [ Group listing ] [ Member report ] [ Bulk invoice ] │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## KPI Cards (Cooperative-Specific)

| Card | Primary | Secondary | Drill-down |
|------|---------|-----------|------------|
| **Members active** | Active / total | New this month | `/app/crm/members?status=active` |
| **Collective volume** | Total tonnes delivered | YoY delta | Reports → member delivery |
| **Marketplace pipeline** | Total deal value | Open deal count | `/app/crm/pipeline` |
| **Deliveries on track** | % members current | Overdue count | Members filtered by delivery status |

---

## Members Needing Attention Widget

Auto-generated list; ranked by risk score.

| Signal | Weight |
|--------|--------|
| No login 14+ days | High |
| Delivery overdue | High |
| Yield >30% below co-op average | Medium |
| Incomplete crop plan | Medium |
| No marketplace activity (when peers active) | Low |

Each row: member name, farm name, primary issue, one CTA (`Contact`, `Support`, `View farm`).

Max 5 rows; cooperative admin can snooze member for 7 days.

---

## Member Activity Chart

Stacked bar or heatmap by week:
- **Active:** logged in + completed task or delivery
- **Moderate:** login only
- **Inactive:** no login

Filter by member segment (region, crop type, join year).

---

## Collective Weather Panel

Regional aggregation — not field-level:
- Count of member farms per alert type
- Link to weather map with member farm pins (anonymized clusters at low zoom)
- Broadcast alert action: "Notify all affected members"

---

## Group Listings Widget

Summary of cooperative marketplace presence:
- Active group listings with total quantity
- Pending offers count
- CTA to Marketplace group listing manager

---

## Collective Sales Pipeline

Kanban summary (Salesforce-inspired):

| Stage | Description |
|-------|-------------|
| **Sourcing** | Aggregating member commitment |
| **Negotiating** | Active buyer discussions |
| **Contract** | Signed, awaiting delivery |
| **Delivery** | Member deliveries in progress |
| **Complete** | Settled |

Click stage → CRM pipeline filtered.

---

## AI Insights (Cooperative Tone)

| Type | Example |
|------|---------|
| **Engagement** | "18 members haven't logged inputs — bulk purchase deadline Friday." |
| **Performance** | "North region yield tracking 12% above south — share practices?" |
| **Market** | "Soy prices rising — 240t unlisted. Create group listing?" |
| **Risk** | "Frost Thursday affects 45 member farms — send advisory?" |

CTAs: `Message members`, `Create listing`, `Send alert`, `View report`.

---

## Quick Actions (Cooperative Set)

| Action | Behavior |
|--------|----------|
| **Message members** | Bulk message composer with segment filter |
| **Group listing** | Marketplace group listing wizard |
| **Member report** | Generate cooperative performance report |
| **Bulk invoice** | Billing → member dues batch |

---

## Member Drill-Down (Context Preservation)

From cooperative dashboard → member profile:

```
Breadcrumb: Dashboard / Members / José M. / Farm La Esperanza

┌─────────────────────────────────────────────────────────────────┐
│ ← Back to cooperative overview                                  │
│ José M. · Member since 2021 · La Esperanza Farm                 │
├─────────────────────────────────────────────────────────────────┤
│ [Overview] [Deliveries] [Performance] [Farm data] [Messages]    │
├─────────────────────────────────────────────────────────────────┤
│ vs cooperative avg:  Yield ▼18%   Deliveries: 2 overdue         │
│ Last active: 14 days ago                                        │
│ [ Send message ]  [ View farm ]  [ Flag for visit ]             │
└─────────────────────────────────────────────────────────────────┘
```

Cooperative context bar remains visible: "Viewing as Valle Verde Cooperative."

---

## Mobile: Cooperative Home

Simplified for admin on-the-go:

```
┌─────────────────────────┐
│ Valle Verde Co-op   🔔 │
│ 312 members · 94% active│
├─────────────────────────┤
│ KPI carousel            │
├─────────────────────────┤
│ NEED ATTENTION (3)      │
│ José M. · 14d inactive  │
│ Ana R. · yield low      │
├─────────────────────────┤
│ Pipeline: $420K · 3 open│
├─────────────────────────┤
│ [Message] [Listing]     │
│ [Members] [Reports]     │
└─────────────────────────┘
```

Tab bar: Home · Members · Marketplace · Alerts · More

---

## Permissions & Visibility

| Data | Co-op admin | Member (farmer) |
|------|-------------|-----------------|
| Other member yield | Aggregated + flagged | Own only |
| Other member farm map | Anonymized cluster | Own only |
| Individual delivery status | Full | Own only |
| Bulk messaging | Yes | No |
| Group listing on behalf | Yes | Opt-in contribution |

---

## Empty & Onboarding States

### First Member Imports

```
┌─────────────────────────────────────────┐
│   Import your member roster             │
│   CSV with name, email, farm, hectares  │
│        [ Import members ]               │
│   Or invite members one by one →        │
└─────────────────────────────────────────┘
```

### Low Engagement Cooperative

Dashboard surfaces engagement campaign CTA:
"Only 40% of members active — launch onboarding campaign?"

---

## Reports Linked from Dashboard

| Widget | One-click report |
|--------|------------------|
| Collective volume | Member delivery summary |
| Members active | Engagement report |
| Pipeline | Sales pipeline export |
| Deliveries | Overdue delivery list |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Member admin weekly active | >85% |
| Attention widget → member action | >30% click-through |
| Group listing created from insight | >10% of AI market insights |
| Member engagement after bulk message | +15% logins within 7 days |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Parent: `/ui/dashboard-layout-system.md`*
