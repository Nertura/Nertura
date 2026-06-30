# Nertura — Product Roadmap

> Strategic development roadmap from MVP through 3-year vision. Sequenced for product-market fit, revenue growth, and platform scale.

---

## Roadmap Principles

| Principle | Application |
|-----------|-------------|
| **Ship value early** | MVP delivers daily-use value for farmers, not just admin tools |
| **AI as differentiator** | AI capabilities introduced progressively, each tied to operational ROI |
| **Platform before features** | Core architecture (auth, multi-tenancy, API) built for scale from day one |
| **Market-driven expansion** | Geographic and crop expansion driven by customer demand data |
| **Revenue milestones** | Each version targets specific ARR and retention benchmarks |

---

## Version Summary

| Version | Timeline | Theme | Target ARR | Key Outcome |
|---------|----------|-------|------------|-------------|
| **MVP** | Months 1–6 | Core operations + basic AI | $500K | Product-market fit with farmers and managers |
| **Version 2** | Months 7–14 | Intelligence + commerce | $3M | Multi-stakeholder platform with marketplace revenue |
| **Version 3** | Months 15–24 | Scale + ecosystem | $15M | Enterprise-ready with partner ecosystem |
| **Year 3+** | Months 25–36 | Global platform leadership | $50M+ | Category-defining AgOS with network effects |

---

## MVP (Months 1–6)

### Goal

Launch a usable agriculture operating system that digitizes daily farm operations for individual farmers and farm managers, with enough AI to demonstrate differentiation.

### Success Criteria

| Metric | Target |
|--------|--------|
| Active organizations | 500 |
| Monthly active usage rate | >70% |
| 30-day retention | >60% |
| NPS | >40 |
| Average session duration | >8 minutes |
| Fields digitized | 5,000+ |

### Modules — MVP Scope

| Module | MVP Scope | Deferred |
|--------|-----------|----------|
| **Dashboard** | Role-based KPI widgets, alert feed, task overview, weather snapshot | Customizable layout |
| **Farm Management** | Farm/field registry, boundary mapping (draw + GPS), soil records, team assignment | Equipment, IoT, infrastructure |
| **Crop Management** | Crop plans, task board, observations with photos, input logging, harvest recording | Crop calendar Gantt, compliance tracking |
| **Weather Intelligence** | 7-day forecast, basic alerts (frost, rain), current conditions, GDD | Hourly forecast, spray window, historical |
| **Irrigation** | — | Full module deferred to V2 |
| **Inventory** | Basic product catalog, stock levels, manual movements (50 SKU limit) | Batch tracking, barcode, warehouse management |
| **Marketplace** | — | Full module deferred to V2 |
| **CRM** | — | Full module deferred to V2 |
| **Reports** | 5 standard reports (harvest, tasks, inputs, weather, field summary) | Custom builder |
| **Notifications** | In-app + email | Push, SMS |
| **Billing** | Self-serve subscription (Starter + Professional), Stripe integration | Member billing |
| **User Management** | Users, roles (owner, admin, manager, operator, viewer), invitations | Custom roles, SSO |

### AI — MVP Scope

| Capability | MVP Scope |
|------------|-----------|
| **AI Assistant** | Basic Q&A about farm data; platform help; English + 2 local languages |
| **Crop Disease Detection** | 4 crops (corn, soybean, wheat, tomato); cloud inference; manual confirmation |
| **Yield Prediction** | — |
| **Irrigation Optimization** | — |
| **Weather Risk Alerts** | Rule-based + basic ML frost/heat alerts |
| **Market Price Forecasting** | — |

### Platform — MVP Scope

| Component | MVP Scope |
|-----------|-----------|
| **Web app** | Responsive web application (React); desktop + tablet optimized |
| **Mobile app** | Progressive Web App (PWA) with offline observation logging |
| **Authentication** | Email/password, MFA optional |
| **Multi-tenancy** | Row-level isolation, org-scoped data |
| **Localization** | English + 2 pilot languages; metric/imperial units |
| **API** | Internal only; no public API |
| **Infrastructure** | Single-region cloud deployment (AWS/GCP) |
| **Compliance** | GDPR-ready; privacy policy; data export |

### MVP Milestones

| Month | Milestone | Deliverables |
|-------|-----------|-------------|
| **M1** | Foundation | Auth, org/user management, farm/field CRUD, basic dashboard |
| **M2** | Crop operations | Crop plans, tasks, observations, input logging |
| **M3** | Weather + alerts | Weather integration, basic alerts, GDD calculation |
| **M4** | AI v1 | AI Assistant (basic), disease detection (2 crops), weather risk ML |
| **M5** | Inventory + reports | Basic inventory, 5 standard reports, harvest workflow |
| **M6** | Launch | Billing (Starter + Pro), onboarding wizard, PWA, beta → GA |

### MVP Team (Recommended)

| Role | Count |
|------|-------|
| Product manager | 1 |
| Engineering lead | 1 |
| Full-stack engineers | 4 |
| Mobile/frontend engineer | 1 |
| AI/ML engineer | 1 |
| UX designer | 1 |
| QA engineer | 1 |
| DevOps | 1 (part-time) |

---

## Version 2 (Months 7–14)

### Goal

Expand from single-stakeholder farm tool to multi-stakeholder platform with commerce, advanced AI, and irrigation — unlocking cooperatives, suppliers, and higher-tier revenue.

### Success Criteria

| Metric | Target |
|--------|--------|
| Active organizations | 3,000 |
| Business tier adoption | 8% of paid base |
| Marketplace GMV | $2M cumulative |
| AI Assistant daily active users | 40% of MAU |
| Net revenue retention | 110% |
| ARR | $3M |

### Modules — V2 Additions

| Module | V2 Scope |
|--------|----------|
| **Dashboard** | Customizable widget layout; AI insights panel |
| **Farm Management** | Equipment registry, IoT device linking, infrastructure, KML/Shapefile import |
| **Crop Management** | Crop calendar (Gantt), compliance tracking (PHI), batch scouting |
| **Weather Intelligence** | 14-day forecast, hourly (48h), spray window, historical charts, custom alert config |
| **Irrigation** | Full module: systems, schedules, water budget, AI advisory, IoT integration |
| **Inventory** | Full module: warehouses, batch/lot tracking, barcode scanning, harvest auto-intake |
| **Marketplace** | Full module: listings, offers, orders, messaging, buyer requirements |
| **CRM** | Basic (Pro) + Full (Business): accounts, contacts, interactions, pipeline, member management |
| **Reports** | All standard reports + custom report builder (Business) |
| **Notifications** | Push notifications (mobile native app) |
| **Billing** | Business tier; member billing for cooperatives |
| **User Management** | Custom roles, API key management |

### AI — V2 Additions

| Capability | V2 Scope |
|------------|-----------|
| **AI Assistant** | Action execution (create tasks, log data); 5 languages; 100 queries/day (Pro) |
| **Crop Disease Detection** | 8+ crops; offline mobile inference (top 20 diseases); feedback loop |
| **Yield Prediction** | Mid-season and pre-season forecasts; confidence intervals |
| **Irrigation Optimization** | Advisory + semi-auto scheduling |
| **Weather Risk Alerts** | ML-enhanced composite risk scoring; impact assessment |
| **Market Price Forecasting** | 1-week and 1-month forecasts for top 10 commodities |

### Platform — V2 Additions

| Component | V2 Scope |
|-----------|----------|
| **Mobile app** | Native iOS + Android apps with offline sync |
| **Public API** | Read-only (Pro), read/write (Business); REST + webhook |
| **Integrations** | Weather station IoT, basic ERP export |
| **Localization** | 8 languages; multi-currency billing |
| **Marketplace payments** | Transaction fee collection; escrow (phase 2 of V2) |

### V2 Milestones

| Month | Milestone | Deliverables |
|-------|-----------|-------------|
| **M7** | Irrigation + IoT | Irrigation module, sensor integration, AI advisory |
| **M8** | Native mobile | iOS + Android apps, offline sync, push notifications |
| **M9** | Marketplace v1 | Listings, offers, messaging, order flow |
| **M10** | CRM + cooperatives | CRM module, member management, cooperative dashboards |
| **M11** | Advanced AI | Yield prediction, irrigation optimization, expanded disease catalog |
| **M12** | Inventory + commerce | Full inventory, marketplace payments, transaction fees |
| **M13** | Reports + API | Custom report builder, public API v1, webhooks |
| **M14** | V2 GA | Business tier launch, 8 languages, market price forecasting |

---

## Version 3 (Months 15–24)

### Goal

Enterprise readiness, ecosystem expansion, and geographic scale — positioning Nertura as the platform leader for agricultural operations.

### Success Criteria

| Metric | Target |
|--------|--------|
| Active organizations | 15,000 |
| Enterprise customers | 50+ |
| Countries | 15+ |
| Marketplace GMV | $25M cumulative |
| Partner integrations | 20+ |
| ARR | $15M |
| Gross margin | >75% |

### Modules — V3 Additions

| Module | V3 Scope |
|--------|----------|
| **Dashboard** | Executive scorecards, cross-org benchmarking (anonymized) |
| **Farm Management** | Machinery telematics integration, satellite imagery overlay |
| **Crop Management** | NDVI integration, automated growth stage detection |
| **Weather Intelligence** | Seasonal outlook, multi-provider ensemble, climate trend analysis |
| **Irrigation** | Full-auto with valve controller integration; multi-field prioritization |
| **Inventory** | Inter-org inventory visibility (Marketplace-linked) |
| **Marketplace** | Group listings, ratings/reviews, logistics coordination, escrow payments |
| **CRM** | Contract grower management, automated engagement scoring |
| **Reports** | Sustainability metrics (water efficiency, input intensity), BI connector |
| **Notifications** | SMS, webhook delivery, escalation rules |
| **Billing** | Enterprise custom contracts, PO billing, multi-entity |
| **User Management** | SSO/SAML, guest access, IP allowlisting |

### AI — V3 Additions

| Capability | V3 Scope |
|------------|-----------|
| **AI Assistant** | Voice input (mobile), custom knowledge base (Enterprise), unlimited queries |
| **Crop Disease Detection** | 15+ crops, custom model training (Enterprise), drone image batch processing |
| **Yield Prediction** | Scenario modeling, satellite NDVI integration, regional benchmarks |
| **Irrigation Optimization** | Full-auto mode, cost optimization, multi-field water budget allocation |
| **Weather Risk Alerts** | Hail probability, composite farm risk index, insurance-grade reports |
| **Market Price Forecasting** | 3-month forecasts, sentiment analysis, sell/hold recommendations |
| **New: Sustainability AI** | Carbon sequestration estimates, water efficiency scoring |

### Platform — V3 Additions

| Component | V3 Scope |
|-----------|----------|
| **Enterprise tier** | SSO, dedicated support, custom SLA, data residency options |
| **Partner marketplace** | Third-party integrations and extensions |
| **White-label** | Custom branding for cooperative/government deployments |
| **Advanced API** | GraphQL, SDK (TypeScript, Python), event streaming |
| **Multi-region** | EU and APAC data residency; regional deployments |
| **Compliance** | SOC 2 Type II, ISO 27001 preparation |
| **Analytics platform** | Cross-customer anonymized benchmarks |

### V3 Milestones

| Month | Milestone | Deliverables |
|-------|-----------|-------------|
| **M15** | Enterprise foundation | SSO/SAML, audit log, Enterprise tier, dedicated support |
| **M16** | Satellite + NDVI | Satellite imagery integration, NDVI-based growth tracking |
| **M17** | Marketplace v2 | Ratings, escrow, logistics, group listings |
| **M18** | Sustainability | Water/carbon metrics, sustainability reports |
| **M19** | Partner ecosystem | Partner marketplace, integration SDK, 10 launch partners |
| **M20** | Multi-region | EU deployment, data residency, 12 languages |
| **M21** | Advanced AI | Voice assistant, custom models, drone processing |
| **M22** | White-label | White-label deployments for 3 pilot partners |
| **M23** | Scale infrastructure | Database sharding, CQRS for reports, 99.9% SLA |
| **M24** | V3 GA | Full enterprise offering, 15 countries, SOC 2 Type II |

---

## 3-Year Roadmap (Months 1–36)

### Year 1: Foundation (Months 1–12)

```
Q1 (M1-M3)          Q2 (M4-M6)          Q3 (M7-M9)          Q4 (M10-M12)
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Platform     │     │ AI v1        │     │ Irrigation   │     │ Marketplace  │
│ core + auth  │────►│ Disease det. │────►│ + IoT        │────►│ + CRM        │
│ Farm/field   │     │ Weather AI   │     │ Native mobile│     │ Advanced AI  │
│ Crop mgmt    │     │ MVP LAUNCH   │     │              │     │ Business tier│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

| Quarter | Theme | Revenue Target | Organizations |
|---------|-------|----------------|---------------|
| **Q1** | Build core | Pre-revenue (beta) | 50 beta users |
| **Q2** | MVP launch | $15K MRR | 200 paid |
| **Q3** | Expand modules | $50K MRR | 800 paid |
| **Q4** | Commerce + AI v2 | $120K MRR | 2,000 paid |

**Year 1 totals:** ~$500K ARR, 2,000+ paid organizations, 3 pilot regions.

### Year 2: Scale (Months 13–24)

```
Q1 (M13-M15)        Q2 (M16-M18)        Q3 (M19-M21)        Q4 (M22-M24)
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ API + reports│     │ Satellite    │     │ Partner      │     │ White-label  │
│ Business tier│     │ Sustainability│    │ ecosystem    │     │ Multi-region │
│ V2 GA        │     │ Marketplace v2│    │ Advanced AI  │     │ Enterprise   │
│              │     │              │     │              │     │ V3 GA        │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

| Quarter | Theme | Revenue Target | Organizations |
|---------|-------|----------------|---------------|
| **Q1** | V2 maturity | $200K MRR | 4,000 paid |
| **Q2** | Intelligence depth | $350K MRR | 7,000 paid |
| **Q3** | Ecosystem | $550K MRR | 10,000 paid |
| **Q4** | Enterprise | $800K MRR | 15,000 paid |

**Year 2 totals:** ~$10M ARR, 15,000+ organizations, 15 countries, 50+ enterprise customers.

### Year 3: Leadership (Months 25–36)

```
Q1 (M25-M27)        Q2 (M28-M30)        Q3 (M31-M33)        Q4 (M34-M36)
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Global       │     │ Autonomous   │     │ Nertura      │     │ Platform     │
│ expansion    │     │ operations   │     │ Index        │     │ monetization │
│ 25+ countries│     │ Drone/robot  │     │ Benchmarks   │     │ Series B /   │
│              │     │ integration  │     │ Insurance    │     │ IPO prep     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

| Quarter | Theme | Revenue Target | Organizations |
|---------|-------|----------------|---------------|
| **Q1** | Global expansion | $1.2M MRR | 18,000 paid |
| **Q2** | Autonomous ops | $1.6M MRR | 21,000 paid |
| **Q3** | Data products | $2.0M MRR | 23,000 paid |
| **Q4** | Platform scale | $2.5M MRR | 25,000+ paid |

**Year 3 totals:** ~$30M ARR ($50M+ inclusive of marketplace fees and data products), 25,000+ organizations, 25+ countries.

---

## Feature Release Timeline (Gantt Overview)

| Feature | MVP | V2 | V3 | Year 3 |
|---------|:---:|:--:|:--:|:------:|
| Farm/field management | ✓ | | | |
| Crop plans + tasks | ✓ | | | |
| Weather forecast | ✓ | | | |
| Basic AI assistant | ✓ | | | |
| Disease detection (4 crops) | ✓ | | | |
| Basic inventory | ✓ | | | |
| Standard reports | ✓ | | | |
| Self-serve billing | ✓ | | | |
| Irrigation module | | ✓ | | |
| Native mobile apps | | ✓ | | |
| Marketplace | | ✓ | | |
| CRM | | ✓ | | |
| Yield prediction | | ✓ | | |
| Custom reports | | ✓ | | |
| Public API | | ✓ | | |
| SSO / Enterprise | | | ✓ | |
| Satellite / NDVI | | | ✓ | |
| Sustainability metrics | | | ✓ | |
| Partner ecosystem | | | ✓ | |
| White-label | | | ✓ | |
| Voice AI assistant | | | ✓ | |
| Drone integration | | | | ✓ |
| Nertura Index | | | | ✓ |
| Insurance integrations | | | | ✓ |
| Carbon marketplace | | | | ✓ |
| Autonomous machinery | | | | ✓ |

---

## Geographic Expansion Plan

| Phase | Timeline | Regions | Rationale |
|-------|----------|---------|-----------|
| **Pilot** | MVP | 1 primary region (configurable) | Product-market fit, local crop support |
| **Expansion A** | V2 (M7–M12) | +2 regions (LATAM, SEA or Africa) | High agricultural output, mobile-first users |
| **Expansion B** | V3 (M15–M24) | +5 regions (EU, North America, Middle East) | Enterprise revenue, export markets |
| **Global** | Year 3 | 25+ countries | Category leadership, network effects |

Each region launch includes: localized crop catalog, language, payment methods, weather provider, and market price data sources.

---

## Technical Debt & Infrastructure Milestones

| Milestone | Version | Description |
|-----------|---------|-------------|
| Multi-tenant architecture | MVP | Row-level isolation, org scoping |
| CI/CD pipeline | MVP | Automated testing, staging, production deploys |
| Monitoring + alerting | MVP | Application and infrastructure observability |
| Database read replicas | V2 | Query performance for reports and dashboards |
| Event-driven architecture | V2 | Module events via message queue |
| Database sharding | V3 | Regional sharding by `region_code` |
| CQRS for analytics | V3 | Separate read models for reports |
| Multi-region active-active | Year 3 | Global low-latency access |
| ML pipeline automation | V2 | Automated model training and deployment |
| Edge inference | V2 | On-device disease detection |

---

## Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Slow farmer adoption | High | Mobile-first UX, offline mode, cooperative channel partnerships | Product |
| AI accuracy in new crops/regions | High | Human-in-the-loop confirmation; expand training data per region | AI/ML |
| Marketplace cold start | Medium | Seed with supplier partnerships; cooperative group listings | Growth |
| Weather API dependency | Medium | Multi-provider fallback; customer IoT as supplementary | Engineering |
| Enterprise sales cycle | Medium | Land-and-expand from Business tier; proof-of-value pilots | Sales |
| Regulatory complexity (export traceability) | Medium | Modular compliance reports per destination country | Product |
| Competition from incumbents | Medium | Speed to market, AI differentiation, multi-stakeholder platform | Leadership |
| Data privacy across regions | High | Regional data residency from V3; GDPR/CCPA by design | Engineering |

---

## Key Performance Indicators (Roadmap Tracking)

| KPI | MVP | V2 | V3 | Year 3 |
|-----|-----|----|----|--------|
| ARR | $500K | $3M | $15M | $50M |
| Paid organizations | 500 | 3,000 | 15,000 | 25,000 |
| MAU / paid ratio | 70% | 75% | 80% | 85% |
| Net revenue retention | — | 110% | 120% | 125% |
| Marketplace GMV (cumulative) | — | $2M | $25M | $100M |
| AI feature adoption | 30% | 50% | 65% | 75% |
| Countries | 1–2 | 5 | 15 | 25+ |
| Enterprise customers | — | 5 | 50 | 200 |
| Team size | 10 | 25 | 60 | 120 |
| Uptime SLA | 99.5% | 99.9% | 99.9% | 99.95% |

---

## Investment Milestones

| Round | Timing | Target | Use of Funds |
|-------|--------|--------|-------------|
| **Pre-seed / Bootstrap** | Pre-MVP | $500K | MVP development, initial team |
| **Seed** | MVP launch (M6) | $3M | V2 development, first market expansion, AI team |
| **Series A** | V2 GA (M14) | $15M | V3 enterprise, geographic expansion, sales team |
| **Series B** | V3 GA (M24) | $50M | Global scale, data products, M&A |
| **Series C / IPO prep** | Year 3 (M30+) | $100M+ | Market leadership, platform ecosystem |

---

*Document owner: Product Architecture*  
*Last updated: June 2026*  
*Status: Approved foundation*
