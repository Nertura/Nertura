# Nertura — Learning System

> Self-improving agricultural knowledge architecture. Every question, photo, answer, and feedback compounds into smarter recommendations — privately for each organization, and collectively for global agriculture with consent.

---

## Purpose

The Learning System transforms Nertura from a **stateless AI wrapper** into a **compounding intelligence asset**. It captures the full learning loop:

```
User asks → Uploads photo → AI answers → User feedback → Stored → System improves
```

Over time, anonymized agricultural knowledge grows — powering better RAG, better routing, and eventually Nertura's proprietary models.

---

## Learning Loop Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LEARNING LOOP                                    │
│                                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│   │  ASK     │───►│ INFER    │───►│ FEEDBACK │───►│  STORE   │         │
│   │ question │    │ + answer │    │ confirm/ │    │ indexed  │         │
│   │ + photo  │    │          │    │ correct  │    │ enriched │         │
│   └──────────┘    └──────────┘    └──────────┘    └────┬─────┘         │
│                                                         │                │
│                         ┌───────────────────────────────┘                │
│                         ▼                                                │
│              ┌─────────────────────┐                                     │
│              │  IMPROVE             │                                     │
│              │  · User RAG          │                                     │
│              │  · Org knowledge     │                                     │
│              │  · Global corpus     │                                     │
│              │  · Model training    │                                     │
│              └─────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Event Types

Every learning event is immutable once written:

| Event | Trigger | Payload |
|-------|---------|---------|
| `interaction.created` | AI response delivered | Full interaction record |
| `feedback.positive` | User thumbs up / confirms diagnosis | `interaction_id`, optional note |
| `feedback.negative` | User thumbs down | `interaction_id`, reason code |
| `feedback.correction` | User provides correct answer | `interaction_id`, correction text, optional re-label |
| `outcome.observed` | Task completed, yield recorded | Links prediction to actual |
| `expert.validated` | Agronomist confirms | Elevated weight in corpus |

---

## Feedback Taxonomy

### Disease / Vision Feedback

| Feedback | System action |
|----------|---------------|
| **Confirm** | Label validated; increase confidence weight in RAG |
| **Reject** | Mark as false positive; downrank similar retrieval |
| **Correct** | Store `{ predicted, actual, crop, region, image_embedding }` |
| **Uncertain** | Queue for expert review; no training use until validated |

### Q&A Feedback

| Feedback | System action |
|----------|---------------|
| **Helpful** | Boost chunk sources used in response |
| **Not helpful** | Log for prompt engineering review |
| **Correction** | Create `KnowledgeCorrection` entity; inject into RAG with high priority |

---

## Knowledge Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 4: GLOBAL ANONYMIZED CORPUS (consented)           │
│ Aggregated patterns: "Corn rust in TR-06, Jun, 87% acc" │
├─────────────────────────────────────────────────────────┤
│ Layer 3: REGIONAL KNOWLEDGE (curated + learned)         │
│ Crop guides, climate patterns, regulatory context       │
├─────────────────────────────────────────────────────────┤
│ Layer 2: ORGANIZATION KNOWLEDGE (private)               │
│ Org feedback, farm outcomes, member patterns            │
├─────────────────────────────────────────────────────────┤
│ Layer 1: USER KNOWLEDGE (private)                       │
│ Personal Q&A history, confirmed diagnoses, preferences  │
└─────────────────────────────────────────────────────────┘
```

Retrieval searches layers bottom-up (most specific first), then merges with decay weights.

---

## Data Entities (Learning-Specific)

### KnowledgeNode

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `layer` | user, org, regional, global |
| `type` | fact, diagnosis, correction, best_practice, outcome |
| `content` | Structured text |
| `embedding` | Vector |
| `crop` | Optional crop filter |
| `region_code` | Optional geo filter |
| `confidence` | 0–1, updated with feedback |
| `source_interaction_id` | Provenance |
| `consent_scope` | operational, training_global |
| `validation_status` | pending, validated, rejected |
| `usage_count` | Times retrieved |
| `positive_feedback_count` | Quality signal |

### LearningPipelineJob

Batch jobs that process feedback into knowledge:

| Job | Frequency | Output |
|-----|-----------|--------|
| `feedback_ingestion` | Real-time | KnowledgeNode create/update |
| `embedding_refresh` | Daily | Re-embed updated nodes |
| `corpus_deduplication` | Weekly | Merge near-duplicate nodes |
| `anonymization_export` | Monthly | Global corpus candidates |
| `model_training_export` | Quarterly | Training datasets [Phase 6] |

---

## Improvement Mechanisms

### 1. RAG Improvement (Immediate — Phase 1+)

When user confirms a diagnosis:

1. Create `KnowledgeNode` with image embedding + label
2. Next similar image query retrieves this node
3. Response includes: "Similar case on your farm, Jun 2026 — confirmed as X"

**Effect:** Same user and org get instant improvement without model retraining.

### 2. Org-Level Pattern Learning (Phase 2+)

Aggregate within organization (never cross-org without consent):

| Pattern | Example |
|---------|---------|
| Input timing vs yield | "This org's corn responds best to N at week 6" |
| Disease recurrence | "Field 3 had rust 2024 and 2025 — preemptive scout" |
| Operator accuracy | Weight scout observations by historical accuracy |

Injected as org-context block in Brain prompts.

### 3. Regional Corpus Growth (Phase 3+)

Anonymization pipeline:

```
Interaction + feedback
    → Strip: user_id, org_id, farm name, GPS, EXIF
    → Retain: crop, region (province level), season, diagnosis, outcome
    → Differential privacy noise on small cell counts (<10)
    → Human review sample (1%) before global index
    → Publish to Layer 4
```

### 4. Model Fine-Tuning (Phase 5–6)

| Model | Training data |
|-------|---------------|
| Disease classifier v1 | Confirmed vision feedback, min 10K labels per crop |
| Ag Q&A embedder | Q&A pairs with positive feedback |
| Nertura Ag LLM | Full consented corpus + curated agronomic textbooks |

All training exports require explicit org opt-in and documented in consent records.

---

## Feedback UI → Learning Pipeline

```
User taps "Not correct" on diagnosis
    → Modal: "What did you find?" + crop condition picker
    → Optional: expert photo upload
    → Submit
        → interaction.feedback = correction
        → Event: feedback.correction
        → Learning worker:
            - Create KnowledgeNode (org layer)
            - If consent_training: queue anonymization
            - Decrement confidence on original prediction node
            - Notify model ops if error rate spikes for crop/region
```

---

## Quality Gates

Knowledge nodes enter global layer only when:

| Gate | Threshold |
|------|-----------|
| Validation | Expert validated OR ≥3 independent user confirmations |
| Confidence | ≥0.85 aggregate |
| Conflict check | No contradictory validated node for same crop/region/condition |
| Consent | `consent_scope = training_global` |
| Privacy review | Automated PII scan pass |

---

## Outcome Linking

Connect predictions to real-world outcomes for calibration:

| Prediction type | Outcome source | Learning use |
|-----------------|----------------|--------------|
| Yield forecast | Harvest record | Adjust model weights |
| Disease alert | Scout confirmation | Precision/recall tracking |
| Irrigation recommendation | Yield + water usage | ROI validation |
| Market price forecast | Actual sale price | Forecast accuracy |

Stored as `PredictionOutcome` linked to `AIPrediction` and `KnowledgeNode`.

---

## Anonymized Global Knowledge Examples

What the global corpus grows toward:

| Knowledge type | Example (anonymized) |
|----------------|------------------------|
| Diagnosis pattern | "Corn northern leaf blight, vegetative stage, humid conditions, TR-Central Anatolia, Jun — confirmed 847 times, 91% accuracy" |
| Timing | "Wheat rust spray optimal window: flag leaf emergence + 7 days, Mediterranean climate" |
| Outcome | "Drip irrigation at 25mm/week during reproductive stage correlated with +8% yield in sandy soil, corn" |

Published only as aggregated statistics — never individual farm data.

---

## Anti-Patterns Prevented

| Risk | Mitigation |
|------|------------|
| **Bad feedback poisoning** | Rate limit corrections; weight by user trust score |
| **Overfitting to one org** | Global layer requires multi-org validation |
| **PII leakage to global** | Automated + sample human review |
| **Stale knowledge** | Time decay on nodes; seasonal validity tags |
| **Contradictory advice** | Conflict resolution: higher validation wins; flag for review |

---

## User Trust Score (Internal)

Derived score affects feedback weight:

| Factor | Weight |
|--------|--------|
| Account age | + |
| Confirmed diagnoses | + |
| Corrections later validated | + |
| Random contradictory corrections | − |
| Expert/agronomist role | 3× multiplier |

Never shown to users — internal quality signal only.

---

## Metrics

| Metric | Target |
|--------|--------|
| Feedback rate on AI responses | >25% |
| Diagnosis confirmation rate | >70% of vision responses |
| RAG retrieval precision@5 | >0.85 |
| Global corpus growth | +10K validated nodes/year |
| Time to incorporate correction into RAG | <5 minutes (org layer) |
| Prediction calibration error | <15% MAPE yield |

---

## Integration Points

| System | Integration |
|--------|-------------|
| AI Brain | Emits events; consumes KnowledgeNodes in RAG |
| Credit System | No credit for feedback submission |
| Compliance | Consent check before global promotion |
| WhatsApp | Feedback via reply: "👍" or "Wrong: [description]" |
| Module AI | Yield/disease models consume outcome links |

---

## Phase Rollout

| Phase | Capability |
|-------|------------|
| **1** | Store interactions; thumbs up/down; org-layer RAG from corrections |
| **2** | Structured correction UI; outcome linking; org pattern summaries |
| **3** | WhatsApp feedback; regional corpus pilot |
| **4** | Anonymization pipeline; global layer search |
| **5** | Fine-tuned disease model from corpus |
| **6** | Nertura Ag LLM trained on full knowledge graph |

---

*Document owner: Chief Systems Architect / AI Engineering*  
*Last updated: June 2026*  
*Companion: `/ai/nertura-ai-brain.md`, `/docs/data-privacy-kvkk-gdpr.md`*
