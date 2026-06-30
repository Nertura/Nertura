# Nertura — Platform Sitemap

> Complete information architecture for the Nertura web and mobile applications. Every route, screen, and nested view documented for design and engineering alignment.

---

## Sitemap Conventions

| Symbol | Meaning |
|--------|---------|
| `/path` | Route (web) or screen identifier (mobile) |
| `(modal)` | Overlay; no route change |
| `(drawer)` | Slide-over panel |
| `[tier]` | Gated by subscription tier |
| `[role]` | Gated by user role |

**Depth limit:** Maximum 4 levels from root. Deep links always resolve to a named screen.

---

## Level 0 — Public & Auth

```
nertura.com/
├── /                           → Marketing homepage (external)
├── /login                      → Sign in
├── /register                   → Account creation
├── /register/verify            → Email verification
├── /forgot-password            → Password reset request
├── /reset-password/:token      → Password reset form
├── /invite/:token              → Accept organization invite
└── /sso/:provider              → Enterprise SSO callback [Enterprise]
```

---

## Level 1 — Application Root

```
/app/
├── /app                        → Redirect to role-appropriate dashboard
├── /app/onboarding             → First-run wizard (new organizations)
├── /app/onboarding/:step       → Wizard step (farm, field, crop, team)
└── /app/search                 → Global search (⌘K) [all tiers]
```

---

## Level 2 — Primary Modules

```
/app/
│
├── /app/dashboard              → Home / command center
│
├── /app/farms                  → Farm Management
├── /app/crops                  → Crop Management
├── /app/weather                → Weather Intelligence
├── /app/irrigation             → Irrigation [Professional+]
├── /app/inventory              → Inventory
├── /app/marketplace            → Marketplace
├── /app/crm                    → CRM [Professional+ basic, Business+ full]
├── /app/reports                → Reports & analytics
├── /app/notifications          → Notification center
│
├── /app/settings               → Organization settings
├── /app/billing                → Subscription & invoices
├── /app/users                  → User & role management
│
└── /app/ai                     → AI Assistant (full-page mode)
```

---

## Level 3 — Farm Management

```
/app/farms/
├── /app/farms                          → Farm list (grid / table / map)
├── /app/farms/new                      → Create farm wizard
├── /app/farms/:farmId                  → Farm detail (tabbed)
│   ├── /app/farms/:farmId/overview     → Summary, map, KPIs
│   ├── /app/farms/:farmId/fields       → Field list
│   ├── /app/farms/:farmId/infrastructure
│   ├── /app/farms/:farmId/equipment
│   ├── /app/farms/:farmId/iot          → IoT devices [Professional+]
│   ├── /app/farms/:farmId/team         → Assigned users
│   └── /app/farms/:farmId/history      → Rotation history
│
├── /app/farms/:farmId/fields/new       → Create field (map draw)
├── /app/farms/:farmId/fields/:fieldId  → Field detail (tabbed)
│   ├── .../overview
│   ├── .../soil
│   ├── .../season                      → Active crop plan
│   ├── .../observations
│   ├── .../tasks
│   └── .../sensors                     → Live IoT [Professional+]
│
├── /app/farms/:farmId/fields/:fieldId/edit   → Field boundary editor
├── /app/farms/:farmId/equipment/:equipId     → Equipment detail
└── /app/farms/:farmId/iot/:deviceId          → Device detail & config
```

---

## Level 3 — Crop Management

```
/app/crops/
├── /app/crops                          → Season overview (Gantt / list)
├── /app/crops/plans/new                → Crop plan wizard
├── /app/crops/plans/:planId            → Crop plan detail (tabbed)
│   ├── .../plan                        → Plan summary & growth stage
│   ├── .../tasks                       → Task list / board
│   ├── .../inputs                      → Input applications
│   ├── .../observations                → Scouting & photos
│   ├── .../pests                       → Pest & disease log
│   ├── .../harvest                     → Harvest records
│   └── .../ai                          → Yield prediction [Business+]
│
├── /app/crops/tasks                    → Global task board
├── /app/crops/tasks/:taskId            → Task detail
├── /app/crops/observations/new         → New observation (photo + AI)
├── /app/crops/observations/:obsId      → Observation detail + AI result
├── /app/crops/harvest/new              → Record harvest
└── /app/crops/catalog                  → Crop catalog [Admin]
```

---

## Level 3 — Weather Intelligence

```
/app/weather/
├── /app/weather                        → Weather dashboard
├── /app/weather/map                    → Full-screen weather map
├── /app/weather/alerts                 → Active & historical alerts
├── /app/weather/alerts/:alertId        → Alert detail + actions
└── /app/weather/settings               → Alert preferences
```

---

## Level 3 — Irrigation

```
/app/irrigation/                        [Professional+]
├── /app/irrigation                     → Overview (systems, schedules, budget)
├── /app/irrigation/systems/:systemId   → System detail
├── /app/irrigation/schedules           → Schedule calendar
├── /app/irrigation/schedules/new       → Create schedule
├── /app/irrigation/log                 → Irrigation history
├── /app/irrigation/moisture            → Soil moisture monitor
└── /app/irrigation/budget              → Water budget & cost
```

---

## Level 3 — Inventory

```
/app/inventory/
├── /app/inventory                      → Stock overview
├── /app/inventory/products/new         → Add product
├── /app/inventory/products/:productId  → Product detail
├── /app/inventory/movements/new        → Stock movement
├── /app/inventory/warehouses           → Warehouse list
├── /app/inventory/warehouses/:whId     → Warehouse detail
└── /app/inventory/alerts               → Low stock & expiry
```

---

## Level 3 — Marketplace

```
/app/marketplace/
├── /app/marketplace                    → Browse (default landing)
├── /app/marketplace/search             → Search results
├── /app/marketplace/listings/:listingId → Listing detail
├── /app/marketplace/listings/new       → Create listing
├── /app/marketplace/listings/:id/edit  → Edit listing
├── /app/marketplace/requirements       → Buyer requirements feed
├── /app/marketplace/requirements/new   → Post requirement
├── /app/marketplace/offers             → Offers & negotiations
├── /app/marketplace/offers/:offerId    → Offer thread
├── /app/marketplace/orders             → Order list
├── /app/marketplace/orders/:orderId    → Order detail
└── /app/marketplace/messages           → Marketplace messaging
```

---

## Level 3 — CRM

```
/app/crm/                               [Professional+ basic, Business+ full]
├── /app/crm                            → CRM dashboard (pipeline summary)
├── /app/crm/accounts                   → Account list
├── /app/crm/accounts/new               → Create account
├── /app/crm/accounts/:accountId        → Account detail (tabbed)
│   ├── .../overview
│   ├── .../contacts
│   ├── .../interactions
│   ├── .../deals
│   ├── .../orders
│   └── .../documents
├── /app/crm/contacts/:contactId        → Contact detail
├── /app/crm/interactions/new           → Log interaction
├── /app/crm/pipeline                   → Deal pipeline board
├── /app/crm/deals/:dealId              → Deal detail
└── /app/crm/members                    → Cooperative members [Business+]
    └── /app/crm/members/:memberId      → Member profile
```

---

## Level 3 — Reports

```
/app/reports/
├── /app/reports                        → Report library
├── /app/reports/:reportSlug/run        → Run standard report
├── /app/reports/:reportSlug/view/:runId → View generated report
├── /app/reports/builder                → Custom report builder [Business+]
├── /app/reports/builder/:reportId      → Edit custom report
└── /app/reports/scheduled              → Scheduled reports
```

---

## Level 3 — Notifications

```
/app/notifications/
├── /app/notifications                  → Notification center (all)
└── /app/notifications/settings         → Per-user preferences
```

---

## Level 3 — Settings & Admin

```
/app/settings/
├── /app/settings/general               → Org name, logo, locale
├── /app/settings/localization          → Language, units, formats
├── /app/settings/security              → MFA policy, sessions
├── /app/settings/integrations          → API keys, webhooks [Business+]
└── /app/settings/sso                   → SSO config [Enterprise]

/app/billing/
├── /app/billing                        → Subscription overview
├── /app/billing/plans                  → Plan comparison
├── /app/billing/invoices               → Invoice history
├── /app/billing/payment-methods        → Saved payment methods
└── /app/billing/members                → Member billing [Business+]

/app/users/
├── /app/users                          → User list
├── /app/users/invite                   → Invite user
├── /app/users/:userId                  → User detail
└── /app/users/roles                    → Roles & permissions
```

---

## Level 3 — AI Assistant

```
/app/ai/
├── /app/ai                             → Full-page chat (default)
├── /app/ai/conversations               → Conversation history
├── /app/ai/conversations/:convId       → Resume conversation
└── /app/ai/insights                    → Proactive insights feed [V2]
```

**Persistent panel:** `(drawer)` — available on every `/app/*` route via floating trigger.

---

## Mobile Sitemap (Native / PWA)

```
Mobile root: nertura:// / https://app.nertura.com/m/

/m/home                    → Dashboard (role-aware)
/m/farms                   → Farm list
/m/farms/:farmId           → Farm detail
/m/farms/:farmId/fields/:fieldId → Field detail
/m/crops                   → Tasks & season
/m/crops/tasks/:taskId     → Task detail
/m/capture                 → Quick observation (camera-first)
/m/capture/result          → AI disease result
/m/weather                 → Weather & alerts
/m/alerts                  → Notification center
/m/marketplace             → Browse listings
/m/marketplace/:listingId → Listing detail
/m/more                    → Overflow menu
/m/more/inventory
/m/more/irrigation
/m/more/crm
/m/more/ai
/m/more/settings
/m/offline                 → Offline sync status
/m/sync                    → Manual sync trigger
```

---

## Role-Based Landing Routes

| Role | Default route after login |
|------|---------------------------|
| Owner / Farmer | `/app/dashboard` (Farmer variant) |
| Manager | `/app/dashboard` (Manager variant) |
| Cooperative admin | `/app/dashboard` (Cooperative variant) |
| Exporter / Buyer | `/app/marketplace` or `/app/dashboard` (Export variant) |
| Supplier | `/app/crm` or `/app/dashboard` |
| Operator | `/app/crops/tasks` |
| Viewer | `/app/dashboard` (read-only) |
| Platform admin | `/app/users` |

---

## Sitemap Statistics

| Metric | Count |
|--------|-------|
| Top-level modules | 12 |
| Level-3 route groups | 14 |
| Named screens (web) | ~95 |
| Named screens (mobile) | ~25 |
| Modals / drawers | ~18 |
| Tier-gated areas | 6 |

---

## Cross-Module Deep Links

AI Assistant and notifications link directly into entity screens:

| Source | Target example |
|--------|----------------|
| Notification: frost alert | `/app/weather/alerts/:alertId` |
| Notification: task overdue | `/app/crops/tasks/:taskId` |
| AI action: create task | `/app/crops/tasks/:taskId` (after confirm) |
| Marketplace order update | `/app/marketplace/orders/:orderId` |
| Low stock alert | `/app/inventory/products/:productId` |

---

## SEO & External (Out of App Scope)

Marketing site sitemap (`nertura.com`) is maintained separately. App routes under `/app/*` are `noindex`.

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Companion: `/ui/navigation-structure.md`, `/wireframes/platform-structure.md`*
