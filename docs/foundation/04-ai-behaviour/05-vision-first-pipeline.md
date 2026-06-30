# 05 — Vision-First Pipeline

---

## Purpose

Document the photo analysis pipeline: Gemini vision runs **before** Knowledge Bank retrieval, species is validated against the user's stated crop, and **`VISION_MIN_CONFIDENCE` (0.52)** gates disease diagnosis from images.

---

## Principles

1. **Species before disease** — Identify the plant in the photo before matching KB disease articles.
2. **Vision first in pipeline order** — Not an afterthought appended to text retrieval.
3. **Structured parse** — Vision output is parsed into `ParsedVisionAnalysis`, not displayed as raw JSON.
4. **Conflict resolution** — Text crop and photo crop must agree, or Nertura asks for clarification.
5. **No diagnosis on bad photos** — Low quality or low confidence → guidance to re-shoot, not chemical advice.

---

## Architecture

### Pipeline order (when `hasImage`)

From `runKnowledgeBankDoctor`:

```
1. mergeCropsForDoctor(farmProfile.crops, detectedCrops)
2. analyzeWithGeminiVision(imageBase64, imageMimeType, question)
3. parseVisionAnalysis(vision.text)
4. Gate: vision_failed → clarification, STOP
5. Gate: needsClarification OR confidence < VISION_MIN_CONFIDENCE → clarification, STOP
6. Gate: cropsConflict(visionCrop, queryCrops) → clarification, STOP
7. Append vision.cropId to queryCrops if not present
8. searchKnowledgeItems + pickBestKbHit
9. visionAgreesWithKb check for direct KB path
10. Synthesis or KB direct
```

Steps 4–6 return **empty `knowledgeHits`** — retrieval does not run on failed vision.

### Gemini vision call

`analyzeWithGeminiVision` in `gemini.ts`:

- Accepts base64 image + MIME type + optional question text
- Returns `{ text, raw }` or `null` on failure
- Raw stored in `rawGemini` for audit; text parsed by `parseVisionAnalysis`

### `ParsedVisionAnalysis` schema

| Field | Type | Purpose |
|-------|------|---------|
| `plantSpecies` | string | Human-readable species label |
| `cropId` | `CropId \| null` | Lexicon-normalized crop |
| `confidence` | number | 0–1, clamped |
| `observations` | string | Visible symptoms |
| `possibleConditions` | string | Candidate conditions (not final diagnosis) |
| `imageQuality` | `good \| poor \| unclear` | Quality gate input |
| `needsClarification` | boolean | Composite gate flag |
| `clarificationQuestions` | string[] | Model-suggested follow-ups |
| `rawText` | string | Original provider text |

### Parsing strategy (`parseVisionAnalysis`)

1. **JSON path** — Extract JSON object from response; map snake_case and camelCase keys.
2. **Crop resolution** — `resolveCropIdFromLabel` via `CROP_ALIASES` and `detectCropsFromQuery`.
3. **Heuristic fallback** — If JSON parse fails, regex-detect crops; lower confidence (0.35–0.62).

`needsClarification` auto-set when:

```typescript
Boolean(parsed.needs_clarification) ||
imageQuality !== 'good' ||
confidence < VISION_MIN_CONFIDENCE  // 0.52
```

### Species validation (`cropsConflict`)

```typescript
function cropsConflict(visionCrop: CropId | null, queryCrops: CropId[]): boolean {
  if (!visionCrop || !queryCrops.length) return false;
  return !queryCrops.includes(visionCrop);
}
```

Example conflict: user writes "pepper" but photo shows tomato morphology.

### KB agreement (`visionAgreesWithKb`)

For direct KB answers with a photo:

```typescript
slug.includes(parsedVision.cropId) || name_en.toLowerCase().includes(parsedVision.cropId)
```

Prevents serving a wheat article when vision identified corn.

### Evidence summary (`formatVisionSummaryForEvidence`)

Human-readable block for evidence cards — **never `[object Object]`**:

```
Plant: tomato
Image Quality: Good
Detected Symptoms: brown spots on lower leaves
Possible Conditions: early blight, septoria
Confidence: 71%
Species: tomato
```

Filtered in `buildEvidenceCards`: invalid summaries skipped; max 400 chars.

### Clarification answers (`buildClarificationAnswer`)

Reason-specific copy in TR/EN:

| Reason | Diagnosis tone |
|--------|----------------|
| `vision_failed` | Photo could not be analyzed — retry JPG/PNG |
| `crop_conflict` | Message crop ≠ photo crop — clarify which plant |
| `low_confidence` / `unclear_image` | Not clear enough for confident diagnosis |

Shared treatment plan rule:

- **TR:** "Net fotoğraf gelene kadar kesin ilaç/gübre önerisi vermiyorum."
- **EN:** "I will not recommend specific chemicals until a clear photo is provided."

---

## Decision Rationale

### Why vision before KB?

KB slugs are crop-specific. Wrong crop → wrong article → confident wrong advice. Vision-first ensures `queryCrops` and `preferredSlugs` include photo-derived crop.

### Why stop pipeline on low confidence?

Running KB retrieval on a bad photo wastes tokens and creates temptation to "answer something." Early exit keeps the product honest.

### Why crop conflict is a hard stop?

Farmers sometimes upload the wrong plant photo. Proceeding would attribute pepper symptoms to tomato diseases.

### Why include `possibleConditions` in prompt but not as final diagnosis?

Conditions are hypotheses for synthesis context. Final diagnosis still goes through Nertura sections with confidence and disclaimers.

---

## Examples

### Example — Good photo, passes gates

```
Vision: cropId=tomato, confidence=0.68, imageQuality=good
needsClarification: false (0.68 >= 0.52)
queryCrops: [tomato]
→ KB search proceeds
→ visionAgreesWithKb(tomato_early_blight) = true
```

### Example — Blurry photo

```
Heuristic parse: lowQuality regex match
confidence: 0.35, imageQuality: poor, needsClarification: true
→ buildClarificationAnswer(low_confidence)
→ knowledgeHits: []
```

### Example — Crop conflict

```
User crops: [pepper] from text + farm profile
Vision cropId: tomato
cropsConflict → true
→ "The crop in your message does not match the plant in the photo."
```

---

## Best Practices

- Accept JPG/PNG; reject unsupported formats before vision call.
- Pass the user's question text to vision — it disambiguates multi-plant scenes.
- Show `image_analysis` evidence card whenever vision summary exists.
- Encourage daylight close-ups in clarification `immediate_action`.
- Merge `farmProfile.crops` into preliminary crops before conflict check.

## Bad Practices

- Running vision after KB retrieval "to enrich" the answer.
- Diagnosing disease when `confidence < 0.52`.
- Displaying raw Gemini vision JSON in the chat bubble.
- Ignoring crop conflict because KB score is high.
- Using vision-only crop when user explicitly names a different crop without clarification.

---

## Future Considerations

- **Multi-plant photos** — Detect multiple crops; ask which plant to diagnose.
- **Progressive vision** — Accept medium-quality for species ID only, block disease ID until second photo.
- **On-device pre-check** — Blur detection before upload to save API calls.
- **Seasonal context** — Cross-check vision species with regional planting calendar.

---

## Source References

- `packages/ai/src/knowledge-bank-doctor.ts` — vision-first ordering, gates, `visionAgreesWithKb`
- `packages/ai/src/vision-analysis.ts` — `VISION_MIN_CONFIDENCE`, `parseVisionAnalysis`, `cropsConflict`, `buildClarificationAnswer`, `formatVisionSummaryForEvidence`
- `packages/ai/src/intelligence-engine.ts` — `resolveVisionSummary`, `geminiVisionText`
- `packages/ai/src/crop-lexicon.ts` — `CROP_ALIASES`, `detectCropsFromQuery`
