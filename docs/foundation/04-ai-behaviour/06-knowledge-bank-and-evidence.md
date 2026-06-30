# 06 — Knowledge Bank & Evidence

---

## Purpose

Explain how verified Knowledge Bank content integrates with AI answers, how **evidence cards** make sources transparent to farmers, and how the **human review queue** ensures nothing unverified auto-publishes to the KB.

---

## Principles

1. **KB is the trust anchor** — High-confidence hits answer directly; lower scores inform synthesis.
2. **Evidence is visible** — Farmers see which sources influenced the answer, not a black box.
3. **Review before publish** — Ingested content enters a queue; approval is a separate human action.
4. **Language-aware retrieval** — Direct KB answers require content in the user's conversation language.
5. **Cards are summaries** — Evidence cards explain influence; they are not full KB articles.

---

## Architecture

### Knowledge Bank in the doctor pipeline

```
searchKnowledgeItems(supabase, question)
  → pickBestKbHit(hits, queryCrops, preferredSlugs)
  → if canUseKbDirect → knowledgeHitToAnswer(topHit, language)
  → else formatKnowledgeContext(hits) → Gemini prompt block
  → combineKbAndGemini(topHit, geminiOutput, language)
```

**Direct path requirements** (all must pass):

- Score ≥ `KB_HIGH_CONFIDENCE_THRESHOLD` (0.78)
- Crop match via `hitMatchesQueryCrop`
- Vision agreement when photo present
- `hasKbContentInLanguage(topHit, language)`

### `KnowledgeHit` shape

| Field | Role |
|-------|------|
| `slug`, `type` | Identity and category |
| `name_tr`, `name_en` | Display names |
| `score` | Retrieval relevance 0–1 |
| `summary_tr`, `summary_en` | Localized summaries |
| `symptoms`, `causes`, `treatments`, `prevention` | Structured KB payload |

### Evidence card types

From `types-intelligence.ts` and `buildEvidenceCards`:

| Type | Title (EN) | When shown | Key fields |
|------|------------|------------|------------|
| `knowledge_bank` | Knowledge Bank | KB hits exist | `confidence` = score, `source` = slug |
| `farm_memory` | Farm Profile / Farm Memory | Always | Profile or "no records" |
| `project_memory` | Project Memory | Projects exist | Project names |
| `disease_history` | Disease History | History exists | Matched crop/disease row |
| `conversation_history` | Conversation History | Prior messages used | — |
| `image_analysis` | Image Analysis | Vision summary valid | `confidence` = 0.7 display |
| `weather_regional` | Weather | Always | Temp/humidity or placeholder |
| `similar_cases` | Similar Cases | Ranked cases provided | Top case score |

Cards are returned on `IntelligenceEngineOutput.evidenceCards` and stored in `memoryEvent.retrieval_context`.

### Knowledge Bank evidence card examples

**Strong match (EN):**

```
Title: Knowledge Bank
Summary: Tomato Early Blight — match score 84%
confidence: 0.84
source: tomato_early_blight
metadata.hits: [{ slug, score }, … top 5]
```

**Weak match — synthesis path:**

```
Summary: 3 knowledge records found
(no direct answer — Gemini synthesized with KB context)
```

### Human review queue (ingestion)

Not implemented in `packages/ai/src/` — enforced at ingestion layer (`docs/knowledge-ingestion.md`):

```
Source collection → AI summarization → knowledge_review_queue (pending)
  → Admin/expert approval → knowledge_items (published)
```

**Rules:**

- Nothing auto-publishes to the live Knowledge Bank
- Statuses include `pending`, `needs_expert`
- Risky claims require agronomist approval before farmers see them in KB-direct answers

When KB content is approved, retrieval scores reflect trusted articles — the AI package does not distinguish "reviewed" vs "legacy" at runtime; that is a data governance concern upstream.

### KB + Gemini synthesis (`combineKbAndGemini`)

Field precedence:

| Section | Priority order |
|---------|----------------|
| Diagnosis | Gemini → KB |
| Possible causes | Gemini `possible_causes` / `symptoms` → KB |
| Risk level | Gemini → KB → `medium` |
| Immediate action | Gemini → default monitor copy |
| Treatment / prevention | Gemini → KB |
| Expert warning | Gemini notes → default agronomist warning |

Source tag: `brain` if KB hit present, else `gemini`.

Internal note: `"Nertura Brain: KB {type}/{slug} + Gemini synthesis"`

### Fallback KB usage

When Gemini fails, `buildFallbackAnswer` uses top KB hit with:

- Confidence capped at `min(0.72, topHit.score)`
- Source: `fallback`
- Internal note: "Fallback mode — Gemini temporarily unavailable"

---

## Decision Rationale

### Why evidence cards for every run?

Trust requires explainability. A farmer asking "how do you know?" should see KB match, photo analysis, farm profile, and similar cases — not a single chat bubble.

### Why require localized KB for direct answers?

Serving English-only KB body to Turkish farmers violates language policy (Chapter 07) and erodes comprehension. Force synthesis with translation when localized summary missing.

### Why separate review queue from AI package?

Ingestion is batch/admin workflow; diagnosis is real-time. Keeping review outside `packages/ai` prevents accidental coupling and keeps the doctor pipeline read-only on KB.

### Why weather card always?

Regional risk is part of agricultural context even when live weather API is placeholder. Card honestly states "live weather coming soon" vs fabricating data.

---

## Examples

### Example — KB-direct with evidence stack

**Query:** Tomato leaf spots (TR, no photo)

**Cards emitted:**

1. `knowledge_bank` — "Domates Erken Yanıklığı — eşleşme skoru 86%"
2. `farm_memory` — "Ankara Sera — Ankara. Ürünler: domates"
3. `weather_regional` — "Ankara — bölgesel iklim profili onboarding'den yüklendi"
4. (no image_analysis, no similar_cases if none loaded)

### Example — Synthesis with weak KB

**KB top score:** 0.61

```
canUseKbDirect: false
→ Gemini receives formatKnowledgeContext(hits)
→ evidence card: "3 knowledge records found"
→ source: brain
```

### Example — Ingestion path (admin)

```
New FAO article ingested → queue status: pending
Agronomist approves → slug published to knowledge_items
Next farmer query → retrieval can hit slug at high score
```

---

## Best Practices

- Render all evidence cards in diagnosis UI — collapsed by default is OK, hidden is not.
- Link KB card `source` slug to in-app KB article when available.
- Prefer KB-direct when gates pass — faster, cheaper, more consistent.
- Monitor KB gaps when synthesis rate is high for a crop (ingestion backlog signal).
- Store top 5 hits in `memoryEvent.retrieval_context.knowledgeHits`.

## Bad Practices

- Showing evidence cards only to premium users.
- Auto-approving ingestion queue items for speed.
- Using KB articles in direct path when `hasKbContentInLanguage` is false.
- Treating evidence card confidence as diagnosis confidence (image card uses 0.7 prior).
- Editing KB content without version audit trail.

---

## Future Considerations

- **Citation links** — Evidence cards link to source URL from ingestion metadata.
- **KB version pinning** — Memory events record KB article version used at answer time.
- **Gap detection** — Auto-file ingestion tasks when retrieval returns zero hits for frequent crops.
- **Expert override queue** — Low-confidence farmer answers flagged for agronomist review (separate from ingestion queue).

---

## Source References

- `packages/ai/src/evidence-cards.ts` — `buildEvidenceCards`
- `packages/ai/src/types-intelligence.ts` — `EvidenceCard`, `EvidenceCardType`
- `packages/ai/src/knowledge-bank-doctor.ts` — retrieval, direct path, synthesis, fallback
- `packages/ai/src/knowledge-search.ts` — `searchKnowledgeItems`, `knowledgeHitToAnswer`
- `packages/ai/src/conversation-language.ts` — `hasKbContentInLanguage`
- `docs/knowledge-ingestion.md` — review queue workflow
