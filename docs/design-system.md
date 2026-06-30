# Nertura — Design System

> Visual language for the Nertura Agriculture Operating System. Apple-level simplicity. Stripe-level trust. Palantir-level intelligence.

**Status:** Approved for product design and implementation  
**Source of truth for brand assets:** `/brand/` (logo mark, wordmark, lockups)  
**Companion specs:** `/ui/dashboard-layout-system.md`, `/ui/navigation-structure.md`

---

## Design North Star

Nertura should feel like **precision agriculture meets precision software** — calm enough for a farmer in the field at dawn, credible enough for a cooperative boardroom, and intelligent enough to earn the trust of enterprise operators.

| Influence | What we take | What we avoid |
|-----------|--------------|---------------|
| **Apple** | Generous whitespace, one focal action per view, invisible chrome, content-first hierarchy | Decorative gradients, novelty motion, visual noise |
| **Stripe** | Typographic clarity, restrained color, trustworthy empty states, predictable component behavior | Flashy marketing aesthetics inside the product |
| **Palantir** | Data density when needed, monospace metrics, graph/map intelligence layers, dark-mode depth | Cold militaristic UI, overwhelming complexity by default |
| **Modern AI** | Subtle intelligence cues — spark marks, source attribution, confidence signals — never gimmicky chatbot chrome | Purple gradients, robot mascots, "magic" without explanation |

**Brand promise (design expression):** *Intelligence rooted in the soil. Operations built for scale.*

---

## Logo Foundation

All color, typography, and component decisions derive from the **approved Nertura logo** in `/brand/`.

### Logo anatomy (canonical)

| Asset | Usage |
|-------|-------|
| **Mark** | App icon, favicon, collapsed sidebar, loading states, AI spark badge |
| **Wordmark** | Marketing, login, document headers |
| **Horizontal lockup** | Top bar (web), splash screens |
| **Stacked lockup** | Mobile splash, square social avatars |

### Logo color extraction

The approved mark anchors the entire palette:

| Token | Hex | Role | Logo tie-in |
|-------|-----|------|-------------|
| **Nertura Forest** | `#2D6A4F` | Primary brand, CTAs, active nav, links | Core mark fill |
| **Nertura Canopy** | `#40916C` | Hover states, secondary emphasis, healthy field status | Mark highlight / leaf tone |
| **Nertura Soil** | `#1B4332` | Dark accents, pressed states, dark-mode primary | Mark shadow / root depth |
| **Nertura Signal** | `#1A7F8C` | AI features, intelligence layer, data graph edges | Intelligence ring / node accent in mark |
| **Nertura Dawn** | `#D8F3DC` | Light backgrounds, AI panel tint, success wash | Mark glow / ambient field light |

### Clear space & minimum size

| Context | Rule |
|---------|------|
| Clear space | Minimum padding = height of mark stem (×) on all sides |
| Web header | Mark ≥ 24px height; lockup ≥ 28px mark height |
| Mobile app icon | 1024×1024 master; mark centered, no wordmark |
| Favicon | Mark only; 16px / 32px / 180px exports |
| Minimum digital | Mark never below 16px; wordmark never below 12px cap height |

### Logo misuse (never)

- Do not recolor the mark outside approved single-color variants (Forest, White, Soil)
- Do not apply drop shadows, outer glow, or gradients to the logo
- Do not place mark on busy photography without a scrim
- Do not stretch, rotate, or outline the mark
- Do not use the AI Signal teal as the primary logo color

---

## Brand Personality

### Voice & tone (visual translation)

| Trait | Feels like | Looks like |
|-------|------------|------------|
| **Grounded** | A agronomist who listens before advising | Earth-toned neutrals, organic spacing, field photography with natural light |
| **Precise** | A instrument panel, not a toy | Tabular numbers, aligned grids, explicit units (mm, ha, °C) |
| **Calm** | Early morning in the field | Low-contrast chrome, soft borders, no alarm colors unless severity warrants |
| **Intelligent** | A analyst beside you, not replacing you | Source citations, confidence labels, expandable reasoning |
| **Trustworthy** | A bank statement meets a soil report | Consistent patterns, no dark patterns, approval states always visible |

### Personality spectrum

```
Playful ○────────●────────○ Corporate
Minimal ●───────────────○ Decorative
Dense   ○───────●───────○ Sparse (role-dependent)
Warm    ●───────────────○ Cold
```

Default product posture: **minimal, warm, moderately sparse** (farmer) → **moderately dense** (cooperative, exporter).

### Photography & illustration

| Type | Direction |
|------|-----------|
| **Photography** | Real fields, real hands, golden-hour and overcast light; never stock "smiling farmer with tablet" clichés |
| **Maps & satellite** | Desaturated base; Nertura status colors overlaid at 60–80% opacity |
| **Illustration** | Sparingly — empty states and onboarding only; line weight 1.5px, Forest + Stone palette |
| **AI-generated imagery** | Media factory only; never in core product UI without "AI-generated" label |

---

## Color System

### Primary — Forest scale

Derived from logo mark `#2D6A4F`.

| Token | Hex | Usage |
|-------|-----|-------|
| `forest-50` | `#EEF6F1` | Subtle fills, selected row background |
| `forest-100` | `#D5E9DE` | Badge backgrounds, tag fills |
| `forest-200` | `#A8D4BC` | Disabled primary buttons (light mode) |
| `forest-300` | `#74B897` | Chart secondary series |
| `forest-400` | `#40916C` | Hover on primary buttons |
| `forest-500` | `#2D6A4F` | **Primary brand** — buttons, links, active nav |
| `forest-600` | `#245A42` | Pressed primary |
| `forest-700` | `#1B4332` | Sidebar active indicator (dark mode) |
| `forest-800` | `#132F24` | Dark mode elevated surfaces |
| `forest-900` | `#0A1C16` | Dark mode base tint |

### Intelligence — Signal scale

AI surfaces, graph nodes, assistant chrome. Distinct from brand green — communicates *system intelligence*, not *brand identity*.

| Token | Hex | Usage |
|-------|-----|-------|
| `signal-50` | `#E6F4F6` | AI panel background (light) |
| `signal-100` | `#B8E0E6` | AI insight card border tint |
| `signal-400` | `#2BA3B0` | AI icons, spark glyph |
| `signal-500` | `#1A7F8C` | AI accent, active assistant header |
| `signal-700` | `#125A63` | AI text emphasis (dark mode) |

### Neutral — Stone scale

Warm gray with subtle green undertone — soil and stone, not blue-gray SaaS default.

| Token | Hex | Usage |
|-------|-----|-------|
| `stone-0` | `#FFFFFF` | Cards, modals (light) |
| `stone-50` | `#F9FAF9` | Page background (light) |
| `stone-100` | `#F1F3F2` | Secondary background, zebra rows |
| `stone-200` | `#E2E6E4` | Borders, dividers |
| `stone-300` | `#C8CECB` | Disabled borders |
| `stone-400` | `#9AA39E` | Placeholder text |
| `stone-500` | `#6B756F` | Secondary text |
| `stone-600` | `#4A524E` | Body text (light mode) |
| `stone-700` | `#343A37` | Headings (light mode) |
| `stone-800` | `#222725` | Primary text emphasis |
| `stone-900` | `#141716` | Headings, high contrast |
| `stone-950` | `#0C0E0D` | Page background (dark) |

### Semantic colors

Operational clarity — Stripe-level consistency across all modules.

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#2D6A4F` | Completed, healthy field, positive delta (reuse Forest) |
| `success-bg` | `#EEF6F1` | Success banner background |
| `warning` | `#D4A017` | Attention, moderate alert, low stock |
| `warning-bg` | `#FBF6E8` | Warning banner background |
| `danger` | `#C0392B` | Critical alert, error, destructive action |
| `danger-bg` | `#FDEEEC` | Error banner background |
| `info` | `#1A7F8C` | Informational, AI-related notices (reuse Signal) |
| `info-bg` | `#E6F4F6` | Info banner background |

### Field status colors (maps & dashboards)

Distinct from semantic UI colors — optimized for map overlay legibility.

| Status | Hex | Label |
|--------|-----|-------|
| Healthy | `#40916C` | On track |
| Attention | `#D4A017` | Needs review |
| Critical | `#C0392B` | Immediate action |
| Unknown | `#9AA39E` | No data |
| Selected | `#1A7F8C` | Active field polygon stroke |

### Data visualization palette

Ordered for color-blind safety (WCAG AA on white/dark backgrounds).

1. `#2D6A4F` Forest  
2. `#1A7F8C` Signal  
3. `#D4A017` Amber  
4. `#6B4C9A` Plum (sparingly)  
5. `#C0392B` Danger  
6. `#40916C` Canopy  
7. `#4A524E` Stone  

Charts: max 5 series default; expand to 7 for enterprise reports. Always label directly or in legend — never color alone.

### Color usage rules

| Rule | Detail |
|------|--------|
| **60-30-10** | 60% Stone neutrals · 30% white/card surfaces · 10% Forest + Signal combined |
| **One primary action** | One filled Forest button per viewport section |
| **Links** | `forest-500` default; `forest-600` hover; underline on body text links only |
| **AI ≠ Primary** | Assistant uses Signal accent; never Forest-filled AI bubbles (avoids "brand spam") |
| **Dark mode** | Never pure `#000000`; use `stone-950` base with Forest/Signal at 400–500 levels |

---

## Typography

### Typefaces

| Role | Family | Fallback | Rationale |
|------|--------|----------|-----------|
| **UI & marketing** | **Inter** | system-ui, sans-serif | Stripe-grade clarity; excellent tabular figures; global language support |
| **Display (optional)** | **Instrument Sans** | Inter | Marketing hero only — Apple-like geometric warmth |
| **Monospace / data** | **JetBrains Mono** | ui-monospace, monospace | KPIs, coordinates, IDs, Palantir-style dense tables |

*Implementation note for design files: use Inter Variable; enable `"tnum"` (tabular nums) on all metric displays.*

### Type scale

Base: **16px / 1rem**. Scale ratio: **1.250 (Major Third)**.

| Token | Size | Line height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-lg` | 36px / 2.25rem | 44px | 600 | Marketing hero only |
| `display-sm` | 30px / 1.875rem | 38px | 600 | Empty state headlines |
| `heading-xl` | 24px / 1.5rem | 32px | 600 | Page titles |
| `heading-lg` | 20px / 1.25rem | 28px | 600 | Widget titles, section headers |
| `heading-md` | 18px / 1.125rem | 26px | 600 | Card titles |
| `heading-sm` | 16px / 1rem | 24px | 600 | Subsection labels |
| `body-lg` | 16px / 1rem | 24px | 400 | Primary body |
| `body-md` | 14px / 0.875rem | 20px | 400 | Secondary body, table cells |
| `body-sm` | 12px / 0.75rem | 16px | 400 | Captions, timestamps, badges |
| `label` | 12px / 0.75rem | 16px | 500 | Form labels, KPI labels (uppercase optional) |
| `metric-xl` | 32px / 2rem | 40px | 600 | KPI primary value (JetBrains Mono, tnum) |
| `metric-lg` | 24px / 1.5rem | 32px | 600 | Secondary KPI |
| `metric-sm` | 14px / 0.875rem | 20px | 500 | Inline metrics, deltas |

### Typographic rules

| Rule | Specification |
|------|---------------|
| **Page title** | One `heading-xl` per page; never stacked with `display-*` inside app |
| **KPI labels** | `label` token; sentence case ("Active tasks" not "ACTIVE TASKS") |
| **KPI values** | `metric-xl` + JetBrains Mono + tabular nums |
| **Deltas** | `body-sm` with semantic color; prefix ▲ ▼ — |
| **Max line length** | 65ch for prose; 80ch for tables |
| **Truncation** | Ellipsis after 2 lines for list primary text; full text in tooltip |
| **Locale** | System respects user locale for number/date formatting; typography scale unchanged |

---

## Iconography

### Icon system

| Property | Value |
|----------|-------|
| **Library** | Lucide (primary) — consistent 24px grid, 1.5px stroke |
| **Style** | Outlined default; filled for active nav and selected states only |
| **Corner radius** | Rounded caps and joins (matches logo softness) |
| **Optical size** | 20px inline with `body-md`; 24px in nav and buttons |

### Icon + color pairings

| Context | Icon color | Background |
|---------|------------|------------|
| Default nav | `stone-500` | — |
| Active nav | `forest-500` | `forest-50` pill (light) / `forest-900` (dark) |
| Destructive | `danger` | `danger-bg` |
| AI / assistant | `signal-500` | `signal-50` |
| Severity critical | `danger` | — |
| Severity high | `#E67E22` | — |
| Severity moderate | `warning` | — |
| Disabled | `stone-300` | — |

### Custom Nertura icons

| Icon | Usage | Design |
|------|-------|--------|
| **Spark (✦)** | AI assistant header, insight cards | Four-point star derived from logo node geometry; Signal color |
| **Field grid** | Farms module | Minimal parcel lines; 1.5px stroke |
| **Root network** | Knowledge graph, Brain admin | Mark-inspired node graph; Forest + Signal nodes |

### Icon misuse

- No emoji as functional icons in navigation or forms
- No mixed libraries (Heroicons + Lucide) in the same view
- No icon-only buttons without tooltip / aria-label

---

## Spacing System

### Base unit

**4px grid.** All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | — |
| `space-1` | 4px | Tight inline gaps, icon-text gap |
| `space-2` | 8px | Badge padding, compact list gaps |
| `space-3` | 12px | Input internal padding (vertical) |
| `space-4` | 16px | Card padding (mobile), column gap |
| `space-5` | 20px | — |
| `space-6` | 24px | Card padding (desktop), page padding, gutter |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large section breaks |
| `space-12` | 48px | Page header margin-bottom |
| `space-16` | 64px | Marketing section spacing |

### Layout tokens (web)

Aligned with `/ui/dashboard-layout-system.md`.

| Token | Value |
|-------|-------|
| Max content width | 1280px |
| Sidebar width | 240px expanded / 64px collapsed |
| Top bar height | 56px |
| Page padding | 24px desktop · 16px tablet · 16px mobile web |
| Grid columns | 12 |
| Column gap | 16px |
| Row gap | 16px |
| Widget border-radius | 8px (`radius-md`) |
| Modal border-radius | 12px (`radius-lg`) |
| Button border-radius | 6px (`radius-sm`) |

### Radius scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Buttons, inputs, tags |
| `radius-md` | 8px | Cards, widgets, dropdowns |
| `radius-lg` | 12px | Modals, sheets, AI panel |
| `radius-xl` | 16px | Mobile bottom sheets |
| `radius-full` | 9999px | Avatars, pills, FAB |

### Elevation (shadow)

Apple restraint — shadows are subtle; borders do most separation work.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | none | Default cards (border only) |
| `shadow-sm` | `0 1px 2px rgba(20, 23, 22, 0.06)` | Dropdowns, popovers |
| `shadow-md` | `0 4px 12px rgba(20, 23, 22, 0.08)` | Modals, AI floating panel |
| `shadow-lg` | `0 8px 24px rgba(20, 23, 22, 0.12)` | Command palette (⌘K) |

Dark mode: reduce shadow opacity 50%; rely on `stone-800` surface lift (+1 elevation step).

---

## Component System

Components are the shared vocabulary across web, mobile, and white-label. Every component supports **light and dark mode** and **minimum 44×44px touch targets** on mobile.

### Buttons

| Variant | Light | Dark | Usage |
|---------|-------|------|-------|
| **Primary** | `forest-500` fill, white text | `forest-400` fill | One per section — main CTA |
| **Secondary** | white fill, `stone-200` border | `stone-800` fill, `stone-700` border | Secondary actions |
| **Ghost** | transparent, `forest-500` text | transparent, `forest-400` text | Tertiary, table actions |
| **Danger** | `danger` fill | `#E74C3C` fill | Delete, irreversible |
| **AI** | `signal-500` fill | `signal-400` fill | "Ask AI", "Generate" — intelligence actions only |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | 12px horizontal | `body-sm` |
| `md` | 40px | 16px horizontal | `body-md` |
| `lg` | 48px | 20px horizontal | `body-lg` |

States: hover (+1 shade), pressed (+2 shade), disabled (40% opacity, no pointer), loading (spinner replaces label, width locked).

### Inputs

| Property | Value |
|----------|-------|
| Height | 40px default · 48px mobile primary forms |
| Border | 1px `stone-200`; focus ring 2px `forest-500` at 40% opacity |
| Background | `stone-0` light · `stone-900` dark |
| Label | `label` above; required asterisk in `danger` |
| Error | Border `danger`; message `body-sm` in `danger` below |
| Helper | `body-sm` in `stone-500` |

Special: **search (⌘K)** — centered modal, 560px wide, `shadow-lg`, no border on input, magnifier icon `stone-400`.

### Cards & widgets

```
┌─────────────────────────────────────────┐  ← radius-md, 1px stone-200 border
│  LABEL                          ···     │  ← label + optional overflow menu
│  42.5                                   │  ← metric-xl
│  ▲ 12% vs last season                   │  ← body-sm, success color
│  ───────────── sparkline                │
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | 24px desktop · 16px mobile |
| Header | `heading-sm` or `label` for KPI cards |
| Divider | 1px `stone-100` internal only when needed |
| Hover (clickable) | Border → `stone-300`; cursor pointer; no lift animation |

### Navigation components

| Component | Spec |
|-----------|------|
| **Sidebar item** | 40px row height; 8px radius active pill; icon 20px + `body-md` label |
| **Top bar** | 56px; bottom border `stone-200`; logo lockup left |
| **Breadcrumb** | `body-sm`; separator `/`; current page `stone-900` weight 500 |
| **Tabs** | Underline 2px `forest-500` active; `body-md`; sticky below top bar |
| **Bottom tab (mobile)** | 56px + safe area; icon 24px; label `body-sm`; active `forest-500` |

### Badges & tags

| Variant | Background | Text |
|---------|------------|------|
| Default | `stone-100` | `stone-600` |
| Success | `success-bg` | `forest-600` |
| Warning | `warning-bg` | `#9A7B0A` |
| Danger | `danger-bg` | `danger` |
| AI | `signal-50` | `signal-500` |
| Tier lock | `stone-100` | `stone-500` + lock icon |

Padding: 4px 8px. Radius: `radius-sm`. Font: `body-sm` weight 500.

### Alerts & banners

Left border accent (4px) + icon + title + optional action.

| Severity | Border | Icon |
|----------|--------|------|
| Critical | `danger` | AlertTriangle |
| High | `#E67E22` | AlertCircle |
| Moderate | `warning` | Info |
| Low | `stone-300` | Bell |
| Offline (mobile) | `warning` | CloudOff |

### AI-specific components

| Component | Design |
|-----------|--------|
| **Assistant FAB** | 56×56px; `forest-500` (brand entry point); Spark icon white; `shadow-md` |
| **Assistant panel header** | `signal-50` background; "✦ Nertura AI" in `heading-sm`; Signal spark |
| **User message bubble** | `stone-100` fill; right-aligned; `radius-lg` |
| **AI message bubble** | `stone-0` fill, 1px `signal-100` border; left-aligned |
| **Action card** | Nested in AI bubble; `forest-50` border; primary + ghost buttons |
| **Source chips** | `body-sm` pills — "Weather · Field 2"; tap → source detail |
| **Confidence indicator** | Text label ("High confidence") + optional 3-bar meter; never gauge-only |
| **Feedback** | 👍 👎 ghost buttons; `body-sm` |

### Data components

| Component | Spec |
|-----------|------|
| **Table** | `body-md`; row height 48px; header `label` in `stone-500`; zebra optional |
| **Sparkline** | 1.5px stroke; no fill; `forest-400` default |
| **Chart container** | `heading-sm` title; range pills (7d / 30d / 90d); `body-sm` axis labels |
| **Map** | Stone-100 base map; field polygons per status colors; selected stroke 2px Signal |
| **Skeleton** | `stone-100` pulse; match final layout geometry exactly |

### Overlays

| Type | Width | Behavior |
|------|-------|----------|
| **Modal** | 480px sm · 640px md · 800px lg | Centered; scrim `stone-900` at 40% |
| **Drawer** | 400px right | Settings, widget picker, filters |
| **Bottom sheet (mobile)** | Full width; `radius-xl` top | Primary mobile overlay pattern |
| **Toast** | 360px max | Bottom-right web; top mobile; auto-dismiss 5s |

---

## Light Mode

Default experience for field use in daylight and bright office environments.

### Surfaces

| Layer | Token | Hex |
|-------|-------|-----|
| Page background | `stone-50` | `#F9FAF9` |
| Card / widget | `stone-0` | `#FFFFFF` |
| Sidebar | `stone-0` | `#FFFFFF` |
| Top bar | `stone-0` | `#FFFFFF` |
| Input fill | `stone-0` | `#FFFFFF` |
| AI panel | `signal-50` | `#E6F4F6` |
| Selected row | `forest-50` | `#EEF6F1` |

### Text

| Role | Token |
|------|-------|
| Primary | `stone-800` |
| Secondary | `stone-500` |
| Disabled | `stone-400` |
| Link | `forest-500` |
| Inverse (on primary button) | `#FFFFFF` |

### Borders

Default border: `stone-200` (`#E2E6E4`). Dividers inside cards: `stone-100`.

### Light mode principles

- White cards on warm gray page — Stripe-like layered calm
- Forest green reserved for action and success — never decorative fills
- Photography and maps provide color; UI chrome stays neutral
- Critical alerts are the only full-width saturated banners on dashboard

---

## Dark Mode

Palantir-inspired intelligence aesthetic for low-light operations centers, evening use, and data-heavy views. **Not** a color inversion — a deliberate second theme.

### Surfaces

| Layer | Token | Hex |
|-------|-------|-----|
| Page background | `stone-950` | `#0C0E0D` |
| Card / widget | `stone-900` | `#141716` |
| Elevated (+1) | `stone-800` | `#222725` |
| Sidebar | `stone-900` | `#141716` |
| Top bar | `stone-950` | `#0C0E0D` |
| Input fill | `stone-800` | `#222725` |
| AI panel | `#0F1A1C` | Signal-tinted dark |
| Selected row | `forest-900` at 40% | — |

### Text

| Role | Token |
|------|-------|
| Primary | `stone-100` |
| Secondary | `stone-400` |
| Disabled | `stone-500` |
| Link | `forest-400` |
| Inverse (on primary button) | `stone-950` |

### Borders

Default: `stone-800`. Subtle inner glow on focus: `forest-400` at 30%.

### Dark mode principles

- Maps and charts gain prominence; chrome recedes
- Primary button uses `forest-400` (lighter) for contrast on dark surfaces
- Semantic colors shift one step lighter (danger → `#E74C3C`)
- AI Signal teal glows slightly on graph edges — intelligence layer visible
- Logo: white mark on dark; Forest mark on light only
- Respect `prefers-color-scheme` with user override in Settings → Appearance

---

## Dashboard Style

The dashboard is the daily return surface. Visual system prioritizes **scannable hierarchy** over decoration.

### Page structure

```
┌────────────────────────────────────────────────────────────────────────┐
│  Good morning, Maria          [Farm: Green Valley ▾]  [Customize]    │  heading-xl + body-sm
│  Friday, 19 June 2026 · 3 alerts need attention                        │
├────────────────────────────────────────────────────────────────────────┤
│  ┌ KPI ─┐ ┌ KPI ─┐ ┌ KPI ─┐ ┌ KPI ─┐                                 │  metric cards, equal height
├──────────────────────────────┬─────────────────────────────────────────┤
│  Alert feed (primary)        │  Weather · AI insights (secondary)    │  8/4 split
├──────────────────────────────┴─────────────────────────────────────────┤
│  Field map (full width)                                                │
└────────────────────────────────────────────────────────────────────────┘
```

### Dashboard visual rules

| Rule | Detail |
|------|--------|
| **Greeting first** | Page header is the only `heading-xl` on dashboard — human before data |
| **KPI strip** | 4 cards default; equal height 96px min; one metric per card |
| **One hero widget** | Map OR chart full-width — not both above fold |
| **Alert prominence** | Critical alert injects above KPI strip; left-border severity coding |
| **AI placement** | Secondary column; max 3 insight cards; Signal accent, not dominant |
| **Whitespace** | Minimum `space-8` between major rows |
| **Customization mode** | Dashed `stone-300` border on widgets; drag handle `stone-400`; no layout shift on enter |

### Role density

| Role | Density | Notes |
|------|---------|-------|
| Farmer | Sparse | 4 KPIs, map hero, friendly copy |
| Manager | Medium | Team activity, multi-farm map |
| Cooperative | Medium-dense | Member tables, aggregated KPIs |
| Exporter | Medium-dense | Pipeline charts, compliance lists |
| Executive | Dense KPIs | Scorecards; no field map default |

### Dashboard motion

| Animation | Duration | Easing |
|-----------|----------|--------|
| Widget load (skeleton → content) | 200ms | ease-out |
| KPI delta update | 150ms | ease-out (number roll optional) |
| Alert appear | 250ms | ease-out slide from top |
| Customize drag | — | No animation during drag; 200ms settle on drop |

Motion is functional only. No parallax, no decorative loops.

---

## Mobile Style

Mobile is the **farmer's primary interface** — not a responsive afterthought. See `/wireframes/mobile-app-screens.md`.

### Shell

| Element | Spec |
|---------|------|
| Header | 56px; `heading-sm` title; no logo (mark in splash / app icon only) |
| Bottom tabs | 5 max; 56px + safe area; active `forest-500` |
| FAB | 56×56; `forest-500`; bottom-right, 16px above tab bar; primary field action (log observation) |
| AI FAB | Secondary — opens assistant; 48×48; `signal-500`; left of primary FAB or in header |
| Touch target | Minimum 44×44px; 48px for primary actions |
| Safe areas | Respect iOS notch and Android gesture bar |

### Mobile-specific patterns

| Pattern | Over web |
|---------|----------|
| **Bottom sheets** | Replace modals for filters, actions, entity quick-view |
| **Swipe actions** | List rows: swipe right complete, swipe left delete/archive |
| **Horizontal KPI carousel** | 2 cards visible; snap; `space-4` peek |
| **Pull to refresh** | Standard on Home, Alerts, task lists |
| **Offline banner** | Full-width `warning-bg`; sticky below status bar |
| **Camera-first** | Observation flow opens camera immediately; metadata after capture |

### Mobile typography adjustments

| Token | Mobile adjustment |
|-------|-------------------|
| `heading-xl` | 20px (page titles rare on mobile) |
| `heading-lg` | 18px widget titles |
| `metric-xl` | 28px KPI values |
| `body-md` | Default body — 14px minimum everywhere |

### Mobile color & contrast

- Outdoor readability: body text minimum `stone-700` on white (not `stone-500` for primary content)
- Critical alerts: full-width banner with icon + title; tap for detail
- Buttons: prefer `lg` (48px) for primary field actions
- Dark mode: optional; default follows system; high contrast mode increases border weight to 2px

### Platform notes

| Platform | Adaptation |
|----------|------------|
| **iOS** | SF Symbol parity where Lucide equivalent exists; haptic on task complete |
| **Android** | Material You dynamic color **disabled by default** — Nertura brand override |
| **PWA** | Same shell as native; offline banner critical; install prompt uses stacked logo lockup |

---

## Accessibility

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG 2.1 AA minimum; AAA for body text where possible |
| Focus | Visible 2px focus ring on all interactive elements |
| Motion | `prefers-reduced-motion` disables non-essential animation |
| Touch | 44×44px minimum; 8px gap between adjacent targets |
| Screen readers | All icons labeled; AI messages announced with "Nertura AI" prefix |
| Color independence | Severity, status, and deltas never rely on color alone — always icon or text |

---

## White-Label (Business+)

Cooperatives and enterprise deployments may apply org brand kit.

| Overridable | Fixed (Nertura platform) |
|-------------|---------------------------|
| Primary accent (replaces Forest on buttons, links) | Component structure, spacing, typography scale |
| Logo / wordmark | AI Signal color (always Nertura intelligence layer) |
| Sidebar header background | Accessibility minimums |
| Email / PDF header | "Powered by Nertura" footer mark on AI outputs |

Accent override must pass WCAG AA against white/dark surfaces — system validates on upload.

---

## File & Token Checklist (Design Ops)

When moving to Figma / implementation, export these token groups:

- [ ] Color primitives (Forest, Signal, Stone, Semantic)
- [ ] Typography styles (Inter + JetBrains Mono scales)
- [ ] Spacing & radius scales
- [ ] Elevation shadows (light + dark)
- [ ] Component variants (button, input, card, alert, badge)
- [ ] Icon set (Lucide subset + Nertura custom)
- [ ] Logo lockups from `/brand/`

**Related documents**

| Document | Purpose |
|----------|---------|
| `/ui/dashboard-layout-system.md` | Grid, widgets, layouts |
| `/ui/navigation-structure.md` | Shell, sidebar, tabs |
| `/wireframes/mobile-app-screens.md` | Mobile screen specs |
| `/wireframes/ai-assistant-screens.md` | AI component behavior |
| `/automation/ai-media-engine.md` | Brand guardrails for generated media |

---

*Nertura Design System v1.0 — Product design specification. No application code.*
