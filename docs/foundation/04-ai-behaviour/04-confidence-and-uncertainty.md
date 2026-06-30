# 04 — Confidence & Uncertainty

---

## Purpose

Define how Nertura expresses and enforces uncertainty: numeric confidence scores, hard gates that block premature diagnosis, and language that **never claims certainty** when evidence is weak.

---

## Principles

1. **Confidence is a signal, not a boast** — Display as approximate (`~72%`), always paired with monitoring guidance.
2. **Gates before answers** — Below-threshold vision or KB scores trigger clarification or synthesis, not forced diagnosis.
3. **Historical calibration** — Past outcomes for the same crop+disease nudge confidence within bounded limits.
4. **Honest fallbacks** — Fallback answers use explicitly lower confidence (e.g. 0.4) and say so in internal notes.
5. **No false precision** — Never show 100% unless the product explicitly supports verified human-confirmed cases (not current behaviour).

---

## Architecture

### Confidence on `DoctorAnswer`

Every answer includes `confidence: number` in range `[0, 1]`, set by:

| Path | Typical confidence | Mechanism |
|------|-------------------|-----------|
| KB direct | `topHit.score` | High match from Knowledge Bank |
| KB + Gemini synthesis | `min(0.95, max(hit.score, 0.72))` | `combineKbAndGemini` |
| Gemini only | `0.75` | No KB hit |
| Fallback with KB | `min(0.72, topHit.score)` | Capped — provider unavailable |
| Fallback generic | `0.4` | No specific KB match |
| Vision clarification | `vision?.confidence ?? 0.25` | Low by design |

### Key thresholds

| Constant | Value | Location | Effect |
|----------|-------|----------|--------|
| `KB_HIGH_CONFIDENCE_THRESHOLD` | **0.78** | `knowledge-bank-doctor.ts` | Direct KB answer without Gemini synthesis |
| `VISION_MIN_CONFIDENCE` | **0.52** | `vision-analysis.ts` | Minimum for photo-based diagnosis path |
| Outcome adjustment bounds | **0.2 – 0.98** | `similar-case-ranking.ts` | `adjustConfidenceFromOutcomes` clamp |

### KB direct gate (`canUseKbDirect`)

All must be true:

1. `topHit.score >= 0.78`
2. `hitMatchesQueryCrop(topHit, queryCrops)`
3. If photo present: vision confidence ≥ 0.52 AND `visionAgreesWithKb(topHit)`
4. `hasKbContentInLanguage(topHit, language)` — localized content exists

Failure → Gemini synthesis or fallback, never a forced KB answer.

### Vision clarification gate

In `parseVisionAnalysis`, `needsClarification` is true when:

- JSON flag `needs_clarification` is set, OR
- `imageQuality !== 'good'`, OR
- `confidence < VISION_MIN_CONFIDENCE` (0.52)

When triggered, `runKnowledgeBankDoctor` returns early with `buildClarificationAnswer` — **no KB search, no synthesis**.

Clarification reasons:

| Reason | Trigger |
|--------|---------|
| `vision_failed` | `analyzeWithGeminiVision` returned null |
| `low_confidence` | Below threshold or poor quality |
| `crop_conflict` | `cropsConflict(visionCrop, queryCrops)` |
| `unclear_image` | Heuristic parse detected blur/unclear |

### Outcome-based adjustment

`adjustConfidenceFromOutcomes(baseConfidence, outcomeStats)`:

```
successRate = (solved + improved * 0.5) / total
failureRate = worse / total
delta = successRate * 0.08 - failureRate * 0.12
adjusted = clamp(base + delta, 0.2, 0.98)
```

Applied in `runIntelligenceEngine` when `context.outcomeStats.total > 0`.

### User-facing confidence language

`formatNaturalDoctorSummary`:

- **TR:** `Güven: yaklaşık %${pct}`
- **EN:** `Confidence: ~${pct}%`

Tilde / "yaklaşık" (approximately) is mandatory tone — not optional marketing copy.

### Evidence card confidence

Optional `confidence` field on cards:

- `knowledge_bank` — KB match score
- `image_analysis` — fixed `0.7` display prior (summary includes parsed %)
- `similar_cases` — top case match score

---

## Decision Rationale

### Why 0.52 for vision?

Below this, species and symptom identification from photos is unreliable enough that wrong-crop advice causes real harm. The gate prefers asking for a better photo over a wrong diagnosis.

### Why 0.78 for KB direct?

Retrieval scores below ~0.78 often indicate partial slug matches or wrong crop articles. Direct answers at lower scores were a top source of user-reported "wrong diagnosis" in internal testing design targets.

### Why cap fallback at 0.72?

Signals "useful but not verified synthesis path" — encourages retry when Gemini is available without alarming the farmer.

### Why never claim certainty?

Agricultural conditions vary by microclimate, cultivar, and chemical resistance. Certainty language creates legal, ethical, and trust liability. Expert warning sections exist to reinforce this.

---

## Examples

### Example — Low vision confidence

**Photo:** Blurry leaf, parsed confidence 0.41

```
needsClarification: true
→ buildClarificationAnswer(reason: 'low_confidence')
→ diagnosis: "The photo is not clear enough for a confident diagnosis."
→ treatment_plan: "I will not recommend specific chemicals until a clear photo is provided."
→ confidence: 0.41
```

Farmer is asked for daylight close-up — not given a disease name.

### Example — High KB, no photo

**Query:** "Tomato early blight treatment" — KB score 0.91

```
canUseKbDirect: true
→ source: knowledge_base, confidence: 0.91
→ evidence card: "Tomato Early Blight — match score 91%"
```

### Example — Outcome-adjusted confidence

**Base:** 0.80 from synthesis  
**Stats:** 8 solved, 2 improved, 1 worse (11 total)

```
successRate ≈ 0.818
delta ≈ 0.065
adjusted ≈ 0.865 (clamped)
```

---

## Best Practices

- Always pass `outcomeStats` when available for recurring crop+disease pairs.
- Show confidence in UI near the short diagnosis, not hidden in settings.
- When confidence < 0.55, consider prominent "verify with agronomist" UI treatment.
- Use clarification path copy that explains *what* is uncertain (image quality, crop mismatch).
- Log `visionConfidence` and `topScore` in doctor analyze logs for threshold tuning.

## Bad Practices

- Rounding confidence to 100% for "strong" KB hits.
- Skipping vision gate because KB score is high.
- Removing "approximately" / "~" from displayed confidence.
- Using confidence as a sorting key for farmers ("only show if > 80%").
- Synthesizing at high confidence when `hasKbContentInLanguage` is false for the user's language.

---

## Future Considerations

- **Per-crop threshold tuning** — Tree crops vs leafy vegetables may need different vision floors.
- **Human-verified boost** — Agronomist-approved KB entries could raise direct-answer threshold confidence display.
- **Calibrated probabilities** — Map raw scores to empirically measured accuracy by crop.
- **User-controlled caution** — "Conservative mode" raises all gates by +0.1.

---

## Source References

- `packages/ai/src/knowledge-bank-doctor.ts` — `KB_HIGH_CONFIDENCE_THRESHOLD`, `canUseKbDirect`
- `packages/ai/src/vision-analysis.ts` — `VISION_MIN_CONFIDENCE`, `buildClarificationAnswer`, `parseVisionAnalysis`
- `packages/ai/src/similar-case-ranking.ts` — `adjustConfidenceFromOutcomes`
- `packages/ai/src/answer-formatter.ts` — `formatNaturalDoctorSummary`
- `packages/ai/src/evidence-cards.ts` — card-level confidence display
