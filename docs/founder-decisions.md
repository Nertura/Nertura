# Nertura — Founder Decisions

> **Single source of truth** for strategic decisions governing Nertura. All product, engineering, growth, and AI work aligns to this document. When in doubt, refer here first.

**Status:** Final · **Authority:** Founder / Board · **Review:** Quarterly  
**Last updated:** June 2026

---

## How to Use This Document

| Audience | Use |
|----------|-----|
| **Leadership** | Strategic alignment, investor narrative, board updates |
| **Product & Engineering** | Scope boundaries, build priorities, trade-off resolution |
| **Growth & Marketing** | Channel focus, messaging, approval rules |
| **New hires** | Company context in first week |

Detailed specifications live in linked docs. **This document states what we decided — not every how.**

---

## 1. Company Identity

### Decision

**Nertura is an AI-powered agriculture intelligence operating system (AgOS)** — not a farm app, not a chatbot, not a marketplace alone.

We unify **operations, intelligence, commerce, and connectivity** for every participant in the food value chain: farmers, cooperatives, agribusiness, suppliers, and exporters.

### Category definition

| We are | We are not |
|--------|------------|
| Agriculture Operating System (AgOS) | Point solution (weather-only, IoT-only) |
| AI-native intelligence layer | Generic ERP with AI bolted on |
| Multi-stakeholder platform | Farmer-only tool |
| Global-ready from architecture day one | US-only row-crop SaaS |

### Mission

**Empower every participant in the global food system to grow smarter, operate efficiently, and trade with confidence.**

### Vision (10-year)

**Become the global intelligence layer for agriculture** — the system of record and decision-making for how food is grown, managed, and moved.

### Brand promise

*Intelligence rooted in the soil. Operations built for scale.*

### North stars (non-negotiable)

1. **Intelligence compounds** — every interaction makes Nertura smarter
2. **Customers own their data** — Nertura is steward, not owner (`/docs/data-ownership-policy.md`)
3. **Human approval before autonomy** — trust is earned, not assumed (`/docs/ai-governance-policy.md`)
4. **Field-first, enterprise-capable** — mobile for the farmer, depth for the boardroom
5. **Self-growing company** — product, content, and AI improve from usage without linear headcount

### What we will not do

- Sell identifiable farmer field data to third parties
- Train global models on customer data without explicit opt-in
- Auto-publish public content at launch without founder approval
- Position as replacement for licensed agronomists — we augment, not replace

---

## 2. Target Customer

### Decision

**Primary launch customer: the mid-size commercial farmer and farm manager** — 20–2,000 hectares, smartphone-first, operating in configurable primary agricultural regions.

**Secondary launch customers (same platform, phased GTM):** cooperatives, commercial agribusiness, input suppliers, exporters.

**Beachhead persona:** Maria Santos — owner-operator, moderate tech comfort, needs *"what to do today"* not more dashboards.

### Customer priority order

| Priority | Segment | Why |
|----------|---------|-----|
| **P0** | Individual farmer / farm manager | Daily AI use; product-market fit proof |
| **P1** | Cooperative | Multiplier; 50–500 members per deal |
| **P2** | Input supplier / exporter | Marketplace + CRM network effects |
| **P3** | Enterprise agribusiness | High ACV; longer sales cycle |

### Geographic strategy

| Phase | Regions | Rationale |
|-------|---------|-----------|
| **Launch** | One primary region (configurable) | Depth before breadth |
| **Year 2** | LATAM, Turkey, Southeast Asia, Eastern Europe | Mobile + WhatsApp; cooperative density |
| **Year 3+** | EU, North America, Middle East | Enterprise, export, compliance revenue |

### Ideal customer profile (launch)

- Manages 1–5 farms, 10+ fields
- Grows 2+ crop types per rotation
- Willing to photograph fields and confirm AI feedback
- Pain: disconnected tools, late disease detection, paperwork burden
- Not ICP at launch: hobby farms <5 ha, pure enterprise RFP-only with 18-month procurement

### Expansion rule

**Cooperatives are the scale wedge in emerging markets; direct farmers are the scale wedge in developed markets.**

---

## 3. First AI Module

### Decision

**The first AI module shipped to users is the AI Farmer experience: conversational assistant + photo disease detection — not yield prediction, not media, not marketplace AI.**

Bundle name for GTM: **"Nertura AI in the field."**

### Launch AI capabilities (MVP)

| Capability | Scope | Agent |
|------------|-------|-------|
| **AI Assistant (Q&A)** | Farm-aware questions in natural language | AI Farmer |
| **Photo disease detection** | 4 crops: corn, soybean, wheat, tomato | AI Farmer + vision API |
| **Weather risk alerts** | Rule + ML frost/heat alerts | Embedded in Weather module |
| **Confirm/correct feedback** | One-tap diagnosis validation | Learning System intake |

### Explicitly not first

| Module | Phase |
|--------|-------|
| Yield prediction | Business tier, Phase 2 |
| Irrigation AI optimization | Professional+, Phase 2 |
| Market price forecasting | Business+, Phase 2 |
| Media Factory / social | Phase 4 |
| WhatsApp AI diagnosis | Phase 3 |
| Autonomous workflows | Phase 6 |

### First-module success definition

- User completes first photo diagnosis within 24 hours of signup
- >25% of AI responses receive feedback within 30 days
- AI Farmer answers reference user's field context (not generic ChatGPT)

### Technical foundation (simultaneous, not user-facing)

100% interaction storage, consent gates, credit architecture ready — even if credits are generous at launch.

---

## 4. Revenue Model

### Decision

**Dual revenue model: SaaS subscriptions for platform access + credit-based metered AI consumption.**

Not credits-only. Not subscription-only. Both compound.

### Subscription tiers (platform)

| Tier | Price (USD/mo) | Target |
|------|----------------|--------|
| **Starter** | $29 | Individual farmer |
| **Professional** | $99 | Commercial farm / manager |
| **Business** | $349 | Cooperative, supplier, mid agribusiness |
| **Enterprise** | From $1,500 | Multi-entity, SSO, custom |

Full limits: `/docs/subscription-model.md`.

### Credit model (intelligence)

| Credit type | Used for |
|-------------|----------|
| **TEXT** | AI questions, reports, scripts |
| **VISION** | Photo diagnosis |
| **MEDIA** | Image/video generation |
| **VOICE** | Voiceover |
| **WA** | WhatsApp AI messages |

Free registered users: **50 TEXT + 5 VISION/month.** Paid tiers receive monthly grants + rollover (1 month).

### Growth funnel

```
Anonymous → Registered free → Credit buyer OR Paid subscriber → Business/Enterprise
```

Details: `/product/free-to-paid-model.md`.

### Phase 5+ revenue line

**Sponsor network** — input suppliers fund farmer credit pools; contextual labeled tips. Never corrupts AI diagnosis.

### Revenue principles

1. **Transparent metering** — show cost before every AI action
2. **PPP pricing** in emerging markets (Tier 2/3 discounts)
3. **No surprise overages** on Starter/Professional — hard limits, upgrade prompts
4. **Marketplace transaction fees** (2–3%) activate with Phase 2 marketplace — not launch

### Year 3 revenue mix target

| Stream | % ARR |
|--------|-------|
| SaaS subscriptions | 65% |
| Credit top-ups | 20% |
| Marketplace fees | 10% |
| Sponsor network | 5% |

---

## 5. Community Strategy

### Decision

**Build Nertura Community as a Phase 5 network (Month 24+)** — after Learning System and Memory reach critical mass. Do not launch social community at MVP.

### Why wait

Community without validated knowledge produces noise. We need **500K+ validated labels** and **25K+ users** before peer content adds net value.

### What we build toward

| Element | Decision |
|---------|----------|
| **Format** | Structured SharedPractice posts + Q&A — not generic forum |
| **Validation** | Expert agronomist badge + outcome-linked upvotes |
| **Privacy** | No farm GPS on public posts; opt-in to global learning |
| **AI integration** | AI Farmer cites validated community practices in answers |
| **Monetization** | Included in Professional+; cooperative private spaces in Business |

### Launch prerequisites (gates)

- 25,000 registered users
- 500,000 validated diagnosis labels in Learning System
- Moderation team + AI pre-screen live
- Community ToS addendum published

### What we will not do

- Launch community to drive vanity MAU before ag quality exists
- Allow anonymous posting
- Let sponsors post undisclosed promotional "practices"

Full spec: `/product/community-network.md`.

---

## 6. WhatsApp Strategy

### Decision

**WhatsApp is the primary field channel for emerging markets — Phase 3 (Month 12–20), not launch.** Web/mobile remains global primary until WhatsApp WABA is live.

### Strategic role

| Role | Detail |
|------|--------|
| **Acquisition** | wa.me links from TikTok/social → register → opt-in |
| **Retention** | Daily AI, photo diagnosis, frost alerts where farmers already are |
| **Cooperative reach** | Bulk utility templates (with approval) |

### Non-negotiables

1. **Double opt-in** before any AI processing on WhatsApp
2. **Credit-metered** — WA + VISION credits per diagnosis session
3. **Same Brain, same memory** as web — not a separate dumb bot
4. **Session AI auto; marketing broadcast manual** at launch

### Regional rollout order

1. Turkey (+90)
2. Brazil (+55)
3. India (+91)
4. LATAM (+52, +57)

### Launch scope (Phase 3 MVP)

- Inbound text Q&A
- Inbound photo diagnosis
- Outbound utility templates: frost, task reminder, harvest alert
- CRM-logged interactions

### Explicit deferrals

- WhatsApp voice notes (Phase 4)
- Marketing broadcast auto (Phase 5+)
- WhatsApp as sole product surface — always paired with app account

Full spec: `/automation/whatsapp-integration.md`.

---

## 7. Media Factory Strategy

### Decision

**Nertura operates an internal AI Media Factory as a self-growing acquisition engine — Phase 4 (Month 18–28). Launch mode: approval-first; founder approves every public post.**

The Media Factory is how Nertura **markets like an AI company** — daily content from our own intelligence, not an agency retainer.

### Production scope

| Line | Channels | Launch phase |
|------|----------|--------------|
| Short video | TikTok, Instagram Reels, YouTube Shorts | 4a |
| Carousel / static | Instagram, Facebook, LinkedIn | 4a |
| Blog (SEO) | nertura.com/blog | 4b |
| Email newsletter | Lifecycle + weekly | 4b |
| WhatsApp templates | Utility + campaign drafts | 4c |

### Pipeline (locked)

**Text → Image → Voice → Video → Package → Approve → Distribute**

Full spec: `/automation/media-factory.md`, `/automation/content-pipeline.md`.

### Model routing for content

| Modality | Providers |
|----------|-----------|
| Text | Claude (scripts), GPT-4o (captions/email) |
| Image | DALL·E 3, Imagen |
| Voice | ElevenLabs brand clone (EN/TR) |
| Video | Runway, Veo, Kling |

### Approval-first (launch)

| Content | Approver |
|---------|----------|
| All social video | Founder / marketing lead |
| Blog | Editor |
| Newsletter | Marketing admin |
| Sponsor content | Founder + compliance |

### Full-auto graduation (future only)

| Never auto | May auto (L1+) after 50 approved posts |
|------------|----------------------------------------|
| Sponsor promos | Daily weather tip reel |
| New topic categories | Pre-approved template series |
| Controversial ag topics | Lifecycle onboarding email |

Kill switch always available. Governance: `/docs/ai-governance-policy.md`.

### Success metric

**15% of new signups attributed to content UTM within 12 months of Factory launch.**

---

## 8. AI Brain Strategy

### Decision

**The Nertura Brain is the company's core intellectual property architecture** — not any single third-party model. External models (GPT, Gemini, Claude) are **replaceable inference suppliers**. Nertura DB is the **permanent system of record**.

### Foundational rules

1. **Store 100% of interactions** — questions, photos, answers, feedback, routing decisions
2. **Provider-agnostic router** — best model per task today; Nertura Model when ready
3. **Six-layer memory** — user → conversation → entity → org → global (consented)
4. **Knowledge graph** — connect field, crop, disease, treatment, harvest, order
5. **Eight specialized agents** — Farmer, Agronomist, Content, Social, CRM, Export, Finance, Support
6. **Credit + consent gate** before every inference
7. **Human confirm** before high-impact platform actions

### Model routing (current)

| Task | Primary |
|------|---------|
| Agronomic Q&A | Claude 3.5 / GPT-4o |
| Regional language | Gemini |
| Vision diagnosis | GPT-4o Vision |
| Fast/support | GPT-4o mini / Gemini Flash |

Router spec: `/ai/brain-architecture.md`.

### Self-growing loop

```
Usage → Stored interactions → Feedback → Memory + Graph → Better RAG
    → Better content topics → More signups → More usage
```

Moat: `/ai/data-moat-strategy.md`.

### Governance

- AI Governance Board meets quarterly
- No production model promotion without eval suite pass
- DPO may veto training scope on privacy grounds

Policies: `/docs/ai-governance-policy.md`, `/docs/data-ownership-policy.md`.

---

## 9. Future Nertura LLM Strategy

### Decision

**Build Nertura Ag LLM as a fine-tuned domain foundation model — not pretrain from scratch until unicorn-scale data and budget justify it.**

**Target: Phase 6 (Month 36–48+)** — Nertura Model handles >60% of agronomic query volume.

### Staged path (locked)

| Stage | Timeline | Milestone |
|-------|----------|-----------|
| **0 — External APIs** | Launch | GPT, Claude, Gemini via Brain router |
| **1 — RAG + memory** | Month 6–12 | GraphRAG beats generic on Nertura eval |
| **2 — Fine-tuned specialists** | Month 12–24 | Disease CNN, ag embedder |
| **3 — Ensemble + edge** | Month 24–36 | Offline diagnosis; provider spend <25% of AI revenue |
| **4 — Nertura Ag LLM** | Month 36–48+ | Fine-tune open foundation on consented corpus |

### Prerequisites for Nertura Ag LLM

| Gate | Threshold |
|------|-----------|
| Consented corpus | >10B agricultural tokens |
| Validated Q&A pairs | >5M |
| Eval suite | Beats GPT-4o by +15% on domain benchmark |
| Board approval | Model card + safety red team |
| Rollout | 5% → 25% → 100% canary |

### Training data rule

**Opt-in only.** Default off for `ai_training_global`. Customer operational data never trains global models without explicit consent.

Full spec: `/ai/training-roadmap.md`.

### End state

Nertura Ag LLM primary; external models fallback for novel crops, long-tail languages, and failover. **Provider spend <30% of AI revenue** at steady state.

---

## 10. Five-Year Vision

### Decision

**By 2031, Nertura is the default agriculture intelligence OS in 25+ countries** — category leader, not feature vendor — with proprietary AI, network effects across the value chain, and the industry's largest validated agricultural knowledge corpus.

### Year-by-year arc

| Year | Theme | Key outcomes | ARR target |
|------|-------|--------------|------------|
| **Y1** | Prove field AI + ops | 2,000 paid orgs; AI Farmer PMF; 100% interaction storage; KVKK/GDPR live | ~$500K |
| **Y2** | Monetize intelligence | Credit system; marketplace live; 15K orgs; WhatsApp TR/BR | ~$10M |
| **Y3** | Growth machine | Media Factory; social distribution; 50K orgs; sponsor pilot | ~$30M |
| **Y4** | Network platform | Community launch; sponsor network; proprietary CNN in production; 100K orgs | ~$75M |
| **Y5** | Category leader | Nertura Ag LLM beta; 25+ countries; Nertura Index benchmarks; IPO-ready metrics | ~$150M+ |

### Five-year metrics (north star)

| Metric | Y5 target |
|--------|-----------|
| Active organizations | 100,000+ |
| Stored AI interactions | 5B+ |
| Validated diagnosis labels | 100M+ |
| Proprietary model query share | >60% |
| Marketplace GMV (annual) | $500M+ |
| Net revenue retention | >125% |
| Countries with live product | 25+ |
| Employees | ~120 (AI-leveraged, not headcount-linear) |

### Strategic endgame

1. **Intelligence layer** — default system for farm decisions, not just record-keeping
2. **Data moat** — validated, graph-connected corpus no competitor can replicate quickly
3. **Network** — farmers, co-ops, suppliers, exporters on one graph
4. **Brand** — Nertura content engine drives category awareness globally
5. **Proprietary AI** — Nertura Model beats generic LLMs on agriculture benchmarks
6. **Optional outcomes** — IPO or strategic acquisition at unicorn valuation; both require Y3–Y4 metrics discipline

### Five-year constraints (still true)

- Customers own their data
- AI remains advisory with human accountability
- Sponsor and growth AI never corrupt operational diagnosis
- Approval-first culture scales to selective auto — not reverse

---

## Decision Log & Phase Map

Single reference for **when** major bets activate:

| Phase | Months | Theme | Founder decision activated |
|-------|--------|-------|----------------------------|
| **1** | 1–8 | Store + approve | Brain, AI Farmer, approval-first, compliance |
| **2** | 7–14 | Credits + commerce | Dual revenue, marketplace |
| **3** | 12–20 | WhatsApp | Emerging market channel |
| **4** | 18–28 | Media Factory | Self-growing acquisition |
| **5** | 24–36 | Network | Community + sponsors + marketplace scale |
| **6** | 30–48+ | Nertura Model | Proprietary LLM, autonomous workflows |

System roadmap: `/docs/system-roadmap.md` · Product roadmap: `/docs/roadmap.md`.

---

## Document Hierarchy

When documents conflict, resolve in this order:

1. **`docs/founder-decisions.md`** (this document) — wins
2. **`docs/ai-governance-policy.md`** / **`docs/data-ownership-policy.md`** — policy
3. **`docs/strategic-architecture.md`** — architecture
4. Domain specs (`/ai/*`, `/product/*`, `/automation/*`, `/docs/*`)

---

## Approval

| Role | Name | Date |
|------|------|------|
| Founder / CEO | — | June 2026 |
| Board ratification | — | Pending |

---

*This is the single source of truth for Nertura. Build accordingly.*
