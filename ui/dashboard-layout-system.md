# Nertura — Dashboard Layout System

> Shared layout framework for all dashboard variants. A modular, widget-based system — Notion's flexibility, Stripe's visual calm, Salesforce's data density when needed.

---

## Design Intent

The dashboard is the **daily return surface**. Users open Nertura to answer one question: *"What needs my attention today?"*

Every role-specific dashboard inherits this system. Customization (Professional+) rearranges widgets; it never changes the underlying grid or component vocabulary.

---

## Layout Grid

### Web — 12-Column Grid

```
┌────────────────────────────────────────────────────────────────────────┐
│ Page header (full width, 12 cols)                                      │
├────────────────────────────────────────────────────────────────────────┤
│ KPI strip (12 cols — 4× col-3 or 6× col-2)                             │
├──────────────────────────────┬─────────────────────────────────────────┤
│ Primary column (col-8)       │ Secondary column (col-4)                │
│                              │                                         │
│ · Alert feed                 │ · Weather widget                        │
│ · Task list                  │ · AI insights                           │
│ · Activity / map             │ · Quick actions                         │
│                              │                                         │
├──────────────────────────────┴─────────────────────────────────────────┤
│ Optional full-width row (col-12) — charts, tables, map                   │
└────────────────────────────────────────────────────────────────────────┘
```

| Token | Value |
|-------|-------|
| Max content width | 1280px |
| Gutter | 24px |
| Column gap | 16px |
| Row gap | 16px |
| KPI card min-height | 96px |
| Widget border-radius | 8px |
| Page padding | 24px (desktop), 16px (tablet) |

### Mobile — Single Column Stack

```
┌─────────────────────┐
│ Greeting + weather  │  ← compact header
├─────────────────────┤
│ Critical alert (1)  │  ← only if severity ≥ high
├─────────────────────┤
│ KPI carousel (sw)   │  ← horizontal scroll, 2 visible
├─────────────────────┤
│ Today's tasks       │
├─────────────────────┤
│ AI insight card     │
├─────────────────────┤
│ Quick actions (2×2) │
└─────────────────────┘
```

---

## Page Header Pattern

### Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│  Good morning, Maria          [Farm: Green Valley ▾]  [Customize]│
│  Friday, 19 June 2026 · 3 alerts need attention                  │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Rules |
|---------|-------|
| **Greeting** | Time-aware: morning / afternoon / evening; first name |
| **Subtitle** | Actionable summary, not vanity metrics |
| **Context switcher** | Farm / org scope; persists per session |
| **Customize** | Professional+ only; enters edit mode |
| **Date** | User timezone; locale-formatted |

---

## Widget Catalog

### Tier 1 — KPI Metric Card

```
┌─────────────────────────┐
│  LABEL                  │
│  42.5                   │  ← primary value, tabular nums
│  ▲ 12% vs last season   │  ← delta, color: green/red/neutral
│  ─────────────── spark  │  ← optional 7-day sparkline
└─────────────────────────┘
```

| Property | Options |
|----------|---------|
| Size | `sm` (col-2), `md` (col-3), `lg` (col-4) |
| Click | Navigates to filtered list in source module |
| Loading | Skeleton pulse |
| Empty | "No data yet" + setup CTA |

### Tier 2 — List Widget

```
┌─────────────────────────────────────────┐
│  Widget title              View all →   │
├─────────────────────────────────────────┤
│  [icon] Primary text          2h ago    │
│         Secondary context               │
│  ─────────────────────────────────────  │
│  [icon] Primary text          5h ago    │
│         Secondary context               │
└─────────────────────────────────────────┘
```

Max 5 rows inline; "View all" deep-links to module.

### Tier 3 — Alert Feed Widget

Severity-coded left border:

| Severity | Border | Icon |
|----------|--------|------|
| Critical | Red | AlertTriangle |
| High | Orange | AlertCircle |
| Moderate | Yellow | Info |
| Low | Gray | Bell |

Each row: title, one-line description, timestamp, chevron → detail.

### Tier 4 — Weather Widget

```
┌─────────────────────────┐
│  28°C  Partly cloudy    │
│  💧 12mm  💨 15 km/h    │
│  ┌───┬───┬───┬───┬───┐  │
│  │ M │ T │ W │ T │ F │  │  ← 5-day mini
│  └───┴───┴───┴───┴───┘  │
│  ⚠ Frost risk Thu night │  ← conditional banner
└─────────────────────────┘
```

### Tier 5 — AI Insights Panel

```
┌─────────────────────────────────────────┐
│  ✦ Nertura AI                           │
├─────────────────────────────────────────┤
│  "Field 3 soil moisture is below          │
│   threshold. Irrigate 25mm today."       │
│                                          │
│  [ Approve schedule ]  [ Dismiss ]       │
├─────────────────────────────────────────┤
│  "Corn in Field 7 reaches reproductive   │
│   stage — schedule nitrogen application."│
│  [ Create task ]  [ Ask why ]            │
└─────────────────────────────────────────┘
```

Max 3 insight cards; prioritized by impact score.

### Tier 6 — Task Widget

Checkbox list for today's tasks. Inline complete for simple tasks; tap → detail for complex.

### Tier 7 — Map Widget

Mini map (col-8 or col-12) showing fields color-coded by status: green (healthy), yellow (attention), red (critical).

### Tier 8 — Chart Widget

Line, bar, or donut. Default range: last 30 days. Range selector: 7d / 30d / 90d / season.

### Tier 9 — Quick Actions

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 📷 Log   │ │ ✓ Task   │ │ 💧 Irrig │ │ 📦 Stock │
│ observation│ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

Role-filtered. Max 4 visible.

---

## Dashboard Variants Map

| Variant | Document | Primary user |
|---------|----------|--------------|
| Farmer | `/product/farmer-dashboard.md` | Owner-operator |
| Manager | Extends farmer + multi-farm | Farm manager |
| Cooperative | `/product/cooperative-dashboard.md` | Co-op admin |
| Export company | `/product/export-company-dashboard.md` | Exporter |
| Supplier | CRM + Marketplace weighted | Input supplier |
| Executive | KPI scorecards only, no field detail | VP / board viewer |

---

## Default Layouts by Role

### Farmer (Default)

| Row | Widgets |
|-----|---------|
| KPI strip | Active tasks · Weather score · Field health · Season progress |
| Main | Alert feed (col-8) · Weather (col-4) |
| Main | Today's tasks (col-8) · AI insights (col-4) |
| Full | Field status map (col-12) |

### Manager (Default)

| Row | Widgets |
|-----|---------|
| KPI strip | Farms active · Tasks overdue · Team completion % · Yield forecast |
| Main | Alert feed (col-6) · Team activity (col-6) |
| Main | Task board summary (col-8) · AI insights (col-4) |
| Full | Multi-farm map (col-12) |

### Cooperative (Default)

See `/product/cooperative-dashboard.md`.

### Exporter (Default)

See `/product/export-company-dashboard.md`.

---

## Customization Mode (Professional+)

### Edit Mode UX

1. Click **Customize** in page header
2. Widgets show drag handle + remove (×) + resize handle
3. **Widget picker** slide-out: add from catalog
4. **Save layout** / **Reset to default**
5. Layout stored per user per dashboard variant

### Constraints

| Rule | Limit |
|------|-------|
| Max widgets | 16 |
| Min KPI cards | 2 |
| Required widgets | Alert feed OR task list (cannot remove both) |
| Map widget | Max 1 per dashboard |

---

## Loading & Empty States

### First-Run Dashboard (Post-Onboarding)

Replace widgets with setup checklist:

```
┌─────────────────────────────────────────┐
│  Welcome to Nertura                     │
│  ■ Create your first field      Done    │
│  □ Add a crop plan              →       │
│  □ Log your first observation   →       │
│  □ Invite a team member         →       │
│  Progress: ████░░░░  50%                │
└─────────────────────────────────────────┘
```

Checklist dismisses when complete or after 14 days.

### Skeleton Loading

Stagger KPI cards → lists → map. Target: meaningful paint < 1.5s on 4G.

---

## Data Refresh

| Widget type | Refresh interval |
|-------------|------------------|
| KPI metrics | 5 min (or on WebSocket event) |
| Alerts | Real-time (WebSocket) |
| Tasks | Real-time |
| Weather | 15 min |
| AI insights | On login + after user action |
| Map | 5 min |
| Charts | 15 min |

Manual refresh: pull-down on mobile; subtle refresh icon on web widget hover.

---

## Responsive Widget Behavior

| Widget | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| KPI strip | 4-up row | 2×2 grid | Horizontal scroll |
| Alert feed | col-8 | full | full, max 3 items |
| Map | col-12 | col-12 | Hidden (link to Farms) |
| AI insights | col-4 | full | Single card |
| Charts | col-6 | full | Simplified spark only |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Widget order | Logical DOM order matches visual order |
| KPI values | `aria-label` includes delta direction |
| Alert severity | Not color-only; icon + text label |
| Customize mode | Keyboard-reorderable widgets |
| Focus | Visible focus ring on all interactive widgets |

---

## Component Naming (Design ↔ Eng)

| Design token | Component ID |
|--------------|--------------|
| KPI Metric Card | `Dashboard.KpiCard` |
| List Widget | `Dashboard.ListWidget` |
| Alert Feed | `Dashboard.AlertFeed` |
| Weather Widget | `Dashboard.WeatherWidget` |
| AI Insights | `Dashboard.AiInsights` |
| Task Widget | `Dashboard.TaskWidget` |
| Map Widget | `Dashboard.FieldMap` |
| Chart Widget | `Dashboard.ChartWidget` |
| Quick Actions | `Dashboard.QuickActions` |
| Page Header | `Dashboard.PageHeader` |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Role variants: `/product/farmer-dashboard.md`, `/product/cooperative-dashboard.md`, `/product/export-company-dashboard.md`*
