# Nertura — Strategic Architecture

> Master architecture document for Nertura as an AI-powered agriculture intelligence operating system — not a point application, but the intelligence layer for global food production.

---

## Executive Summary

Nertura is architected as a **multi-plane intelligence platform** that combines operational farm management, a self-improving agricultural knowledge brain, credit-governed AI consumption, omnichannel engagement (web, mobile, WhatsApp, email), and an approval-first media automation engine — all on a KVKK/GDPR-ready data foundation designed for unicorn-scale global deployment.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NERTURA INTELLIGENCE OS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  EXPERIENCE PLANE          │  Web · Mobile · WhatsApp · Email · Social       │
├────────────────────────────┼────────────────────────────────────────────────┤
│  INTELLIGENCE PLANE        │  AI Brain · Learning System · Media Engine      │
├────────────────────────────┼────────────────────────────────────────────────┤
│  COMMERCE PLANE            │  Credits · Subscriptions · Marketplace          │
├────────────────────────────┼────────────────────────────────────────────────┤
│  OPERATIONS PLANE          │  Farms · Crops · Weather · CRM · Reports        │
├────────────────────────────┼────────────────────────────────────────────────┤
│  GOVERNANCE PLANE          │  Consent · Audit · Encryption · Compliance      │
├────────────────────────────┼────────────────────────────────────────────────┤
│  DATA PLANE                │  Unified PostgreSQL + Object Storage + Vector DB │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architectural North Stars

| Star | Definition |
|------|------------|
| **Intelligence compounds** | Every interaction makes Nertura smarter for that user and, with consent, for humanity |
| **Provider-agnostic AI** | Best external model for each task today; proprietary models tomorrow |
| **Credits, not surprises** | All AI consumption metered, visible, and purchasable |
| **Human approval first** | Autonomous AI publishes and acts only after trust is earned |
| **Privacy by architecture** | KVKK/GDPR compliance is structural, not a checkbox |
| **Omnichannel parity** | Same brain, same context — web, WhatsApp, email, social |

---

## System Planes

### 1. Experience Plane

User-facing surfaces that deliver Nertura capabilities.

| Surface | Purpose | Primary users |
|---------|---------|---------------|
| **Web application** | Planning, reporting, admin, approval workflows | Managers, admins, exporters |
| **Mobile application** | Field operations, photo capture, offline sync | Farmers, scouts, operators |
| **WhatsApp** | Diagnosis, reminders, CRM, AI chat | Farmers (emerging markets priority) |
| **Email** | Onboarding, alerts, reports, outreach | All users |
| **Social channels** | Brand + educational content (approval-first) | Public audience |

All surfaces connect to a **unified session and context service** — a WhatsApp photo diagnosis attaches to the same field record as a web upload.

### 2. Intelligence Plane

The core differentiator. Three subsystems:

| Subsystem | Document | Function |
|-----------|----------|----------|
| **Nertura AI Brain** | `/ai/nertura-ai-brain.md` | Orchestration, RAG, provider routing, interaction storage |
| **Learning System** | `/ai/learning-system.md` | Feedback loops, knowledge graph, model improvement |
| **AI Media Engine** | `/automation/ai-media-engine.md` | Content research, generation, voiceover, calendar |

Future: **Autonomous Workflow Engine** — AI agents that execute multi-step farm and commerce workflows with human approval gates.

### 3. Commerce Plane

Dual revenue model: SaaS subscriptions + AI credits.

| Component | Document | Function |
|-----------|----------|----------|
| **Subscription tiers** | `/docs/subscription-model.md` | Module access, farm limits, team size |
| **Credit system** | `/product/credit-system.md` | Metered AI, media, WhatsApp consumption |
| **Free-to-paid model** | `/product/free-to-paid-model.md` | Acquisition funnel, conversion mechanics |
| **Marketplace** | `/product/core-modules.md` | B2B trade, transaction fees, sponsor network (Phase 5) |

### 4. Operations Plane

Traditional AgOS modules — the operational data that feeds intelligence.

Dashboard, Farm Management, Crop Management, Weather, Irrigation, Inventory, Marketplace, CRM, Reports, Notifications, Billing, User Management.

Documented in `/product/core-modules.md`. Operations data is the **primary training context** for the AI Brain.

### 5. Governance Plane

Compliance, consent, and security as first-class architecture.

| Component | Document |
|-----------|----------|
| Security framework | `/docs/security-compliance.md` |
| KVKK/GDPR data privacy | `/docs/data-privacy-kvkk-gdpr.md` |
| Approval workflow | `/product/approval-workflow.md` |

### 6. Data Plane

Unified storage strategy:

| Store | Technology | Contents |
|-------|------------|----------|
| **Primary DB** | PostgreSQL (regional) | All structured entities |
| **Object storage** | S3-compatible (regional) | Photos, media, documents |
| **Vector DB** | pgvector / dedicated | Embeddings, RAG retrieval |
| **Event log** | Kafka / append-only tables | Audit, analytics, learning events |
| **Cache** | Redis | Sessions, rate limits, credit balances |

Full entity catalog: `/docs/database-blueprint.md` (extended by this architecture).

---

## AI Provider Strategy

### Phase 0–3: External Model Orchestration

Nertura routes requests to best-in-class providers via an **AI Gateway** — never exposing provider keys to clients.

| Capability | Primary providers | Fallback |
|------------|-------------------|----------|
| Text / reasoning | OpenAI GPT-4o, Claude 3.5, Gemini 1.5 Pro | Cross-provider failover |
| Vision / diagnosis | GPT-4o Vision, Gemini Pro Vision | Claude Vision |
| Embeddings | OpenAI text-embedding-3, Voyage | Cohere |
| Voice / TTS | ElevenLabs, OpenAI TTS, Google Cloud TTS | Provider rotation by language |
| Video generation | Runway Gen-3, Google Veo, Kling | Manual queue on failure |
| Image generation | DALL·E 3, Imagen, Flux via API | — |

### Phase 4–6: Proprietary Models

Transition path:

1. **RAG-first** — Nertura knowledge brain outperforms generic models on ag queries
2. **Fine-tuned classifiers** — Disease detection on proprietary labeled dataset
3. **Nertura Ag LLM** — Domain model trained on consented, anonymized interaction corpus
4. **Edge models** — On-device inference for offline field use

See `/docs/system-roadmap.md` Phase 6.

---

## The Nertura Knowledge Flywheel

```
User question / photo
        │
        ▼
External AI model (routed)
        │
        ▼
Answer + confidence stored in Nertura DB  ←── NOT discarded
        │
        ▼
User feedback (confirm / correct / reject)
        │
        ▼
Learning System indexes outcome
        │
        ├──► Improved RAG for this user/org
        ├──► Improved recommendations globally (anonymized, consented)
        └──► Training data for proprietary models (Phase 6)
```

**Critical architectural rule:** Nertura **always persists** the full interaction chain — prompt, context, model used, response, feedback, credits consumed — regardless of which external provider generated the response.

---

## Credit-Governed AI Consumption

All intelligence plane operations consume credits. See `/product/credit-system.md`.

| Action | Credit type |
|--------|-------------|
| Text question | Text credit |
| Photo diagnosis | Vision credit |
| Video / media generation | Media credit |
| WhatsApp AI message | Channel credit |
| Voiceover generation | Voice credit |
| Batch report generation | Text credit (weighted) |

Free tier → registered tier → paid tier → enterprise pool. Transparent metering in UI at all times.

---

## Omnichannel Architecture

```
                    ┌─────────────────┐
                    │  Context Service │
                    │  (user, farm,    │
                    │   session, credits)│
                    └────────┬────────┘
                             │
       ┌──────────┬──────────┼──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼
    Web App   Mobile    WhatsApp    Email    Social
       │          │          │          │          │
       └──────────┴──────────┴──────────┴──────────┘
                             │
                    ┌────────▼────────┐
                    │   AI Gateway    │
                    │   + Brain RAG   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Learning System │
                    └─────────────────┘
```

Channel-specific adapters normalize inbound/outbound messages to a **canonical Interaction entity**.

---

## Automation Subsystems

| System | Document | Launch mode |
|--------|----------|-------------|
| AI Media Engine | `/automation/ai-media-engine.md` | Approval-first |
| Social Media Automation | `/automation/social-media-automation.md` | Approval-first → auto |
| WhatsApp Integration | `/automation/whatsapp-integration.md` | Opt-in, credit-metered |
| Email Engine | `/automation/email-engine.md` | Transactional + lifecycle |

All automation flows pass through `/product/approval-workflow.md` at launch.

---

## Approval-First Publishing

At launch, **no content leaves Nertura without human approval**:

```
AI generates → Queue (Pending Review) → Founder/Admin approves → Publish
                                      → Reject / Edit → Regenerate
```

Later phases enable rule-based auto-publish for trusted content types. See `/product/approval-workflow.md`.

---

## Security & Compliance Architecture

| Layer | Control |
|-------|---------|
| **Transport** | TLS 1.3 everywhere |
| **At rest** | AES-256; regional keys via KMS |
| **Access** | RBAC + ABAC; org-scoped row isolation |
| **Consent** | Granular consent records per processing purpose |
| **Audit** | Immutable audit log for all data and AI actions |
| **Residency** | EU, TR, US region selection [Enterprise] |
| **Deletion** | Right to erasure workflow; 30-day soft delete → hard purge |
| **Export** | Machine-readable data portability JSON/CSV |

Full specification: `/docs/security-compliance.md`, `/docs/data-privacy-kvkk-gdpr.md`.

---

## Deployment Topology

### Launch (Phase 1–2)

Single primary region + CDN. Multi-tenant SaaS. Managed PostgreSQL. Object storage.

### Scale (Phase 3–4)

| Component | Strategy |
|-----------|----------|
| API | Horizontal pod autoscaling |
| AI Gateway | Queue-based; rate limit per org |
| Media generation | Async job workers; approval queue |
| WhatsApp | Dedicated webhook workers |
| Database | Read replicas; partition time-series tables |

### Global (Phase 5–6)

Regional deployments (EU, TR, US, LATAM). Data residency per org. Cross-region analytics on anonymized aggregates only.

---

## Integration Map

| External system | Integration | Phase |
|-----------------|-------------|-------|
| OpenAI / Anthropic / Google AI | AI Gateway | 1 |
| ElevenLabs / TTS providers | Voice service | 4 |
| Runway / Veo / Kling | Media service | 4 |
| WhatsApp Business API | Channel adapter | 3 |
| Meta / TikTok / YouTube / LinkedIn APIs | Social publishing | 4 |
| Google Workspace | Company email | 1 |
| Resend / SendGrid | Transactional email | 1 |
| Stripe | Billing + credits | 2 |
| Stripe / local payment | Subscriptions | 1–2 |

---

## Document Index

| Document | Path | Scope |
|----------|------|-------|
| Strategic architecture | `/docs/strategic-architecture.md` | This document |
| System roadmap | `/docs/system-roadmap.md` | 6-phase intelligence roadmap |
| Security & compliance | `/docs/security-compliance.md` | Enterprise security |
| KVKK/GDPR privacy | `/docs/data-privacy-kvkk-gdpr.md` | Regulatory architecture |
| AI Brain | `/ai/nertura-ai-brain.md` | Core intelligence orchestration |
| Learning System | `/ai/learning-system.md` | Self-improving knowledge |
| AI system (modules) | `/ai/ai-system.md` | Embedded module AI |
| Credit system | `/product/credit-system.md` | Metered AI consumption |
| Approval workflow | `/product/approval-workflow.md` | Human-in-the-loop publishing |
| Free-to-paid model | `/product/free-to-paid-model.md` | Growth architecture |
| AI Media Engine | `/automation/ai-media-engine.md` | Content generation pipeline |
| Social automation | `/automation/social-media-automation.md` | Multi-platform publishing |
| WhatsApp | `/automation/whatsapp-integration.md` | Messaging channel |
| Email engine | `/automation/email-engine.md` | Transactional + lifecycle email |
| Database blueprint | `/docs/database-blueprint.md` | Entity model |
| Product roadmap | `/docs/roadmap.md` | Product feature roadmap |

---

## Success Criteria (Architecture)

| Metric | Target |
|--------|--------|
| AI interaction storage rate | 100% — zero orphaned provider calls |
| Credit metering accuracy | 99.99% |
| Consent coverage before AI training use | 100% |
| Approval queue SLA (launch) | <24h founder review |
| Cross-channel context continuity | Same session across web + WhatsApp |
| GDPR erasure completion | <30 days |
| Uptime (intelligence plane) | 99.9% |

---

*Document owner: Chief Systems Architect*  
*Last updated: June 2026*  
*Status: Approved foundation*
