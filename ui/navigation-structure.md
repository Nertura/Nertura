# Nertura — Navigation Structure

> Complete navigation architecture for web and mobile. Designed for clarity at scale — inspired by Stripe's precision, Notion's contextual wayfinding, and Salesforce's role-aware IA.

---

## Navigation Design Principles

| Principle | Nertura Application |
|-----------|---------------------|
| **Persistent orientation** | User always knows: org, module, entity, action |
| **Role-adaptive** | Nav items appear based on role + tier + org type |
| **Progressive disclosure** | Primary nav = 7±2 items; secondary in tabs and overflow |
| **Keyboard-first (web)** | ⌘K search, `G then D` go-to-dashboard, arrow nav in lists |
| **Thumb-first (mobile)** | Bottom tabs, FAB for primary field action |
| **Context preservation** | Breadcrumbs + back stack; deep links restore full context |

---

## Web — Global Shell

### Shell Anatomy

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [≡] Nertura · Org ▾ · Farm ▾  │  ⌘K Search  │  🔔  👤        │
├────────────┬─────────────────────────────────────────────────────────────┤
│            │ Breadcrumb: Dashboard / Farms / Field 12                    │
│  Sidebar   ├─────────────────────────────────────────────────────────────┤
│  (240px)   │                                                             │
│            │                    Main Content Area                          │
│            │                    (max-width: 1280px, centered)            │
│            │                                                             │
│            │                                                             │
├────────────┴─────────────────────────────────────────────────────────────┤
│ AI Assistant trigger (bottom-right FAB) · Collapses to icon when panel open │
└──────────────────────────────────────────────────────────────────────────┘
```

### Top Bar Components

| Component | Behavior |
|-----------|----------|
| **Sidebar toggle** | Collapse to icon-only (64px) on desktop; hidden on tablet |
| **Org switcher** | Multi-org users (consultants, exporters); shows org name + type badge |
| **Farm context switcher** | Filters dashboard and list views; "All farms" default for managers |
| **Global search (⌘K)** | Entities, actions, help, AI quick-ask |
| **Notifications** | Badge count; dropdown preview → full center |
| **Profile menu** | Profile, preferences, language, sign out |

---

## Web — Primary Sidebar

### Default Order (All Roles)

| # | Item | Icon | Route | Badge |
|---|------|------|-------|-------|
| 1 | Dashboard | Home | `/app/dashboard` | — |
| 2 | Farms | Map | `/app/farms` | — |
| 3 | Crops | Sprout | `/app/crops` | Overdue tasks |
| 4 | Weather | Cloud | `/app/weather` | Active alerts |
| 5 | Irrigation | Droplet | `/app/irrigation` | [Pro+] |
| 6 | Inventory | Package | `/app/inventory` | Low stock |
| 7 | Marketplace | Store | `/app/marketplace` | Open offers |
| 8 | CRM | Users | `/app/crm` | [Pro+] |
| 9 | Reports | Chart | `/app/reports` | — |
| — | *divider* | | | |
| 10 | Settings | Gear | `/app/settings` | — |
| 11 | Billing | CreditCard | `/app/billing` | [Admin only] |
| 12 | Users | UserCog | `/app/users` | [Admin only] |

**Hidden items:** Shown with lock icon + upgrade CTA when tier insufficient. Never show empty slots.

### Sidebar by Organization Type

| Org Type | Emphasis | Hidden / Deprioritized |
|----------|----------|------------------------|
| **Farm** | Farms, Crops, Weather, Irrigation | CRM (until Pro) |
| **Cooperative** | Dashboard, CRM, Marketplace, Reports | Irrigation (unless shared assets) |
| **Ag company** | Farms, Crops, Reports, Users | — |
| **Supplier** | CRM, Marketplace, Inventory | Farms, Crops (collapsed group) |
| **Exporter** | Marketplace, CRM, Reports | Farms, Irrigation |

Sidebar order re-sorts automatically on first login by org type. User can pin/unpin (Notion-style) on Professional+.

---

## Web — Secondary Navigation (Tabs)

Used inside entity detail pages. Tab bar sits below breadcrumb, sticky on scroll.

### Farm Detail Tabs

`Overview` · `Fields` · `Infrastructure` · `Equipment` · `IoT` · `Team` · `History`

### Field Detail Tabs

`Overview` · `Soil` · `Season` · `Observations` · `Tasks` · `Sensors`

### Crop Plan Tabs

`Plan` · `Tasks` · `Inputs` · `Observations` · `Pests & Disease` · `Harvest` · `AI Insights`

### CRM Account Tabs

`Overview` · `Contacts` · `Interactions` · `Deals` · `Orders` · `Documents`

### Settings Tabs

`General` · `Localization` · `Security` · `Integrations` · `SSO`

---

## Web — Breadcrumb Rules

| Rule | Example |
|------|---------|
| Max 4 segments visible | `Crops / Plan: Corn 2026 / Tasks / Spray #42` |
| Truncate middle on overflow | `Farms / … / Field 12 / Soil` |
| Current page not linked | Last segment is plain text |
| Entity names over IDs | "Green Valley Farm" not `farm_8x2k` |
| Action context | `Marketplace / Orders / ORD-2026-0042` |

---

## Web — Global Search (⌘K)

### Result Categories

| Category | Examples |
|----------|----------|
| **Go to** | Dashboard, Farms, specific field |
| **Entities** | Fields, tasks, listings, accounts |
| **Actions** | "Create task", "Log observation", "New listing" |
| **Ask AI** | Natural language → opens AI panel with query |
| **Help** | Documentation snippets |

### Search Result Row

```
[icon]  Primary label                    ⌘↵
        Secondary · Module · Farm name
```

Recent searches and pinned items appear when query is empty (Notion-style).

---

## Web — Role-Based Nav Visibility

| Nav Item | Owner | Admin | Manager | Operator | Viewer | Partner |
|----------|:-----:|:-----:|:-------:|:--------:|:------:|:-------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Farms | ✓ | ✓ | ✓ | R | R | — |
| Crops | ✓ | ✓ | ✓ | ✓ | R | — |
| Weather | ✓ | ✓ | ✓ | ✓ | R | R |
| Irrigation | ✓ | ✓ | ✓ | R | R | — |
| Inventory | ✓ | ✓ | ✓ | ✓ | R | ✓ |
| Marketplace | ✓ | ✓ | ✓ | R | R | ✓ |
| CRM | ✓ | ✓ | ✓ | — | R | ✓ |
| Reports | ✓ | ✓ | ✓ | — | ✓ | R |
| Settings | ✓ | ✓ | — | — | — | — |
| Billing | ✓ | R | — | — | — | — |
| Users | ✓ | ✓ | — | — | — | — |

**R** = read-only access if granted; **—** = hidden.

---

## Mobile — Bottom Tab Bar

### Default Tabs (Farmer / Operator)

| Tab | Icon | Route | Badge |
|-----|------|-------|-------|
| Home | 🏠 | `/m/home` | — |
| Farms | 🗺 | `/m/farms` | — |
| Crops | 🌾 | `/m/crops` | Task count |
| Alerts | 🔔 | `/m/alerts` | Unread |
| More | ☰ | `/m/more` | — |

### More Menu (Sheet)

```
┌─────────────────────────────┐
│  Weather                    │
│  Irrigation                 │
│  Inventory                  │
│  Marketplace                │
│  CRM                        │
│  AI Assistant               │
│  Reports                    │
│  ─────────────────          │
│  Settings                   │
│  Sync status · 3 pending    │
└─────────────────────────────┘
```

### Mobile Tab Overrides by Role

| Role | Tab 3 replaces "Crops" | Tab 5 replaces "More" |
|------|------------------------|------------------------|
| Exporter | Marketplace | CRM |
| Supplier | Inventory | CRM |
| Cooperative admin | Members (CRM) | Reports |

---

## Mobile — Header Bar

```
┌─────────────────────────────────────────┐
│ ← Back    Screen Title        🔔  👤   │
│           Farm context ▾                │
└─────────────────────────────────────────┘
```

- **Back:** Respects navigation stack; swipe-back on iOS
- **Farm context:** Dropdown when user has multiple farms
- **No global search on mobile MVP** — added V2 in More menu

---

## Mobile — Floating Action Button (FAB)

| Context | FAB Action | Icon |
|---------|------------|------|
| Home / Farms / Crops | Quick Capture (photo observation) | Camera |
| Marketplace | New listing | Plus |
| CRM | Log interaction | Message |
| Tasks list | New task | Plus |

FAB hides when keyboard open or scrolling down; reappears on scroll up.

---

## Contextual Navigation Patterns

### List → Detail → Action (Stripe pattern)

```
List view (table/cards)
  → Row click → Detail page (tabs)
    → Primary CTA → Action (modal or inline form)
      → Success toast → Stay or go to related entity
```

### Hub → Spoke (Salesforce pattern)

Dashboard acts as hub. Every widget links to spoke (module list filtered to context).

### Sidebar + Command Palette (Notion pattern)

Power users navigate via ⌘K without touching sidebar. Sidebar remains source of truth for IA discovery.

---

## Navigation States

| State | Treatment |
|-------|-----------|
| **Active module** | Sidebar item: accent background + bold label |
| **Active tab** | Underline + primary color |
| **Disabled (tier)** | Lock icon; click → upgrade modal |
| **Disabled (role)** | Hidden entirely (not grayed out) |
| **Unread badge** | Numeric cap at 99+ |
| **Offline (mobile)** | Amber banner; nav works on cached routes |

---

## Upgrade & Empty Nav CTAs

When module locked by tier:

```
┌─────────────────────────────────┐
│  🔒 Irrigation                  │
│  Optimize water use with AI     │
│  [ Upgrade to Professional ]    │
└─────────────────────────────────┘
```

Sidebar item visible but styled as locked — drives conversion without breaking IA consistency.

---

## Keyboard Shortcuts (Web)

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Global search |
| `G then D` | Go to Dashboard |
| `G then F` | Go to Farms |
| `G then C` | Go to Crops |
| `G then M` | Go to Marketplace |
| `⌘/` | Open AI Assistant |
| `⌘.` | Toggle notification panel |
| `Esc` | Close modal / drawer / AI panel |

---

## Responsive Breakpoints

| Breakpoint | Navigation behavior |
|------------|---------------------|
| **≥1280px** | Full sidebar (240px) + expanded top bar |
| **1024–1279px** | Collapsed sidebar (64px icons) by default |
| **768–1023px** | Sidebar as overlay drawer; hamburger in top bar |
| **<768px** | Redirect to mobile app or PWA; bottom tabs |

---

## Analytics Events (Nav)

| Event | Properties |
|-------|------------|
| `nav.sidebar.click` | module, role, tier |
| `nav.search.open` | trigger (keyboard, click) |
| `nav.search.select` | result_type, query_length |
| `nav.breadcrumb.click` | segment_index |
| `nav.mobile.tab` | tab_name |
| `nav.upgrade_prompt.click` | module, tier_required |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Companion: `/wireframes/platform-sitemap.md`, `/ui/dashboard-layout-system.md`*
