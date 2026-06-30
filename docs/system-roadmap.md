# Nertura — System Roadmap

> Six-phase intelligence and automation roadmap from manual-approval AI through proprietary agricultural models, WhatsApp omnichannel, media automation, marketplace network effects, and Nertura-owned AI.

---

## Roadmap Overview

This roadmap governs **intelligence, automation, and platform architecture** evolution. Product feature roadmap remains in `/docs/roadmap.md`. Both align but serve different planning horizons.

```
Phase 1          Phase 2          Phase 3          Phase 4          Phase 5          Phase 6
Manual AI    →   Credits      →   WhatsApp     →   Media Engine →   Marketplace  →   Nertura AI
+ Brain store    + monetization   assistant        + social auto      + sponsors       proprietary model
```

---

## Phase 1: Manual Approval AI System

**Timeline:** Months 1–8  
**Theme:** Store everything; trust before autonomy

### Objectives

- Deploy Nertura AI Brain with external provider routing
- Persist 100% of interactions in Nertura database
- Launch Learning System feedback loop (org-layer)
- All AI-generated content and actions require human approval
- KVKK/GDPR consent framework live before scale

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **AI Brain** | Provider router (OpenAI, Claude, Gemini); context assembly; RAG from curated corpus; Interaction storage |
| **Learning** | Thumbs up/down; diagnosis confirm/reject; org-level KnowledgeNodes |
| **Approval** | Approval queue UI; founder review for any publish; action confirm pattern |
| **Compliance** | ConsentRecord service; privacy policy TR+EN; data export v1; deletion workflow |
| **Operations** | MVP modules (farm, crop, weather); basic disease detection (4 crops) |
| **Email** | Resend transactional; Google Workspace company mail; verification, alerts |
| **Security** | TLS, encryption at rest, RBAC, audit log, MFA for admin |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M1.1 | AI Gateway + Brain request lifecycle |
| M1.2 | Interaction persistence + object storage for photos |
| M1.3 | RAG pipeline + citation in responses |
| M1.4 | ApprovalRequest entity + review UI |
| M1.5 | Consent gates on AI and photos |
| M1.6 | Learning event ingestion |

### Success metrics

| Metric | Target |
|--------|--------|
| Interaction storage rate | 100% |
| Founder approval SLA | <24h |
| Diagnosis feedback rate | >20% |
| Zero compliance incidents | ✓ |
| Active organizations | 500 |

### Team focus

Platform engineering, AI integration, compliance foundation — no media automation yet.

---

## Phase 2: Credit System

**Timeline:** Months 7–14  
**Theme:** Meter intelligence; product-led monetization

### Objectives

- Credit-governed AI consumption (TEXT, VISION)
- Free → registered → paid segment ladder
- Subscription + credit dual revenue
- Margin visibility per interaction

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **Credits** | CreditBalance ledger; reserve/settle; UI meter; top-up packs |
| **Subscriptions** | Tier credit grants on billing cycle; Stripe integration |
| **Free tier** | 50 TEXT + 5 VISION/month; conversion triggers |
| **Brain integration** | Credit gate before every inference; refund on failure |
| **Analytics** | Cost vs revenue dashboard; provider margin |
| **Learning** | Correction UI; outcome linking to harvest |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M2.1 | Atomic credit ledger |
| M2.2 | Credit gate in Brain pipeline |
| M2.3 | Top-up purchase flow |
| M2.4 | Usage dashboard |
| M2.5 | Free tier enforcement + upgrade CTAs |

### Success metrics

| Metric | Target |
|--------|--------|
| Free → paid conversion (90d) | 5% |
| Credit top-up attach rate | 15% |
| Gross margin on AI | >60% |
| ARR | $3M |

### Dependency

Phase 1 Brain and consent must be stable.

---

## Phase 3: WhatsApp Assistant

**Timeline:** Months 12–20  
**Theme:** Omnichannel intelligence where farmers already are

### Objectives

- WhatsApp Business API live (TR, BR first)
- Photo diagnosis + AI Q&A via WhatsApp
- Operational reminders and CRM templates
- Unified context: WA session = same Brain context as app
- WA credit metering

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **WhatsApp** | WABA setup; webhook service; opt-in double consent |
| **Brain adapter** | WA message normalization; image download; short replies |
| **Credits** | WA credit type; conversation metering |
| **CRM** | WA logged as CRMInteraction; template broadcasts with approval |
| **Learning** | WA feedback via reply keywords |
| **Templates** | Frost, task, irrigation reminders (Meta-approved) |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M3.1 | Webhook + signature validation |
| M3.2 | Phone → user linking + OTP |
| M3.3 | Inbound photo → vision pipeline |
| M3.4 | Outbound template scheduler |
| M3.5 | Cross-channel session context |

### Success metrics

| Metric | Target |
|--------|--------|
| WA opt-in rate (from app users) | >40% |
| WA vision % of total diagnoses | >25% |
| Response latency p95 | <15s |
| Active organizations | 5,000 |

---

## Phase 4: AI Media Engine

**Timeline:** Months 18–28  
**Theme:** Content factory with approval-first publishing

### Objectives

- End-to-end content pipeline: research → script → image → video → voice → caption
- Social publishing to Instagram, TikTok, YouTube Shorts, Facebook, LinkedIn
- Founder approval on every post at launch (L0)
- Performance analytics feedback to topic research
- MEDIA + VOICE credits
- White-label media for Business+ customers

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **Media Engine** | Topic research cron; script generation; image/video jobs |
| **Voiceover** | ElevenLabs + OpenAI TTS + Google TTS router |
| **Video** | Runway / Veo / Kling integration; FFmpeg assembly |
| **Social automation** | OAuth connect; publish scheduler; analytics poll |
| **Approval** | Social posts in approval queue; platform mockup preview |
| **Credits** | MEDIA, VOICE types; production budget caps |
| **Email** | Newsletter from Media Engine; approval-gated |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M4.1 | MediaProductionJob pipeline |
| M4.2 | Voiceover service |
| M4.3 | Video composition worker |
| M4.4 | Instagram + TikTok publish adapters |
| M4.5 | Analytics ingestion → topic scoring |
| M4.6 | L1 auto-publish for pre-approved templates |

### Success metrics

| Metric | Target |
|--------|--------|
| Posts published / week (brand) | 7+ |
| Approval turnaround | <24h |
| Social → registration UTM | 10% of new signups |
| Engagement rate vs industry | Top quartile |
| ARR | $15M |

### Graduation to auto-publish

See `/product/approval-workflow.md` trust levels L1–L4.

---

## Phase 5: Marketplace & Sponsor Network

**Timeline:** Months 24–36  
**Theme:** Network effects; intelligence meets commerce

### Objectives

- Full B2B marketplace with traceability from AI-managed fields
- Sponsor network: input suppliers fund farmer credits and featured listings
- Group cooperative listings at scale
- CRM + Marketplace + Brain unified (demand signals feed AI)
- Enterprise credit pools and API marketplace
- Regional expansion: 20+ countries

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **Marketplace** | Listings, offers, orders, escrow, logistics |
| **Sponsor network** | Suppliers buy credit bundles for farmers; branded AI tips |
| **Traceability** | Farm → harvest → listing → export chain |
| **API economy** | Public API; webhook marketplace events |
| **Intelligence** | Market price forecasting; sell/hold recommendations |
| **Automation** | Auto-listing from harvest record; AI-drafted listings (approval) |
| **Global** | Multi-region deploy; 15 languages |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M5.1 | Marketplace payment settlement |
| M5.2 | Sponsor credit injection API |
| M5.3 | Traceability report generator |
| M5.4 | Demand signal → Brain context |
| M5.5 | EU + TR data residency regions |

### Success metrics

| Metric | Target |
|--------|--------|
| Marketplace GMV (annual) | $100M |
| Sponsor-funded credits | 20% of total credits issued |
| Enterprise customers | 200 |
| Countries live | 25 |
| ARR | $50M |

---

## Phase 6: Nertura Proprietary Agriculture AI

**Timeline:** Months 30–48+  
**Theme:** Own the model; reduce provider dependency

### Objectives

- Fine-tuned disease detection replaces vision API for top 20 crops
- Nertura Ag LLM primary for agronomic Q&A in priority regions
- Federated learning from consented global corpus
- Edge deployment for offline field inference
- Autonomous workflow engine (L3 approval) for irrigation, tasks, alerts
- Category-defining Ag intelligence moat

### Deliverables

| Workstream | Deliverables |
|------------|--------------|
| **Models** | Disease CNN v2; yield LSTM; Nertura Ag LLM v1 |
| **Training** | ML pipeline on anonymized KnowledgeNodes; human review gate |
| **Inference** | Model registry; A/B external vs proprietary; gradual rollout |
| **Edge** | Mobile TFLite bundles; offline diagnosis 50+ diseases |
| **Autonomous** | Workflow engine: trigger → plan → approve/auto → execute |
| **Research** | Nertura Index — benchmark for operational efficiency |
| **Compliance** | SOC 2 Type II; ISO 27001; AI Act conformity assessment [EU] |

### Architecture milestones

| Milestone | Description |
|-----------|-------------|
| M6.1 | Training pipeline + dataset versioning |
| M6.2 | Disease model parity with GPT-4o Vision |
| M6.3 | Ag LLM beta (TR, EN, PT, ES) |
| M6.4 | Edge model OTA update |
| M6.5 | Autonomous irrigation workflow L3 |
| M6.6 | Provider spend <30% of AI revenue |

### Success metrics

| Metric | Target |
|--------|--------|
| Proprietary model query share | >60% |
| Disease accuracy (proprietary) | >92% |
| Provider cost / AI revenue | <30% |
| Organizations | 100,000+ |
| Valuation trajectory | Unicorn-scale metrics |

---

## Cross-Phase Dependencies

```
Phase 1 ──► Phase 2 (Brain must store before meter)
Phase 1 ──► Phase 3 (Consent before WhatsApp)
Phase 2 ──► Phase 3 (Credits before WA metering)
Phase 1 ──► Phase 4 (Approval before publish)
Phase 2 ──► Phase 4 (Media credits)
Phase 3 ──► Phase 5 (WA acquisition feeds marketplace)
Phase 1 ──► Phase 6 (Learning corpus before training)
Phase 5 ──► Phase 6 (Marketplace data enriches models)
```

---

## Future: Autonomous AI Workflow Engine

Post-Phase 6 capability — documented for architectural preparedness:

```
Trigger (weather alert, schedule, market signal)
    → Brain plans multi-step workflow
    → Approval gate (L0–L3 based on trust)
    → Execute: tasks, irrigation, CRM, marketplace, WhatsApp
    → Monitor outcomes → Learning System
    → Adjust future workflows
```

| Workflow example | Steps |
|------------------|-------|
| Frost response | Alert → delay irrigation → create scout tasks → WA notify team |
| Harvest sell | Yield prediction → market forecast → draft listing → approve → publish |
| Member engagement | Detect inactive → CRM segment → AI message draft → approve → WA send |

Requires: Brain action executor, approval trust levels, credit pools, audit completeness.

---

## Investment Alignment

| Phase | Suggested raise | Primary spend |
|-------|-----------------|---------------|
| 1 | Pre-seed / bootstrap | Brain, compliance, MVP |
| 2 | Seed ($3M) | Credits, growth, AI team |
| 3 | Seed extension / A | WhatsApp, regional |
| 4 | Series A ($15M) | Media engine, social, marketing |
| 5 | Series B ($50M) | Marketplace, global infra |
| 6 | Series C+ | ML platform, proprietary models |

---

## Risk Register (System)

| Risk | Phase | Mitigation |
|------|-------|------------|
| Provider API cost spike | 2–4 | Credits + multi-provider |
| Meta WA policy change | 3 | Multi-channel; in-app primary |
| AI content brand damage | 4 | L0 approval; guardrails |
| KVKK/GDPR enforcement | 1+ | DPO, DPIA, consent architecture |
| Marketplace cold start | 5 | Sponsor credits; cooperative bulk |
| Model training insufficient data | 6 | Phase 1 storage; consent corpus |
| Competitor copy | All | Data flywheel + network effects |

---

## Document Cross-Reference

| Phase | Primary documents |
|-------|-------------------|
| 1 | `/ai/nertura-ai-brain.md`, `/ai/learning-system.md`, `/product/approval-workflow.md`, `/docs/data-privacy-kvkk-gdpr.md` |
| 2 | `/product/credit-system.md`, `/product/free-to-paid-model.md` |
| 3 | `/automation/whatsapp-integration.md` |
| 4 | `/automation/ai-media-engine.md`, `/automation/social-media-automation.md`, `/automation/email-engine.md` |
| 5 | `/product/core-modules.md` (Marketplace), `/docs/strategic-architecture.md` |
| 6 | `/ai/learning-system.md`, `/ai/ai-system.md` |

---

*Document owner: Chief Systems Architect*  
*Last updated: June 2026*  
*Status: Approved foundation*
