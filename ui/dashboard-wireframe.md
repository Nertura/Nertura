# Nertura — Operating System Dashboard Wireframe

> Complete product UX specification for the Nertura AgOS application shell (`/app/*`). Four role variants · fourteen modules · three breakpoints.

**Status:** Wireframe specification · No application code  
**Companion:** `/ui/navigation-structure.md`, `/ui/dashboard-layout-system.md`, `/docs/design-system.md`  
**Roles:** Farmer · Cooperative · Agronomist · Enterprise

---

## Document Conventions

### Screen spec template

Every screen below includes:

| Field | Definition |
|-------|------------|
| **Goal** | Job-to-be-done for this screen |
| **Layout** | ASCII wireframe + grid zones |
| **Widgets** | Components with data and behavior |
| **Actions** | Primary, secondary, bulk, and keyboard |
| **User flow** | Entry → interaction → exit paths |

### Breakpoints

| Name | Width | Shell behavior |
|------|-------|----------------|
| **Desktop** | ≥1280px | Full sidebar 240px · AI panel docked · max content 1280px |
| **Tablet** | 768–1279px | Collapsed sidebar 64px or drawer · AI panel overlay |
| **Mobile** | <768px | Bottom tabs · sheets · FAB · PWA / native |

### Role personas (anchors)

| Role | Persona | Primary question |
|------|---------|------------------|
| **Farmer** | Maria Santos — 45 ha owner-operator | *What do I do in the field today?* |
| **Cooperative** | Elena Vasquez — 320-member co-op admin | *Which members need support and how is the collective performing?* |
| **Agronomist** | Dr. Kenji Tanaka — licensed advisor, 40 client farms | *Which diagnoses need validation and where is crop stress emerging?* |
| **Enterprise** | Priya Sharma — VP Ops, 12 farms, 200 users | *Is the organization on track and compliant across all sites?* |

### Role × module access matrix

| Module | Farmer | Cooperative | Agronomist | Enterprise |
|--------|:------:|:-----------:|:----------:|:----------:|
| Dashboard home | ✓ | ✓ | ✓ | ✓ |
| AI Assistant | ✓ | ✓ | ✓ | ✓ |
| Field management | ✓ own | ✓ members | ✓ assigned | ✓ all org |
| Crop monitoring | ✓ | ✓ aggregate | ✓ assigned | ✓ all org |
| Disease detection | ✓ submit | ○ review queue | ✓ validate | ○ oversight |
| Marketplace | ✓ | ✓ group | ○ read | ✓ |
| Orders | ✓ | ✓ | — | ✓ |
| Analytics | ○ basic | ✓ | ✓ | ✓ full |
| Reports | ○ standard | ✓ | ✓ | ✓ custom |
| WhatsApp center | ✓ own | ✓ broadcast | ✓ assigned | ✓ org admin |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Tasks | ✓ | ✓ assign | ✓ assign | ✓ |
| Settings | ✓ org | ✓ org | ✓ profile | ✓ org + SSO |

**Legend:** ✓ full · ○ limited · — hidden

---

# Part 1 — Navigation Structure

## Screen: Global Application Shell

### Goal

Persistent orientation across all modules — user always knows **org, farm scope, module, and available actions**.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [≡] Nertura · Org ▾ · Farm ▾          ⌘K Search          🔔  💬  👤   │
├────────────┬─────────────────────────────────────────────────────────────┤
│ SIDEBAR    │ Breadcrumb: Module / Entity / Tab                           │
│ 240px      ├─────────────────────────────────────────────────────────────┤
│            │                                                             │
│ Dashboard  │                  MAIN CONTENT                               │
│ Farms      │                  (module screen)                            │
│ Crops      │                                                             │
│ ...        │                                                             │
│ ─────      │                                                             │
│ Settings   │                                          [AI FAB]           │
└────────────┴─────────────────────────────────────────────────────────────┘
```

**Tablet**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [≡] Nertura · Farm ▾                              ⌘K    🔔  👤            │
├──────────────────────────────────────────────────────────────────────────┤
│ Breadcrumb                                                               │
├──────────────────────────────────────────────────────────────────────────┤
│                         MAIN CONTENT (full width)                        │
│                                                         [AI FAB]         │
└──────────────────────────────────────────────────────────────────────────┘
Sidebar: overlay drawer from hamburger; icon rail optional at 1024px+.
```

**Mobile**

```
┌─────────────────────────┐
│ ← Title      🔔  👤     │
│ Farm context ▾          │
├─────────────────────────┤
│                         │
│   MAIN CONTENT          │
│                         │
├─────────────────────────┤
│ Home Farms Crops Alert More │
└─────────────────────────┘
              [ FAB ]
```

### Widgets (shell chrome)

| Widget | All roles | Behavior |
|--------|-----------|----------|
| **Org switcher** | Multi-org users | Dropdown; org name + type badge |
| **Farm / scope switcher** | Farmer, Agronomist, Enterprise | Single farm · All farms · Region |
| **⌘K search** | Desktop, tablet | Entities, actions, Ask AI |
| **Notifications bell** | All | Badge count; dropdown preview |
| **WhatsApp indicator** | If connected | 💬 badge → WhatsApp center |
| **Profile menu** | All | Profile · Preferences · Sign out |
| **AI FAB** | All (tier-gated AI) | Opens assistant panel; ⌘/ shortcut |
| **Breadcrumb** | Desktop, tablet | Max 4 segments |

### Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Toggle sidebar | ≡ or `[` | Expand/collapse/drawer |
| Global search | ⌘K | Command palette |
| Open notifications | Bell or ⌘. | Dropdown or full center |
| Open AI | FAB or ⌘/ | Assistant panel |
| Switch org | Org ▾ | Reload nav + dashboard variant |
| Switch farm scope | Farm ▾ | Filter all scoped views |

### User flow

```
Login → role + org resolved → default landing (dashboard variant)
  → sidebar module click → module list/detail
  → ⌘K → jump anywhere
  → entity row → detail tabs
  → AI FAB → panel (context preserved)
  → notification → deep link to entity
```

---

## Role-Specific Sidebar Order

### Farmer

| # | Item | Route | Badge |
|---|------|-------|-------|
| 1 | Dashboard | `/app/dashboard` | — |
| 2 | Farms | `/app/farms` | — |
| 3 | Crops | `/app/crops` | Overdue tasks |
| 4 | Disease | `/app/crops/disease` | Pending results |
| 5 | Weather | `/app/weather` | Active alerts |
| 6 | Marketplace | `/app/marketplace` | Open offers |
| 7 | Orders | `/app/marketplace/orders` | In transit |
| 8 | Tasks | `/app/crops/tasks` | Due today |
| 9 | WhatsApp | `/app/whatsapp` | Unread |
| — | *divider* | | |
| 10 | Analytics | `/app/analytics` | [Pro+] |
| 11 | Reports | `/app/reports` | — |
| 12 | Settings | `/app/settings` | — |

Irrigation, Inventory, CRM: under **More** group or visible when tier unlocks.

### Cooperative

| # | Item | Route | Badge |
|---|------|-------|-------|
| 1 | Dashboard | `/app/dashboard` | — |
| 2 | Members | `/app/crm/members` | At-risk count |
| 3 | Marketplace | `/app/marketplace` | Open deals |
| 4 | Orders | `/app/marketplace/orders` | Overdue delivery |
| 5 | Analytics | `/app/analytics` | — |
| 6 | Reports | `/app/reports` | — |
| 7 | Tasks | `/app/crops/tasks` | Team overdue |
| 8 | WhatsApp | `/app/whatsapp` | Broadcast queue |
| 9 | CRM | `/app/crm` | Pipeline |
| — | *divider* | | |
| 10 | Farms | `/app/farms` | Member farms map |
| 11 | Settings | `/app/settings` | — |
| 12 | Billing | `/app/billing` | [Admin] |

### Agronomist

| # | Item | Route | Badge |
|---|------|-------|-------|
| 1 | Dashboard | `/app/dashboard` | — |
| 2 | Review queue | `/app/disease/review` | Pending validation |
| 3 | Assigned farms | `/app/farms` | Stress alerts |
| 4 | Crop monitoring | `/app/crops` | Observations new |
| 5 | Disease | `/app/crops/disease` | All cases |
| 6 | Tasks | `/app/crops/tasks` | Assigned to me |
| 7 | Analytics | `/app/analytics` | — |
| 8 | Reports | `/app/reports` | — |
| 9 | WhatsApp | `/app/whatsapp` | Client messages |
| — | *divider* | | |
| 10 | AI Assistant | `/app/ai` | — |
| 11 | Settings | `/app/settings` | — |

No Marketplace write, Orders, Billing unless dual-role.

### Enterprise

| # | Item | Route | Badge |
|---|------|-------|-------|
| 1 | Dashboard | `/app/dashboard` | — |
| 2 | Analytics | `/app/analytics` | — |
| 3 | Reports | `/app/reports` | Scheduled |
| 4 | Farms | `/app/farms` | All regions |
| 5 | Crops | `/app/crops` | — |
| 6 | Marketplace | `/app/marketplace` | — |
| 7 | Orders | `/app/marketplace/orders` | — |
| 8 | CRM | `/app/crm` | — |
| 9 | Tasks | `/app/crops/tasks` | Org overdue |
| 10 | WhatsApp | `/app/whatsapp` | Org volume |
| — | *divider* | | |
| 11 | Users | `/app/users` | — |
| 12 | Settings | `/app/settings` | — |
| 13 | Billing | `/app/billing` | — |
| 14 | Audit log | `/app/settings/audit` | [Enterprise] |

---

## Mobile Bottom Tabs by Role

| Tab | Farmer | Cooperative | Agronomist | Enterprise |
|-----|--------|-------------|------------|------------|
| 1 | Home | Home | Home | Home |
| 2 | Farms | Members | Farms | Analytics |
| 3 | Crops | Marketplace | Review | Farms |
| 4 | Alerts | Alerts | Alerts | Alerts |
| 5 | More | More | More | More |

**More sheet** includes overflow modules per role (see `/ui/navigation-structure.md`).

---

# Part 2 — Dashboard Home

## Screen: Dashboard Home — Farmer

**Route:** `/app/dashboard` · Mobile: `/m/home`

### Goal

Answer *"What needs my attention today?"* — tasks, alerts, field health, one AI insight.

### Layout

**Desktop (12-col)**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Good morning, Maria · Green Valley ▾                    [Customize]      │
│ Friday, 19 June · 1 alert needs you                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ [KPI: Tasks] [KPI: Weather] [KPI: Field health] [KPI: Season progress]   │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Alert feed (col-8)                         │ Weather (col-4)             │
├────────────────────────────────────────────┤ AI insights (col-4)         │
│ Today's tasks (col-8)                      │ Quick actions (col-4)       │
├────────────────────────────────────────────┴─────────────────────────────┤
│ Field status map (col-12)                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** KPI 2×2 · Alerts + tasks stacked · Map full width below · Weather + AI side-by-side.

**Mobile:** Critical alert banner → KPI carousel (2 visible) → Tasks → AI card (1) → Quick actions 2×2 → Map link card.

### Widgets

| Widget | Content |
|--------|---------|
| **Page header** | Time greeting · farm switcher · actionable subtitle |
| **KPI: Today's tasks** | Count due · overdue in red |
| **KPI: Weather score** | Good / Fair / Poor + reason |
| **KPI: Field health** | "2 need you" from alerts + AI |
| **KPI: Season progress** | Week N/M · active crop |
| **Alert feed** | Max 5; severity left border |
| **Weather** | Current + 5-day + frost banner |
| **Today's tasks** | Checkbox list; max 5 |
| **AI insights** | Max 3 cards; action + Why? |
| **Quick actions** | Log observation · New task · Weather · Stock |
| **Field map** | Polygons color-coded by status |

### Actions

| Action | Result |
|--------|--------|
| Complete task inline | Sync · toast |
| Alert row click | Alert detail |
| AI Approve / Schedule | Confirm modal → task created |
| Quick capture | `/m/capture` or observation modal |
| Customize [Pro+] | Widget edit mode |
| KPI click | Filtered module deep link |

### User flow

```
Open app → dashboard loads scoped to farm
  → critical alert? → banner → alert detail → action (task / dismiss)
  → scan tasks → complete or tap → task detail
  → AI insight → approve → irrigation scheduled
  → map field tap → field detail
  → FAB → AI panel with field context
```

---

## Screen: Dashboard Home — Cooperative

**Route:** `/app/dashboard` (cooperative variant)

### Goal

*Which members need support and how is the collective performing?*

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Cooperative overview · Valle Verde              [Season: 2026 Spring ▾]  │
│ 312 active members · 94% engaged this week                               │
├──────────────────────────────────────────────────────────────────────────┤
│ [Members active] [Collective volume] [Pipeline $] [Deliveries on track]  │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Members needing attention (col-8)          │ Collective weather (col-4)  │
├────────────────────────────────────────────┤ Group listings (col-4)      │
│ Member activity chart (col-8)              │ AI insight (col-4)          │
├────────────────────────────────────────────┴─────────────────────────────┤
│ Collective sales pipeline (col-12)                                       │
├──────────────────────────────────────────────────────────────────────────┤
│ Quick actions: Message members · Group listing · Report · Bulk invoice   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** KPI 2×2 · Members list full width · Pipeline horizontal scroll · Charts simplified.

**Mobile:** KPI carousel → Members at-risk list (3) → Pipeline summary card → WhatsApp broadcast CTA.

### Widgets

| Widget | Content |
|--------|---------|
| **KPI: Members active** | 312/320 · ▲ new |
| **KPI: Collective volume** | Tonnes · YoY delta |
| **KPI: Marketplace pipeline** | $ value · deal count |
| **KPI: Deliveries on track** | % · overdue count |
| **Members needing attention** | Risk-ranked list; Contact / Support CTAs |
| **Collective weather** | Regional alert counts |
| **Member activity** | 7-day bar chart by engagement tier |
| **Group listings** | Active bulk listings summary |
| **Sales pipeline** | Kanban counts by stage |
| **AI insight** | Co-op-level recommendation |

### Actions

| Action | Result |
|--------|--------|
| Contact member | CRM interaction composer |
| Support member | Assign task to field officer |
| Broadcast weather alert | WhatsApp center pre-filled |
| + Deal | CRM pipeline new deal |
| Group listing | Marketplace group listing wizard |

### User flow

```
Login → cooperative dashboard
  → member at-risk row → member profile → message / assign task
  → pipeline card → deal detail → update stage
  → frost alert → broadcast wizard → WhatsApp to affected members
  → AI insight → bulk input purchase reminder → message template
```

---

## Screen: Dashboard Home — Agronomist

**Route:** `/app/dashboard` (agronomist variant)

### Goal

*Which diagnoses need my validation and where is crop stress emerging across client farms?*

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Good afternoon, Kenji · 40 assigned farms · 6 pending reviews            │
├──────────────────────────────────────────────────────────────────────────┤
│ [Review queue] [High confidence AI] [Stress alerts] [Visits this week]   │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Validation queue (col-8)                   │ Confidence breakdown (col-4)│
├────────────────────────────────────────────┤ Today's visits (col-4)      │
│ Stress map — assigned farms (col-8)        │ AI co-pilot (col-4)         │
├────────────────────────────────────────────┴─────────────────────────────┤
│ Recent observations feed (col-12)                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** Queue full width · Map below · Stats 2-col.

**Mobile:** Pending review count banner → Queue cards (swipe validate/reject) → Map link → Observation feed.

### Widgets

| Widget | Content |
|--------|---------|
| **KPI: Review queue** | Pending expert validation count |
| **KPI: High-confidence AI** | Auto-approved last 7d (read-only) |
| **KPI: Stress alerts** | Fields flagged by AI + sensors |
| **KPI: Visits scheduled** | This week field visits |
| **Validation queue** | Photo · AI diagnosis · confidence · farm · crop |
| **Confidence breakdown** | Donut: high / medium / low / overridden |
| **Stress map** | Assigned farms only; heat by NDVI/stress score |
| **AI co-pilot** | Suggested priorities for the day |
| **Observations feed** | Latest scout photos across clients |

### Actions

| Action | Result |
|--------|--------|
| Validate diagnosis | Confirm AI · add expert note · notify farmer |
| Override diagnosis | Correct label · retrain signal · notify farmer |
| Request more photos | Task to farmer + WhatsApp template |
| Schedule visit | Task + calendar |
| Open in AI | Full context chat with observation loaded |

### User flow

```
Login → review queue count visible
  → queue item → side-by-side photo + AI result
  → validate → farmer notified · case closed
  → override → reason required → learning feedback recorded
  → stress map field tap → field detail → observation history
  → AI co-pilot "Prioritize Field 12" → navigate to case
```

---

## Screen: Dashboard Home — Enterprise

**Route:** `/app/dashboard` (enterprise variant)

### Goal

*Is the organization on track, compliant, and performing across all sites?*

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Organization overview · AgriCorp Global        [Region: All ▾] [Q2 2026] │
│ 12 farms · 4 regions · 198 active users                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ [Revenue forecast] [Yield vs plan] [Ops health] [Compliance score]       │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Executive KPI chart (col-8)                │ Risk register (col-4)       │
├────────────────────────────────────────────┤ AI executive brief (col-4)  │
│ Farm performance table (col-8)             │ System status (col-4)       │
├────────────────────────────────────────────┴─────────────────────────────┤
│ Orders & marketplace volume (col-12)                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** KPI 2×2 · Table horizontal scroll · Charts stacked.

**Mobile:** KPI carousel → Risk register (3 items) → Farm table top 5 → Link to full analytics.

### Widgets

| Widget | Content |
|--------|---------|
| **KPI: Revenue forecast** | Pipeline + harvest revenue |
| **KPI: Yield vs plan** | % deviation org-wide |
| **KPI: Ops health** | Tasks overdue · alerts open |
| **KPI: Compliance score** | KVKK/GDPR · audit items |
| **Executive chart** | Multi-farm trend · toggle metric |
| **Risk register** | Top operational risks ranked |
| **Farm performance table** | Farm · region · yield · health · manager |
| **AI executive brief** | Weekly narrative summary |
| **System status** | API · integrations · WhatsApp uptime |
| **Commerce strip** | Order volume · marketplace GMV |

### Actions

| Action | Result |
|--------|--------|
| Region filter | Scope all widgets |
| Farm row click | Farm dashboard (manager view) |
| Export board pack | PDF report generation |
| Risk item click | Detail + assign owner |
| Drill to analytics | Full analytics module |

### User flow

```
Login → executive dashboard
  → yield KPI amber → farm table sort by deviation
  → farm row → farm detail (read-only or impersonate manager [admin])
  → compliance score → audit log filtered
  → AI brief → expand → share link to leadership
  → export → scheduled report to email
```

---

# Part 3 — AI Assistant Panel

## Screen: AI Assistant — Floating Panel

**Route:** Persistent overlay on all `/app/*` · Entry: FAB, ⌘/

### Goal

Context-aware intelligence on any screen — ask, act, and approve without losing place.

### Layout

**Desktop (400px docked right)**

```
┌─────────────────────────────────────┐
│ ✦ Nertura AI              ─  □  ✕  │
│ Context: Field 7 · Corn 2026        │
├─────────────────────────────────────┤
│ [Conversation thread]               │
│ User bubble                         │
│ AI bubble + sources + confidence    │
│ [ Action card: Confirm task ]       │
│ 👍 👎                               │
├─────────────────────────────────────┤
│ Suggested: [Frost?] [Tasks today]   │
├─────────────────────────────────────┤
│ Ask anything...              🎤  ➤  │
│ Credits: 847 remaining              │
└─────────────────────────────────────┘
```

**Tablet:** 360px overlay; content reflows to col-8 + panel col-4 or full overlay.

**Mobile:** 85vh bottom sheet; expand to full screen.

### Widgets

| Widget | Behavior |
|--------|----------|
| **Context bar** | Auto from current route entity |
| **Message thread** | User / AI bubbles; markdown in full mode |
| **Action card** | Inline Confirm · Edit · Dismiss |
| **Source chips** | Weather · Field · Crop plan — tappable |
| **Confidence label** | High / Medium / Low |
| **Suggested prompts** | Role-aware chips |
| **Credit meter** | Remaining credits; upgrade link |
| **Feedback** | Thumbs · optional correction |

### Actions

| Action | Result |
|--------|--------|
| Send message | Brain request · streaming response |
| Confirm action | Execute task / schedule / order draft |
| Expand □ | Navigate to `/app/ai` full page |
| Minimize ─ | Collapse to FAB |
| Attach photo | Vision / disease flow |
| Voice 🎤 [V2] | Transcribe → send |

### User flow

```
Any screen → FAB → panel opens with context
  → type question → AI responds with sources
  → action card → Confirm → task created → toast
  → attach photo → disease sub-flow → result in thread
  → expand → full-page chat history preserved
  → Esc → panel closes · context retained for reopen
```

### Role variants

| Role | Suggested prompts | Special |
|------|-------------------|---------|
| Farmer | Frost risk · Spray today · Stock levels | Photo diagnosis |
| Cooperative | Member summary · Bulk deal · Broadcast | Aggregate queries |
| Agronomist | Similar cases · Treatment protocol · Validate | Load observation context |
| Enterprise | Org yield · Compliance · Region compare | Read-only org data enforced |

---

## Screen: AI Assistant — Full Page

**Route:** `/app/ai`

### Goal

Extended analysis, report generation, and conversation history.

### Layout

**Desktop**

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Convo    │  ✦ Nertura AI                         [ New chat ]          │
│ list     ├──────────────────────────────────────────────────────────────┤
│ 280px    │         Thread max 720px centered                            │
│          │         + action cards + tables                              │
│          ├──────────────────────────────────────────────────────────────┤
│          │ Ask anything...                                    🎤  ➤     │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**Tablet:** Convo list as drawer · Thread full width.

**Mobile:** `/m/more/ai` — convo list ↔ thread navigation stack.

### Widgets

Conversation list grouped by Today / Yesterday / Week · Search · New chat · Thread with markdown · Export conversation [Pro+].

### Actions

New chat · Rename · Delete · Export PDF · Share link [Enterprise team].

### User flow

Panel expand → full page → pick past conversation → continue → export report to Reports module.

---

# Part 4 — Field Management

## Screen: Farm & Field List

**Route:** `/app/farms`

### Goal

See all farms and fields — status at a glance, navigate to parcel detail.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Farms · Green Valley org                    [ + Farm ]  [ Map · List ]   │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │  MAP: all fields color-coded · cluster at low zoom [Enterprise]     │   │
│ └────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ Farm cards or table: name · area · field count · health · last activity  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** Map 60vh · List below · Toggle map/list.

**Mobile:** `/m/farms` — Map thumbnail → full screen map · List cards · FAB add observation.

### Widgets

Map widget · Farm card grid · Filters: status · crop · region · Search · View toggle.

### Actions

+ Farm · Draw field · Import boundary · Filter · Field click → detail.

### User flow

Dashboard map widget → farms → field polygon tap → field detail overview tab.

### Role variants

| Role | Scope | Extra |
|------|-------|-------|
| Farmer | Own farms | Draw field wizard |
| Cooperative | Member farms read | Member name on card |
| Agronomist | Assigned only | Stress badge |
| Enterprise | All org farms | Region filter · bulk export |

---

## Screen: Field Detail

**Route:** `/app/farms/:farmId/fields/:fieldId`

### Goal

Single parcel system of record — boundary, soil, season, observations, tasks, sensors.

### Layout

**Desktop — tabs below breadcrumb**

```
Overview | Soil | Season | Observations | Tasks | Sensors
─────────────────────────────────────────────────────────────
┌──────────────────────────────┬──────────────────────────────┐
│ Field map + boundary         │ KPI: area · crop · stage     │
│                              │ Status · last scout          │
├──────────────────────────────┴──────────────────────────────┤
│ Active season summary + recent observations list             │
└──────────────────────────────────────────────────────────────┘
```

**Tablet:** Tabs scroll horizontal · Map stacked above KPIs.

**Mobile:** `/m/farms/:farmId/fields/:fieldId` — Header · Status pill · Tab sheet · FAB observe.

### Widgets

Boundary map · Season card · Observation list · Task snippet · Sensor sparklines [Pro+] · AI field summary card.

### Actions

Edit boundary · Log observation · Create task · Ask AI about field · View disease history.

### User flow

Field list → field detail → Observations tab → photo → disease result → validate [agronomist] → task created.

---

# Part 5 — Crop Monitoring

## Screen: Crop Season Overview

**Route:** `/app/crops`

### Goal

Track active crop plans, growth stages, and season progress across fields.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Crops · Spring 2026                         [ + Crop plan ]  [ Gantt ]   │
├──────────────────────────────────────────────────────────────────────────┤
│ Season Gantt / timeline — fields × growth stages                         │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Active plans list (col-8)                  │ Stage distribution (col-4)  │
│                                            │ Input schedule (col-4)      │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Tablet:** Gantt horizontal scroll · Plans list full width.

**Mobile:** `/m/crops` — Plan cards · Stage progress bar · Tasks due chip.

### Widgets

Gantt chart · Plan cards: crop · field · stage · % complete · Input calendar · Pest/disease indicator dot.

### Actions

+ Crop plan wizard · Filter crop type · Row → plan detail · Global task board link.

### User flow

Dashboard season KPI → crops → plan detail → tasks tab → complete spray task.

### Role variants

| Role | View |
|------|------|
| Farmer | Own plans |
| Cooperative | Aggregate member plans · filter by member |
| Agronomist | Assigned farms · stage anomaly highlights |
| Enterprise | All regions · compare yield stage across farms |

---

## Screen: Crop Plan Detail

**Route:** `/app/crops/plans/:planId`

### Goal

Manage one season on one field — plan, tasks, inputs, observations, harvest.

### Layout

Tabs: `Plan` · `Tasks` · `Inputs` · `Observations` · `Pests & Disease` · `Harvest` · `AI Insights`

**Desktop Plan tab**

```
┌──────────────────────────────┬──────────────────────────────┐
│ Growth stage tracker         │ Yield forecast [Business+]   │
│ Sowing → ... → Harvest       │ AI recommendation panel      │
├──────────────────────────────┴──────────────────────────────┤
│ Input application timeline                                   │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** Tab bar in sheet · Swipe between tabs · Stage tracker vertical.

### Widgets

Stage stepper · Input timeline · Observation gallery · Disease log · AI insights · Harvest record form.

### Actions

Advance stage · Schedule input · Log observation · Open disease · Generate season report.

### User flow

Crop list → plan → Pests tab → prior detections → new observation → AI diagnosis.

---

# Part 6 — Disease Detection

## Screen: Disease Detection Hub

**Route:** `/app/crops/disease` · Agronomist: `/app/disease/review`

### Goal

Submit photos for AI diagnosis, track case history, and validate results [agronomist].

### Layout

**Desktop — Farmer**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Disease detection                           [ 📷 New diagnosis ]         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐  ← recent cases cards                   │
│ │ Photo  │ │ Photo  │ │ Photo  │  crop · field · result · date            │
│ └────────┘ └────────┘ └────────┘                                         │
├──────────────────────────────────────────────────────────────────────────┤
│ Cases table: status · crop · confidence · expert status · actions        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Desktop — Agronomist review queue**

```
┌──────────────────────────────┬──────────────────────────────────────────────┐
│ Queue list                   │  Review panel                                │
│ · Case #142 · Medium conf    │  [Photo]  |  AI: Northern leaf blight 78%   │
│ · Case #141 · Low conf       │  Expert: [ Confirm ▾ ] [ Override ]         │
│                              │  Notes · Treatment suggestion · Notify      │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

**Tablet:** Queue stacked above review · Swipe between cases.

**Mobile:** `/m/capture` camera-first → `/m/capture/result` overlay · History in Crops → Disease.

### Widgets

Case cards · Status badges: Pending · AI complete · Expert validated · Overridden · Photo gallery · Confidence meter · Treatment recommendation card · Similar cases [Agronomist].

### Actions

New diagnosis (camera/upload) · Confirm result · Override · Request expert [Pro+] · Create treatment task · Share to agronomist · Export case PDF.

### User flow

```
Farmer: FAB capture → select field + crop → photo → analyzing skeleton
  → result overlay on photo (heatmap optional) → confidence + treatment
  → [Create task] [Ask AI] [Request expert review]
  → agronomist notified if low confidence or user request

Agronomist: dashboard queue → case → validate → farmer WhatsApp + in-app notification

Enterprise: oversight table → filter by farm → audit export only
```

---

## Screen: Disease Result (Inline)

**Route:** `/app/crops/observations/:obsId` or mobile `/m/capture/result`

### Goal

Present diagnosis with explainability — user trusts result enough to act.

### Layout

```
┌─────────────────────────────────────────┐
│ [←] Diagnosis result                      │
├─────────────────────────────────────────┤
│  [Photo with optional highlight regions]  │
│  Northern leaf blight — 78% confidence    │
│  Sources: visual model · similar cases    │
├─────────────────────────────────────────┤
│  Recommended actions                      │
│  · Scout adjacent rows in 48h           │
│  · Consider fungicide X — spray window Fri│
├─────────────────────────────────────────┤
│  [Create task] [Ask AI] [Expert review]   │
│  👍 Accurate  👎 Wrong                    │
└─────────────────────────────────────────┘
```

### Widgets

Annotated photo · Primary diagnosis · Differential list [expand] · Confidence · Sources · Action list · Feedback.

### Actions

Create task · Schedule spray · Request expert · Correct label (feedback) · Save to field history.

### User flow

Capture → result → create task → tasks module · or expert review → agronomist queue.

---

# Part 7 — Marketplace

## Screen: Marketplace Browse

**Route:** `/app/marketplace`

### Goal

Discover listings and requirements — trade with operational context attached.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Marketplace                    [ Search... ]        [ + Create listing ]   │
│ [All] [Grain] [Produce] [Inputs] [Export-ready]    Sort: Recent ▾         │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Listing cards grid (col-8)                 │ Buyer requirements (col-4)  │
│                                            │ Your offers (col-4)         │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Tablet:** Filters pill row · Single column cards · Sidebar stacks below.

**Mobile:** `/m/marketplace` — Search · Filter sheet · Card feed · FAB new listing.

### Widgets

Filter pills · Listing card: photo · crop · qty · price · location · verified badge · Requirements feed · My offers summary.

### Actions

Search · Filter · Create listing · Make offer · Save listing · Share.

### User flow

Dashboard → marketplace → listing detail → make offer → offer thread → order created.

### Role variants

| Role | Capabilities |
|------|--------------|
| Farmer | Create · offer · [Pro+] |
| Cooperative | Group listing · aggregate member supply |
| Agronomist | Browse only (reference prices) |
| Enterprise | Full · priority placement · bulk |

---

## Screen: Listing Detail

**Route:** `/app/marketplace/listings/:listingId`

### Goal

Evaluate listing — quality context, traceability, negotiate.

### Layout

Gallery · Title · Price · Qty · Seller info · Traceability panel (field origin, harvest date) · Map · [Make offer] [Message].

**Mobile:** Full-width gallery swipe · Sticky bottom bar Make offer.

### Widgets

Photo gallery · Traceability card · Seller rating · Offer history · AI fair price hint [Business+].

### Actions

Make offer · Message seller · Report listing · Add to watchlist.

### User flow

Browse → listing → offer modal → submit → `/app/marketplace/offers/:id` negotiation.

---

# Part 8 — Orders

## Screen: Orders List

**Route:** `/app/marketplace/orders`

### Goal

Track order lifecycle — fulfillment, delivery, documentation.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Orders · 12 active                           [ Status ▾ ] [ Export CSV ] │
├──────────────────────────────────────────────────────────────────────────┤
│ Table: ID · Counterparty · Crop · Qty · Status · Delivery · Actions      │
│ OR kanban: Draft · Confirmed · In transit · Delivered · Disputed         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** Table horizontal scroll · Kanban toggle.

**Mobile:** Order cards · Status filter chips · Tap → detail.

### Widgets

Status filter · Order table/kanban · Status badges · Delivery date · Document attachments indicator.

### Actions

View detail · Update status · Upload document · Message counterparty · Export · Dispute [Business+].

### User flow

Offer accepted → order auto-created → orders list → detail → mark delivered → invoice in billing.

### Role variants

| Role | View |
|------|------|
| Farmer | Own buy/sell |
| Cooperative | Member orders rollup · bulk delivery |
| Enterprise | All org orders · ERP export |

---

## Screen: Order Detail

**Route:** `/app/marketplace/orders/:orderId`

### Goal

Single order system of record — timeline, docs, compliance.

### Layout

Header: ORD-2026-0042 · Status pill · Timeline vertical · Parties · Line items · Documents · Compliance checklist [Exporter/Enterprise] · Activity log.

**Mobile:** Timeline accordion · Sticky action: Confirm delivery.

### Widgets

Status timeline · Document upload · Traceability link · Messaging thread snippet · AI summary of obligations.

### Actions

Advance status · Upload COA · Generate packing list · Message · Print · Export compliance pack.

### User flow

Notification "Order shipped" → order detail → upload receipt → mark complete → report includes order.

---

# Part 9 — Analytics

## Screen: Analytics Dashboard

**Route:** `/app/analytics`

### Goal

Explore operational and agronomic metrics — spot trends, compare farms, inform decisions.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Analytics · All farms ▾ · Last 30 days ▾              [ Save view ]      │
├──────────────────────────────────────────────────────────────────────────┤
│ [Yield] [Water use] [Task completion] [Alert frequency]  ← KPI strip     │
├────────────────────────────────────────────┬─────────────────────────────┤
│ Primary chart (col-8)                      │ Breakdown donut (col-4)     │
├────────────────────────────────────────────┤ Comparison table (col-4)    │
│ Map layer optional (col-12)                │                             │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Tablet:** KPI 2×2 · Chart full width · Table below.

**Mobile:** KPI carousel · One chart · "Open full analytics on desktop" for custom builder.

### Widgets

Date range picker · Farm/region scope · KPI cards · Line/bar chart · Donut · Comparison table · Saved views [Pro+] · Export PNG/CSV.

### Actions

Change metric · Drill down · Save view · Schedule email · Share link [Enterprise].

### User flow

Dashboard KPI click → analytics pre-filtered → drill field → field detail.

### Role variants

| Role | Default scope |
|------|---------------|
| Farmer | Single farm · yield · tasks · weather impact |
| Cooperative | Member aggregates · engagement · collective volume |
| Agronomist | Disease incidence · stress · validation rates |
| Enterprise | Multi-region · financial · compliance · user activity |

---

# Part 10 — Reports

## Screen: Reports Library

**Route:** `/app/reports`

### Goal

Run standard reports or build custom ones — export and schedule delivery.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Reports                              [ + Custom report ] [ Scheduled ]   │
├──────────────────────────────┬───────────────────────────────────────────┤
│ Categories (col-3)           │ Report cards (col-9)                      │
│ · Operations                 │ Season summary · Yield · Inventory ·      │
│ · Agronomy                   │ Member delivery · Marketplace · Audit     │
│ · Financial                  │                                           │
│ · Compliance                 │                                           │
└──────────────────────────────┴───────────────────────────────────────────┘
```

**Tablet:** Categories horizontal pills · Cards grid 2-col.

**Mobile:** Search reports · Recent runs · Tap → run → view PDF in viewer.

### Widgets

Category nav · Report card: name · description · last run · Run button · Scheduled list · Custom builder entry [Business+].

### Actions

Run report · Schedule · Download PDF/CSV · Email · Duplicate custom · Delete schedule.

### User flow

Reports → Season summary → parameters (farm, season) → Run → viewer → download · or Schedule weekly email.

### Role variants

| Role | Access |
|------|--------|
| Farmer | 5 standard [Starter] · all standard [Pro+] |
| Cooperative | Member reports · bulk delivery · billing |
| Agronomist | Disease summary · client farm pack |
| Enterprise | Custom builder · API export · audit reports |

---

## Screen: Report Viewer

**Route:** `/app/reports/:reportSlug/view/:runId`

### Goal

Read and share generated report output.

### Layout

Toolbar: Download · Print · Share · Regenerate · Parameters summary · Paginated content · AI narrative summary [Pro+].

**Mobile:** PDF viewer full screen · Share sheet.

### Actions

Download · Print · Share link · Edit parameters · Re-run.

### User flow

Run → viewer → share to cooperative board → schedule recurrence.

---

# Part 11 — WhatsApp Center

## Screen: WhatsApp Center

**Route:** `/app/whatsapp`

### Goal

Manage WhatsApp as an operational channel — conversations, templates, broadcasts, opt-in status.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ WhatsApp Center · Connected ✓              [ Broadcast ] [ Templates ] │
├──────────────────────────────┬───────────────────────────────────────────┤
│ Conversation list (col-4)    │ Thread view (col-8)                       │
│ · Maria · 2 unread           │ [WhatsApp-style bubbles]                  │
│ · Co-op broadcast Jun 18     │ AI handled · Credit used · Link to entity │
│ · José · pending opt-in      │ [Reply] [AI suggest] [Create task]          │
├──────────────────────────────┴───────────────────────────────────────────┤
│ Opt-in stats · Credits used · Template approval status                   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** List ↔ thread master-detail · Back to list.

**Mobile:** Conversation list → thread push · No broadcast composer (desktop/tablet preferred).

### Widgets

Connection status · Conversation list · Thread · AI/handoff badge · Credit per thread · Template library · Broadcast composer · Opt-in table · Analytics strip.

### Actions

Reply · AI suggest reply · Create task from message · Send template · Broadcast wizard · Revoke/resend opt-in · Link unknown number to user.

### User flow

```
Farmer: Settings → connect WhatsApp → OTP → opt-in YES → center shows threads
  → inbound photo → appears in thread → linked to disease case

Cooperative: frost alert → broadcast → select affected members → template preview
  → approve → send → delivery stats in thread

Agronomist: client message → reply with validation → linked to review case

Enterprise: org-wide volume dashboard · template governance · user opt-in compliance export
```

### Role variants

| Role | Capabilities |
|------|--------------|
| Farmer | Own thread · connect/disconnect |
| Cooperative | Member threads · broadcast |
| Agronomist | Assigned client threads |
| Enterprise | All threads read · template admin · compliance export |

---

# Part 12 — Notifications

## Screen: Notification Center

**Route:** `/app/notifications` · Mobile: `/m/alerts`

### Goal

Unified inbox for alerts, tasks, marketplace, AI, and system messages — triage and act.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Notifications · 12 unread          [ Mark all read ] [ Settings ]        │
│ [All] [Weather] [Tasks] [AI] [Market] [System]                           │
├──────────────────────────────────────────────────────────────────────────┤
│ [icon] Frost alert Field 2 · Critical · 2h ago              [Act →]      │
│ [icon] Offer received on corn listing · 5h ago              [View →]     │
│ [icon] AI insight ready · Field 5 irrigation                [Open →]     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** Same · Split view optional: list + detail preview.

**Mobile:** Full-screen list · Swipe archive · Tap → deep link.

### Widgets

Filter tabs · Notification row: icon · severity · title · body · timestamp · action chip · Empty state.

### Actions

Mark read · Mark all read · Act (deep link) · Archive · Mute category · Notification preferences.

### User flow

Bell dropdown (3 preview) → View all → filter Weather → frost alert → weather detail → create protection task.

### Role variants

All roles share component; content filtered by permissions. Cooperative adds member activity · Enterprise adds system/compliance alerts.

---

# Part 13 — Tasks

## Screen: Task Board / List

**Route:** `/app/crops/tasks`

### Goal

Plan, assign, and complete work — field operations hub.

### Layout

**Desktop**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Tasks · 8 due today          [ List | Board | Calendar ]  [ + Task ]     │
│ [Mine] [Team] [Overdue] [Field ▾] [Assignee ▾]                           │
├──────────────────────────────────────────────────────────────────────────┤
│ LIST: checkbox · title · field · due · assignee · priority               │
│ OR BOARD: Today | This week | Later | Done                               │
│ OR CALENDAR: month grid with task dots                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tablet:** Board horizontal scroll columns · List default.

**Mobile:** `/m/crops` tasks tab · Due today list · FAB new task · Swipe complete.

### Widgets

View toggle · Filter bar · Task row/card · Priority badge · Assignee avatar · Field link · Recurrence indicator · Bulk select toolbar.

### Actions

+ Task · Complete · Assign · Reschedule · Add photo · Link observation · Bulk complete · Export.

### User flow

Dashboard task widget → tasks → filter overdue → assign to operator → WhatsApp reminder sent · operator completes on mobile → sync.

### Role variants

| Role | Capabilities |
|------|--------------|
| Farmer | CRUD own · assign team |
| Cooperative | Assign to members · bulk tasks |
| Agronomist | Assign to farmers · expert visit tasks |
| Enterprise | View all · reports on completion rates |

---

## Screen: Task Detail

**Route:** `/app/crops/tasks/:taskId`

### Goal

Execute one task with full context — instructions, location, weather gate, proof of work.

### Layout

Title · Status · Field link · Due · Assignee · Description · Checklist · Weather suitability badge · Attachments · Activity log · [Complete] [Edit] [Ask AI].

**Mobile:** Map link · Navigate to field · Camera proof on complete.

### Widgets

Weather gate ("Wind too high for spray") · Checklist · Photo attachment · Comments · AI "Is today OK?" shortcut.

### Actions

Complete · Snooze · Reassign · Add photo · Open field · Ask AI · Delete.

### User flow

Notification overdue → task detail → check weather AI → reschedule → complete with photo → observation linked.

---

# Part 14 — Settings

## Screen: Settings Hub

**Route:** `/app/settings`

### Goal

Configure org, personal preferences, integrations, security — role-appropriate scope.

### Layout

**Desktop — tabbed**

```
General | Localization | Notifications | WhatsApp | Integrations | Security | SSO | Audit
─────────────────────────────────────────────────────────────────────────────────────────
[Tab content forms]
```

**Tablet:** Vertical settings nav left 200px · Content right.

**Mobile:** `/m/more/settings` — Grouped list → push sub-screens.

### Widgets by tab

| Tab | Key fields |
|-----|------------|
| **General** | Org name · logo · timezone · currency |
| **Localization** | Language · units · date format |
| **Notifications** | Channel toggles per alert type |
| **WhatsApp** | Connect · opt-in status · phone |
| **Integrations** | API keys · webhooks · IoT [Pro+] |
| **Security** | MFA · sessions · password policy |
| **SSO** | SAML config [Enterprise] |
| **Audit** | Activity log export [Enterprise] |

### Actions

Save · Connect integration · Revoke session · Enforce MFA org-wide · Download audit · Delete account (owner).

### User flow

WhatsApp connect from settings → OTP → opt-in → WhatsApp center enabled · Enterprise admin → SSO → test login → enforce for all users.

### Role variants

| Role | Access |
|------|--------|
| Farmer | General (limited) · Personal prefs · WhatsApp |
| Cooperative | + member billing settings · broadcast defaults |
| Agronomist | Profile · credentials · notification prefs only |
| Enterprise | Full · SSO · audit · API · data residency |

---

# Part 3 — Cross-Module Flows

## Flow: Morning field routine (Farmer · Mobile)

```
/m/home → critical alert banner → task list → tap spray task
  → weather gate OK → navigate to field
  → FAB capture → disease check on leaf
  → /m/capture/result → create task if treatment needed
  → complete original task → sync
```

## Flow: Cooperative frost response (Desktop)

```
Dashboard collective weather → 45 farms affected
  → WhatsApp center → Broadcast
  → template "Frost alert" → member filter affected
  → preview → send → monitor delivery stats
  → Tasks auto-created for field officers
```

## Flow: Expert validation (Agronomist · Tablet)

```
Dashboard review queue → case #142
  → photo + AI 62% confidence
  → override to "Common rust" + treatment note
  → notify farmer via WhatsApp + in-app
  → learning feedback recorded
```

## Flow: Executive weekly review (Enterprise · Desktop)

```
Dashboard executive brief → drill yield KPI
  → /app/analytics region compare
  → export board pack → /app/reports
  → schedule Monday email to leadership
  → audit log spot check → settings
```

---

# Part 4 — Responsive Summary Matrix

| Screen | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| **Shell** | Sidebar 240px | Drawer / icon rail | Bottom tabs + FAB |
| **Dashboard** | 12-col widgets | 2-col stack | Carousel + stack |
| **AI panel** | 400px docked | 360px overlay | 85vh sheet |
| **Field map** | Inline large | 60vh | Full-screen map route |
| **Disease review** | Split pane | Stacked | Camera-first |
| **Marketplace** | Grid + sidebar | 2-col cards | Feed |
| **Orders** | Table/kanban | H-scroll table | Cards |
| **Analytics** | Full charts | Simplified | KPI + 1 chart |
| **Reports** | Library + viewer | Same | PDF viewer |
| **WhatsApp** | Split pane | Master-detail | List → thread |
| **Notifications** | Full list | Full list | Full screen |
| **Tasks** | Board/list/calendar | Board scroll | List + swipe |
| **Settings** | Horizontal tabs | Vertical nav | Native grouped list |

---

# Part 5 — Empty, Loading, and Error States

| Screen | Empty | Loading |
|--------|-------|---------|
| Dashboard | Onboarding checklist | Skeleton KPI → lists → map |
| Farms | "Create first field" CTA | Map skeleton |
| Disease | "Take first photo" | Analyzing progress ring |
| Marketplace | Browse categories hint | Card skeletons |
| Orders | "No orders yet" + marketplace CTA | Row skeleton |
| WhatsApp | Connect prompt | Thread skeleton |
| Tasks | "Nothing due — plan your week" | Row skeleton |
| Notifications | "All caught up" illustration | Shimmer rows |

Errors: inline retry · offline banner mobile · credit exhausted → upgrade modal on AI actions.

---

# Part 6 — Analytics Events (Design Handoff)

| Event | Properties |
|-------|------------|
| `dashboard.widget.click` | widget_id, role |
| `ai.panel.open` | trigger, context_entity |
| `disease.submit` | crop, confidence_bucket |
| `disease.validate` | action: confirm|override, role |
| `whatsapp.broadcast.send` | recipient_count, role |
| `task.complete` | source: dashboard|list|mobile, has_photo |
| `nav.module.enter` | module, role, breakpoint |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `/ui/navigation-structure.md` | Nav IA details |
| `/ui/dashboard-layout-system.md` | Widget catalog |
| `/product/farmer-dashboard.md` | Farmer variant depth |
| `/product/cooperative-dashboard.md` | Cooperative variant depth |
| `/wireframes/ai-assistant-screens.md` | AI panel detail |
| `/wireframes/mobile-app-screens.md` | Mobile screen inventory |
| `/docs/design-system.md` | Visual tokens |

---

*Nertura OS Dashboard Wireframe v1.0 — Product UX specification. No application code.*
