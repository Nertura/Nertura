# Nertura — Memory System

> Long-term memory architecture for a self-improving AI operating system — hierarchical, consent-aware, and queryable across users, fields, crops, diseases, conversations, and organizations.

---

## Purpose

Large language models are stateless. Nertura is not. The Memory System gives every agent **persistent, structured, retrievable context** that compounds with use — making each interaction more accurate than the last without re-explaining context.

```
Without memory:  "What's wrong with my corn?"  (no field context)
With memory:     Knows Field 7, week 8 vegetative, last rust scout 3d ago,
                 soil N low, farmer prefers TR language, confirmed blight 2025
```

---

## Memory Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ L6: GLOBAL MEMORY (anonymized, consented)                    │
│     Regional patterns, validated diagnoses corpus           │
├─────────────────────────────────────────────────────────────┤
│ L5: ORGANIZATION MEMORY                                     │
│     Policies, co-op rules, team patterns, aggregate KPIs    │
├─────────────────────────────────────────────────────────────┤
│ L4: ENTITY MEMORY (field, crop plan, disease incident)      │
│     Persistent records linked to operational entities         │
├─────────────────────────────────────────────────────────────┤
│ L3: CONVERSATION MEMORY                                     │
│     Sessions, threads, agent handoffs                       │
├─────────────────────────────────────────────────────────────┤
│ L2: USER MEMORY                                             │
│     Preferences, habits, corrections, trust signals         │
├─────────────────────────────────────────────────────────────┤
│ L1: WORKING MEMORY (ephemeral)                              │
│     Current request context, active entities, token window  │
└─────────────────────────────────────────────────────────────┘
```

Retrieval searches **bottom-up**: most specific first, then broader layers until token budget filled.

---

## L1: Working Memory

### Scope

Single request lifecycle — not persisted beyond session cache.

| Content | TTL |
|---------|-----|
| Active route / screen context | Session |
| Uncommitted form state | Session |
| Current agent persona | Request |
| Assembled prompt chunks | Request |
| Streaming partial response | Request |

### Implementation concept

In-memory session store (Redis) keyed by `session_id`. Cleared on logout or 24h idle.

---

## L2: User Memory

### Purpose

Everything Nertura learns about **an individual user** across sessions.

### Memory types

| Type | Example | Source |
|------|---------|--------|
| **Preference** | Language TR; metric units; brief replies | Explicit settings + inferred |
| **Habit** | Checks dashboard at 6 AM; scouts Fridays | Behavior analytics |
| **Correction** | "Last time you said rust but it was blight" | Feedback events |
| **Expertise** | High confirmation rate on corn diagnoses | Trust score |
| **Channel pref** | Primary: WhatsApp | Usage pattern |
| **Pinned context** | "Always consider organic constraints" | User statement |

### UserMemory entity

| Field | Description |
|-------|-------------|
| `user_id` | Owner |
| `memory_type` | preference, habit, correction, note |
| `key` | Semantic key slug |
| `content` | Structured text / JSON |
| `embedding` | Vector for retrieval |
| `confidence` | 0–1; inferred vs explicit |
| `source_interaction_id` | Provenance |
| `expires_at` | Optional TTL for inferred habits |
| `created_at` / `updated_at` | |

### Privacy

- User can view all memories in Settings → AI Memory
- User can delete individual memories or full reset
- Deleted memories removed from RAG within 5 minutes

---

## L3: Conversation Memory

### Purpose

Multi-turn coherence within and across sessions.

### Structure

```
Conversation (thread)
    ├── Session A (2026-06-19)
    │     ├── Message user: "Should I spray Field 2?"
    │     ├── Message agent.farmer: "Wind too high..."
    │     └── Action proposed: reschedule task (confirmed)
    ├── Session B (2026-06-20)
    │     └── Message user: "Did we reschedule that spray?"
    └── Summary (auto-generated): "Field 2 spray rescheduled to Fri"
```

### ConversationSummary

Auto-generated after session idle >30 min or on close:

| Field | Description |
|-------|-------------|
| `conversation_id` | |
| `summary_text` | 2–5 sentences |
| `entities_mentioned` | field_ids, crop_plan_ids |
| `actions_taken` | Task IDs created |
| `open_questions` | Unresolved threads |
| `embedding` | For "pick up where we left off" retrieval |

### Cross-session continuity

On new session, Brain retrieves:
1. Last 3 conversation summaries for user
2. Open questions flagged
3. Recent actions still relevant (tasks due, alerts active)

WhatsApp and web share `conversation_id` when phone linked.

---

## L4: Entity Memory

### Purpose

Persistent intelligence attached to **operational objects** — not just chat logs.

### Entity memory domains

#### Field memory

| Memory | Example |
|--------|---------|
| Soil history summary | "pH trending down over 3 seasons" |
| Recurring issues | "Northern blight 2024, 2025 — preemptive scout Jun" |
| Irrigation pattern | "Responds well to 25mm/week in vegetative" |
| Yield history | "4.2 t/ha avg corn; best 4.8 in 2024" |
| Notes | Manager annotations |

Linked to: `field_id` in Knowledge Graph.

#### Crop history memory

Per `crop_plan_id` and aggregated per field×crop rotation:

| Memory | Example |
|--------|---------|
| Season narrative | "Planted late 2025 due to rain; yield -12%" |
| Input program | What was applied, when, outcomes |
| Growth milestones | Actual vs planned stage dates |
| Harvest outcome | Quantity, grade, buyer |

Rolls up when season → `harvested`; informs next season planning.

#### Disease history memory

Per field, crop, and org region:

| Memory | Example |
|--------|---------|
| Incident log | Disease, date, severity, treatment, outcome |
| AI diagnosis chain | Prediction → feedback → validated label |
| Recurrence pattern | "Rust appears week 9 if wet spring" |
| Treatment efficacy | "Product X resolved in 5 days" |

Feeds AI Agronomist and Learning System.

#### Photo memory

Not duplicate storage — pointers to `ObservationPhoto` with embedded analysis:

| Memory | Example |
|--------|---------|
| Visual timeline | Gallery indexed by date, field, diagnosis |
| Similar case retrieval | Embedding nearest-neighbor search |
| Progression | Same disease spot tracked across dates |

---

## L5: Organization Memory

### Purpose

Shared intelligence for cooperatives, ag companies, and teams.

### Memory types

| Type | Example | Access |
|------|---------|--------|
| **Policy** | "All organic fields: no synthetic N" | All org members |
| **Procedure** | "Report harvest within 48h" | All members |
| **Aggregate KPI** | "Co-op avg corn yield 4.1 t/ha" | Managers |
| **Member pattern** | "North region outperforms south 12%" | Co-op admin |
| **Brand / comms** | Tone guide for white-label AI | Admins |
| **Sponsor context** | Active sponsor programs | Target segments |

### OrgMemory entity

| Field | Description |
|-------|-------------|
| `organization_id` | |
| `visibility` | all_members, managers, admins |
| `memory_type` | policy, kpi, pattern, brand |
| `content` | |
| `embedding` | |
| `valid_from` / `valid_until` | Seasonal policies |

### Isolation

Org memory **never leaks** to other orgs in retrieval. Global promotion requires anonymization pipeline (`/ai/learning-system.md`).

---

## L6: Global Memory

### Purpose

Anonymized, validated, consented patterns searchable across Nertura — the collective agricultural brain.

### Content examples

| Pattern | Form |
|---------|------|
| Diagnosis frequency | "Corn rust, TR-Central, Jun, 91% confirm rate" |
| Timing knowledge | "Wheat fungicide flag leaf +7d Mediterranean" |
| Outcome correlation | "Drip 25mm/wk → +8% yield sandy corn" |

### Access rules

| Agent | Access |
|-------|--------|
| AI Farmer | Retrieve only; no write |
| AI Agronomist | Retrieve + flag for validation |
| Learning System | Write after anonymization |
| Users | Never direct access to raw global store |

---

## Memory Retrieval Pipeline

```
Query (user message + context)
    │
    ▼
┌─────────────────┐
│ Query embedding │
└────────┬────────┘
         │
    ┌────▼────┐  Parallel retrieval:
    │ Router  │  · User memory (top 5)
    └────┬────┘  · Conversation summaries (top 3)
         │       · Entity memory (active field/crop)
         │       · Org memory (policies)
         │       · Global memory (if agronomic query)
         ▼
┌─────────────────┐
│ Rerank + dedupe │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Token   │  Fit to agent token budget
    │ budget  │
    └────┬────┘
         │
         ▼
    Injected into Brain prompt
    with source citations
```

### Recency vs relevance weighting

| Memory type | Recency weight |
|-------------|----------------|
| Working | 100% current |
| Conversation | High decay after 30d |
| User preference | Low decay |
| Entity (this season) | High |
| Entity (historical) | Medium |
| Org policy | No decay until expiry |
| Global | Relevance only |

---

## Memory Write Rules

| Event | Memory write |
|-------|--------------|
| User states preference | User memory (explicit) |
| Diagnosis confirmed | Disease entity memory + Learning System |
| Task completed | Crop / field memory update |
| Season harvested | Crop history rollup |
| User correction | User memory + downgrade old entity memory |
| Co-op admin sets policy | Org memory |
| 3+ orgs validate pattern | Queue global memory candidate |

All writes produce `MemoryEvent` audit record.

---

## Memory Consolidation (Sleep Cycle)

Nightly batch jobs:

| Job | Action |
|-----|--------|
| **Summarize** | Long conversations → summaries |
| **Prune** | Delete expired inferred habits |
| **Merge** | Duplicate user preferences |
| **Rollup** | Field season stats → field memory |
| **Embed refresh** | Re-embed updated nodes |
| **Anonymize queue** | Candidates for global layer |

---

## Consent & Deletion

| Action | Behavior |
|--------|----------|
| User deletes account | Cascade delete L2–L4 user-linked; anonymize L5 if sole member |
| Opt out of training | Stop global promotion; org/user layers retained |
| Memory export | Include in GDPR export bundle |
| Right to erasure | Entity memories purged; global nodes already anonymized stay |

See `/docs/data-privacy-kvkk-gdpr.md`.

---

## Scale Considerations

| Scale | Strategy |
|-------|----------|
| <100K users | PostgreSQL + pgvector for all layers |
| 100K–1M | Dedicated vector DB; memory shard by org |
| 1M+ | Tiered storage: hot (Redis + pgvector), warm (S3 + index), cold archive |

Estimated memory per active farmer: ~500 KB structured + embeddings/year.

---

## Agent Memory Access (Quick Reference)

| Agent | L2 User | L3 Conv | L4 Entity | L5 Org | L6 Global |
|-------|---------|---------|-----------|--------|-----------|
| AI Farmer | ✓ | ✓ | Assigned fields | Read policies | Retrieve |
| AI Agronomist | ✓ | ✓ | All org entities | ✓ | Retrieve |
| AI Content | ✗ | ◐ | ✗ | Brand only | Trends only |
| AI Social | ✗ | ◐ | ✗ | Brand only | Trends only |
| AI CRM | ◐ | ✓ | Account-linked | ✓ | ✗ |
| AI Export | ◐ | ✓ | Supply chain | ✓ | Regulations |
| AI Finance | ✓ | ✓ | Cost entities | ✓ | ✗ |
| AI Support | ◐ | ✓ | ✗ | Tier info | Docs only |

---

## Integration Map

| System | Role |
|--------|------|
| AI Brain | Orchestrates read/write |
| Knowledge Graph | Entity IDs for L4 memory |
| Learning System | Promotes validated memory to L6 |
| Agents | Scoped access per `/ai/agents.md` |
| Database | Persistent store — `/docs/database-blueprint.md` |

---

*Document owner: Chief AI Platform Architect*  
*Last updated: June 2026*  
*Companion: `/ai/knowledge-graph.md`, `/ai/nertura-ai-brain.md`*
