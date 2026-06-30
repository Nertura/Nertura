# Nertura — Farmer Dashboard

> UX specification for the individual farmer and owner-operator dashboard. Optimized for daily field decisions, mobile parity, and minimal cognitive load.

---

## Persona Anchor

**Primary user:** Maria Santos — 45 ha, corn/soy/vegetables, smartphone-first, moderate tech comfort.

**Job to be done:** *"Tell me what to do today and warn me before something goes wrong."*

---

## Design Philosophy

| Influence | Application |
|-----------|-------------|
| **Stripe** | Clean hierarchy; one primary metric per glance; no clutter |
| **Notion** | Friendly greeting; contextual empty states with clear next steps |
| **Salesforce** | — (intentionally avoided; farmer dashboard is not a CRM) |

**Anti-patterns to avoid:** Dense tables, multi-farm complexity, pipeline charts, admin controls.

---

## Screen: Farmer Dashboard (Web)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Good morning, Maria                    Green Valley Farm ▾              │
│ Friday, 19 June · 1 alert needs you today                               │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ TODAY'S     │ │ WEATHER     │ │ FIELD       │ │ SEASON      │        │
│ │ TASKS       │ │ SCORE       │ │ HEALTH      │ │ PROGRESS    │        │
│ │ 3 due       │ │ Good ✓      │ │ 2 need you  │ │ Week 8/16   │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ⚠ ALERTS                                   │ WEATHER                     │
│ ┌────────────────────────────────────────┐ │ 28°C · Partly cloudy        │
│ │ FROST RISK Thu night · Field 2, 3      │ │ Rain 12mm expected Mon      │
│ │ Review protection options →            │ │ ┌─┬─┬─┬─┬─┐                 │
│ └────────────────────────────────────────┘ │ M T W T F                   │
│                                            │ ⚠ Frost Thu                 │
├────────────────────────────────────────────┤                             │
│ TODAY'S TASKS                    See all →│ ✦ AI INSIGHT                │
│ ☐ Spray Field 2 — fungicide      Due today │ "Soil moisture low in       │
│ ☐ Check irrigation — Field 5     Due today │  Field 5. Irrigate 20mm."   │
│ ☐ Scout Field 7 — corn           Tomorrow  │ [ Schedule ] [ Why? ]       │
├────────────────────────────────────────────┴─────────────────────────────┤
│ YOUR FIELDS                                              [Map · List]     │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │  [Satellite map: fields color-coded green/yellow/red]              │   │
│ │  Field 2 ● yellow — moisture low    Field 7 ● green — on track    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                             │
│  [ 📷 Log observation ]  [ ✓ Complete task ]  [ 🌧 Weather ]  [ 📦 Stock ]│
└──────────────────────────────────────────────────────────────────────────┘
                                        [ 🤖 Ask Nertura ]  ← AI FAB
```

---

## KPI Cards (Farmer-Specific)

| Card | Primary Value | Secondary | Click → |
|------|---------------|-----------|---------|
| **Today's tasks** | Count due today | Overdue count in red if >0 | `/app/crops/tasks?due=today` |
| **Weather score** | Good / Fair / Poor | One-line reason | `/app/weather` |
| **Field health** | "X need you" | Based on alerts + AI | `/app/farms` (filtered) |
| **Season progress** | Week N of M | Crop name | Active crop plan |

### Weather Score Logic (Surface to User)

| Score | Condition |
|-------|-----------|
| **Good ✓** | No critical/high alerts; spray window open |
| **Fair** | Moderate alert or rain expected in 48h |
| **Poor** | Critical frost, flood, or heat alert active |

---

## Alert Feed (Farmer Priority Order)

1. Critical weather (frost, hail, flood)
2. Disease detection confirmed
3. Irrigation threshold breached
4. Task overdue
5. Low inventory (reorder threshold)
6. Marketplace offer received (if seller)

Max 3 visible; expand for full list. Critical alerts use full-width banner above KPI strip on mobile.

---

## AI Insights (Farmer Tone)

Copy rules:
- Second person: "Your Field 5…"
- Action verb first: "Irrigate", "Spray", "Scout"
- Max 2 sentences
- Always one primary CTA + "Why?" secondary

Example insights:

| Priority | Insight |
|----------|---------|
| 1 | "Frost expected Thursday. Delay irrigation on Field 2 and check cover." |
| 2 | "Northern leaf blight likely in Field 7 — scout within 48 hours." |
| 3 | "Corn prices up 4% this week — good time to list harvest." [Pro+] |

---

## Field Map (Farmer)

| Color | Meaning |
|-------|---------|
| Green | No open alerts; tasks on track |
| Yellow | Moderate alert or task due within 48h |
| Red | Critical alert or overdue task |

Tap field → Field detail. No multi-select; farmer manages one farm (Starter) or few fields.

---

## Quick Actions (Farmer Set)

| Action | Route / Behavior |
|--------|------------------|
| **Log observation** | Opens observation flow with camera |
| **Complete task** | Today's task picker → quick complete |
| **Weather** | Weather dashboard |
| **Stock** | Inventory overview |

---

## Mobile: Farmer Home (`/m/home`)

```
┌─────────────────────────┐
│ Good morning, Maria  🔔 │
│ Green Valley · 28°C ☀  │
├─────────────────────────┤
│ ⚠ FROST Thu night       │  ← only if critical/high
│ Field 2, 3 · View →     │
├─────────────────────────┤
│ ← KPI swipe carousel →  │
│ [3 tasks][Good][2 fld]  │
├─────────────────────────┤
│ TODAY                   │
│ ☐ Spray Field 2         │
│ ☐ Check irrigation F5   │
├─────────────────────────┤
│ ✦ Irrigate Field 5 today│
│   [ Schedule ]          │
├─────────────────────────┤
│ [📷 Capture] [✓ Task]   │
│ [🌧 Weather] [📦 Stock] │
└─────────────────────────┘
      [🏠][🗺][🌾][🔔][☰]
                    [FAB 📷]
```

**FAB priority:** Quick Capture (photo observation) — largest touch target, bottom-right.

---

## Farmer vs Manager Differences

| Element | Farmer | Manager |
|---------|--------|---------|
| Farm switcher | Hidden (single farm) or 2–3 farms | Multi-farm required |
| Team activity | Hidden | Visible widget |
| Yield forecast KPI | Hidden (Business+) | Visible |
| Task assignment | Self only | Assign to others |
| Map | Single farm | Multi-farm overview |
| Greeting subtitle | Personal tasks | Team overdue count |

---

## Empty States

### No Fields Yet

```
┌─────────────────────────────────────────┐
│         [Field illustration]            │
│   Map your first field to get started   │
│   Draw boundaries or walk the perimeter │
│        [ Add field ]                    │
└─────────────────────────────────────────┘
```

### No Active Season

```
┌─────────────────────────────────────────┐
│   Plan your season                      │
│   Add a crop plan to see tasks,         │
│   weather context, and AI insights.     │
│        [ Create crop plan ]             │
└─────────────────────────────────────────┘
```

### All Clear (No Alerts, No Tasks)

```
┌─────────────────────────────────────────┐
│   ✓ You're all caught up                │
│   Next task: Scout Field 7 — in 3 days  │
│   Weather looks good through Monday.    │
└─────────────────────────────────────────┘
```

Positive framing — never an empty void.

---

## Tier Variations

| Feature | Starter | Professional |
|---------|---------|--------------|
| KPI cards | 4 fixed | 4 customizable |
| AI insights | 1/day (weather only) | 3/day (full) |
| Field map | List only | Map + list |
| Marketplace widget | Hidden | "Prices up" insight |
| Customize layout | No | Yes |

---

## Interaction Specifications

| Interaction | Behavior |
|-------------|----------|
| Task checkbox | Optimistic complete; undo toast 5s |
| Alert row tap | Navigate to alert detail |
| Field map tap | Field detail → Season tab |
| AI CTA "Schedule" | Opens irrigation schedule pre-filled |
| AI CTA "Why?" | Opens AI panel with explanation thread |
| Pull to refresh | Mobile only; re-fetch all widgets |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Dashboard → action conversion | >40% sessions include module navigation |
| Task complete from dashboard | >25% of daily task completions |
| AI insight CTA click rate | >15% |
| Time to first action | <10 seconds from load |
| Mobile home DAU / MAU | >80% |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Parent: `/ui/dashboard-layout-system.md`*
