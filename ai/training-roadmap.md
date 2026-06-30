# Nertura — AI Training Roadmap

> Structured path from external foundation models (OpenAI, Gemini, Claude) through fine-tuned specialists to the Nertura proprietary agriculture model — governed by data quality, consent, and measurable parity benchmarks.

---

## Training Philosophy

| Principle | Application |
|-----------|-------------|
| **RAG before fine-tune** | Extract maximum value from retrieval before expensive training |
| **Fine-tune before pretrain** | Specialized heads beat general pretraining until corpus justifies |
| **Labels over volume** | 10K validated diagnoses beat 1M unconfirmed guesses |
| **Consent always** | No training export without explicit opt-in |
| **Benchmark-driven** | No model promotion without beating baseline on Nertura eval suite |
| **Human in the loop** | Expert review gate for production model updates |

---

## Evolution Stages Overview

```
Stage 0          Stage 1           Stage 2            Stage 3             Stage 4
External API  →  RAG + prompts  →  Fine-tuned      →  Multi-model       →  Nertura Ag
(GPT/Claude/     + memory          specialists         ensemble            Foundation Model
 Gemini)                           (vision, embed)     + edge deploy
     │                │                  │                  │                  │
  Month 0          Month 1–12        Month 12–24        Month 24–36        Month 36–48+
```

---

## Stage 0: External Foundation Models (Launch)

### Configuration

| Task | Primary model | Role |
|------|---------------|------|
| Agronomic Q&A | Claude 3.5 Sonnet / GPT-4o | Reasoning |
| Vision diagnosis | GPT-4o Vision / Gemini Pro Vision | Classification |
| Embeddings | text-embedding-3-large | RAG |
| Media scripts | GPT-4o | Content |
| Structured extraction | GPT-4o | JSON reliability |

### Nertura additions (no training)

- System prompts per agent (`/ai/agents.md`)
- Memory + Knowledge Graph injection
- Citation requirements
- Feedback storage for future stages

### Exit criteria for Stage 1

| Criterion | Threshold |
|-----------|-------------|
| Interactions stored | >1M |
| Diagnosis feedback rate | >25% |
| Validated labels | >50K |
| RAG corpus | >100K chunks |

---

## Stage 1: RAG + Prompt Optimization (Months 1–12)

### Objective

Maximize quality without custom model weights — **cheapest intelligence gain**.

### Workstreams

| Workstream | Actions |
|------------|---------|
| **Corpus curation** | License extension guides; ingest regional crop manuals |
| **Embedding pipeline** | Chunk, embed, index operational + curated docs |
| **GraphRAG** | Vector seed + knowledge graph expansion |
| **Prompt registry** | Versioned agent prompts; A/B test |
| **Feedback-weighted retrieval** | Confirmed diagnoses boost similar retrieval |
| **Eval suite v1** | 500 agronomic Q&A; 200 diagnosis images (holdout) |

### Eval suite v1 structure

| Benchmark | Size | Metric |
|-----------|------|--------|
| Ag Q&A (multilingual) | 500 questions | Accuracy vs expert answer key |
| Disease classification | 200 images | Top-1 accuracy |
| Region-specific timing | 100 scenarios | Recommendation correctness |
| Safety / scope | 50 adversarial | Block rate |

### Expected lift

| Metric | Stage 0 | Stage 1 target |
|--------|---------|----------------|
| Ag Q&A accuracy | 72% | 85% |
| Diagnosis top-1 | 78% | 88% |
| User satisfaction | 4.0 | 4.3 |

### Cost profile

Low — embedding + storage; no GPU training cluster.

---

## Stage 2: Fine-Tuned Specialists (Months 12–24)

### Objective

Train **narrow models** that beat general APIs on high-volume, high-margin tasks.

### Model 2A: Disease Classification CNN

| Attribute | Detail |
|-----------|--------|
| **Architecture** | EfficientNet-B4 or ViT-base |
| **Training data** | Confirmed + expert-validated labels from Learning System |
| **Minimum per crop** | 10,000 validated images |
| **Augmentation** | Rotation, lighting, regional variance |
| **Output** | Disease class + severity + confidence + heatmap |
| **Deployment** | Cloud API primary; TFLite edge bundle |

**Promotion gate:** Top-1 accuracy ≥ GPT-4o Vision on holdout **and** ≥90% on in-domain test.

### Model 2B: Agricultural Embedding Model

| Attribute | Detail |
|-----------|--------|
| **Base** | Fine-tune embedding model on Q&A pairs with positive feedback |
| **Training pairs** | >500K question-chunk relevance pairs |
| **Use** | Replace generic embeddings in RAG |
| **Metric** | NDCG@10 on retrieval benchmark |

### Model 2C: Intent Router (Small classifier)

| Attribute | Detail |
|-----------|--------|
| **Architecture** | DistilBERT-scale |
| **Task** | Route to correct agent + task type |
| **Training data** | Labeled interactions |
| **Deployment** | Edge of Brain pipeline; <10ms |

### Infrastructure

| Component | Spec |
|-----------|------|
| Training | AWS SageMaker / GCP Vertex; spot instances |
| Experiment tracking | MLflow / Weights & Biases |
| Dataset versioning | DVC or lakeFS |
| Model registry | Versioned artifacts with approval gate |
| CI/CD | Automated eval on promotion PR |

### Data pipeline

```
Learning System validated labels
    → Dataset builder (consent filter)
    → Quality audit (dedupe, balance, PII scan)
    → Train / val / test split (temporal — no future leakage)
    → Training job
    → Eval suite
    → Human review sample (1%)
    → Model registry promote
    → Canary 5% traffic → full rollout
```

---

## Stage 3: Multi-Model Ensemble + Edge (Months 24–36)

### Objective

Reduce provider dependency; deploy offline-capable intelligence.

### Model 3A: Ensemble Diagnosis

| Component | Role |
|-----------|------|
| Nertura CNN (Stage 2) | Primary on supported crops |
| GPT-4o Vision | Fallback + novel crops |
| RAG context | Treatment recommendation |
| Calibrator | Platt scaling on confidence |

Routing: CNN if crop supported and confidence >0.8; else vision API.

### Model 3B: Yield Prediction LSTM + GBM

| Attribute | Detail |
|-----------|--------|
| **Data** | Crop plans + weather + inputs + outcomes |
| **Training** | Per-region calibration |
| **Metric** | MAPE <12% at harvest |

### Model 3C: Edge Bundle (Mobile)

| Content | Size target |
|---------|-------------|
| Top-20 disease CNN | <25 MB TFLite |
| Intent router | <5 MB |
| Offline RAG cache | Top 1K regional chunks |

OTA update via mobile app; differential download.

### Provider spend target

| Metric | Stage 2 | Stage 3 |
|--------|---------|---------|
| External API $ / AI revenue | 45% | 25% |
| Queries on proprietary models | 20% | 55% |

---

## Stage 4: Nertura Agriculture Foundation Model (Months 36–48+)

### Objective

Domain foundation model for agronomic reasoning — **Nertura Ag LLM**.

### Prerequisites

| Prerequisite | Threshold |
|--------------|-----------|
| Consented corpus tokens | >10B agricultural tokens |
| Validated Q&A pairs | >5M |
| Expert-reviewed content | >100K items |
| Graph subgraph exports | Structured agronomic relations |
| Legal review | AI Act conformity [EU]; KVKK [TR] |

### Training approach (decision tree)

```
IF corpus < 10B tokens:
    → Continue Stage 2/3 specialists; delay Stage 4

ELIF corpus 10B–50B:
    → Fine-tune open foundation (Llama 3 / Mistral / Gemma)
      on Nertura corpus (continued pretrain + SFT + RLHF)

ELIF corpus > 50B + revenue justifies:
    → Consider domain-specific pretrain from scratch
      (only with $50M+ ML budget and research team)
```

**Recommended path for Nertura:** Fine-tune open foundation model — not pretrain from scratch until unicorn scale.

### Nertura Ag LLM training stages

| Phase | Method | Data |
|-------|--------|------|
| **Continued pretrain** | Causal LM on ag corpus | Docs, Q&A, graph exports |
| **SFT** | Instruction tuning | Agent conversations with high feedback |
| **RLHF / DPO** | Preference alignment | Thumbs up/down pairs |
| **Tool use** | Function calling | Action executor schemas |
| **Safety** | Red team + refusal tuning | Non-ag, medical, legal blocks |

### Nertura Ag LLM capabilities target

| Capability | Benchmark vs GPT-4o |
|------------|-------------------|
| Agronomic Q&A (TR, EN, PT, ES) | +15% accuracy |
| Regional regulation awareness | +25% |
| Structured action proposals | +20% schema compliance |
| Citation fidelity | +30% |
| Latency | <2s p95 (self-hosted) |

### Deployment

| Tier | Deployment |
|------|------------|
| Cloud | Dedicated GPU cluster; vLLM serving |
| Hybrid | CNN edge + LLM cloud |
| Enterprise | VPC-hosted model instance |

---

## Training Data Governance

### Inclusion criteria

| Criterion | Required |
|-----------|----------|
| User consent `ai_training_global` | ✓ |
| PII removed | ✓ automated + sample human |
| Label validated | ✓ confirm, expert, or outcome |
| Quality score | Above threshold |
| Regional representation | Balanced — no crop/region <5% unless rare |

### Exclusion criteria

- Rejected diagnoses without correction
- Single-source unvalidated claims
- Children/minor accounts
- Legal hold accounts

### Dataset documentation (Model Cards)

Every registered model publishes:

- Training data sources and date range
- Demographic/geographic representation
- Known limitations and failure modes
- Eval results on Nertura suite + bias probes
- Consent methodology

---

## Eval Suite Evolution

| Version | Stage | Benchmarks |
|---------|-------|------------|
| v1 | 1 | 500 Q&A, 200 images |
| v2 | 2 | +1K images, retrieval NDCG, yield MAPE |
| v3 | 3 | +multilingual, edge latency, ensemble calibration |
| v4 | 4 | +full agent workflows, safety red team, RLHF preference |

**Golden rule:** No production promotion without regression pass on previous version benchmarks.

---

## Human Review Pipeline

| Stage | Human role |
|-------|------------|
| Label validation | Expert agronomists review 1% random + 100% low confidence |
| Model promotion | ML lead + ag science advisor sign-off |
| RLHF preference | Trained raters with ag background |
| Incident review | User reports of bad diagnosis → root cause → retrain queue |

---

## Timeline Summary

| Stage | Timeline | Primary output | Provider dependency |
|-------|----------|----------------|---------------------|
| 0 External | 0–6 mo | Brain + storage | 100% |
| 1 RAG | 6–12 mo | Corpus + GraphRAG | 95% |
| 2 Fine-tune | 12–24 mo | Disease CNN, embedder | 70% |
| 3 Ensemble + edge | 24–36 mo | Offline diagnosis, yield | 45% |
| 4 Nertura Ag LLM | 36–48+ mo | Domain foundation model | <30% |

Aligned with `/docs/system-roadmap.md` Phase 6.

---

## Investment & Team

| Stage | ML team size | Est. annual ML infra |
|-------|--------------|----------------------|
| 0–1 | 2 ML + 1 data | $200K |
| 2 | 5 ML + 3 data + 2 ag science | $1.5M |
| 3 | 12 ML + 5 data + 3 ag science | $5M |
| 4 | 25+ research + labeling ops | $15M+ |

---

## Success Metrics

| Metric | Stage 4 target |
|--------|--------------|
| Proprietary model query share | >60% |
| Diagnosis accuracy (proprietary) | >92% top-1 |
| Ag LLM benchmark vs GPT-4o | +15% domain accuracy |
| Training data consent rate | >40% of active users |
| Model promotion cycle | Quarterly specialist; biannual LLM |
| AI gross margin | >75% |

---

*Document owner: Chief AI Platform Architect / ML Engineering*  
*Last updated: June 2026*  
*Companion: `/ai/data-moat-strategy.md`, `/ai/learning-system.md`, `/ai/nertura-ai-brain.md`*
