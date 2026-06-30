# Nertura — Brain Architecture

> Unified intelligence architecture for a self-growing AI company — model routing, agent orchestration, memory, learning, and the path from external APIs to the Nertura Model.

---

## Executive Summary

The **Nertura Brain** is not a single model. It is a **governed intelligence operating system** that:

1. Routes work to the best available model (GPT, Gemini, Claude, or future Nertura Model)
2. Persists every interaction as proprietary company data
3. Powers specialized agents across farm ops, growth, and automation
4. Feeds a learning loop that makes Nertura smarter every day
5. Operates in **approval-first mode** at launch and **graduates to full-auto** by domain

```
External world (farmers, buyers, social audiences)
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                     NERTURA BRAIN CORE                         │
│  Ingest → Govern → Route → Infer → Store → Learn → Act        │
└───────────────────────────────────────────────────────────────┘
        │
        ├── Operational intelligence (fields, crops, diagnosis)
        ├── Growth intelligence (content, social, email, blog)
        └── Channel intelligence (WhatsApp, notifications, CRM)
        │
        ▼
Self-growing company: more usage → more data → better models → more value
```

**Companion docs:** `/ai/nertura-ai-brain.md` (interaction storage), `/ai/agents.md`, `/ai/memory-system.md`, `/ai/knowledge-graph.md`, `/ai/learning-system.md`, `/docs/ai-governance-policy.md`.

---

## Brain Layers

| Layer | Function | Components |
|-------|----------|------------|
| **L0 — Gateway** | Auth, rate limits, channel normalization | Web, mobile, WhatsApp, email, internal cron |
| **L1 — Governance** | Credits, consent, policy, approval gates | Credit Gate, Consent Gate, Policy Engine |
| **L2 — Orchestration** | Agent selection, multi-step plans | Agent Router, Workflow Orchestrator |
| **L3 — Context** | Memory, graph, RAG assembly | Memory System, Knowledge Graph, RAG Engine |
| **L4 — Inference** | Model routing and execution | Model Router (GPT / Gemini / Claude / Nertura) |
| **L5 — Persistence** | Company data asset | Interaction Store, Media Assets, Audit Log |
| **L6 — Learning** | Self-improvement | Learning System, eval suite, training pipeline |

No layer may be skipped. External models never write directly to users or public channels without passing L1 and (at launch) approval.

---

## Model Router

### Design principle

**Best model for the task today; Nertura Model for the task tomorrow** — with automatic failover, cost awareness, and benchmark-driven promotion.

### Model tiers

| Tier | Models | Role |
|------|--------|------|
| **T1 — External reasoning** | Claude 3.5 Sonnet / Opus, GPT-4o, Gemini 1.5 Pro | Complex agronomy, scripts, multi-step plans |
| **T2 — External fast** | GPT-4o mini, Gemini Flash, Claude Haiku | Support, routing, short replies |
| **T3 — External vision** | GPT-4o Vision, Gemini Pro Vision | Photo diagnosis, visual QA |
| **T4 — External media** | DALL·E 3, Imagen, Runway, Veo, Kling | Image/video generation |
| **T5 — Nertura specialists** | Nertura Disease CNN, Nertura Embedder [Phase 2+] | High-volume, domain-specific |
| **T6 — Nertura Model** | Nertura Ag LLM [Phase 4+] | Primary agronomic reasoning |

### Routing matrix

| Task category | Primary | Secondary | Tertiary | Nertura (when ready) |
|---------------|---------|-----------|----------|----------------------|
| Agronomic Q&A (EN) | Claude 3.5 | GPT-4o | Gemini Pro | Nertura Ag LLM |
| Agronomic Q&A (TR/regional) | Gemini Pro | GPT-4o | Claude | Nertura Ag LLM |
| Structured JSON / actions | GPT-4o | Gemini Pro | Claude | Nertura Ag LLM |
| Disease vision | GPT-4o Vision | Gemini Vision | — | Nertura CNN |
| Content scripts (social/blog) | Claude 3.5 | GPT-4o | — | Nertura Ag LLM |
| SEO blog long-form | Claude 3.5 | Gemini 1.5 Pro | — | Nertura Ag LLM |
| Email copy | GPT-4o | Claude | — | Nertura Ag LLM |
| WhatsApp short reply | Gemini Flash | GPT-4o mini | — | Nertura Ag LLM |
| Embeddings / RAG | OpenAI embed | Voyage | — | Nertura Embedder |
| Intent / agent routing | GPT-4o mini | Distil classifier | — | Nertura Router |

### Routing decision inputs

```
task_type + language + token_estimate + latency_sla + cost_budget
    + data_residency + model_health + user_tier + eval_score_history
        → selected_model
```

### Failover chain

1. Primary timeout or 5xx → secondary
2. Content policy block → sanitize once → retry secondary
3. All external fail → queue job OR Nertura Model if available
4. System failure → refund credits; never silent drop

### Nertura Model promotion rules

A Nertura-trained model replaces external routing only when:

| Gate | Requirement |
|------|-------------|
| Benchmark | Beats incumbent on Nertura eval suite for task |
| Safety | Passes red-team and regression suite |
| Latency | Meets SLA for channel |
| Governance | Model card approved by AI Governance Board |
| Rollout | Canary 5% → 25% → 100% with rollback |

See `/ai/training-roadmap.md`.

---

## Self-Growing Company Loop

Nertura is architected as a **company that compounds intelligence like a product**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELF-GROWTH FLYWHEEL                          │
│                                                                  │
│   GROWTH CHANNELS          OPERATIONS           INTELLIGENCE     │
│   · TikTok / IG / YT       · Farmer AI          · Interactions   │
│   · Blog / SEO               · Diagnosis          · Feedback       │
│   · Email / WhatsApp         · Marketplace        · Outcomes       │
│         │                         │                    │         │
│         └─────────────┬───────────┴────────────────────┘         │
│                       ▼                                          │
│              NERTURA BRAIN (store everything)                    │
│                       │                                          │
│         ┌─────────────┼─────────────┐                            │
│         ▼             ▼             ▼                            │
│    Learning      Memory +       Training                         │
│    System        Graph          pipeline                         │
│         │             │             │                            │
│         └─────────────┴─────────────┘                            │
│                       ▼                                          │
│         Better content · Better AI · Better retention            │
│                       ▼                                          │
│              More users · More data · More revenue               │
└─────────────────────────────────────────────────────────────────┘
```

| Flywheel leg | Mechanism |
|--------------|-----------|
| **Acquire** | Social + blog + email drive registration |
| **Activate** | AI Farmer + free credits → first diagnosis |
| **Retain** | Memory + field history increase switching cost |
| **Monetize** | Subscriptions + credits + sponsors |
| **Learn** | Every channel feeds Interaction Store |
| **Improve** | RAG → fine-tune → Nertura Model |
| **Scale content** | Media Factory produces daily growth assets |

---

## Agent Integration

Brain orchestrates agents defined in `/ai/agents.md`:

| Domain | Agents | Primary models |
|--------|--------|----------------|
| Operations | AI Farmer, AI Agronomist | Claude/GPT + vision |
| Growth | AI Content Director, AI Social | Claude + media APIs |
| Revenue | AI CRM, AI Export, AI Finance | GPT/Claude |
| Support | AI Support | GPT-4o mini |

Agent Router selects persona; Model Router selects weights/API within agent constraints.

---

## Operating Modes

### Mode A — Approval-first (Launch default)

| Output type | Gate |
|-------------|------|
| Social publish (TikTok, IG, YT) | Founder/admin approve |
| Blog publish | Editor approve |
| Email campaign | Marketing approve |
| WhatsApp broadcast | Admin approve |
| AI platform actions | User confirm |

See `/product/approval-workflow.md`, `/docs/ai-governance-policy.md`.

### Mode B — Full-auto (Future, per domain)

| Domain | Graduation criteria (summary) |
|--------|------------------------------|
| Weather tip reels | L1: 50 approved posts, <5% rejection |
| Transactional email | L2: template whitelist |
| WhatsApp reminders | L2: Meta-approved templates only |
| Irrigation advisory | L3: user policy opt-in |
| Full social calendar | L4: anomaly monitoring + sample audit |

Each domain graduates independently. Global kill switch always available.

---

## Channel Adapters (Brain L0)

| Channel | Adapter responsibility | Brain output |
|---------|------------------------|--------------|
| Web / mobile | Full context, streaming | Rich UI + actions |
| WhatsApp | Short text, media download | ≤1024 char replies |
| Email | HTML + plain text | Template render |
| Social | Platform specs via Distribution Engine | Asset bundle + caption |
| Blog | Markdown/HTML + SEO meta | CMS-ready document |
| Internal cron | Media Factory triggers | Batch jobs |

All adapters normalize to `BrainRequest` / `BrainResponse`.

---

## Data & Governance Hooks

Every inference produces:

| Record | Purpose |
|--------|---------|
| `AIInteraction` | Full audit trail |
| `CreditTransaction` | Revenue alignment |
| `ConsentSnapshot` | Regulatory proof |
| `ModelRoutingDecision` | Which model, why, cost |
| `ApprovalRequest` | If publish-bound |

Policies: `/docs/data-ownership-policy.md`, `/docs/data-privacy-kvkk-gdpr.md`.

---

## Observability

| Dashboard | Metrics |
|-----------|---------|
| **Model health** | Latency, error rate, failover frequency by provider |
| **Model economics** | Cost per task type vs credit revenue |
| **Quality** | Feedback rate, positive %, eval regression |
| **Growth** | Content → signup attribution by channel |
| **Governance** | Approval queue depth, auto-mode domains active |

---

## Infrastructure Topology

```
                    ┌─────────────────┐
                    │  API Gateway    │
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │     Brain Orchestrator       │
              │  (stateless, horizontal)     │
              └──────────────┬──────────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Model Router         Job Queue           Real-time WS
   (sync infer)         (async media)       (streaming chat)
         │                   │
    ┌────┴────┬────────┬─────┴─────┐
    ▼         ▼        ▼           ▼
  OpenAI   Anthropic  Google    Nertura GPU
  API      API        API       cluster
```

| Workload | Pattern |
|----------|---------|
| Chat / Q&A | Sync, <30s |
| Vision | Sync, <60s |
| Video render | Async queue, minutes |
| Blog generation | Async, approval queue |
| Batch email | Async, scheduled |

---

## Phase Roadmap (Brain)

| Phase | Capability |
|-------|------------|
| **1** | External routing only; full storage; approval-first |
| **2** | Credit-gated; eval suite; RAG + graph |
| **3** | WhatsApp adapter; CRM agents |
| **4** | Media Factory integration; multi-model cost optimization |
| **5** | Nertura CNN + embedder in production path |
| **6** | Nertura Ag LLM primary; external fallback |

Aligned with `/docs/system-roadmap.md`.

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Interaction capture rate | 100% |
| Model routing decision logged | 100% |
| External → Nertura query migration | >60% by Phase 6 |
| Approval SLA (launch) | <24h |
| AI gross margin | >75% at scale |
| Zero unaudited public publishes (launch) | ✓ |

---

*Document owner: Chief Growth & Intelligence Architect*  
*Last updated: June 2026*  
*Status: Final platform foundation*
