# Nertura — Homepage Wireframe

> Complete marketing homepage specification for `nertura.com/`.  
> **Feel:** Apple simplicity · Stripe trust · Palantir intelligence — **not** a typical agriculture website.

**Route:** `/`  
**Companion:** `/docs/design-system.md`, `/docs/founder-decisions.md`, `/docs/subscription-model.md`  
**Status:** Wireframe specification · No application code

---

## Page-Level Design Principles

| Principle | Homepage expression |
|-----------|---------------------|
| **Category reframe** | Lead with *intelligence operating system*, not "farm software" |
| **Show the product** | UI mockups, Brain diagrams, live-feeling data — not stock field photography as hero |
| **Trust before hype** | Source attribution, approval gates, data ownership callouts — Stripe-style honesty |
| **Intelligence as aesthetic** | Graph nodes, map overlays, monospace metrics — Palantir depth without cold militarism |
| **One idea per scroll** | Each section answers one question; generous vertical rhythm (`space-16`–`space-24` between sections) |

### Anti-patterns (never on homepage)

- Hero: smiling farmer holding tablet in golden wheat field
- Tractor / barn / seed bag icon grids
- "Revolutionizing agriculture" empty superlatives without proof
- Green gradient blobs and leaf clip-art
- Chatbot robot mascot
- Auto-playing video with dramatic drone footage

### Visual language (marketing)

| Element | Spec |
|---------|------|
| Background | Alternating `stone-50` and `stone-0` bands; one **dark intelligence band** (Brain section) |
| Typography | Inter; `display-lg` hero only; body never below 16px on desktop |
| Primary CTA | Forest `#2D6A4F` filled button |
| Secondary CTA | Ghost or `stone-200` border |
| AI accent | Signal `#1A7F8C` for Brain / AI sections only |
| Max content width | 1120px (marketing); full-bleed only for product screenshots and dark band |
| Section padding | 120px vertical desktop · 64px mobile |

---

## Global Shell

### Sticky navigation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo lockup]     Product  Brain  Pricing  Resources  │  Sign in  [Start free] │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| **Logo** | Horizontal lockup; links to `/` |
| **Product** | Mega-menu or anchor scroll: Assistant · Operations · Marketplace · Analytics · Mobile |
| **Brain** | Anchor to `#brain` |
| **Pricing** | Anchor to `#pricing` or `/pricing` |
| **Resources** | Blog · Docs · Community (future) · Help |
| **Sign in** | Ghost link → `/login` |
| **Start free** | Primary button → `/register` |

**Desktop UX:** 64px height; transparent on hero, solid `stone-0` + 1px `stone-200` border after 80px scroll; subtle backdrop blur optional.

**Mobile UX:** 56px height; hamburger left; logo center or left; **Start free** pill right (compact). Full-screen menu overlay with accordion for Product sub-links. Sticky CTA bar appears after hero scroll: `[Start free — $29/mo]`.

---

## Section 1 — Hero

### Goal

Establish Nertura as an **AI agriculture intelligence OS** in five seconds. Visitor understands: *this is serious software, not another farm app.*

### Content

| Element | Copy direction |
|---------|----------------|
| **Eyebrow** | `Agriculture Operating System` — `label` style, `forest-500` |
| **Headline** | **The intelligence layer for how food is grown.** |
| **Subhead** | One platform for operations, AI, commerce, and analytics — from field to export. Trusted by farmers, cooperatives, and agribusiness worldwide. |
| **Proof strip** (optional launch) | "KVKK & GDPR ready · Human-approved AI · Offline-capable mobile" — icon + text chips |
| **Product visual** | Dashboard mock: greeting header + KPI strip + field map with status colors — **not** a photo |

**Alternate headline (A/B):** *Intelligence rooted in the soil. Operations built for scale.*

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│     [Eyebrow]                                                                │
│                                                                              │
│     The intelligence layer for                                               │
│     how food is grown.                    ┌─────────────────────────────┐   │
│                                           │  [Product UI mock — dashboard]│   │
│     Subhead copy (max 2 lines)            │  KPI · Map · AI insight card  │   │
│                                           │  subtle shadow, radius-lg     │   │
│     [Start free]  [See how it works →]    └─────────────────────────────┘   │
│                                                                              │
│     KVKK · GDPR · Offline mobile  (trust chips)                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Zone | Width |
|------|-------|
| Copy column | 5/12 |
| Product mock | 7/12 |
| Vertical alignment | Center |

Background: `stone-50`. No full-bleed photography.

### Desktop UX

- Headline: `display-lg` (36px), max 2 lines
- Subhead: `body-lg`, `stone-600`, max 480px width
- Primary CTA: `Start free` → `/register`
- Secondary: `See how it works` → smooth scroll to `#brain` or 90s product loop (muted, click-to-play)
- Product mock: slight parallax (4px) on scroll — disabled if `prefers-reduced-motion`
- Optional: typed metric ticker below mock — `42 fields monitored · 3 alerts resolved today` — JetBrains Mono, `body-sm`, Palantir nod

### Mobile UX

- Single column: copy stack → full-width product mock → CTAs
- CTAs: stacked full-width, 48px height; primary first
- Product mock: crop to show KPI + one AI insight card; horizontal scroll **not** used in hero
- Trust chips: wrap 2×2 or horizontal scroll
- Nav sticky; hero min-height 85vh minus nav

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Start free** | `/register` |
| Secondary | **See how it works** | `#brain` anchor |

---

## Section 2 — Nertura Brain

### Goal

Explain the **central intelligence architecture** — why Nertura is Palantir-class, not a ChatGPT wrapper. Build technical credibility with investors and operators.

### Content

| Element | Copy direction |
|---------|----------------|
| **Section label** | `✦ Nertura Brain` — Signal color |
| **Headline** | **One brain. Every channel. Every season.** |
| **Body** | The Nertura Brain routes every question, photo, and decision through a governed intelligence layer — memory, knowledge graph, and specialized agents. Your data stays yours. Models improve only with your consent. |
| **Architecture diagram** | Channels (Web · Mobile · WhatsApp · Email) → Brain gateway → Agents · Memory · Graph → Operations |
| **Four pillars** (grid) | **Remember** — 6-layer memory across seasons · **Connect** — Knowledge graph links fields, crops, orders · **Learn** — Validated feedback loops, not blind self-training · **Govern** — Human approval before autonomous action |
| **Trust callout** | "100% of interactions stored in Nertura — LLM providers are replaceable suppliers, not the system of record." |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░  DARK BAND — stone-950 background  ░░░░░░░░░░░░░░░░░░░  │
│                                                                              │
│  ✦ Nertura Brain                                                             │
│  One brain. Every channel. Every season.                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │     [Animated architecture diagram — nodes + edges, Signal accents]     │  │
│  │     Web ──┐                                                              │  │
│  │  WhatsApp ├──► BRAIN ──► Agents / Memory / Graph ──► Your operations   │  │
│  │   Mobile ─┘                                                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Remember │ │ Connect  │ │  Learn   │ │ Govern   │                        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                        │
│                                                                              │
│  [Explore Brain architecture →]                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Full-bleed dark section. Text `stone-100`. Diagram uses Forest + Signal node colors on dark canvas.

### Desktop UX

- Dark band full viewport width; content max 1120px centered
- Diagram: static SVG default; subtle pulse on Brain center node (2s loop)
- Pillar cards: `stone-900` surface, 1px `stone-800` border, icon + title + 2-line description
- Hover on pillar: border `signal-500` at 40%
- Link: docs deep-link to `/docs/nertura-brain-architecture.md` (public summary page in production)

### Mobile UX

- Diagram: simplified vertical stack — channels → Brain → outputs — swipeable if wide
- Pillars: 2×2 grid or vertical accordion (tap to expand detail)
- Reduce motion: static diagram only
- Text size: `heading-lg` headline; body remains 16px minimum

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Explore the Brain** | `/brain` or docs landing |
| Secondary | **Read architecture** | Technical doc (for developers / enterprise) |

---

## Section 3 — AI Agriculture Assistant

### Goal

Show the **AI Farmer** as actionable intelligence — photo diagnosis, spray windows, task creation — with explainability and sources (Stripe trust).

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Ask anything about your fields. Get answers you can act on.** |
| **Body** | Nertura AI knows your crops, weather, and season history. Every recommendation includes reasoning, confidence, and sources — and one-click actions to create tasks or reschedule work. |
| **Feature bullets** | Photo disease detection (4 launch crops) · Spray window advisor · Irrigation recommendations · Natural language in your language |
| **Conversation mock** | User: "Should I spray Field 2 today?" → AI: wind/rain analysis → Recommendation: Delay → `[Confirm reschedule]` action card |
| **Explainability strip** | Sources: Weather · Field 2 · Crop plan 2026 · Confidence: High |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-0 background                                                          │
│                                                                              │
│  ┌─────────────────────────────┐   Ask anything about your fields.          │
│  │  [AI panel mock — chat UI]  │   Body copy + feature list                 │
│  │  User bubble / AI bubble    │                                            │
│  │  Action card with Confirm     │   ✓ Disease detection from photo          │
│  │  Sources · Confidence         │   ✓ Spray window advisor                  │
│  └─────────────────────────────┘   ✓ Irrigation recommendations             │
│                                                                              │
│                                    [Try AI on Professional →]               │
└──────────────────────────────────────────────────────────────────────────────┘
```

Image left (7/12), copy right (5/12). Reverse of hero for rhythm.

### Desktop UX

- AI panel mock uses product-accurate styling: Signal header, action card with Forest button
- Feature list: check icons in `forest-500`, not bullet dots
- Optional interactive demo: pre-filled question; visitor clicks "Ask" → canned response animates in (no live API on marketing site at launch)
- Credit note (small): "AI included on Professional and above. Credits for high-volume use."

### Mobile UX

- Copy first, mock second
- Mock: fixed height 420px; internal scroll if needed
- Feature list: collapsible "What's included" accordion
- Tap mock → expands to near-full-screen preview modal

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Start with AI** | `/register?plan=professional` |
| Secondary | **See AI screens** | Product tour / wireframe gallery |

---

## Section 4 — WhatsApp Assistant

### Goal

Prove **channel parity** — same Brain on WhatsApp for emerging markets. Differentiator vs. web-only ag SaaS.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Your farm intelligence, in WhatsApp.** |
| **Body** | Send a crop photo, ask about frost risk, or confirm a task — from the app you already use. Same memory, same AI, same approval standards. Double opt-in. Reply STOP anytime. |
| **Phone mock** | WhatsApp thread: photo upload → disease result → recommended action · Frost alert template message |
| **Compliance chips** | Double opt-in · Credit-metered · KVKK/GDPR · No spam |
| **Stat** | "Built for markets where WhatsApp is the field office." |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-50 background                                                         │
│                                                                              │
│  Your farm intelligence,          ┌──────────────────┐                      │
│  in WhatsApp.                     │  [Phone frame]    │                      │
│                                   │  WhatsApp UI mock │                      │
│  Body + compliance chips          │  chat bubbles     │                      │
│                                   └──────────────────┘                      │
│  [Connect WhatsApp →]                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Copy left (5/12), phone mock right (7/12). Phone frame: neutral device chrome, not iPhone hero cliché.

### Desktop UX

- Phone mock: 320px wide, subtle `shadow-md`
- Message bubbles: authentic WhatsApp layout (green user / white Nertura) — brand green for user messages optional, test contrast
- Animated sequence: 3 messages fade in on scroll-into-view (stagger 200ms)
- wa.me link preview shown as secondary path

### Mobile UX

- Phone mock centered, max 280px width
- Copy above; compliance chips below mock
- **Connect WhatsApp** opens app deep-link or wa.me with pre-filled START (if configured)

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Connect WhatsApp** | `/register` → onboarding step or wa.me link |
| Secondary | **Learn about messaging** | WhatsApp integration doc / help article |

---

## Section 5 — Farm Management

### Goal

Ground the intelligence story in **operational reality** — farms, fields, crops, tasks — without looking like legacy farm ERP.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Operations that scale from one field to five hundred.** |
| **Body** | Map every parcel, plan every season, assign every task. Nertura is the system of record for what happens on your land — structured data that makes AI smarter every day. |
| **Capability grid** | Farms & field boundaries · Crop plans & growth stages · Tasks & scouting · Equipment & infrastructure · IoT sensor feeds [Pro+] |
| **Visual** | Split: satellite map with field polygons (status colors) + season Gantt/list panel |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-0 background                                                          │
│                                                                              │
│  Operations that scale from one field to five hundred.                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  [Full-width product screenshot — map + sidebar field list]             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│  │ Fields  │ │ Seasons │ │ Tasks   │ │ Equip   │ │ Sensors │                 │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                 │
│                                                                              │
│  [Explore farm management →]                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

Centered headline; full-bleed screenshot (max 1280px); 5-column icon grid below.

### Desktop UX

- Screenshot with subtle browser chrome frame (Stripe-style)
- Icon grid: Lucide icons, `heading-sm` title, one-line description each
- Hover on screenshot hotspots (optional): 3 pulsing dots on map → tooltip "Field health · Task overdue · Sensor offline"
- No tractor icons

### Mobile UX

- Screenshot: horizontal scroll with snap OR static crop showing map + one field card
- Icon grid: 2 columns; sensors row may wrap alone
- Hotspots disabled on mobile — static image

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Start managing fields** | `/register` |
| Secondary | **View farm module** | `/product/farms` or demo video |

---

## Section 6 — Marketplace

### Goal

Position commerce as **network intelligence**, not a classified ads page — demand signals, traceability, B2B trust.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Trade with context, not guesswork.** |
| **Body** | List harvest, input surplus, or buyer requirements. Every listing connects to your operational data — quality, quantity, and traceability already on file. |
| **Feature row** | Verified listings · Offer negotiation · Order tracking · Export documentation [Business+] |
| **Visual** | Marketplace browse UI: listing cards with crop, quantity, location, price; filter bar |
| **Social proof** | "From farm gate to export contract — one platform." |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-50 background                                                         │
│                                                                              │
│  Trade with context, not guesswork.                                          │
│  Body copy (centered, max 640px)                                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  [Marketplace UI mock — 3 listing cards + filter pills]                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Verified · Negotiate · Track · Export docs                                  │
│                                                                              │
│  [Browse marketplace →]  (Starter: browse only — footnote)                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop UX

- Listing cards: photo thumbnail, crop name, qty, region, price — clean card grid inside mock
- Filter pills: `Corn` `Wheat` `Export-ready` — interactive appearance, static on marketing site
- Footnote in `body-sm` `stone-500`: "Listing and trading on Professional+. Browse free on Starter."

### Mobile UX

- Single listing card featured full-width; peek of second card (carousel snap)
- Features: horizontal scroll chips
- CTA full-width

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Open marketplace** | `/register` or public browse `/marketplace` if available |
| Secondary | **For exporters** | Anchor to export use case or `/solutions/exporters` |

---

## Section 7 — Analytics & Intelligence

### Goal

Palantir moment — **data density done beautifully**. Show analytics as decision infrastructure, not vanity charts.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **See the whole operation. Predict what comes next.** |
| **Body** | Dashboards, custom reports, yield forecasts, and market signals — built on the same knowledge graph that powers your AI assistant. |
| **Metric strip** | Sample KPIs: `Yield forecast +8.2%` · `Water use −12%` · `3 fields need attention` — monospace |
| **Visual** | Dark-tinted analytics panel: line chart + field status donut + alert table row |
| **Tier note** | Standard reports on all plans · Custom builder on Business+ |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-0 background                                                          │
│                                                                              │
│  See the whole operation. Predict what comes next.                           │
│                                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐   ← KPI strip (mono numbers)              │
│  │ +8.2%  │ │ −12%   │ │ 3      │                                            │
│  └────────┘ └────────┘ └────────┘                                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  [Analytics dashboard mock — chart + map + table]                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [Explore analytics →]                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop UX

- KPI strip: JetBrains Mono, `metric-lg`, semantic colors for deltas
- Dashboard mock: slightly elevated card on `stone-100` background
- Optional: range selector pills (7d / 30d / Season) — static
- Cooperative callout link: "Aggregated reporting for member farms →"

### Mobile UX

- KPI strip: horizontal scroll, 3 cards snap
- Chart mock: simplified single chart + one table row
- Cooperative callout below CTA

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **See your dashboard** | `/register` |
| Secondary | **For cooperatives** | `/solutions/cooperatives` |

---

## Section 8 — Mobile App

### Goal

Establish **field-first, offline-capable** mobile as primary interface — Apple product-page clarity.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Built for the field. Works without signal.** |
| **Body** | Log observations, complete tasks, and get alerts from your pocket. Camera-first scouting with on-device disease detection. Syncs when you're back in range. |
| **Feature list** | Offline observations · Push alerts · Camera + AI diagnosis · Bottom-tab navigation · Same Brain as web |
| **Visual** | 2–3 phone screens: Home dashboard · Camera capture · AI result overlay |
| **Store badges** | App Store · Google Play · PWA (optional) |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-50 background                                                         │
│                                                                              │
│  Built for the field. Works without signal.                                  │
│                                                                              │
│       ┌─────┐    ┌─────┐    ┌─────┐                                          │
│       │Home │    │Camera│   │Result│   ← 3 phones, slight overlap/fan       │
│       └─────┘    └─────┘    └─────┘                                          │
│                                                                              │
│  Feature bullets (centered)          [App Store] [Google Play]               │
│                                                                              │
│  [Get the app →]                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop UX

- Phone fan: center phone 100% opacity; side phones 85% + 8px offset
- Offline banner visible on Home mock (amber strip) — proves capability
- Store badges: official assets, equal height 40px

### Mobile UX

- Single phone mock (Home screen); swipe carousel for Camera / Result
- Store badges stacked or side-by-side centered
- **Get the app** smart link: detects platform

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Get the app** | Store links or `/register` (account required) |
| Secondary | **See mobile screens** | Mobile wireframe gallery |

---

## Section 9 — Content & Community

### Goal

Preview **self-growing intelligence** — Media Factory content, future community network — without over-promising v1.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Knowledge that grows with every season.** |
| **Body** | Expert guides, crop insights, and peer-validated practices — curated by Nertura and powered by the same Brain that serves your farm. Human-approved at launch; community contributions coming. |
| **Two columns** | **Content** — Daily agricultural intelligence: articles, short video, WhatsApp tips · **Community** [Coming] — Share practices, learn from verified growers, expert validation |
| **Visual** | Content card grid: 3 article/video cards with crop tag + read time |
| **Honesty badge** | "All public AI content is approval-gated at launch." |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-0 background                                                          │
│                                                                              │
│  Knowledge that grows with every season.                                     │
│  Body (centered)                                                             │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                          │
│  │  Content             │  │  Community [Soon]    │                          │
│  │  [3 content cards]   │  │  [Illustration: network]│                       │
│  └──────────────────────┘  └──────────────────────┘                          │
│                                                                              │
│  Approval-gated badge                                                        │
│  [Read the blog →]  [Join waitlist →]                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop UX

- Content cards: thumbnail, crop pill, title, 3 min read
- Community column: desaturated / "Coming soon" ribbon — honest, not hidden
- Blog links open `blog.nertura.com` or `/blog`

### Mobile UX

- Tabs: `Content` | `Community` — Community tab shows waitlist form
- Cards: vertical stack
- Waitlist: email only, inline validation

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Read the blog** | `/blog` |
| Secondary | **Join community waitlist** | Email capture modal |

---

## Section 10 — Pricing

### Goal

Stripe-grade **transparent pricing** — clear tiers, no "contact us" for standard plans, upgrade path obvious.

### Content

| Element | Copy direction |
|---------|----------------|
| **Headline** | **Plans that grow with your operation.** |
| **Subhead** | Start free trial on Starter. Upgrade when you need AI, marketplace, or multi-farm scale. |
| **Toggle** | Monthly / Annual (save ~17%) |
| **Four tiers** | Starter $29 · Professional $99 · Business $349 · Enterprise Custom |
| **Highlight** | Professional badge: "Most popular" — includes AI Assistant |
| **Credit note** | "AI credits included; additional credits available. See credit policy." |
| **Comparison link** | Full feature matrix |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-50 background · id="pricing"                                          │
│                                                                              │
│  Plans that grow with your operation.                                        │
│                    [ Monthly | Annual ]                                      │
│                                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Starter  │ │ Pro ★    │ │ Business │ │Enterprise│                        │
│  │ $29/mo   │ │ $99/mo   │ │ $349/mo  │ │ Custom   │                        │
│  │ 3 bullets│ │ 5 bullets│ │ 5 bullets│ │ Contact  │                        │
│  │ [Start]  │ │ [Start]  │ │ [Start]  │ │ [Talk]   │                        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                        │
│                                                                              │
│  Compare all features →    PPP pricing available in select regions           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tier card content (bullets max 5 each)

| Tier | Top bullets |
|------|-------------|
| **Starter** | 1 farm · 10 fields · 3 users · Weather + inventory basics · Mobile offline |
| **Professional** | 5 farms · AI Assistant + disease detection · Marketplace · CRM basic · Custom dashboard |
| **Business** | Unlimited farms · 50 users · Custom reports · Member billing · Yield + market AI |
| **Enterprise** | Unlimited everything · SSO · Dedicated support · Data residency · Custom AI |

### Desktop UX

- 4 equal-width cards; Professional: 1px `forest-500` border + "Most popular" pill
- Annual toggle updates prices with 150ms number crossfade
- Each card: one primary CTA at bottom aligned across row
- Enterprise: "Talk to sales" opens form or Calendly — not dead end

### Mobile UX

- Horizontal scroll carousel with snap; Professional card centered on load
- Dots indicator below
- Compare features: link to full page (table scrolls horizontally)
- Sticky bottom bar on pricing section: `Start with Professional — $99/mo`

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary (per card) | **Start free trial** / **Talk to sales** | `/register?plan=` or sales form |
| Secondary | **Compare all features** | `/pricing#matrix` |

---

## Section 11 — FAQ

### Goal

Remove **trust friction** — data ownership, AI safety, pricing, WhatsApp, offline — before signup.

### Content

| # | Question | Answer summary |
|---|----------|----------------|
| 1 | What is Nertura? | AgOS — operations + AI + commerce + analytics; not a single-purpose app |
| 2 | Who owns my farm data? | You do. Nertura is steward. No sale of identifiable field data. |
| 3 | Does AI train on my data? | Serves you by default; global model training **opt-in only** |
| 4 | Is AI content published automatically? | No — human approval required at launch for all public content |
| 5 | Does it work offline? | Mobile observations and core tasks yes; sync when connected |
| 6 | How does WhatsApp work? | Double opt-in; same Brain; credit-metered; STOP anytime |
| 7 | What crops does disease detection support? | 4 crops at launch; expanding — list in docs |
| 8 | Can cooperatives manage member farms? | Business tier — aggregated dashboards, member billing, CRM |
| 9 | Is Nertura GDPR / KVKK compliant? | Yes — DPA available; data residency on Enterprise |
| 10 | Can I switch plans or cancel? | Self-serve billing; export your data anytime |

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-0 background                                                          │
│                                                                              │
│  Frequently asked questions                                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ▼ What is Nertura?                                                     │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  ▶ Who owns my farm data?                                               │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  ▶ Does AI train on my data?                                            │  │
│  │  ... (accordion)                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Still have questions? [Contact support →]                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

Single column, max 720px centered. Accordion — one open at a time.

### Desktop UX

- Accordion row: 64px min height; chevron right; expand 200ms ease
- Open state: answer `body-md` `stone-600`, padding-bottom 24px
- First item open by default
- Link within answers to docs (data ownership, AI governance)

### Mobile UX

- Full-width accordion; 48px min tap target per row
- Support link: opens mailto or in-app chat widget if enabled

### CTA

| Button | Label | Destination |
|--------|-------|-------------|
| Primary | **Contact support** | `/help/contact` or support@ |
| Secondary | **Read documentation** | `/docs` |

---

## Section 12 — Footer

### Goal

Navigation exhaust, legal trust, locale readiness — Stripe-style comprehensive footer.

### Content

| Column | Links |
|--------|-------|
| **Product** | Dashboard · AI Assistant · Farm Management · Marketplace · Analytics · Mobile · WhatsApp |
| **Brain** | Overview · Architecture · Agents · Data ownership · AI governance |
| **Solutions** | Farmers · Cooperatives · Exporters · Suppliers · Enterprise |
| **Resources** | Blog · Documentation · Help center · Status page · Community waitlist |
| **Company** | About · Careers · Press · Contact · Partners |
| **Legal** | Privacy · Terms · KVKK · GDPR · Cookie settings |

**Footer bottom row:** © 2026 Nertura · Language selector · Social (LinkedIn, X, YouTube — no Facebook required)

**Newsletter (optional):** "Weekly crop intelligence" — email + Subscribe; double opt-in

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-950 background · light text                                         │
│                                                                              │
│  [Logo mark white]                                                           │
│  Intelligence rooted in the soil.                                            │
│                                                                              │
│  Product    Brain      Solutions   Resources   Company   Legal             │
│  · links    · links    · links     · links     · links   · links            │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  [Newsletter email input — optional]                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  © 2026 Nertura          English ▾          [social icons]                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Desktop UX

- 6-column link grid; column heading `label` uppercase optional, `stone-400`
- Links: `body-sm` `stone-300`, hover `stone-0`
- Newsletter: inline input + button, max 400px
- Language selector: dropdown — EN, TR (launch); more later

### Mobile UX

- Accordion columns: tap Product / Brain / etc. to expand link list
- Logo + tagline top
- Newsletter stacked full-width
- Social + language on bottom row

### CTA

| Element | Label | Destination |
|---------|-------|-------------|
| Final conversion band (above footer) | **Ready to grow smarter?** + `[Start free]` | `/register` |
| Newsletter | **Subscribe** | Email capture API |
| Footer links | — | Respective routes |

---

## Final Conversion Band (Pre-Footer)

Insert immediately before footer on all viewports.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  stone-100 background · centered                                             │
│                                                                              │
│  Ready to grow smarter?                                                      │
│  Start with one farm. Scale to the entire value chain.                       │
│                                                                              │
│  [Start free]    [Talk to sales]                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

| CTA | Destination |
|-----|-------------|
| **Start free** | `/register` |
| **Talk to sales** | Enterprise / cooperative sales form |

---

## Page Flow Summary

| # | Section | Background | Primary CTA |
|---|---------|------------|-------------|
| — | Nav | transparent → white | Start free |
| 1 | Hero | stone-50 | Start free |
| 2 | Nertura Brain | stone-950 (dark) | Explore the Brain |
| 3 | AI Assistant | stone-0 | Start with AI |
| 4 | WhatsApp | stone-50 | Connect WhatsApp |
| 5 | Farm Management | stone-0 | Start managing fields |
| 6 | Marketplace | stone-50 | Open marketplace |
| 7 | Analytics | stone-0 | See your dashboard |
| 8 | Mobile App | stone-50 | Get the app |
| 9 | Content & Community | stone-0 | Read the blog |
| 10 | Pricing | stone-50 | Start free trial |
| 11 | FAQ | stone-0 | Contact support |
| 12 | Footer | stone-950 | Start free (band above) |

---

## Motion & Interaction (Global)

| Interaction | Spec |
|-------------|------|
| Scroll reveal | Sections fade + translateY 12px; 400ms ease-out; stagger children 100ms |
| Anchor links | Smooth scroll; nav highlights active section |
| Reduced motion | Disable parallax, diagram pulse, message stagger |
| Focus | Visible ring on all interactive elements |
| Loading | Marketing site static; no skeleton needed |

---

## SEO & Meta (Content Notes)

| Field | Value |
|-------|-------|
| **Title** | Nertura — AI Agriculture Operating System |
| **Description** | Intelligence for farms, cooperatives, and agribusiness. AI assistant, operations, marketplace, and analytics — one platform from field to export. |
| **OG image** | Product dashboard mock on stone-50 — not field photo |

---

## Analytics Events (Design Handoff)

| Event | Trigger |
|-------|---------|
| `homepage_cta_click` | Any primary CTA; property: `section`, `label` |
| `homepage_pricing_toggle` | Monthly / annual switch |
| `homepage_faq_expand` | Question id |
| `homepage_nav_anchor` | Section id |
| `homepage_waitlist_submit` | Community email |

---

## Asset Checklist (Design)

- [ ] Hero dashboard mock (light mode, farmer variant)
- [ ] Brain architecture SVG (dark + light variants)
- [ ] AI panel conversation mock
- [ ] WhatsApp phone mock (3-message sequence)
- [ ] Farm map screenshot with field polygons
- [ ] Marketplace listing grid mock
- [ ] Analytics dashboard mock (KPI + chart)
- [ ] Mobile 3-screen fan (Home · Capture · Result)
- [ ] Content card thumbnails × 3
- [ ] Pricing tier cards with toggle states
- [ ] Footer logo mark (white)

---

*Homepage wireframe v1.0 — aligns with `/docs/design-system.md`. No application code.*
