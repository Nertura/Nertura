# Nertura Brain Architecture

> Complete specification of the Nertura Brain — the governed intelligence operating system at the center of AgOS. Executive clarity for leadership; technical depth for engineering and AI teams.

**Authority:** Canonical brain reference · defers to [`founder-decisions.md`](founder-decisions.md) on strategic trade-offs  
**Status:** Final foundation · **Last updated:** June 2026

---

## Executive Summary

The **Nertura Brain** is not ChatGPT with a farm skin. It is a **multi-layer intelligence operating system** that:

- Routes inference to the best model (GPT, Gemini, Claude, then **Nertura Foundation Model**)
- Remembers every user, field, season, and conversation across channels
- Connects all agricultural data in a **Knowledge Graph**
- Improves through **validated learning loops** — not unsafe autonomous self-training
- Powers specialized **agents** for fields, WhatsApp, content, and commerce
- Stores **100% of interactions** in Nertura's database — providers are replaceable suppliers, not the system of record

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NERTURA BRAIN                                    │
│                                                                          │
│   Every question · Every photo · Every answer · Every correction       │
│   → Stored → Remembered → Connected → Validated → Smarter tomorrow       │
│                                                                          │
│   WITHOUT: silent self-training · unapproved publishes · data sale       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Founder lock:** Customer data trains global models **only with explicit opt-in**. Operational AI uses customer data to serve that customer regardless — with consent for processing under Terms.

---

## System Overview

```
                         CHANNELS
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Web/Mobile│ WhatsApp │  Email   │  Social  │ Internal │
    └─────┬────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
          │           │          │          │          │
          └───────────┴──────────┴────┬─────┴──────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. CENTRAL AI BRAIN (Gateway → Govern → Orchestrate → Route → Act)      │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. AGENT ARCHITECTURE (Farmer · Agronomist · WhatsApp · Content · etc.) │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. MEMORY SYSTEM (6 layers: working → user → entity → org → global)     │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. KNOWLEDGE GRAPH (fields · crops · diseases · orders · knowledge)     │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. LEARNING SYSTEM (feedback → validate → index → RAG → train [gated])  │
├─────────────────────────────────────────────────────────────────────────┤
│ 6. USER FEEDBACK LOOPS (confirm · correct · outcome · expert)           │
├─────────────────────────────────────────────────────────────────────────┤
│ INFERENCE PLANE: GPT · Gemini · Claude · Nertura CNN · Nertura LLM      │
├─────────────────────────────────────────────────────────────────────────┤
│ PERSISTENCE: PostgreSQL · Object Storage · Vector DB · Event Log        │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
              Operations · Growth · Commerce · Compliance modules
```

---

## 1. Central AI Brain

### What it is

The Central AI Brain is the **single entry point for all intelligence** on Nertura. No module, channel, or agent calls OpenAI, Anthropic, or Google directly. Everything flows through the Brain.

### Core responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Ingest** | Normalize requests from any channel into canonical `BrainRequest` |
| **Govern** | Enforce credits, consent, policy, and approval before side effects |
| **Orchestrate** | Select agent(s), plan multi-step workflows |
| **Contextualize** | Assemble memory, graph, and RAG chunks |
| **Route** | Choose model tier and provider |
| **Infer** | Execute sync or async inference with failover |
| **Persist** | Write interaction, routing decision, and assets before responding |
| **Learn** | Emit events to Learning System (never blocking user response) |
| **Act** | Propose or execute platform actions through Action Executor |

### Seven-layer stack

| Layer | Name | Technical function |
|-------|------|-------------------|
| **L0** | Gateway | Auth, RBAC, rate limits, channel adapters |
| **L1** | Governance | Credit Gate, Consent Gate, Policy Engine, Approval Gate |
| **L2** | Orchestration | Agent Router, Workflow Orchestrator, session state |
| **L3** | Context | Memory retrieval, Graph expansion, RAG assembly |
| **L4** | Inference | Model Router → provider APIs or Nertura models |
| **L5** | Persistence | Interaction Store, audit log, media lineage |
| **L6** | Learning | Event bus → Learning System (async, validated) |

**Invariant:** L1 and L5 are mandatory on every path. External models stop at L4; they never skip storage or governance.

### Request lifecycle (technical)

```
1. BrainRequest arrives (channel, user, org, payload, context hints)
2. Authenticate + authorize (RBAC + farm scope)
3. Credit Gate: estimate → reserve
4. Consent Gate: verify purpose (operational / vision / training flags)
5. Agent Router: select agent persona + permissions envelope
6. Context Assembly:
      a. Working memory (session)
      b. User + conversation memory (vector search)
      c. Entity memory (active field, crop plan, disease history)
      d. Org memory (policies, co-op rules)
      e. Knowledge Graph subgraph (GraphRAG expand)
      f. Global corpus (if consented + query warrants)
7. Prompt construction: system + agent overlay + context + user input
8. Model Router: select provider/model; log decision
9. Inference (stream if applicable)
10. Post-process: parse structured output, attach citations, safety filter
11. Persist Interaction + ModelRoutingDecision + assets (BEFORE response)
12. Credit Gate: settle or refund
13. BrainResponse to channel adapter
14. Async: Learning event emission; approval queue if publish-bound
15. User feedback later → Feedback Loop → Learning System
```

### Interaction record (minimum schema)

Every inference writes:

| Field | Purpose |
|-------|---------|
| `interaction_id` | UUID lineage |
| `organization_id`, `user_id` | Tenant scope |
| `channel` | web, mobile, whatsapp, email, internal |
| `agent_id` | Which agent persona |
| `input_type` | text, photo, audio, document |
| `context_snapshot` | JSON: farms, fields, weather at inference time |
| `provider`, `model`, `model_version` | Routing audit |
| `prompt_hash`, `response_text`, `response_structured` | Full trace |
| `rag_chunk_ids`, `graph_path_ids` | Explainability |
| `confidence` | Model or calibrated score |
| `credits_consumed` | Commercial audit |
| `consent_snapshot` | Regulatory proof |
| `feedback` | null until user responds |

**Rule:** Provider API response is a cache miss if Nertura DB write fails. Never return success without persistence.

### Model routing (Central Brain)

| Task | Primary | Fallback | Future primary |
|------|---------|----------|----------------|
| Agronomic Q&A (EN) | Claude 3.5 Sonnet | GPT-4o | Nertura Foundation Model |
| Agronomic Q&A (TR/regional) | Gemini 1.5 Pro | GPT-4o | Nertura Foundation Model |
| Structured actions / JSON | GPT-4o | Gemini Pro | Nertura Foundation Model |
| Photo disease | GPT-4o Vision | Gemini Vision | Nertura Disease CNN |
| Fast / support / routing | GPT-4o mini | Gemini Flash | Nertura Router |
| Embeddings | text-embedding-3-large | Voyage | Nertura Embedder |
| Content long-form | Claude 3.5 | GPT-4o | Nertura Foundation Model |

Routing inputs: `task_type`, `language`, `latency_sla`, `cost_budget`, `data_residency`, `provider_health`, `eval_score_history`.

Failover: primary timeout → secondary → queue → refund. All logged.

---

## 2. Agent Architecture

### Design principle

Agents are **specialized personas**, not separate products. They share one Brain, one memory, one graph, one governance layer. The Agent Router selects persona based on intent, user role, and org type.

### Agent Router

| Signal | Weight |
|--------|--------|
| Explicit user intent ("export this shipment") | Highest |
| User role (farmer, exporter, admin) | High |
| Organization type (farm, cooperative, supplier) | High |
| Active UI module / screen | Medium |
| System trigger (frost alert, cron) | Medium |

### Agent catalog

| Agent | Code | Domain | Phase |
|-------|------|--------|-------|
| AI Farmer | `agent.farmer` | Daily field ops, diagnosis | 1 |
| AI Agronomist | `agent.agronomist` | Technical crop science | 1 |
| AI Support | `agent.support` | Platform help, escalation | 1 |
| AI Finance | `agent.finance` | Costs, credits, ROI (not securities) | 2 |
| **WhatsApp Agent** | `agent.whatsapp` | Channel-optimized field companion | 3 |
| AI CRM Manager | `agent.crm` | Relationships, follow-ups | 3 |
| **Content Agent** | `agent.content` | Editorial + social execution | 4 |
| AI Social Manager | `agent.social` | Platform-native packaging | 4 |
| **Commerce Agent** | `agent.commerce` | Marketplace, export, deals | 5 |
| AI Export Manager | `agent.export` | Trade ops, traceability | 5 |

### Multi-agent orchestration

The Workflow Orchestrator decomposes complex jobs:

```
Event: Frost alert (critical)
  → AI Farmer: field impact summary, recommended actions
  → AI Agronomist: validate stress-related disease risk [if flagged]
  → WhatsApp Agent: draft utility message [approval if broadcast]
  → AI CRM Manager: cooperative member segment notification [co-op only]
  → AI Support: monitor confusion signals in replies
```

Session state passes between agents via shared `conversation_id` and working memory.

### Permission envelope

Each agent carries a hard allowlist. Examples:

| Action | Farmer | Agronomist | WhatsApp | Content | Commerce |
|--------|--------|------------|----------|---------|----------|
| Diagnose photo | ✓ | ✓ | ✓ | ✗ | ✗ |
| Publish social | ✗ | ✗ | ✗ | draft only | ✗ |
| Create CRM deal draft | ✗ | ✗ | ✗ | ✗ | ✓ |
| Send WA template | ✗ | ✗ | draft | ✗ | ✗ |
| Marketplace listing draft | ✗ | ✗ | ✗ | ✗ | ✓ |

Full matrix: [`/ai/agents.md`](../ai/agents.md).

---

## 3. Memory System

### Purpose

LLMs are stateless. Nertura Memory is **persistent intelligence** that compounds per user, field, and organization.

### Six layers

| Layer | Scope | TTL | Example |
|-------|-------|-----|---------|
| **L1 Working** | Current session | Session | Active field, in-progress form |
| **L2 User** | Individual | Long-lived | Language TR, prefers brief replies, corrections |
| **L3 Conversation** | Threads | Summarized | "Last week we rescheduled Field 2 spray" |
| **L4 Entity** | Field, crop, disease | Season + history | Field 7 rust recurrence 2024–2025 |
| **L5 Organization** | Co-op / company | Policy-driven | "Organic: no synthetic N" |
| **L6 Global** | Anonymized corpus | Permanent | "Corn rust TR-Central Jun 91% confirm" |

### Retrieval order

Search **bottom-up**: user preferences → entity context → org policies → global patterns. Token budget truncates lowest-value chunks first.

### Memory write triggers

| Event | Layer updated |
|-------|---------------|
| User states preference | L2 User |
| Diagnosis confirmed | L4 Disease + Learning queue |
| Season harvested | L4 Crop history rollup |
| Co-op admin sets rule | L5 Org |
| 3+ orgs validate pattern + consent | L6 candidate queue |

Users view and delete memories in Settings → AI Memory. Deletion de-indexes RAG within minutes.

Detail: [`/ai/memory-system.md`](../ai/memory-system.md).

---

## 4. Knowledge Graph

### Purpose

The graph stores **relationships**, not just records. It enables GraphRAG: vector find seed nodes → traverse edges → rerank by path relevance.

### Layer composition

| Layer | Contents |
|-------|----------|
| **A — Operational** | Farm, Field, CropPlan, Harvest, Order (sync from PostgreSQL) |
| **B — Intelligence** | AIInteraction, Diagnosis, Prediction, Photo |
| **C — Memory** | MemoryNode with REMEMBERS edges |
| **D — Community** | SharedPractice, ExpertProfile [Phase 5] |
| **E — Global** | Anonymized KnowledgeNode (no PII edges) |

### Critical edge types

```
Organization ──OWNS──> Farm ──CONTAINS──> Field
Field ──PLanted_ON──> CropPlan ──INSTANCE_OF──> CropCatalog
Observation ──CAPTURED_IN──> Photo ──PRODUCED──> Diagnosis
User ──CONFIRMED──> Diagnosis ──TREATED_WITH──> InputApplication
Order ──TRACES_TO──> HarvestRecord ──HARVESTED_FROM──> CropPlan
AIInteraction ──ABOUT──> Field
KnowledgeNode ──DERIVED_FROM──> AIInteraction [with consent]
```

### Example traversal (executive)

*"Why did Nertura recommend fungicide on Field 7?"*

```
Field(7) → Diagnosis(rust, Jun 2026, 87%) ← User CONFIRMED
         → Similar Photo(2025) → Treatment(azole) → Harvest(4.2 t/ha)
         → WeatherAlert(humidity) 
         → KnowledgeNode(global): "Rust risk high week 8 wet spring"
```

Citations in user-facing answers reference graph path IDs.

Detail: [`/ai/knowledge-graph.md`](../ai/knowledge-graph.md).

---

## 5. Learning System

### Purpose

Convert usage into **durable intelligence** through governed pipelines — **not** by letting models train themselves on live traffic.

### Safe improvement philosophy

| We do | We do not |
|-------|-----------|
| Store every interaction for retrieval | Auto-train weights on raw logs |
| Improve RAG from validated feedback | Promote user corrections without validation |
| Fine-tune on curated, consented datasets | Scraped web data mixed with private fields |
| Benchmark before model promotion | Ship model because "loss went down" |
| Anonymize before global layer | Put farm names in global corpus |
| Human + expert gates on training exports | Overnight unsupervised retraining |

### Learning pipeline stages

```
Stage 1 — CAPTURE (automatic)
    Every interaction stored; feedback nullable

Stage 2 — FEEDBACK (user-driven)
    Confirm · reject · correct · outcome link

Stage 3 — VALIDATION (gated)
    Trust score · expert review · outcome confirmation · dedupe

Stage 4 — INDEX (automatic after validation)
    KnowledgeNode · Memory update · Graph edge · embedding refresh

Stage 5 — RETRIEVAL IMPROVEMENT (immediate value)
    Better RAG for this user/org/global — no retraining required

Stage 6 — TRAINING EXPORT (consent + board gated)
    Curated datasets → fine-tune specialists → Nertura Foundation Model

Stage 7 — PROMOTION (eval gated)
    Canary rollout only after beating incumbent on eval suite
```

**Stages 1–5 run continuously. Stage 6–7 are quarterly, human-approved events.**

### Knowledge promotion rules (L6 Global)

A fact enters global corpus only when:

| Gate | Threshold |
|------|-----------|
| Consent | `ai_training_global` = true |
| Validation | Expert validated OR ≥3 independent user confirmations |
| Confidence | ≥0.85 aggregate |
| Privacy | PII scan pass + anonymization |
| Conflict | No contradictory validated node |
| Audit | 1% human sample approval |

### Event types

| Event | Triggers |
|-------|----------|
| `interaction.created` | Every inference |
| `feedback.positive` | Thumbs up, CONFIRM on diagnosis |
| `feedback.correction` | User supplies correct label |
| `outcome.observed` | Harvest vs yield prediction |
| `expert.validated` | Agronomist sign-off |

Detail: [`/ai/learning-system.md`](../ai/learning-system.md).

---

## 6. User Feedback Loops

### Why feedback is the moat

Generic AI forgets. Nertura **learns from corrections** — but only validated corrections change what others see (with consent).

### Feedback surfaces

| Surface | Actions | Channel |
|---------|---------|---------|
| AI response | 👍 👎 | Web, mobile |
| Diagnosis result | Confirm · Wrong · Describe | Web, mobile, WhatsApp |
| Task outcome | Completed · skipped · yield logged | Operations modules |
| Expert review queue | Validate · reject | Internal agronomist |
| Content performance | Engagement → topic reprioritization | Growth analytics |

### Diagnosis feedback flow

```
User uploads photo
    → Brain + vision model → Diagnosis proposal (87% rust)
    → User taps CONFIRM
        → feedback.positive
        → L4 Disease memory updated
        → Graph: User ──CONFIRMED──> Diagnosis
        → If consent_training: queue anonymization for L6
    → User taps WRONG → describes "gray leaf spot"
        → feedback.correction
        → Downrank original retrieval
        → Create KnowledgeNode(org layer) with correction
        → Trust score update on user
```

### WhatsApp feedback

| User message | Interpreted as |
|--------------|----------------|
| 👍 or "YES" | feedback.positive |
| "NO" or "WRONG: …" | feedback.correction |
| No reply in 48h | Optional follow-up template (approved) |

### Trust-weighted feedback

Internal trust score weights corrections (never shown to user):

| Factor | Effect |
|--------|--------|
| High confirmation history | +weight |
| Random contradictory corrections | −weight, flag for review |
| Expert role | 3× multiplier |
| New account spam pattern | Ignored for global promotion |

### Outcome linking

| Prediction | Outcome source | Learning use |
|------------|----------------|--------------|
| Yield forecast | HarvestRecord | Calibration metrics |
| Disease alert | Scout confirmation | Precision/recall |
| Irrigation recommendation | Water used + yield | ROI validation |
| Market price forecast | Actual sale price | Forecast accuracy |

Outcomes never auto-train models — they feed **validation queues** and **eval suites**.

---

## 7. WhatsApp Agent

### Role

The **WhatsApp Agent** (`agent.whatsapp`) is the **field-native persona** of AI Farmer — optimized for short messages, photo diagnosis, and utility alerts on WhatsApp Business API. Same Brain, same memory, different adapter constraints.

### Architecture placement

```
Farmer WhatsApp message
    → Meta Cloud API webhook
    → Channel Adapter (normalize)
    → Brain L0 Gateway
    → Consent check (whatsapp_ai + opt-in)
    → Credit Gate (WA + VISION if photo)
    → Agent Router → agent.whatsapp
    → Context: linked user, farms, last conversation summary
    → Model: Gemini Flash (short TR/PT) or GPT-4o mini
    → Response ≤1024 chars + optional deep link to app
    → Persist Interaction (channel=whatsapp)
    → Learning event async
```

### Capabilities

| Capability | Launch | Future |
|------------|--------|--------|
| Text Q&A | ✓ | ✓ |
| Photo diagnosis | ✓ | ✓ + offline CNN hint |
| Task create (confirm) | ✓ | ✓ |
| Frost / task utility templates | Approved templates | L2 auto-send |
| Marketing broadcast | Admin approve each | Never fully auto |
| Voice note | ✗ | Phase 4 |

### Constraints

| Constraint | Rule |
|------------|------|
| Opt-in | Double opt-in before AI |
| Session window | 24h Meta rule; templates outside |
| Credits | WA + VISION metered |
| Memory | Same conversation_id as app when phone linked |
| Diagnosis isolation | Sponsor content never in inference path |

### Example exchange

```
Farmer: [photo of corn leaf]
Agent: Analyzing… 🌿
       Possible: Northern Leaf Blight (85%)
       Field linked: Field 7 · Corn 2026
       Recommend scout within 48h; consider azole if confirmed.
       Reply CONFIRM or tell me what you see.
       (2 Vision + 1 WA credits · 38 Vision remaining)
```

Detail: [`/automation/whatsapp-integration.md`](../automation/whatsapp-integration.md).

---

## 8. Content Agent

### Role

The **Content Agent** combines **AI Content Director** (strategy, scripts, editorial) and **AI Social Media Manager** (platform packaging) under one growth persona orchestrated by the Brain — feeding the Media Factory and Distribution Engine.

### Sub-responsibilities

| Function | Owner | Output |
|----------|-------|--------|
| Topic intake | Content Agent | Ranked ContentOpportunity list |
| Script / blog / email draft | Content Agent | Text assets |
| Platform variants | Social sub-persona | TikTok, IG, YT, blog, email bundles |
| Brand / agronomic QA | Content Agent → Agronomist flag | Pass/fail |
| Approval submission | Content Agent | ApprovalRequest (mandatory launch) |

### Pipeline integration

```
Learning System trends + social analytics
    → Content Agent plans calendar
    → Brain routes text to Claude (scripts), GPT (captions)
    → Media Factory: image, voice, video
    → Content Agent packages ContentBundle
    → QA gates → Pending Approval
    → [Human approves]
    → Social Distribution Engine publishes
    → Analytics → Learning System (content.outcome events)
```

### Channel outputs

| Channel | Content Agent delivers |
|---------|------------------------|
| **TikTok** | 9:16 video + caption + hashtags |
| **Instagram** | Reels, carousel copy, hashtags |
| **YouTube Shorts** | Title, description, tags, thumbnail brief |
| **Blog** | Markdown, SEO meta, hero image brief |
| **Email** | Subject variants, HTML body |
| **WhatsApp** | Template parameter draft (not send) |

### Governance

| Rule | Enforcement |
|------|-------------|
| Launch | Founder/marketing approves every public post |
| Sponsor content | Labeled; never auto |
| Agronomic claims | AI Agronomist scan; block high-risk |
| AI disclosure | Platform-appropriate tag |

Full-auto graduation: L1 template categories only after trust level earned — [`/docs/ai-governance-policy.md`](ai-governance-policy.md).

Detail: [`/automation/media-factory.md`](../automation/media-factory.md), [`/automation/content-pipeline.md`](../automation/content-pipeline.md).

---

## 9. Commerce Agent

### Role

The **Commerce Agent** (`agent.commerce`) unifies **CRM, Marketplace, and Export** intelligence — sourcing, deals, traceability, and supplier health — for cooperatives, suppliers, and exporters.

### Sub-domains

| Sub-domain | Agent behavior | Primary users |
|------------|----------------|---------------|
| **CRM** | Account health, follow-up drafts, pipeline hygiene | Supplier, co-op |
| **Marketplace** | Listing drafts, offer analysis, buyer matching | Farmer, co-op, exporter |
| **Export** | Traceability chains, compliance deadlines, doc packs | Exporter |
| **Sponsor** | Labeled tip surfacing (never alters diagnosis) | Farmer (recipient) |

### Graph-powered commerce queries

```
Exporter: "Which suppliers can fulfill 500t corn EU grade in July?"
    → Commerce Agent
    → Graph: MarketplaceListing + HarvestRecord timing + CRMAccount health
    → Memory: past order quality
    → Response with ranked suppliers + traceability preview links
    → Action proposal: "Draft message to Valle Verde?" [confirm]
```

### Permissions

| Action | Allowed | Approval |
|--------|---------|----------|
| Read marketplace + CRM | ✓ | RBAC |
| Draft listing / offer / message | ✓ | User confirm |
| Send message / create order | ✗ direct | User or admin confirm |
| Modify prices | ✗ | Suggest only |
| Legal export sign-off | ✗ | Human only |

### Commerce learning loop

| Event | Learning value |
|-------|----------------|
| Order completed | Traceability path validated |
| Deal won/lost | Pipeline calibration |
| Listing → offer → close | Conversion patterns (aggregate) |
| Export doc rejection | Compliance gap indexing |

Commerce data stays **org-scoped** unless anonymized aggregate for global trends.

Detail: [`/product/core-modules.md`](../product/core-modules.md) (Marketplace, CRM), [`/product/sponsor-network.md`](../product/sponsor-network.md).

---

## 10. Future Nertura Foundation Model

### Strategic intent

**Nertura Foundation Model** (Nertura Ag LLM + Nertura Disease CNN + Nertura Embedder) replaces external APIs as **primary inference** for high-volume domain tasks — reducing cost, latency, and provider dependency while increasing accuracy on agriculture-specific work.

**Founder decision:** Fine-tune open foundation weights on consented corpus — **do not pretrain from scratch** until unicorn-scale data and budget justify it.

### Model portfolio (target state)

| Model | Role | Replaces |
|-------|------|----------|
| **Nertura Ag LLM** | Agronomic Q&A, scripts, actions, WhatsApp replies | Claude/GPT primary |
| **Nertura Disease CNN** | Photo diagnosis top 20+ crops | GPT-4o Vision |
| **Nertura Embedder** | RAG retrieval | OpenAI embeddings |
| **Nertura Router** | Intent + agent selection | GPT-4o mini classifier |
| **Nertura TTS** [optional] | Brand voice | ElevenLabs partial |

### Evolution timeline

| Phase | Months | Milestone |
|-------|--------|-----------|
| **0** | 0–6 | External only; 100% storage |
| **1** | 6–12 | RAG + memory beat generic on eval |
| **2** | 12–24 | CNN + embedder in production |
| **3** | 24–36 | Ensemble routing; edge offline CNN |
| **4** | 36–48+ | Ag LLM primary; >60% query share |

### Promotion gates (non-negotiable)

| Gate | Requirement |
|------|-------------|
| Data | ≥10B consented tokens; ≥5M validated Q&A pairs |
| Eval | Beat incumbent +15% on Nertura domain suite |
| Safety | Red team pass; regression on previous benchmarks |
| Governance | AI Governance Board approval; model card published |
| Rollout | 5% → 25% → 100% canary with automatic rollback |
| Privacy | DPO sign-off on training set |

### Training data sources (consented only)

| Source | Use |
|--------|-----|
| Validated Q&A interactions | SFT |
| Confirmed diagnoses + corrections | CNN labels |
| Expert-validated KnowledgeNodes | High-weight SFT |
| Curated extension corpora | Continued pretrain mix |
| **Excluded** | Rejected feedback, non-consented users, PII-bearing fields |

### Runtime architecture (future)

```
BrainRequest
    → Model Router
        IF crop in CNN catalog AND confidence path CNN-first:
            Nertura CNN → if low confidence → vision API fallback
        IF text agronomic:
            Nertura Ag LLM → if low confidence OR novel crop → Claude/GPT fallback
    → Same persistence, governance, learning either path
```

External models remain **permanent fallback** for long-tail languages, novel crops, and failover.

Detail: [`/ai/training-roadmap.md`](../ai/training-roadmap.md), [`/docs/founder-decisions.md`](founder-decisions.md) §9.

---

## How Nertura Gets Smarter Safely

### The compound loop (approved)

```
More users
    → More interactions stored (always)
    → More feedback (validated)
    → Better memory + graph + RAG (immediate, per-user and org)
    → Better content topics + product UX
    → More users

Parallel track (gated):
    Validated + consented corpus
        → Quarterly training export
        → Eval suite
        → Board-approved model promotion
        → Better foundation models
        → Cheaper, faster, more accurate inference
```

### What "unsafe self-training" means — and how we avoid it

| Unsafe pattern | Nertura safeguard |
|----------------|-----------------|
| Train on all logs nightly | Training is quarterly, curated, consented |
| User correction instantly changes global model | Corrections → org RAG first; global needs validation |
| Model publishes social posts autonomously at launch | Approval-first; L1+ auto only per domain |
| Feedback spam poisons corpus | Trust scores; rate limits; expert audit |
| PII in global embeddings | Anonymization pipeline; DPO review |
| Provider retrains on our prompts | Zero-retention API contracts |
| Diagnosis influenced by sponsor | Sponsor layer strictly post-inference UI |
| Model self-modifies prompts | Prompt registry versioned; human review on change |
| No rollback | Model registry; canary; one-click revert |

### Three speeds of intelligence

| Speed | Mechanism | Latency to improve |
|-------|-----------|-------------------|
| **Instant** | RAG retrieves new validated node | Minutes |
| **Fast** | Memory + graph update after feedback | Seconds–minutes |
| **Slow** | Fine-tune / foundation model promotion | Months (gated) |

**Most user-visible improvement comes from Speed 1–2 — no weight updates required.**

---

## Governance & Ownership

| Topic | Document |
|-------|----------|
| Strategic decisions | [`founder-decisions.md`](founder-decisions.md) |
| AI policy, auto modes | [`ai-governance-policy.md`](ai-governance-policy.md) |
| Data ownership | [`data-ownership-policy.md`](data-ownership-policy.md) |
| KVKK/GDPR | [`data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md) |
| Credits | [`/product/credit-system.md`](../product/credit-system.md) |

---

## Document Map (Deep Dives)

| Topic | Location |
|-------|----------|
| Interaction storage detail | [`/ai/nertura-ai-brain.md`](../ai/nertura-ai-brain.md) |
| Brain layers + routing | [`/ai/brain-architecture.md`](../ai/brain-architecture.md) |
| All agents | [`/ai/agents.md`](../ai/agents.md) |
| Memory | [`/ai/memory-system.md`](../ai/memory-system.md) |
| Graph | [`/ai/knowledge-graph.md`](../ai/knowledge-graph.md) |
| Learning | [`/ai/learning-system.md`](../ai/learning-system.md) |
| Data moat | [`/ai/data-moat-strategy.md`](../ai/data-moat-strategy.md) |
| Module AI (yield, irrigation) | [`/ai/ai-system.md`](../ai/ai-system.md) |
| System phases | [`system-roadmap.md`](system-roadmap.md) |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Interaction storage rate | 100% |
| Feedback rate on AI responses | >25% |
| Diagnosis confirmation rate | >70% |
| RAG precision@5 | >0.85 |
| Global node promotion with full gates | 100% compliance |
| Model promotion without eval pass | 0 |
| Provider cost / AI revenue (steady state) | <30% |
| Nertura Foundation Model query share (Phase 4) | >60% |
| P1 AI safety incidents from self-learning | 0 |

---

## Summary

The Nertura Brain is a **governed, multi-layer intelligence OS** — not a model wrapper. It **remembers**, **connects**, **learns from validated feedback**, and **graduates** to proprietary models only through human and eval gates. Agents for **field, WhatsApp, content, and commerce** share one memory and one graph. The platform becomes smarter every day because **every interaction is stored and validated learning is designed in** — not because models train themselves unsupervised on live traffic.

---

*Document owner: Chief Growth & Intelligence Architect*  
*This document is the canonical Brain architecture reference for Nertura.*
