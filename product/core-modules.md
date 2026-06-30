# Nertura — Core Platform Modules

> Complete specification of all platform modules comprising the Nertura Agriculture Operating System.

---

## Module Architecture Overview

Nertura is organized into **12 core modules** that share a unified data layer, authentication system, notification engine, and AI services layer. Modules can be enabled per subscription tier and configured per organization.

```
┌─────────────────────────────────────────────────────────────────┐
│                        NERTURA PLATFORM                          │
├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤
│Dashboard │   Farm   │   Crop   │ Weather  │Irrigation│Inventory│
│          │Management│Management│Intel.    │          │         │
├──────────┼──────────┼──────────┼──────────┼──────────┼─────────┤
│Marketplace│   CRM   │ Reports  │Notifica- │ Billing  │  User   │
│          │          │          │  tions   │          │Management│
├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤
│              AI Services Layer (see /ai/ai-system.md)            │
├─────────────────────────────────────────────────────────────────┤
│         Shared Services: Auth, API, Search, Files, Audit        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Dashboard

### Purpose

Central command center providing real-time operational visibility, KPI tracking, and AI-powered insights tailored to each user's role and organization.

### Key Features

| Feature | Description |
|---------|-------------|
| **Role-based views** | Customized layouts for Farmer, Manager, Cooperative, Executive |
| **KPI widgets** | Yield, costs, water usage, inventory levels, sales pipeline |
| **Alert summary** | Critical notifications from all modules in one feed |
| **Weather snapshot** | Current conditions and 7-day forecast for active farms |
| **Task overview** | Pending and overdue tasks across crop plans |
| **AI insights panel** | Proactive recommendations from AI Assistant |
| **Quick actions** | Shortcuts to common workflows (log activity, create order, assign task) |
| **Customizable layout** | Drag-and-drop widget arrangement (Professional+) |

### Data Sources

Aggregates data from all enabled modules; refreshes in real-time via WebSocket for critical metrics.

### Access Control

All authenticated users see a Dashboard; widget availability governed by role and module permissions.

---

## 2. Farm Management

### Purpose

Digital registry and operational hub for all farm assets — land, sites, infrastructure, equipment, and personnel assignments.

### Key Features

| Feature | Description |
|---------|-------------|
| **Farm / site registry** | Create and manage farms with address, timezone, currency |
| **Field mapping** | GeoJSON field boundaries; satellite overlay; area calculation |
| **Zone management** | Sub-divide fields into management zones (soil type, slope, etc.) |
| **Soil records** | Soil type, pH, nutrient history, lab test uploads |
| **Infrastructure** | Storage facilities, greenhouses, processing units |
| **Equipment registry** | Tractors, sprayers, harvesters; maintenance schedules |
| **IoT device linking** | Connect sensors, weather stations, flow meters to fields/zones |
| **Team assignment** | Assign workers and managers to sites and fields |
| **Land history** | Crop rotation history per field across seasons |

### Entity Hierarchy

```
Organization
  └── Farm (Site)
        └── Field
              └── Zone
                    └── IoT Device
```

### Integrations

GPS/GIS import (KML, Shapefile), satellite imagery providers, machinery telematics (Enterprise).

---

## 3. Crop Management

### Purpose

End-to-end crop lifecycle management from planning through harvest, including tasks, inputs, observations, and yield recording.

### Key Features

| Feature | Description |
|---------|-------------|
| **Crop catalog** | Global crop library with varieties, growth stages, input requirements |
| **Season planning** | Define crop plans per field per season with target dates |
| **Growth stage tracking** | Visual growth timeline; stage-based task triggers |
| **Task management** | Planting, spraying, fertilizing, harvesting tasks with assignments |
| **Input application log** | Record products applied (type, rate, date, operator) |
| **Field observations** | Notes, photos, scouting records with geo-tag |
| **Pest & disease log** | Incident recording with severity; links to AI disease detection |
| **Harvest recording** | Yield quantity, quality grade, harvest date, storage location |
| **Compliance tracking** | Pre-harvest intervals, organic certification constraints |
| **Crop calendar** | Gantt-style view of all crop activities across fields |

### AI Integration

- Disease detection from field photos
- Yield prediction based on plan, weather, and historical data
- Task recommendations based on growth stage and conditions

---

## 4. Weather Intelligence

### Purpose

Hyperlocal weather data, historical analysis, and risk alerting to inform every operational decision.

### Key Features

| Feature | Description |
|---------|-------------|
| **Current conditions** | Temperature, humidity, wind, precipitation per farm location |
| **Forecasts** | Hourly (48h), daily (14d), seasonal outlook |
| **Historical weather** | Multi-year data for trend analysis and reporting |
| **Agricultural indices** | GDD (Growing Degree Days), ET (Evapotranspiration), frost hours |
| **Risk alerts** | Frost, heat stress, heavy rain, drought, wind damage |
| **Spray window** | Optimal spraying conditions based on wind and rain forecast |
| **Field-level microclimate** | IoT station data merged with API forecasts |
| **Alert configuration** | Custom thresholds and notification channels per user |
| **Weather overlay** | Map view with precipitation, temperature, radar layers |

### Data Providers

Primary and fallback weather API providers; customer-owned IoT weather stations as supplementary source.

### AI Integration

Weather Risk Alerts module uses ML models for probabilistic risk scoring beyond rule-based thresholds.

---

## 5. Irrigation

### Purpose

Plan, schedule, monitor, and optimize water application across fields and irrigation systems.

### Key Features

| Feature | Description |
|---------|-------------|
| **Irrigation system registry** | Drip, pivot, flood, sprinkler systems linked to fields |
| **Schedule management** | Manual and automated irrigation schedules |
| **Flow monitoring** | Real-time and historical water usage via IoT flow meters |
| **Soil moisture tracking** | Sensor integration; moisture threshold alerts |
| **Water budget** | Set allocation limits per field, season, or farm |
| **Irrigation log** | Record of all irrigation events with duration and volume |
| **ET-based scheduling** | Evapotranspiration-driven schedule recommendations |
| **Cost tracking** | Water cost per field based on volume and rate |
| **Compliance reporting** | Water usage reports for regulatory requirements |

### AI Integration

Irrigation Optimization engine recommends schedules based on crop stage, soil moisture, weather forecast, and water budget.

### IoT Requirements

Optional — module functions manually; enhanced with soil moisture sensors, flow meters, and smart valve controllers.

---

## 6. Inventory

### Purpose

Track all agricultural inputs, harvested product, and supplies across locations with full audit trail.

### Key Features

| Feature | Description |
|---------|-------------|
| **Product catalog** | Seeds, fertilizers, pesticides, fuel, packaging, harvested crops |
| **Warehouse / storage locations** | Multiple storage sites with capacity tracking |
| **Stock levels** | Real-time quantity on hand with unit of measure |
| **Batch / lot tracking** | Lot numbers, expiry dates, supplier origin |
| **Stock movements** | Receive, transfer, consume (linked to crop applications), sell |
| **Reorder alerts** | Minimum stock thresholds with notification |
| **Inventory valuation** | FIFO/average cost; total inventory value |
| **Barcode / QR support** | Mobile scanning for stock operations |
| **Harvest intake** | Auto-update from crop harvest records |

### Links to Other Modules

- **Crop Management** — input consumption deducts inventory
- **Marketplace** — available harvest inventory for listing
- **Billing** — invoicing for sold inventory

---

## 7. Marketplace

### Purpose

B2B agricultural commerce platform connecting producers, cooperatives, suppliers, and exporters for product and input trading.

### Key Features

| Feature | Description |
|---------|-------------|
| **Product listings** | List harvest, inputs, or services with specs and pricing |
| **Buyer requirements** | Post wanted ads with quantity, quality, delivery terms |
| **Search & discovery** | Filter by crop, region, certification, price, quantity |
| **Negotiation / messaging** | In-platform communication between parties |
| **Order management** | Order creation, confirmation, status tracking |
| **Contract templates** | Standard purchase agreements with customizable terms |
| **Quality specifications** | Grade standards, moisture content, certification requirements |
| **Logistics coordination** | Delivery scheduling, pickup points, transport notes |
| **Transaction history** | Full record of trades for reporting and CRM |
| **Ratings & reviews** | Post-transaction feedback (Phase 2) |
| **Group listings** | Cooperative bulk listings aggregated from members |

### Trust & Compliance

Verified organization badges, traceability data attached to listings, phytosanitary document links for exports.

### Revenue Model

Transaction fee (configurable per tier); premium listing placement (future).

---

## 8. CRM

### Purpose

Relationship management for all business contacts — customers, suppliers, buyers, contract growers, and cooperative members.

### Key Features

| Feature | Description |
|---------|-------------|
| **Contact registry** | Companies and individuals with roles and tags |
| **Account hierarchy** | Parent/child accounts for corporate structures |
| **Interaction log** | Calls, meetings, emails, notes with timestamps |
| **Pipeline management** | Sales/opportunity stages for suppliers and exporters |
| **Contract grower management** | Agreements, targets, performance tracking |
| **Member management** | Cooperative member profiles with delivery history |
| **Communication tools** | Bulk messaging to segments; template messages |
| **Document storage** | Contracts, certificates linked to accounts |
| **Activity reminders** | Follow-up tasks and scheduled check-ins |
| **CRM analytics** | Conversion rates, account health, revenue by customer |

### Links to Other Modules

- **Marketplace** — auto-create accounts from transactions
- **Billing** — invoice history per account
- **Reports** — CRM performance dashboards

---

## 9. Reports

### Purpose

Flexible reporting and analytics engine for operational, financial, and compliance reporting across all modules.

### Key Features

| Feature | Description |
|---------|-------------|
| **Standard report library** | Pre-built reports for each module (yield, water, inventory, sales) |
| **Custom report builder** | Drag-and-drop fields, filters, grouping (Business+) |
| **Scheduled reports** | Email delivery on daily, weekly, monthly cadence |
| **Export formats** | PDF, Excel, CSV |
| **Dashboard export** | Snapshot any dashboard view as report |
| **Comparative analysis** | Field vs field, season vs season, farm vs farm |
| **Traceability reports** | Farm-to-buyer chain for export compliance |
| **Sustainability metrics** | Water efficiency, input intensity, carbon estimates (V2) |
| **Audit reports** | User activity, data changes, access logs |
| **API data export** | Programmatic access for BI tools (Enterprise) |

### Report Categories

| Category | Examples |
|----------|----------|
| **Operational** | Task completion, harvest summary, irrigation log |
| **Financial** | Cost per hectare, revenue by crop, inventory valuation |
| **Compliance** | Input application records, water usage, origin certificates |
| **Executive** | KPI scorecards, trend analysis, forecast vs actual |

---

## 10. Notifications

### Purpose

Unified notification engine delivering timely alerts and updates across all channels based on events from every module.

### Key Features

| Feature | Description |
|---------|-------------|
| **In-app notifications** | Real-time notification center with read/unread state |
| **Push notifications** | Mobile push for critical alerts |
| **Email notifications** | Configurable email for reports, alerts, and digests |
| **SMS notifications** | Critical alerts via SMS (Business+) |
| **Notification preferences** | Per-user, per-module, per-channel configuration |
| **Severity levels** | Info, warning, critical — with channel routing rules |
| **Quiet hours** | Suppress non-critical notifications during defined hours |
| **Digest mode** | Batch non-urgent notifications into daily/weekly digest |
| **Escalation rules** | Unacknowledged critical alerts escalate to manager (Enterprise) |
| **Webhook delivery** | External system integration for alerts (Enterprise) |

### Event Sources

| Module | Example Events |
|--------|----------------|
| Weather | Frost warning, heavy rain forecast |
| Irrigation | Schedule triggered, moisture threshold breached |
| Crop | Task overdue, disease detected, harvest ready |
| Inventory | Low stock, expiry approaching |
| Marketplace | New offer, order confirmed, payment received |
| Billing | Invoice due, payment failed |
| System | New user added, integration error |

---

## 11. Billing

### Purpose

Subscription management, invoicing, payment processing, and financial administration for Nertura SaaS and in-platform transactions.

### Key Features

| Feature | Description |
|---------|-------------|
| **Subscription management** | Plan selection, upgrade/downgrade, renewal |
| **Usage metering** | Track usage against plan limits (users, farms, API calls) |
| **Invoice generation** | Automated subscription invoices |
| **Payment processing** | Credit card, bank transfer, local payment methods |
| **Multi-currency** | Billing in customer's local currency |
| **Tax handling** | VAT/GST calculation by region |
| **Member billing** | Cooperative member dues and service charges |
| **Marketplace settlement** | Transaction fee collection and seller payouts (V2) |
| **Billing history** | Full invoice and payment record |
| **Dunning management** | Automated retry and notification for failed payments |
| **Enterprise contracts** | Custom pricing, PO-based billing, annual invoicing |

### Plan Enforcement

Billing module enforces subscription tier limits via shared entitlements service used by all modules.

---

## 12. User Management

### Purpose

Identity, access control, and organizational structure management for all Nertura users.

### Key Features

| Feature | Description |
|---------|-------------|
| **User accounts** | Create, invite, deactivate users |
| **Role-based access control (RBAC)** | Predefined and custom roles with granular permissions |
| **Organization hierarchy** | Multi-entity, multi-farm organizational structure |
| **Team management** | Group users into teams with shared access |
| **Invitation workflow** | Email invite with role assignment |
| **Authentication** | Email/password, MFA, SSO/SAML (Enterprise) |
| **Session management** | Active sessions, remote logout |
| **Audit log** | Login history, permission changes, admin actions |
| **Profile management** | User profile, language, timezone, notification prefs |
| **API key management** | Service accounts and API keys (Business+) |
| **Guest / external access** | Limited-access accounts for buyers, auditors (Enterprise) |

### Default Roles

| Role | Scope | Typical User |
|------|-------|--------------|
| **Owner** | Full org access including billing | Farm owner, cooperative director |
| **Admin** | Full operational access, no billing | IT admin, office manager |
| **Manager** | Assigned farms/sites, all modules | Farm manager, site supervisor |
| **Operator** | Assigned tasks and field logging | Field worker, agronomist |
| **Viewer** | Read-only access to assigned areas | Investor, auditor, board member |
| **Member** | Cooperative member with own farm data | Cooperative member farmer |
| **Partner** | Marketplace and CRM access only | Supplier, buyer, exporter |

---

## Module Dependencies

```
User Management ──► (required by all modules)
Billing ──► (gates module access by tier)
Notifications ◄── (fed by all modules)
Dashboard ◄── (aggregates all modules)
Reports ◄── (reads from all modules)

Farm Management ──► Crop Management
Farm Management ──► Irrigation
Farm Management ──► Weather Intelligence
Crop Management ──► Inventory (harvest intake)
Crop Management ──► Marketplace (listings)
Inventory ◄──► Marketplace
CRM ◄──► Marketplace
```

---

## Module Availability by Tier

| Module | Starter | Professional | Business | Enterprise |
|--------|---------|--------------|----------|------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Farm Management | ✓ (1 farm) | ✓ (5 farms) | ✓ (unlimited) | ✓ |
| Crop Management | ✓ | ✓ | ✓ | ✓ |
| Weather Intelligence | Basic | ✓ | ✓ | ✓ |
| Irrigation | — | ✓ | ✓ | ✓ |
| Inventory | Basic | ✓ | ✓ | ✓ |
| Marketplace | View only | ✓ | ✓ | ✓ |
| CRM | — | Basic | ✓ | ✓ |
| Reports | Standard | Standard | Custom | Custom + API |
| Notifications | In-app + email | ✓ | ✓ + SMS | ✓ + webhook |
| Billing | Self-serve | ✓ | ✓ + member billing | Custom |
| User Management | 3 users | 10 users | 50 users | Unlimited + SSO |

*Detailed limits in `/docs/subscription-model.md`*

---

*Document owner: Product Architecture*  
*Last updated: June 2026*  
*Status: Approved foundation*
