# Nertura — Platform Structure & Navigation

> Complete screen inventory, navigation architecture, and user flows for the Nertura web and mobile applications.

---

## Platform Overview

Nertura ships as two primary clients sharing a unified backend:

| Client | Primary Users | Context |
|--------|---------------|---------|
| **Web Application** | Managers, admins, cooperatives, exporters | Desktop/tablet — planning, reporting, administration |
| **Mobile Application** | Farmers, field workers, scouts | Phone/tablet — field operations, offline-capable |

Both clients share identical navigation structure with responsive layout adaptations.

---

## Global Navigation Architecture

### Web — Primary Sidebar

```
┌──────────────────┐
│  🌱 Nertura       │
│  [Org Switcher ▾] │
├──────────────────┤
│  ■ Dashboard      │
│  ■ Farms          │
│  ■ Crops          │
│  ■ Weather        │
│  ■ Irrigation     │
│  ■ Inventory      │
│  ■ Marketplace    │
│  ■ CRM            │
│  ■ Reports        │
│  ■ Notifications  │
├──────────────────┤
│  ⚙ Settings       │
│  💳 Billing        │
│  👥 Users          │
├──────────────────┤
│  🤖 AI Assistant   │  ← persistent floating panel
└──────────────────┘
```

### Mobile — Bottom Tab Bar

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Screen Content]               │
│                                             │
├───────┬───────┬───────┬───────┬─────────────┤
│ Home  │ Farms │ Crops │ Alert │  More ▾     │
│  🏠   │  🗺   │  🌾   │  🔔   │  ☰          │
└───────┴───────┴───────┴───────┴─────────────┘
```

**More menu:** Weather, Irrigation, Inventory, Marketplace, CRM, Reports, AI Assistant, Settings

---

## Authentication & Onboarding Flows

### Screen: Login

| Element | Description |
|---------|-------------|
| Email / password fields | Standard authentication |
| "Forgot password" link | Password reset flow |
| SSO button | Enterprise SAML/OIDC (Enterprise tier) |
| Language selector | Pre-login language preference |
| "Create account" link | Registration flow |

### Screen: Registration

| Step | Fields / Actions |
|------|------------------|
| 1. Account | Email, password, full name |
| 2. Organization | Org name, type (farm, cooperative, company, supplier, exporter) |
| 3. Profile | Role, country, timezone, language |
| 4. Plan selection | Choose subscription tier |
| 5. Verification | Email confirmation |
| 6. Onboarding wizard | Guided first-farm setup |

### Screen: Onboarding Wizard

| Step | Content |
|------|---------|
| Welcome | Platform overview video / tour |
| Create first farm | Name, location (map pin), size |
| Add first field | Draw boundary on map or enter area |
| Select crops | Choose current/planned crops |
| Invite team | Optional team member invites |
| Done | Redirect to Dashboard |

### Screen: Forgot Password / Reset Password

Standard email-based password recovery flow.

---

## 1. Dashboard Module

### Screen: Dashboard (Home)

| Section | Content |
|---------|---------|
| **Header** | Greeting, date, farm selector dropdown, weather snapshot |
| **KPI row** | 4–6 metric cards (yield, tasks, alerts, inventory, sales) |
| **Alert feed** | Critical and recent notifications |
| **Task list** | Today's and overdue tasks |
| **AI insights** | Proactive recommendations panel |
| **Weather widget** | Current + 7-day forecast mini chart |
| **Quick actions** | FAB menu: log observation, create task, add inventory |
| **Activity feed** | Recent team activity across modules |

**Role variants:**
- **Farmer:** Simplified 4-widget layout, large quick actions
- **Manager:** Multi-farm selector, team activity, field status map
- **Cooperative:** Member summary, aggregate KPIs, group alerts
- **Executive:** High-level scorecards, trend charts, no field detail

### Screen: Dashboard Customization (Professional+)

Drag-and-drop widget editor to add, remove, and rearrange dashboard widgets.

---

## 2. Farm Management Module

### Screen: Farm List

| Element | Description |
|---------|-------------|
| Search / filter bar | By name, region, crop, status |
| Farm cards / table | Name, location, total area, active crops, status indicator |
| "Add Farm" button | Create new farm |
| Map view toggle | All farms on map |

### Screen: Farm Detail

| Tab | Content |
|-----|---------|
| **Overview** | Farm info, total area, team, active crops summary, map |
| **Fields** | List of fields with area, current crop, status |
| **Infrastructure** | Storage, greenhouses, processing units |
| **Equipment** | Machinery registry with maintenance status |
| **IoT Devices** | Connected sensors and stations |
| **Team** | Assigned users and roles |
| **History** | Season-by-season crop rotation log |

### Screen: Field Detail

| Section | Content |
|---------|---------|
| **Map** | Field boundary with zone overlays, satellite imagery |
| **Info panel** | Area, soil type, current crop, irrigation system |
| **Soil records** | Test history, nutrient levels chart |
| **Current season** | Active crop plan summary with growth stage |
| **Observations** | Photo gallery from scouting |
| **Tasks** | Field-specific task list |
| **IoT data** | Live sensor readings (moisture, temperature) |

### Screen: Field Editor (Create / Edit)

| Element | Description |
|---------|-------------|
| Map drawing tool | Polygon draw, GPS walk, import KML/Shapefile |
| Field properties form | Name, soil type, notes |
| Zone sub-division | Draw zones within field |
| Save / cancel | Validation on minimum area |

### Screen: Equipment Detail

Equipment info, maintenance log, assignment history, linked fields.

### Screen: IoT Device Management

Device registry, pairing wizard, live data view, alert threshold configuration.

---

## 3. Crop Management Module

### Screen: Crop Season Overview

| Element | Description |
|---------|-------------|
| Season selector | Dropdown for crop year/season |
| Gantt calendar | All crop plans across fields on timeline |
| Status summary | Fields by growth stage (planting, vegetative, reproductive, harvest) |
| "New Crop Plan" button | Create plan wizard |

### Screen: Crop Plan Detail

| Tab | Content |
|-----|---------|
| **Plan** | Crop, variety, field, dates, target yield |
| **Growth stages** | Visual timeline with current stage highlighted |
| **Tasks** | Scheduled and completed tasks for this plan |
| **Inputs** | Applied inputs log (fertilizer, pesticide, seed) |
| **Observations** | Scouting records with photos |
| **Disease/Pest** | Incident log with AI detection results |
| **Harvest** | Yield records, quality grades |
| **AI** | Yield prediction, recommendations |

### Screen: Crop Plan Wizard (Create)

| Step | Content |
|------|---------|
| 1. Select field | Choose field(s) |
| 2. Select crop | Crop catalog with variety |
| 3. Set dates | Planting, expected harvest |
| 4. Set targets | Target yield, quality grade |
| 5. Generate tasks | AI-suggested task schedule (editable) |
| 6. Review & save | Summary confirmation |

### Screen: Task Board

| View | Description |
|------|-------------|
| **Kanban** | Columns: To Do, In Progress, Done, Overdue |
| **Calendar** | Tasks on calendar by due date |
| **List** | Filterable table with assignee, field, status |
| **Map** | Tasks plotted on field map |

### Screen: Task Detail

Task info, assignee, field, due date, instructions, completion form (notes, photos, inputs used).

### Screen: Field Observation (Create)

| Element | Description |
|---------|-------------|
| Photo capture/upload | Camera or gallery; triggers AI disease detection |
| AI result panel | Disease/pest identification with confidence |
| Notes field | Free text observation |
| Geo-tag | Auto-captured GPS |
| Severity selector | None, low, medium, high |
| Link to crop plan | Auto-linked based on field |

### Screen: Harvest Recording

Quantity, unit, quality grade, harvest date, storage location, link to inventory.

### Screen: Crop Catalog (Admin)

Browse and manage crop types, varieties, growth stage definitions, input templates.

---

## 4. Weather Intelligence Module

### Screen: Weather Dashboard

| Section | Content |
|---------|---------|
| **Location selector** | Farm/field selector |
| **Current conditions** | Large display: temp, humidity, wind, rain |
| **Hourly forecast** | 48-hour scrollable chart |
| **Daily forecast** | 14-day table/cards |
| **Risk alerts** | Active weather risk cards with severity |
| **Agricultural indices** | GDD, ET, frost hours accumulated |
| **Spray window** | Green/yellow/red indicator for spraying conditions |
| **Historical chart** | Temperature/rainfall trends (selectable period) |

### Screen: Weather Map

Full-screen map with overlay layers: precipitation, temperature, radar, wind, risk zones.

### Screen: Alert Configuration

| Setting | Options |
|---------|---------|
| Alert types | Toggle per risk type (frost, heat, flood, drought, wind) |
| Thresholds | Custom values per alert type |
| Channels | In-app, push, email, SMS |
| Quiet hours | Start/end time |
| Farm scope | Per-farm or org-wide |

### Screen: Alert Detail

Risk description, probability, impact assessment, recommended actions, affected fields list.

---

## 5. Irrigation Module

### Screen: Irrigation Overview

| Element | Description |
|---------|-------------|
| Farm selector | Multi-farm support |
| System list | All irrigation systems with status |
| Active schedules | Currently running and upcoming |
| Water usage summary | Today, this week, this season vs budget |
| AI recommendation banner | "Irrigate Field 3 today — 25mm recommended" |

### Screen: Irrigation System Detail

System type, linked fields, capacity, connected IoT devices, schedule history.

### Screen: Schedule Editor

| Element | Description |
|---------|-------------|
| Calendar view | Irrigation events on calendar |
| Create schedule | Field, duration, volume, recurrence |
| AI suggestion | "Apply AI recommendation" button |
| Automation toggle | Advisory / semi-auto / full-auto |

### Screen: Water Budget

| Element | Description |
|---------|-------------|
| Budget allocation | Total water budget per season |
| Usage tracker | Progress bar: used vs allocated |
| Per-field breakdown | Table/chart of water use by field |
| Cost summary | Water cost per field, per crop |

### Screen: Irrigation Log

Filterable history of all irrigation events with volume, duration, method, operator.

### Screen: Soil Moisture Monitor

Real-time moisture readings from IoT sensors, chart over time, threshold indicators.

---

## 6. Inventory Module

### Screen: Inventory Overview

| Element | Description |
|---------|-------------|
| Summary cards | Total SKUs, total value, low-stock count, expiring soon |
| Category tabs | Seeds, fertilizers, pesticides, fuel, harvest, packaging |
| Stock table | Product, location, quantity, status, last movement |
| Search / filter | By name, category, location, status |
| "Add Product" / "Stock Movement" buttons | |

### Screen: Product Detail

Product info, current stock by location, batch/lot details, movement history, linked supplier (CRM).

### Screen: Stock Movement (Create)

| Field | Options |
|-------|---------|
| Movement type | Receive, transfer, consume, sell, adjust |
| Product | Select from catalog |
| Quantity | Amount and unit |
| From / to location | Warehouse selection |
| Reference | Link to crop application, order, or manual |
| Batch/lot | Lot number, expiry |

### Screen: Warehouse Management

List of storage locations with capacity, current occupancy, linked farm.

### Screen: Low Stock / Expiry Alerts

Filtered view of products below minimum threshold or approaching expiry.

### Screen: Inventory Valuation Report

Total value by category, location, and trend over time.

---

## 7. Marketplace Module

### Screen: Marketplace Browse

| Element | Description |
|---------|-------------|
| Search bar | Full-text search |
| Filters | Crop, region, quantity, price range, certification, quality grade |
| Sort | Price, date, quantity, distance |
| Listing cards | Product image, title, price, quantity, seller, location |
| View toggle | Grid / list / map |
| "Create Listing" button | |
| "Post Requirement" button | Buyer wanted ads |

### Screen: Listing Detail

| Section | Content |
|---------|---------|
| **Photos** | Product images gallery |
| **Details** | Crop, quantity, quality grade, price, unit |
| **Seller info** | Organization name, rating, location, verified badge |
| **Traceability** | Farm origin, crop plan link, certifications |
| **Logistics** | Delivery terms, pickup location, available date |
| **Actions** | "Make Offer", "Message Seller", "Add to Watchlist" |

### Screen: Create / Edit Listing

| Field | Description |
|-------|-------------|
| Product | Select from inventory or manual entry |
| Quantity & unit | Available amount |
| Price | Per unit, currency, negotiable toggle |
| Quality specs | Grade, moisture, certifications |
| Photos | Upload product images |
| Delivery terms | FOB, CIF, pickup, etc. |
| Visibility | Public, cooperative members only, specific buyers |

### Screen: Buyer Requirement (Create)

Crop needed, quantity, quality requirements, delivery destination, price range, deadline.

### Screen: Offers & Negotiations

| Tab | Content |
|-----|---------|
| **Sent offers** | Offers you've made on listings |
| **Received offers** | Offers on your listings |
| **Active negotiations** | Ongoing message threads with offer history |
| **Completed** | Closed deals |

### Screen: Order Detail

Order status timeline, parties, product details, agreed price, logistics, documents, payment status.

### Screen: Marketplace Messages

In-platform messaging threads linked to listings and orders.

---

## 8. CRM Module

### Screen: CRM Dashboard

Pipeline summary, recent interactions, upcoming follow-ups, top accounts by revenue.

### Screen: Contact / Account List

Searchable table/cards: name, type (customer, supplier, buyer, member), last interaction, status tag.

### Screen: Account Detail

| Tab | Content |
|-----|---------|
| **Overview** | Company info, contacts, tags, status |
| **Contacts** | People at this account |
| **Interactions** | Logged calls, meetings, emails, notes |
| **Deals / Pipeline** | Opportunities with stages and values |
| **Orders** | Marketplace and direct order history |
| **Documents** | Contracts, certificates, attachments |
| **Tasks** | Follow-up reminders |

### Screen: Interaction Log (Create)

Type (call, meeting, email, note), date, summary, linked account, follow-up task option.

### Screen: Pipeline Board

Kanban view of deals/opportunities: Lead → Qualified → Proposal → Negotiation → Won/Lost.

### Screen: Member Management (Cooperative)

Member list with farm link, delivery history, payment status, performance metrics.

---

## 9. Reports Module

### Screen: Report Library

| Category | Example Reports |
|----------|----------------|
| **Operational** | Task completion, harvest summary, field activity |
| **Financial** | Cost per hectare, revenue by crop, input costs |
| **Irrigation** | Water usage, cost, efficiency |
| **Inventory** | Stock levels, valuation, movement summary |
| **Weather** | Historical conditions, risk events |
| **Marketplace** | Sales volume, transaction history |
| **CRM** | Pipeline, account activity |
| **Compliance** | Input records, traceability, water reports |
| **Audit** | User activity, data changes |

Each report card: name, description, last run, "Run" and "Schedule" buttons.

### Screen: Report Viewer

Generated report with filters applied, chart/table visualization, export buttons (PDF, Excel, CSV).

### Screen: Custom Report Builder (Business+)

| Panel | Function |
|-------|----------|
| **Data source** | Select module and entity |
| **Fields** | Drag available fields to report |
| **Filters** | Date range, farm, crop, status filters |
| **Grouping** | Group by field, crop, month, etc. |
| **Visualization** | Table, bar chart, line chart, pie chart |
| **Preview** | Live preview pane |
| **Save / schedule** | Name, save, set recurring delivery |

### Screen: Scheduled Reports

List of scheduled reports with frequency, recipients, last sent, next run. Edit/pause/delete actions.

---

## 10. Notifications Module

### Screen: Notification Center

| Element | Description |
|---------|-------------|
| Filter tabs | All, Critical, Tasks, Weather, Marketplace, System |
| Notification list | Icon, title, summary, timestamp, read/unread |
| Bulk actions | Mark all read, clear |
| Click action | Navigate to relevant module screen |

### Screen: Notification Preferences

Matrix of notification types × channels (in-app, push, email, SMS) with toggle switches. Quiet hours configuration.

---

## 11. Billing Module

### Screen: Subscription Overview

Current plan, usage meters (users, farms, API calls), renewal date, upgrade button.

### Screen: Plan Comparison / Upgrade

Side-by-side tier comparison table with feature checklist. Upgrade/downgrade actions.

### Screen: Invoice History

Table of invoices: date, amount, status, download PDF.

### Screen: Payment Methods

Saved cards, bank accounts, add/remove payment method.

### Screen: Member Billing (Cooperative)

Member dues configuration, payment tracking, outstanding balances, bulk invoicing.

### Screen: Usage Details

Detailed breakdown of usage against plan limits with historical trend.

---

## 12. User Management Module

### Screen: User List

| Column | Content |
|--------|---------|
| Name | Full name with avatar |
| Email | Login email |
| Role | Assigned role badge |
| Farms | Assigned farm(s) |
| Status | Active, invited, deactivated |
| Last active | Timestamp |
| Actions | Edit, deactivate, resend invite |

### Screen: Invite User

Email, role selection, farm/site assignment, optional welcome message.

### Screen: User Detail / Edit

Profile info, role, permissions, farm assignments, activity log, session management.

### Screen: Roles & Permissions

| Element | Description |
|---------|-------------|
| Role list | Predefined + custom roles |
| Permission matrix | Module × action (view, create, edit, delete, admin) |
| Create custom role | Name, description, permission selection |

### Screen: Organization Settings

| Tab | Content |
|-----|---------|
| **General** | Org name, logo, address, timezone, default currency |
| **Localization** | Language, date format, number format, units (metric/imperial) |
| **Security** | MFA policy, session timeout, password rules |
| **Integrations** | API keys, webhooks, connected services |
| **SSO** | SAML/OIDC configuration (Enterprise) |
| **Audit log** | Searchable admin action history |

---

## AI Assistant (Global)

### Screen: AI Assistant Panel

Persistent slide-out panel accessible from any screen.

| Element | Description |
|---------|-------------|
| **Chat history** | Conversation thread with user and AI messages |
| **Input bar** | Text input with voice button (mobile) |
| **Suggested prompts** | Context-aware quick actions ("Check frost risk", "Show today's tasks") |
| **Action cards** | AI-suggested actions with confirm/cancel buttons |
| **Source citations** | Links to data sources used in response |
| **Feedback** | Thumbs up/down on responses |

### Screen: AI Disease Detection Result

Overlay on observation screen showing detected disease, confidence score, severity map on photo, treatment recommendations.

---

## Mobile-Specific Screens

### Screen: Quick Capture (Mobile)

Camera-first interface for rapid field observation: photo → AI scan → quick note → save. Optimized for one-hand use.

### Screen: Offline Sync Status

Indicator showing pending sync items, last sync time, manual sync trigger.

### Screen: Field GPS Walk (Mobile)

Walk field perimeter with GPS to auto-draw boundary polygon.

### Screen: Barcode Scanner (Mobile)

Scan product barcodes for inventory receive/consume operations.

---

## Navigation Flow Diagrams

### Primary User Journeys

#### Farmer Daily Flow

```
Login → Dashboard → Check weather alerts
                  → View today's tasks → Complete task in field
                  → Capture observation (photo) → AI disease check
                  → Check irrigation recommendation → Approve schedule
                  → Log out
```

#### Farm Manager Weekly Flow

```
Login → Dashboard (multi-farm) → Review team task completion
       → Crop Season Overview → Adjust plans
       → Irrigation → Review AI schedule → Approve
       → Reports → Run weekly ops report → Email to leadership
       → CRM → Log buyer call → Update pipeline
```

#### Cooperative Season Flow

```
Login → Dashboard (member summary) → Review member deliveries
       → Marketplace → Create group listing
       → CRM → Member performance review
       → Billing → Issue member invoices
       → Reports → Generate cooperative season report
```

#### Exporter Sourcing Flow

```
Login → Marketplace → Search listings by crop/region
       → Listing Detail → Review traceability
       → Make Offer → Negotiate via messages
       → Order Detail → Confirm → Generate export docs
       → Reports → Traceability report for shipment
```

### Cross-Module Flows

#### Observation → Disease → Treatment

```
Crop Management → Field Observation (photo)
    → AI Disease Detection (result overlay)
    → Confirm diagnosis → Auto-create pest incident
    → Treatment recommendation → Create spraying task
    → Task assigned to operator → Notification sent
    → Operator completes task → Input logged → Inventory deducted
```

#### Harvest → Inventory → Marketplace

```
Crop Management → Harvest Recording (yield, grade)
    → Inventory auto-updated (harvest stock)
    → Marketplace → Create Listing from inventory
    → Buyer makes offer → Order created
    → CRM account auto-updated → Billing invoice generated
```

#### Weather Alert → Irrigation → Task

```
Weather Intelligence → Frost alert (critical)
    → Notification (push + SMS)
    → AI Assistant → "Delay irrigation on Field 2"
    → Irrigation → Schedule adjusted
    → Crop Management → Task created: "Check frost damage tomorrow"
```

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| **Mobile** (<768px) | Bottom tabs, stacked cards, FAB actions |
| **Tablet** (768–1024px) | Collapsible sidebar, 2-column grids |
| **Desktop** (>1024px) | Full sidebar, multi-column dashboards, split views |

---

## Empty States

Every list screen includes contextual empty states with:
- Illustration/icon
- Descriptive message ("No fields yet")
- Primary CTA button ("Add your first field")
- Optional help link to documentation

---

## Error States

| Error | Screen Behavior |
|-------|----------------|
| **404** | Friendly message with navigation back to Dashboard |
| **403** | "You don't have access" with contact admin link |
| **Network error** | Retry banner; offline mode indicator on mobile |
| **Server error** | Generic error with support contact and incident ID |

---

*Document owner: Product Architecture / UX*  
*Last updated: June 2026*  
*Status: Approved foundation*
