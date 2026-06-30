# 03 — Memory Systems

---

## Purpose

Document how Nertura remembers field context across conversations: farm profiles, disease history, projects, similar cases, and the **`ai_memory_events`** audit graph that powers learning and feedback.

---

## Principles

1. **Memory informs, never overrides** — Context enriches prompts and evidence cards; KB and vision gates still apply.
2. **Farmer-owned data** — Memory is scoped by user, organization, and RLS; guests have limited persistence.
3. **Transparent recall** — When memory influences an answer, an evidence card says so.
4. **Write every diagnosis** — Each intelligence run produces a `MemoryEventPayload` suitable for `ai_memory_events` insertion.
5. **Recency-bounded** — Conversation context uses the last 8 messages; disease history top 5 entries in prompts.

---

## Architecture

### Intelligence context (`IntelligenceContext`)

Defined in `intelligence-engine.ts`:

| Field | Type | Role |
|-------|------|------|
| `conversationHistory` | `{ role, content }[]` | Multi-turn continuity |
| `similarCases` | `RankedSimilarCase[]` | Past diagnoses with outcomes |
| `farmMemory` | Farm summaries | Registered farms list |
| `farmProfile` | `FarmIntelligenceProfile` | Onboarding-derived active farm |
| `projectMemory` | `{ projectName }[]` | Active projects |
| `diseaseHistory` | crop/disease/occurrence/outcome | Field-level recurrence |
| `weather` | temp, humidity, rainfall, zone | Regional risk (live or placeholder) |
| `outcomeStats` | solved/improved/noChange/worse/total | Confidence adjustment input |

The API layer loads this context from Supabase and passes it to `runIntelligenceEngine`. The AI package does not query the database for memory — separation of concerns.

### Prompt formatting (`formatMemoryContextForPrompt`)

In `memory-context.ts`, context blocks are injected into Gemini and doctor prompts:

```
--- Recent conversation ---
Farmer: [last messages, max 500 chars each]
Nertura: …

--- Field disease history ---
tomato / early_blight: 3x (improved)

--- Similar cases ---
tomato: Alternaria leaf spot (87% match)

--- Projects ---
Spring greenhouse trial
```

Rules:

- Last **8** conversation messages
- Last **5** disease history rows
- Last **4** similar cases
- Labels localized (TR/EN) to match conversation language

### Evidence cards mirror memory

`buildEvidenceCards` in `evidence-cards.ts` creates user-visible cards for each memory type:

| Card type | When emitted |
|-----------|--------------|
| `farm_memory` | Always — profile, saved farms, or "no farm records" |
| `project_memory` | When `projectMemory.length > 0` |
| `disease_history` | When history exists; highlights crop/disease match |
| `conversation_history` | When `hasConversationHistory` is true |
| `similar_cases` | When ranked similar cases provided |

Farm memory card shows organization name, location, crops — or explicitly states general guidance was applied without farm records.

### `ai_memory_events` table

Schema from `supabase/migrations/20250629000000_intelligence_engine.sql`:

| Column | Purpose |
|--------|---------|
| `intent` | Classified agriculture intent |
| `crop`, `disease`, `pest` | Primary entities |
| `symptoms` | JSON array |
| `diagnosis`, `treatment` | Final Nertura answer fields |
| `confidence` | Post-adjustment score |
| `provider_used` | `DoctorSource` string |
| `raw_gemini_output` | Internal audit only |
| `final_nertura_answer` | Structured answer + sections |
| `entities` | Full `ExtractedEntities` |
| `retrieval_context` | KB hits, evidence cards, similar cases used |
| `reasoning_steps` | Ordered pipeline audit |
| `feedback_status` | Learning loop state (default `pending`) |
| `language` | `tr` or `en` |

Related tables:

- **`ai_feedback`** — User feedback linked to `memory_event_id`
- **`similar_cases`** — Pairwise links between memory events
- **`diagnosis_outcomes`** — Follow-up outcome records (see Chapter 10)

### Memory event assembly

At the end of `runIntelligenceEngine`:

```typescript
const memoryEvent: MemoryEventPayload = {
  intent,
  crop: primaryCrop(entities),
  disease: primaryDisease(entities),
  pest: primaryPest(entities),
  symptoms: entities.symptoms,
  diagnosis: pipeline.answer.diagnosis,
  treatment: pipeline.answer.treatment,
  confidence: pipeline.answer.confidence,
  provider_used: pipeline.answer.source,
  raw_gemini_output: pipeline.rawGemini,
  final_nertura_answer: { answer, formatted, sections },
  entities,
  retrieval_context: { knowledgeHits, evidenceCards, similarCases, … },
  reasoning_steps: reasoningSteps,
  language,
};
```

The API persists this payload; the engine only constructs it.

---

## Decision Rationale

### Why separate farm profile and farm memory?

- **Profile** — Active onboarding context (crops, location, organization) merged into doctor input via `mergeCropsForDoctor`.
- **Memory** — List of farms the user has registered; supports multi-farm users and evidence transparency.

### Why cap conversation history at 8 messages?

Token budget and relevance. Older turns rarely change diagnosis; disease history and similar cases carry structured signal more efficiently.

### Why always emit a farm_memory evidence card?

Even without records, the card says "general guidance applied." Silence would imply Nertura had field context it did not have — a trust failure.

### Why store raw Gemini in memory events?

Regulatory audit, model evaluation, and dispute resolution. It is never rendered to farmers. RLS restricts access to authenticated owners.

---

## Examples

### Example — Returning farmer, tomato blight history

**Context loaded by API:**

```json
{
  "farmProfile": { "organizationName": "Ankara Greenhouse", "crops": ["tomato"] },
  "diseaseHistory": [
    { "crop": "tomato", "disease": "early_blight", "occurrenceCount": 2, "lastOutcome": "improved" }
  ],
  "conversationHistory": [
    { "role": "user", "content": "Yapraklarda yine lekeler var" },
    { "role": "assistant", "content": "…" }
  ]
}
```

**Evidence cards emitted:**

- `farm_memory` — "Ankara Greenhouse — Ankara. Crops: tomato"
- `disease_history` — "tomato / early_blight — seen 2 time(s), last: improved"
- `conversation_history` — "Previous messages used as context."

**Prompt block** includes disease history and conversation for Gemini synthesis.

### Example — Guest user, no farm

**Evidence card:**

- `farm_memory` — "No farm records yet — general guidance applied."

Memory event still written with `guest_id` where policy allows.

---

## Best Practices

- Load `farmProfile` from active organization onboarding on every doctor call.
- Pre-rank similar cases with `rankSimilarCases` before passing to the engine.
- Persist full `memoryEvent` including `reasoning_steps` — not a subset.
- Update `feedback_status` on `ai_memory_events` when user submits feedback.
- Use `diseaseHistory` to boost evidence card relevance — match on crop OR disease.

## Bad Practices

- Injecting entire conversation transcripts (>8 turns) into prompts.
- Using memory to skip vision gates ("we diagnosed this before").
- Exposing `raw_gemini_output` in farmer-facing API responses.
- Writing memory events without `retrieval_context.evidenceCards` (breaks replay debugging).
- Cross-user memory leakage — always enforce RLS at load time, not in the AI package.

---

## Future Considerations

- **Cross-season memory** — Disease history weighted by `lastSeenAt` and outcome.
- **Organization-level memory** — Agronomist notes shared across farm team with consent.
- **Memory decay** — Old similar cases deprioritized in ranking.
- **Offline sync** — Field memory cached on mobile; merge conflicts resolved server-side.

---

## Source References

- `packages/ai/src/intelligence-engine.ts` — `IntelligenceContext`, `MemoryEventPayload`
- `packages/ai/src/memory-context.ts` — `formatMemoryContextForPrompt`
- `packages/ai/src/evidence-cards.ts` — memory-related card types
- `packages/ai/src/similar-case-ranking.ts` — `RankedSimilarCase`, `DiseaseHistoryEntry`
- `supabase/migrations/20250629000000_intelligence_engine.sql` — `ai_memory_events` schema
