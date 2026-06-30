# Nertura — Master Index

> **Single source of truth for navigating the Nertura documentation ecosystem.** Every spec, policy, wireframe, and architecture document indexed here.

**Status:** Living index · **Maintained by:** Product & Architecture  
**Last updated:** June 2026 · **Documents indexed:** 72

---

## How to Use This Index

| If you need… | Start here |
|--------------|------------|
| **Nertura Core (operating brain)** ★ | [`foundation/NERTURA_CORE.md`](foundation/NERTURA_CORE.md) |
| **Constitution (supreme law)** | [`foundation/CONSTITUTION.md`](foundation/CONSTITUTION.md) |
| **Foundation (canonical v1.0)** | [`docs/foundation/README.md`](foundation/README.md) — Core + five books |
| **Product direction & UX philosophy** | [Book 01 — Product Bible](foundation/01-product-bible/) · legacy: [`NERTURA_PRODUCT_MANIFESTO.md`](NERTURA_PRODUCT_MANIFESTO.md) |
| **Design system & UI rules** | [Book 02 — Design System](foundation/02-design-system/) |
| **Engineering standards & DoD** | [Book 03 — Engineering Standards](foundation/03-engineering-standards/) |
| **AI behaviour & safety** | [Book 04 — AI Behaviour](foundation/04-ai-behaviour/) |
| **Growth, pricing, KPIs** | [Book 05 — Growth & Business](foundation/05-growth-business/) |
| **How the system is built (code)** | [Operations](#operations--production-pre-code-blueprint) → [`NERTURA_ARCHITECTURE_BIBLE.md`](NERTURA_ARCHITECTURE_BIBLE.md) |
| **What we decided strategically** | [Vision](#vision) → [`founder-decisions.md`](founder-decisions.md) |
| **What ships in 90 days** | [Vision](#vision) → [`mvp-definition.md`](mvp-definition.md) |
| **How to build a feature** | [Product](#product) + [Design](#design) + [AI](#ai) |
| **Legal / privacy / AI rules** | [Compliance](#compliance) + [Security](#security) |
| **Pricing and credits** | [Revenue](#revenue) |
| **Brain / agents / memory** | [AI](#ai) → [`nertura-brain-architecture.md`](nertura-brain-architecture.md) |
| **Long-term moat narrative** | [Vision](#vision) → [`data-moat-strategy.md`](data-moat-strategy.md) |

---

## Document Authority Hierarchy

When documents conflict, resolve in this order:

```
1. docs/foundation/CONSTITUTION.md  ← Supreme law
2. docs/foundation/NERTURA_CORE.md    ← Product operating brain
3. docs/foundation/ (Core layers + five books)
4. Code                               ← When Foundation is silent
5. founder-decisions.md               ← Strategic if Foundation silent
5. NERTURA_PRODUCT_MANIFESTO.md       ← Legacy (superseded by Book 01 where duplicated)
6. mvp-definition.md                  ← Launch scope timing
7. Compliance & security policies     ← Legal "must"
8. NERTURA_ARCHITECTURE_BIBLE.md      ← Deep technical reference
9. nertura-brain-architecture.md
10. Domain specs, wireframes
```

This index does **not** override policy — it **organizes** it.

---

## Ecosystem Map

```
Nertura/
├── docs/           Strategy, policies, vision, MVP, design system, Brain canon
├── product/        Modules, dashboards, workflows, network products
├── ai/             Brain, agents, memory, graph, learning, training, moat
├── automation/     Media, email, WhatsApp, social, content pipelines
├── ui/             Navigation, layout, dashboard wireframes
├── wireframes/     Screen-level UX specs (web, mobile, marketing)
├── brand/          Logo and brand assets (source of truth for mark)
├── web/            Web application (code — not indexed here)
├── mobile/         Mobile application (code — not indexed here)
└── crm/            CRM implementation (code — not indexed here)
```

**Note:** This index covers **documentation only**. Application code lives in `web/`, `mobile/`, and related folders.

---

## Foundation Library (v1.0) ★★★

**Permanent source of truth.** Start with **Nertura Core**, then Five Books.

| Layer | Path |
|-------|------|
| **Nertura Core** ★ | [`foundation/NERTURA_CORE.md`](foundation/NERTURA_CORE.md) |
| Experience Language | [`foundation/03-experience-language/`](foundation/03-experience-language/) |
| Writing System | [`foundation/04-writing-system/`](foundation/04-writing-system/) |
| Quality / Review | [`foundation/08-quality/`](foundation/08-quality/) · [`foundation/12-review-system/`](foundation/12-review-system/) |
| Intelligence Constitution | [`foundation/11-nertura-intelligence/`](foundation/11-nertura-intelligence/) |
| Decision Archive | [`foundation/10-decision-archive/`](foundation/10-decision-archive/) |

| Book | Path | Chapters |
|------|------|----------|
| **01 — Product Bible** | [`foundation/01-product-bible/`](foundation/01-product-bible/) | 12 |
| **02 — Design System** | [`foundation/02-design-system/`](foundation/02-design-system/) | 15 |
| **03 — Engineering Standards** | [`foundation/03-engineering-standards/`](foundation/03-engineering-standards/) | 13 |
| **04 — AI Behaviour Manual** | [`foundation/04-ai-behaviour/`](foundation/04-ai-behaviour/) | 10 |
| **05 — Growth & Business Manual** | [`foundation/05-growth-business/`](foundation/05-growth-business/) | 8 |

Master index: [`foundation/README.md`](foundation/README.md)

---

## Operations & Production (Pre-Code Blueprint)

*Production-grade infrastructure plan — complete before application coding begins.*

| Document | Path | Summary |
|----------|------|---------|
| **Nertura Product Manifesto** ★★ | [`docs/NERTURA_PRODUCT_MANIFESTO.md`](NERTURA_PRODUCT_MANIFESTO.md) | **Canonical product direction** — AI Brain positioning, UX ladder, four layers, safety, marketplace rule |
| **Nertura Architecture Bible** ★★ | [`docs/NERTURA_ARCHITECTURE_BIBLE.md`](NERTURA_ARCHITECTURE_BIBLE.md) | **Canonical code-aligned architecture** — monorepo, apps, AI pipeline, data, auth, credits, deploy |
| **Geo Intelligence (Sprint 1A)** | [`docs/geo-intelligence.md`](geo-intelligence.md) | Mapbox abstraction, field boundaries, regional API stubs, farm map |
| **Product Foundation Sprint** | [`docs/SPRINT_PRODUCT_FOUNDATION.md`](SPRINT_PRODUCT_FOUNDATION.md) | NL intake, field cases, geo UX, KB/CRM/content/premium scaffolds |
| **Field Cases + Geo + Content Sprint** | [`docs/SPRINT_FIELD_CASES_GEO_CONTENT.md`](SPRINT_FIELD_CASES_GEO_CONTENT.md) | Doctor case sidebar, auto-geocode, content intelligence engine |
| **RC-1 Beta Readiness** | [`docs/SPRINT_RC1_BETA_READINESS.md`](SPRINT_RC1_BETA_READINESS.md) | UX polish, Doctor/Map/CRM/Content/Marketing consistency |
| **RC-2 Field Intelligence** | [`docs/SPRINT_RC2_FIELD_INTELLIGENCE.md`](SPRINT_RC2_FIELD_INTELLIGENCE.md) | Field-centric home, field workspace, cases, recommendations, health score |
| **Smart Farm Creation (Sprint 1B)** | [`docs/SPRINT_1B_FARM_CREATION_REPORT.md`](SPRINT_1B_FARM_CREATION_REPORT.md) | Create farm wizard, My Farm hub, UUID-safe map routing |
| **Final Production Blueprint** ★ | [`docs/final-production-blueprint.md`](final-production-blueprint.md) | Master plan: 20 domains, topology, monorepo, phasing |
| **Infrastructure Stack** | [`docs/infrastructure-stack.md`](infrastructure-stack.md) | Next.js, Vercel, Cloudflare, Supabase, Stripe, Brain, integrations |
| **Security Master Plan** | [`docs/security-master-plan.md`](security-master-plan.md) | 14 security layers, AI security, SDLC, compliance roadmap |
| **Database Security Rules** | [`docs/database-security-rules.md`](database-security-rules.md) | Mandatory RLS, patterns, migration checklist |
| **Audit Log System** | [`docs/audit-log-system.md`](audit-log-system.md) | Immutable audit schema, categories, retention |
| **Incident Response Plan** | [`docs/incident-response-plan.md`](incident-response-plan.md) | P0–P3 severity, phases, breach notification |
| **Legal Compliance Master Plan** | [`docs/legal-compliance-master-plan.md`](legal-compliance-master-plan.md) | KVKK/GDPR, consent, DSR, sub-processors |
| **Admin Panel Spec** | [`docs/admin-panel-spec.md`](admin-panel-spec.md) | 22 admin modules, MVP scope |
| **Admin Permission Matrix** | [`docs/admin-permission-matrix.md`](admin-permission-matrix.md) | 9 roles × permissions |
| **Frontend Website Spec** | [`docs/frontend-website-spec.md`](frontend-website-spec.md) | nertura.com IA, pages, forms, MVP |
| **SEO Engine Spec** | [`docs/seo-engine-spec.md`](seo-engine-spec.md) | Technical + programmatic SEO, schema, AI content policy |
| **Marketing Growth System** | [`docs/marketing-growth-system.md`](marketing-growth-system.md) | Channels, calendar, UTM, approval, analytics |
| **Payment Billing System** | [`docs/payment-billing-system.md`](payment-billing-system.md) | Stripe, webhooks, credits, dunning |
| **Production Checklist** | [`docs/production-checklist.md`](production-checklist.md) | GA gates: security, legal, SEO, deployment |
| **Privacy Policy (Draft)** | [`docs/privacy-policy-draft.md`](privacy-policy-draft.md) | ⚠️ Lawyer review required |
| **Terms of Service (Draft)** | [`docs/terms-of-service-draft.md`](terms-of-service-draft.md) | ⚠️ Lawyer review required |
| **Cookie Policy (Draft)** | [`docs/cookie-policy-draft.md`](cookie-policy-draft.md) | ⚠️ Lawyer review required |
| **AI Usage Policy (Draft)** | [`docs/ai-usage-policy.md`](ai-usage-policy.md) | ⚠️ Lawyer review required |
| **Data Retention Policy (Draft)** | [`docs/data-retention-policy.md`](data-retention-policy.md) | ⚠️ Lawyer review required |

★ = Start here for engineering kickoff

---

## Vision

*Where Nertura is going, who we serve, what we decided, and how we phase the journey.*

| Document | Path | Summary |
|----------|------|---------|
| **Nertura Product Manifesto** ★★ | [`docs/NERTURA_PRODUCT_MANIFESTO.md`](NERTURA_PRODUCT_MANIFESTO.md) | AI Brain for Agriculture — guest-first composer, field OS for logged-in, safety rules |
| **Nertura Master Index** ★ | [`docs/nertura-index.md`](nertura-index.md) | **This document** — navigation index for all ecosystem specs |
| **Final Production Blueprint** ★ | [`docs/final-production-blueprint.md`](final-production-blueprint.md) | Pre-code master architecture: 20 domains, stack, phasing |
| **Production Checklist** | [`docs/production-checklist.md`](production-checklist.md) | Strict GA gates: security, legal, SEO, deployment |
| **Founder Decisions** ★ | [`docs/founder-decisions.md`](founder-decisions.md) | Single source of truth for strategy: identity, customer, first AI module, revenue, community, WhatsApp, media, brain, LLM path, 5-year vision |
| **Project Vision** | [`docs/project-vision.md`](project-vision.md) | Mission, 10-year vision, AgOS positioning, competitive landscape, long-term goals |
| **User Personas** | [`docs/user-personas.md`](user-personas.md) | Seven personas: farmer, manager, cooperative, ag company, supplier, exporter, admin |
| **MVP Definition** | [`docs/mvp-definition.md`](mvp-definition.md) | Strict 90-day launch scope: Must/Should/Could/Not now per module |
| **Product Roadmap** | [`docs/roadmap.md`](roadmap.md) | MVP → V2 → V3 feature roadmap, milestones, team, success metrics |
| **System Roadmap** | [`docs/system-roadmap.md`](system-roadmap.md) | Engineering systems roadmap: infrastructure, intelligence platform, scale phases |
| **Strategic Architecture** | [`docs/strategic-architecture.md`](strategic-architecture.md) | Master architecture: multi-plane intelligence platform, credit, channels, compliance foundation |
| **Data Moat Strategy** | [`docs/data-moat-strategy.md`](data-moat-strategy.md) | Long-term competitive advantage: why GPT cannot replace Nertura, network effects, regional layers |

★ = Primary entry point for new leadership hires

---

## Product

*What Nertura does — modules, role experiences, workflows, and application structure.*

| Document | Path | Summary |
|----------|------|---------|
| **Core Modules** | [`product/core-modules.md`](../product/core-modules.md) | All 12 platform modules: dashboard, farms, crops, weather, irrigation, inventory, marketplace, CRM, reports, billing, users, AI |
| **Farmer Dashboard** | [`product/farmer-dashboard.md`](../product/farmer-dashboard.md) | P0 daily return surface: KPIs, alerts, tasks, AI insights, field map |
| **Cooperative Dashboard** | [`product/cooperative-dashboard.md`](../product/cooperative-dashboard.md) | Member rollup, collective weather, pipeline, group listings |
| **Export Company Dashboard** | [`product/export-company-dashboard.md`](../product/export-company-dashboard.md) | Export pipeline, compliance, traceability, buyer CRM weighting |
| **Approval Workflow** | [`product/approval-workflow.md`](../product/approval-workflow.md) | Human-in-the-loop for AI content and high-impact actions; state machine |
| **Community Network** | [`product/community-network.md`](../product/community-network.md) | Phase 5+ farmer knowledge network: practices, expert validation, moat |
| **Sponsor Network** | [`product/sponsor-network.md`](../product/sponsor-network.md) | Phase 5+ contextual sponsorship: credit-funded, consent-based tips |
| **Platform Structure** | [`wireframes/platform-structure.md`](../wireframes/platform-structure.md) | Module deep structure: entities, fields, relationships per domain |
| **Platform Sitemap** | [`wireframes/platform-sitemap.md`](../wireframes/platform-sitemap.md) | Complete route inventory: web `/app/*`, mobile `/m/*`, depth rules |
| **AI Assistant Screens** | [`wireframes/ai-assistant-screens.md`](../wireframes/ai-assistant-screens.md) | Floating panel, full-page chat, disease overlay, mobile voice [V2] |
| **CRM Screens** | [`wireframes/crm-screens.md`](../wireframes/crm-screens.md) | Accounts, pipeline, members, interactions — web and mobile |
| **Dashboard Wireframe** | [`ui/dashboard-wireframe.md`](../ui/dashboard-wireframe.md) | Full AgOS dashboard UX: 4 roles × 14 modules × 3 breakpoints |
| **Navigation Structure** | [`ui/navigation-structure.md`](../ui/navigation-structure.md) | Sidebar, tabs, ⌘K, mobile bottom bar, role visibility, keyboard shortcuts |
| **Dashboard Layout System** | [`ui/dashboard-layout-system.md`](../ui/dashboard-layout-system.md) | 12-col grid, widget catalog, customization rules, responsive behavior |

---

## AI

*Intelligence layer — Brain, agents, memory, learning, models, and governance.*

| Document | Path | Summary |
|----------|------|---------|
| **Nertura Brain Architecture** ★ | [`docs/nertura-brain-architecture.md`](nertura-brain-architecture.md) | **Canonical Brain reference:** central brain, agents, memory, graph, learning, feedback, channels, Foundation Model path |
| **Nertura AI Brain** | [`ai/nertura-ai-brain.md`](../ai/nertura-ai-brain.md) | Brain specification: gateway, orchestration, inference routing, storage |
| **Brain Architecture** | [`ai/brain-architecture.md`](../ai/brain-architecture.md) | Technical brain layers and execution flow (companion to canonical doc) |
| **AI System** | [`ai/ai-system.md`](../ai/ai-system.md) | All AI capabilities embedded in AgOS: philosophy, modules, confidence, offline |
| **Agents** | [`ai/agents.md`](../ai/agents.md) | Eight specialized agents: Farmer, Agronomist, WhatsApp, Content, Commerce, etc. |
| **Memory System** | [`ai/memory-system.md`](../ai/memory-system.md) | Six-layer memory: working → user → conversation → entity → org → global |
| **Knowledge Graph** | [`ai/knowledge-graph.md`](../ai/knowledge-graph.md) | Entity types, edges, traversals, GraphRAG, sync from operational DB |
| **Learning System** | [`ai/learning-system.md`](../ai/learning-system.md) | Feedback loop: ask → infer → confirm → store → improve; event taxonomy |
| **Training Roadmap** | [`ai/training-roadmap.md`](../ai/training-roadmap.md) | External models → RAG → fine-tune → Nertura Foundation Model; benchmarks |
| **Voice Cloning System** | [`ai/voice-cloning-system.md`](../ai/voice-cloning-system.md) | ElevenLabs brand voices, white-label, Media Factory audio |
| **Data Moat Strategy (AI)** | [`ai/data-moat-strategy.md`](../ai/data-moat-strategy.md) | Seven moat layers: interactions, feedback, memory, network, corpus, models, community |
| **AI Governance Policy** | [`docs/ai-governance-policy.md`](ai-governance-policy.md) | Approval levels L0–L4, auto-publish rules, model deprecation, kill switches |

★ = Canonical Brain document; prefer over duplicate brain specs when in conflict

---

## Data

*Data architecture, ownership, moat, and persistence.*

| Document | Path | Summary |
|----------|------|---------|
| **Database Blueprint** | [`docs/database-blueprint.md`](database-blueprint.md) | PostgreSQL schema: orgs, farms, fields, crops, AI, commerce, audit entities |
| **Data Ownership Policy** | [`docs/data-ownership-policy.md`](data-ownership-policy.md) | Customer vs Nertura IP; farm data; AI training opt-in; export and deletion |
| **Data Moat Strategy** | [`docs/data-moat-strategy.md`](data-moat-strategy.md) | Strategic moat: GPT vs Nertura, network effects, disease dataset, regional layers |
| **Data Moat Strategy (AI)** | [`ai/data-moat-strategy.md`](../ai/data-moat-strategy.md) | Operational seven-layer moat architecture and metrics |
| **Knowledge Graph** | [`ai/knowledge-graph.md`](../ai/knowledge-graph.md) | Graph nodes, relationships, query patterns — structural data model |
| **Memory System** | [`ai/memory-system.md`](../ai/memory-system.md) | Memory entity model, retrieval order, privacy controls |
| **Learning System** | [`ai/learning-system.md`](../ai/learning-system.md) | Immutable learning events, label tiers, corpus promotion rules |

---

## Security

*Platform security architecture and enterprise readiness.*

| Document | Path | Summary |
|----------|------|---------|
| **Security & Compliance** ★ | [`docs/security-compliance.md`](security-compliance.md) | SOC 2 path, encryption, IAM, audit logging, incident response, ISO 27001 alignment |

★ = Primary security reference

---

## Compliance

*Privacy regulation, AI governance, data rights, and approval requirements.*

| Document | Path | Summary |
|----------|------|---------|
| **Data Privacy (KVKK & GDPR)** ★ | [`docs/data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md) | Lawful basis, DPA, cross-border transfer, user rights, consent registry |
| **Data Ownership Policy** | [`docs/data-ownership-policy.md`](data-ownership-policy.md) | Ownership matrix; no sale of identifiable field data; training opt-in |
| **AI Governance Policy** | [`docs/ai-governance-policy.md`](ai-governance-policy.md) | Human approval before autonomy; content levels; safe self-improvement |
| **Approval Workflow** | [`product/approval-workflow.md`](../product/approval-workflow.md) | Approval state machine for social, email, WhatsApp, media, platform actions |
| **Security & Compliance** | [`docs/security-compliance.md`](security-compliance.md) | Security controls supporting regulatory audit |

★ = Primary privacy reference for EU and Turkey

---

## Growth

*Acquisition, content, channels, automation, and network expansion.*

| Document | Path | Summary |
|----------|------|---------|
| **Free-to-Paid Model** | [`product/free-to-paid-model.md`](../product/free-to-paid-model.md) | Funnel: anonymous → registered → credits → subscription; conversion triggers |
| **Community Network** | [`product/community-network.md`](../product/community-network.md) | Phase 5+ peer learning network; gates: 25K users, 500K labels |
| **Sponsor Network** | [`product/sponsor-network.md`](../product/sponsor-network.md) | Phase 5+ contextual ag sponsorship via credit pools |
| **Media Factory** | [`automation/media-factory.md`](../automation/media-factory.md) | Phase 4 daily content production: research → create → approve → distribute |
| **Content Pipeline** | [`automation/content-pipeline.md`](../automation/content-pipeline.md) | End-to-end content stages, approval gates, channel packaging |
| **AI Media Engine** | [`automation/ai-media-engine.md`](../automation/ai-media-engine.md) | Image, video, voice generation pipeline; brand guardrails |
| **Social Distribution Engine** | [`automation/social-distribution-engine.md`](../automation/social-distribution-engine.md) | Multi-channel publish, scheduling, performance loop, L0–L2 auto levels |
| **Social Media Automation** | [`automation/social-media-automation.md`](../automation/social-media-automation.md) | Account connect, post queue, white-label org social [Business+] |
| **Email Engine** | [`automation/email-engine.md`](../automation/email-engine.md) | Lifecycle, newsletter, cooperative broadcasts; approval-first |
| **WhatsApp Integration** | [`automation/whatsapp-integration.md`](../automation/whatsapp-integration.md) | WABA, opt-in, inbound AI, templates, credit metering — Phase 3 channel |
| **Homepage Wireframe** | [`wireframes/homepage-wireframe.md`](../wireframes/homepage-wireframe.md) | Marketing site UX: 12 sections, conversion paths, pricing anchor |

---

## Revenue

*Subscriptions, credits, pricing tiers, and monetization mechanics.*

| Document | Path | Summary |
|----------|------|---------|
| **Subscription Model** ★ | [`docs/subscription-model.md`](subscription-model.md) | Starter / Professional / Business / Enterprise tiers, limits, feature matrix |
| **Credit System** | [`product/credit-system.md`](../product/credit-system.md) | TEXT, VISION, MEDIA, VOICE, WA credits; grants, rollover, metering UI |
| **Free-to-Paid Model** | [`product/free-to-paid-model.md`](../product/free-to-paid-model.md) | Dual revenue funnel; free tier credits; upgrade triggers |
| **Sponsor Network** | [`product/sponsor-network.md`](../product/sponsor-network.md) | Phase 5+ revenue line: suppliers fund farmer credits |
| **Founder Decisions §4** | [`docs/founder-decisions.md`](founder-decisions.md) | Revenue model decisions: SaaS + credits, PPP, marketplace fees Phase 2 |

★ = Primary pricing reference

---

## Marketplace

*Commerce, listings, orders, and B2B trade UX.*

| Document | Path | Summary |
|----------|------|---------|
| **Marketplace Screens** ★ | [`wireframes/marketplace-screens.md`](../wireframes/marketplace-screens.md) | Browse, listings, offers, orders, messaging, buyer requirements |
| **Core Modules § Marketplace** | [`product/core-modules.md`](../product/core-modules.md) | Marketplace module capabilities and entity model |
| **Export Company Dashboard** | [`product/export-company-dashboard.md`](../product/export-company-dashboard.md) | Exporter-weighted dashboard: pipeline, compliance, traceability |
| **Database Blueprint § Commerce** | [`docs/database-blueprint.md`](database-blueprint.md) | Listings, offers, orders schema |
| **Subscription Model § Marketplace** | [`docs/subscription-model.md`](subscription-model.md) | Tier gating: browse vs full; transaction fees 2–3% |

★ = Primary marketplace UX reference · **Launch note:** Marketplace deferred to V2 per [`mvp-definition.md`](mvp-definition.md)

---

## Mobile

*Field-first mobile and PWA experience.*

| Document | Path | Summary |
|----------|------|---------|
| **Mobile App Screens** ★ | [`wireframes/mobile-app-screens.md`](../wireframes/mobile-app-screens.md) | PWA/native UX: home, farms, capture, disease result, offline sync, bottom tabs |
| **Platform Sitemap § Mobile** | [`wireframes/platform-sitemap.md`](../wireframes/platform-sitemap.md) | `/m/*` route inventory and deep links |
| **Navigation Structure § Mobile** | [`ui/navigation-structure.md`](../ui/navigation-structure.md) | Bottom tabs, FAB, More sheet, role overrides |
| **Dashboard Wireframe § Mobile** | [`ui/dashboard-wireframe.md`](../ui/dashboard-wireframe.md) | Per-module mobile layouts and flows |
| **Farmer Dashboard § Mobile** | [`product/farmer-dashboard.md`](../product/farmer-dashboard.md) | Farmer mobile parity and critical alert banner |
| **MVP Definition § PWA** | [`docs/mvp-definition.md`](mvp-definition.md) | Day 90: PWA offline observations; native apps V2 |

★ = Primary mobile UX reference

---

## Design

*Visual language, marketing UX, and design system.*

| Document | Path | Summary |
|----------|------|---------|
| **Design System** ★ | [`docs/design-system.md`](design-system.md) | Brand, color, typography, components, light/dark, dashboard and mobile styles |
| **Homepage Wireframe** | [`wireframes/homepage-wireframe.md`](../wireframes/homepage-wireframe.md) | Marketing homepage: Apple/Stripe/Palantir aesthetic; 12 sections |
| **Dashboard Layout System** | [`ui/dashboard-layout-system.md`](../ui/dashboard-layout-system.md) | Widget catalog, grid tokens, loading states — visual structure |
| **Navigation Structure** | [`ui/navigation-structure.md`](../ui/navigation-structure.md) | Shell chrome, sidebar anatomy, responsive breakpoints |
| **Dashboard Wireframe** | [`ui/dashboard-wireframe.md`](../ui/dashboard-wireframe.md) | Application UX spec aligned to design system tokens |
| **Brand Assets** | `brand/` | Approved logo mark, wordmark, lockups — source for color extraction |

★ = Primary visual reference · All UI specs defer to design system tokens

---

## Operations

*How we ship, scope, approve, and run the platform.*

| Document | Path | Summary |
|----------|------|---------|
| **MVP Definition** ★ | [`docs/mvp-definition.md`](mvp-definition.md) | 90-day gates, cut priority, definition of done, tier and role scope |
| **Approval Workflow** | [`product/approval-workflow.md`](../product/approval-workflow.md) | Operational approval for AI content and actions at launch |
| **System Roadmap** | [`docs/system-roadmap.md`](system-roadmap.md) | Engineering delivery phases, infra milestones, scale triggers |
| **Database Blueprint** | [`docs/database-blueprint.md`](database-blueprint.md) | Implementation schema reference for engineering |
| **Strategic Architecture** | [`docs/strategic-architecture.md`](strategic-architecture.md) | Multi-plane platform ops: intelligence, commerce, channels |
| **Product Roadmap** | [`docs/roadmap.md`](roadmap.md) | Month-by-month MVP milestones and V2/V3 delivery |
| **Security & Compliance** | [`docs/security-compliance.md`](security-compliance.md) | Operational security requirements and audit readiness |
| **AI Governance Policy** | [`docs/ai-governance-policy.md`](ai-governance-policy.md) | Operational AI safety levels and graduation to automation |

★ = Primary launch operations reference

---

## Cross-Index

Documents that belong to **multiple groups** — listed by primary group above.

| Document | Also relevant to |
|----------|------------------|
| [`founder-decisions.md`](founder-decisions.md) | Vision, Revenue, AI, Growth, Compliance |
| [`nertura-brain-architecture.md`](nertura-brain-architecture.md) | AI, Data, Operations |
| [`data-moat-strategy.md`](data-moat-strategy.md) | Vision, Data, AI |
| [`data-ownership-policy.md`](data-ownership-policy.md) | Data, Compliance |
| [`ai-governance-policy.md`](ai-governance-policy.md) | AI, Compliance, Operations |
| [`approval-workflow.md`](../product/approval-workflow.md) | Product, Compliance, Operations, Growth |
| [`mvp-definition.md`](mvp-definition.md) | Vision, Operations, Product, Mobile |
| [`free-to-paid-model.md`](../product/free-to-paid-model.md) | Revenue, Growth |
| [`community-network.md`](../product/community-network.md) | Product, Growth, Data |
| [`whatsapp-integration.md`](../automation/whatsapp-integration.md) | Growth, AI, Mobile |
| [`platform-sitemap.md`](../wireframes/platform-sitemap.md) | Product, Mobile |
| [`core-modules.md`](../product/core-modules.md) | Product, Marketplace, Revenue |

---

## Canonical vs Companion Documents

Some topics have multiple specs. Use the **canonical** doc first.

| Topic | Canonical | Companion (detail / legacy) |
|-------|-----------|----------------------------|
| **Strategy** | `docs/founder-decisions.md` | `docs/strategic-architecture.md`, `docs/roadmap.md` |
| **Launch scope** | `docs/mvp-definition.md` | `docs/roadmap.md` (6-month view) |
| **Brain** | `docs/nertura-brain-architecture.md` | `ai/nertura-ai-brain.md`, `ai/brain-architecture.md` |
| **Data moat** | `docs/data-moat-strategy.md` (strategic) | `ai/data-moat-strategy.md` (operational layers) |
| **Moat index / navigation** | `docs/nertura-index.md` (this file) | — |
| **Design** | `docs/design-system.md` | Individual wireframes |
| **Dashboard UX** | `ui/dashboard-wireframe.md` | `ui/dashboard-layout-system.md`, role dashboards in `product/` |
| **Privacy** | `docs/data-privacy-kvkk-gdpr.md` | `docs/data-ownership-policy.md` |
| **Pricing** | `docs/subscription-model.md` | `product/credit-system.md` |

---

## Recommended Reading Paths

### New engineer (Day 1)

1. [`founder-decisions.md`](founder-decisions.md)  
2. [`mvp-definition.md`](mvp-definition.md)  
3. [`nertura-brain-architecture.md`](nertura-brain-architecture.md)  
4. [`database-blueprint.md`](database-blueprint.md)  
5. [`platform-sitemap.md`](../wireframes/platform-sitemap.md)

### Product designer (Day 1)

1. [`founder-decisions.md`](founder-decisions.md)  
2. [`design-system.md`](design-system.md)  
3. [`dashboard-wireframe.md`](../ui/dashboard-wireframe.md)  
4. [`navigation-structure.md`](../ui/navigation-structure.md)  
5. [`mobile-app-screens.md`](../wireframes/mobile-app-screens.md)

### AI / ML engineer (Day 1)

1. [`nertura-brain-architecture.md`](nertura-brain-architecture.md)  
2. [`ai/agents.md`](../ai/agents.md)  
3. [`ai/memory-system.md`](../ai/memory-system.md)  
4. [`ai/learning-system.md`](../ai/learning-system.md)  
5. [`ai/training-roadmap.md`](../ai/training-roadmap.md)

### Investor / board (1 hour)

1. [`founder-decisions.md`](founder-decisions.md)  
2. [`project-vision.md`](project-vision.md)  
3. [`data-moat-strategy.md`](data-moat-strategy.md)  
4. [`subscription-model.md`](subscription-model.md)  
5. [`mvp-definition.md`](mvp-definition.md)

### Compliance / legal review

1. [`data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md)  
2. [`data-ownership-policy.md`](data-ownership-policy.md)  
3. [`ai-governance-policy.md`](ai-governance-policy.md)  
4. [`security-compliance.md`](security-compliance.md)  
5. [`approval-workflow.md`](../product/approval-workflow.md)

### Growth / marketing lead

1. [`founder-decisions.md`](founder-decisions.md) §6–7  
2. [`homepage-wireframe.md`](../wireframes/homepage-wireframe.md)  
3. [`free-to-paid-model.md`](../product/free-to-paid-model.md)  
4. [`automation/media-factory.md`](../automation/media-factory.md)  
5. [`mvp-definition.md`](mvp-definition.md) (what **not** to market at launch)

---

## Document Count by Group

| Group | Count | Folder(s) |
|-------|-------|-----------|
| Vision | 8 | `docs/` |
| Product | 14 | `product/`, `ui/`, `wireframes/` |
| AI | 12 | `docs/`, `ai/` |
| Data | 7 | `docs/`, `ai/` |
| Security | 1 | `docs/` |
| Compliance | 5 | `docs/`, `product/` |
| Growth | 11 | `product/`, `automation/`, `wireframes/` |
| Revenue | 5 | `docs/`, `product/` |
| Marketplace | 5 | `wireframes/`, `product/`, `docs/` |
| Mobile | 6 | `wireframes/`, `ui/`, `product/`, `docs/` |
| Design | 6 | `docs/`, `ui/`, `wireframes/`, `brand/` |
| Operations | 8 | `docs/`, `product/` |

*Counts include cross-listed documents; unique markdown files: **53**.*

---

## Index Maintenance

| Rule | Action |
|------|--------|
| **New doc added** | Add row to primary group + cross-index if multi-group |
| **Doc renamed/moved** | Update path; add redirect note in old location for 1 release |
| **Doc superseded** | Move to Canonical vs Companion table; mark status Deprecated |
| **Strategy change** | Update `founder-decisions.md` first, then this index |
| **Launch scope change** | Update `mvp-definition.md` first, then this index |

**Owner:** Product Architecture · **Review cadence:** Weekly during build; monthly post-GA

---

## Quick Links — Start Here

| Role | Document |
|------|----------|
| **Everyone** | [`docs/nertura-index.md`](nertura-index.md) ← you are here |
| **Product / UX** | [`docs/NERTURA_PRODUCT_MANIFESTO.md`](NERTURA_PRODUCT_MANIFESTO.md) |
| **Engineering** | [`docs/NERTURA_ARCHITECTURE_BIBLE.md`](NERTURA_ARCHITECTURE_BIBLE.md) |
| **Founder / CEO** | [`docs/founder-decisions.md`](founder-decisions.md) |
| **Ship in 90 days** | [`docs/mvp-definition.md`](mvp-definition.md) |
| **Build the Brain** | [`docs/nertura-brain-architecture.md`](nertura-brain-architecture.md) |
| **Design anything** | [`docs/design-system.md`](design-system.md) |
| **Price anything** | [`docs/subscription-model.md`](subscription-model.md) |
| **Stay legal** | [`docs/data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md) |
| **Win long-term** | [`docs/data-moat-strategy.md`](data-moat-strategy.md) |

---

*Nertura Master Index v1.0 — Single navigation source for the documentation ecosystem. No application code.*
