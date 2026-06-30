# Nertura — AI Brain

> Core intelligence orchestration layer. Routes to external models today; builds proprietary agricultural intelligence from every stored interaction tomorrow.

---

## Purpose

The **Nertura AI Brain** is the central nervous system of the platform. It is not a chatbot wrapper — it is a persistent, context-aware, credit-governed intelligence layer that:

1. Routes each request to the optimal external AI provider
2. Assembles agricultural context from operational data and the knowledge base
3. **Stores every interaction** in Nertura's own database
4. Feeds the Learning System for continuous improvement
5. Enforces consent, credits, and compliance before any inference

---

## Architectural Position

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT SURFACES                           │
│         Web · Mobile · WhatsApp · Email · Internal tools         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      NERTURA AI BRAIN                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Context  │ │   RAG    │ │ Provider │ │ Interaction│          │
│  │ Assembly │ │  Engine  │ │  Router  │ │  Store    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                          │
│  │ Credit   │ │ Consent  │ │  Action  │                          │
│  │  Gate    │ │  Gate    │ │ Executor │                          │
│  └──────────┘ └──────────┘ └──────────┘                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   OpenAI / Claude         Nertura PostgreSQL      Vector DB
   Gemini / ElevenLabs     (interactions,          (embeddings,
   Runway / Veo / Kling    feedback, media)        knowledge)
```

---

## Core Principle: Store Everything

Every AI interaction — regardless of provider — produces a **durable Nertura record**:

| Stored element | Description |
|----------------|-------------|
| `interaction_id` | UUID primary key |
| `organization_id` | Tenant scope |
| `user_id` | Who initiated |
| `channel` | web, mobile, whatsapp, email, internal |
| `input_type` | text, photo, audio, video, document |
| `input_payload_ref` | Pointer to stored input (text hash, photo URL) |
| `context_snapshot` | JSON: farms, fields, crops, weather at inference time |
| `prompt_assembled` | Full prompt sent to provider (redacted secrets) |
| `provider` | openai, anthropic, google, elevenlabs, runway, etc. |
| `model` | Exact model version string |
| `response_text` | Full model output |
| `response_structured` | Parsed JSON (diagnosis, entities, actions) |
| `confidence` | Model or post-processed confidence score |
| `credits_consumed` | Credit type and amount |
| `latency_ms` | Provider round-trip time |
| `feedback` | null until user responds |
| `consent_training` | Boolean at time of interaction |
| `created_at` | Timestamp |

**Provider responses are never the system of record — Nertura DB is.**

---

## Request Lifecycle

```
1. INGEST
   User submits question, photo, or command via any channel

2. AUTHENTICATE & AUTHORIZE
   Validate session; check RBAC for action type

3. CREDIT GATE
   Estimate cost → check balance → reserve credits
   (see /product/credit-system.md)

4. CONSENT GATE
   Verify consent for: photo analysis, training use, WhatsApp AI
   (see /docs/data-privacy-kvkk-gdpr.md)

5. CONTEXT ASSEMBLY
   Pull: user profile, org, active farm/field, crop plan,
   weather, recent interactions, inventory, CRM notes

6. RAG RETRIEVAL
   Query vector DB for: agronomic knowledge, past Q&A,
   similar diagnoses, regional best practices, user corrections

7. PROMPT CONSTRUCTION
   System prompt + context block + RAG chunks + user input
   Apply safety and scope guardrails

8. PROVIDER ROUTING
   Select provider by: task type, language, cost, latency,
   availability, data residency constraints

9. INFERENCE
   Call provider API; stream if supported; handle failover

10. POST-PROCESS
    Parse structured output; validate schema; attach citations

11. PERSIST
    Write Interaction record BEFORE returning to user
    Store photos/media in object storage with interaction link

12. RESPOND
    Return to client; log audit event; emit learning event

13. FEEDBACK LOOP (async)
    User confirms/corrects → update Interaction.feedback
    → Learning System ingestion (see /ai/learning-system.md)
```

---

## Provider Router

### Routing Matrix

| Task | Primary | Fallback | Selection criteria |
|------|---------|----------|-------------------|
| General agronomic Q&A | Claude 3.5 Sonnet | GPT-4o | Language, latency |
| Structured data extraction | GPT-4o | Gemini 1.5 Pro | JSON reliability |
| Photo disease detection | GPT-4o Vision | Gemini Pro Vision | Confidence calibration |
| Long document analysis | Gemini 1.5 Pro | Claude 3.5 | Context window |
| Turkish / regional language | Gemini | GPT-4o | Language quality |
| Embeddings | text-embedding-3-large | Voyage-3 | Cost |
| Voice synthesis | ElevenLabs | OpenAI TTS | Voice clone, language |
| Image generation | DALL·E 3 | Imagen 3 | Style, safety |
| Video generation | Runway Gen-3 | Kling / Veo | Queue depth, cost |

### Failover Rules

1. Primary timeout (30s text, 60s vision) → fallback provider
2. Rate limit → queue with backoff; secondary provider if SLA breached
3. Content policy block → sanitize and retry once; else user-facing explanation
4. All failures logged with provider error code; credits refunded on system failure

### Provider Abstraction Interface

Each provider implements:

```
infer(request: BrainRequest) → BrainResponse
estimateCredits(request) → CreditEstimate
healthCheck() → Status
```

No client or module calls providers directly — **only the Brain**.

---

## Context Assembly

### Context Layers (priority order)

| Layer | Source | Token budget |
|-------|--------|--------------|
| **System** | Nertura persona, safety rules, output schema | Fixed |
| **User** | Role, language, preferences, unit system | ~200 |
| **Operational** | Active farm, field, crop plan, tasks, weather | ~2,000 |
| **RAG** | Retrieved knowledge chunks | ~4,000 |
| **History** | Last 5 interactions in session | ~1,500 |
| **Input** | User question + image description | Variable |

Total context managed dynamically; truncate lowest-priority layers first.

### Operational Context Example

```json
{
  "user": { "role": "farmer", "language": "tr", "region": "TR-06" },
  "farm": { "name": "Green Valley", "hectares": 45 },
  "field": { "id": "...", "crop": "corn", "stage": "vegetative", "week": 8 },
  "weather": { "temp_c": 28, "alerts": ["frost_thu"], "gdd": 842 },
  "recent_inputs": [{ "product": "Urea", "date": "2026-06-10", "field": "F2" }],
  "open_tasks": [{ "title": "Scout Field 7", "due": "2026-06-20" }]
}
```

---

## RAG Engine (Retrieval-Augmented Generation)

### Knowledge Sources

| Source | Type | Scope |
|--------|------|-------|
| Global agronomic corpus | Curated documents | All users |
| Regional crop guides | Curated + licensed | By country/region |
| Platform documentation | Internal | All users |
| User/org interaction history | Generated | Per org (private) |
| Learning System outputs | Generated | Global (anonymized, consented) |
| Feedback corrections | Generated | Weighted highly in retrieval |

### Retrieval Pipeline

```
Query embedding
    → Hybrid search (vector + keyword)
    → Filter by: language, crop, region, consent scope
    → Rerank top 20 → select top 5 chunks
    → Inject into prompt with source citations
```

### Citation Requirement

Every factual claim in a Brain response must reference at least one source chunk ID. UI displays: "Sources: Field history · Regional corn guide · Your observation 12 Jun"

---

## Interaction Storage Schema (Extended)

Beyond core Interaction entity (see `/docs/database-blueprint.md`):

### AIInteractionDetail

| Column | Type | Description |
|--------|------|-------------|
| `interaction_id` | UUID | FK |
| `provider_request_id` | VARCHAR | External trace ID |
| `provider_raw_response` | JSONB | Full API response (encrypted at rest) |
| `rag_chunk_ids` | UUID[] | Chunks used |
| `token_counts` | JSONB | `{ input, output, total }` |
| `cost_usd` | DECIMAL | Provider cost for margin analysis |
| `safety_flags` | JSONB | Content filter results |
| `action_proposals` | JSONB | Structured actions suggested |
| `actions_executed` | JSONB | Actions user confirmed |

### AIInteractionMedia

| Column | Type | Description |
|--------|------|-------------|
| `interaction_id` | UUID | FK |
| `media_type` | ENUM | photo, audio, video |
| `storage_url` | TEXT | Object storage path |
| `thumbnail_url` | TEXT | |
| `analysis_overlay` | JSONB | Disease heatmap, bounding boxes |
| `exif_stripped` | BOOLEAN | Privacy: GPS removed if user setting |

---

## Credit Integration

Every Brain call passes through Credit Gate before inference:

| Step | Action |
|------|--------|
| Estimate | Router returns expected credit cost by task type |
| Reserve | Atomic deduct from balance; hold until complete |
| Settle | Confirm on success; release difference if over-estimated |
| Refund | Full refund on provider/system failure |

See `/product/credit-system.md` for tier allocations.

---

## Consent Integration

Before storing interaction for **training use**:

| Check | Requirement |
|-------|-------------|
| Org-level AI training consent | Opt-in in settings |
| User-level consent | Confirmed at registration or prompt |
| Photo consent | Separate flag for vision + training |
| KVKK/GDPR | Explicit, granular, withdrawable |

Interactions always stored for **operational purposes** (user history, RAG for org). Training use is a separate, consent-gated pipeline to Learning System.

---

## Action Executor

Brain can propose platform actions (not execute silently):

| Action type | Example | Requires confirmation |
|-------------|---------|----------------------|
| `create_task` | Schedule spray Friday | Yes |
| `log_observation` | Save diagnosis to field | Yes |
| `send_whatsapp` | Remind worker | Yes |
| `schedule_irrigation` | AI-optimized schedule | Yes (configurable auto) |
| `create_crm_note` | Log call summary | Yes |

Confirmed actions written to audit log with `interaction_id` link.

---

## Channel Adapters

Each surface normalizes to `BrainRequest`:

| Channel | Adapter responsibilities |
|---------|-------------------------|
| **Web/Mobile** | Full context; streaming; rich action cards |
| **WhatsApp** | Image download; phone → user mapping; short responses |
| **Email** | Thread parsing; attachment extraction; async response |
| **Media Engine** | Batch mode; no user context; brand voice system prompt |
| **Internal** | Admin tools; higher token limits; audit enhanced |

---

## Security

| Control | Implementation |
|---------|----------------|
| Prompt injection defense | Input sanitization; system prompt isolation |
| PII in prompts | Redact email, phone, payment data before provider call |
| Provider data retention | Zero-retention API flags where available |
| Output filtering | Agricultural scope enforcement; block non-ag advice |
| Encryption | Interaction payloads encrypted at rest (AES-256) |

---

## Observability

| Metric | Purpose |
|--------|---------|
| `brain.requests.total` | Volume by channel, task |
| `brain.provider.latency` | Per-provider p50/p99 |
| `brain.provider.errors` | Failover frequency |
| `brain.rag.hit_rate` | Retrieval quality |
| `brain.feedback.positive_rate` | Answer quality |
| `brain.credits.consumed` | Revenue and cost alignment |
| `brain.cost.margin` | Provider cost vs credit revenue |

---

## Evolution Path

| Phase | Brain capability |
|-------|------------------|
| **1** | External models + full storage + RAG from curated corpus |
| **2** | RAG enriched with user feedback and org history |
| **3** | WhatsApp + omnichannel unified context |
| **4** | Media generation tasks via same Brain orchestration |
| **5** | Fine-tuned disease classifier replaces vision API for top crops |
| **6** | Nertura Ag LLM primary; external models fallback only |

---

## Relationship to Module AI

`/ai/ai-system.md` describes **embedded module AI** (yield prediction, irrigation optimization, weather risk). Those services call the Brain internally or shared ML infrastructure — they are not separate intelligence silos.

```
Module (e.g. Crop Disease UI)
    → Brain (vision task, context, storage, credits)
    → Learning System (feedback)
```

---

*Document owner: Chief Systems Architect / AI Engineering*  
*Last updated: June 2026*  
*Companion: `/ai/learning-system.md`, `/product/credit-system.md`*
