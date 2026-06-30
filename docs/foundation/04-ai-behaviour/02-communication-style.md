# 02 — Communication Style

---

## Purpose

Define how Nertura speaks to farmers: **short diagnosis first**, structured sections, calibrated tone, and consistent formatting across KB-direct, synthesized, and fallback answers.

---

## Principles

1. **Lead with the answer** — The farmer's first screenful must contain the diagnosis and immediate action, not preamble.
2. **Structured, not chatty** — Every doctor answer uses the same seven-section schema.
3. **Calm and practical** — Agricultural guidance, not medical alarmism or academic jargon.
4. **Honest about limits** — Expert warnings and confidence percentages are part of the voice, not footnotes.
5. **Language-consistent** — Section headers and body text match the locked conversation language (TR or EN).

---

## Architecture

### Section schema (`NerturaDoctorSections`)

Defined in `answer-formatter.ts`:

| Section key | TR header | EN header | Role |
|-------------|-----------|-----------|------|
| `short_diagnosis` | Kısa Teşhis | Short diagnosis | One-paragraph primary finding |
| `possible_causes` | Olası Nedenler | Possible causes | Symptoms, conditions, context |
| `risk_level` | Risk Seviyesi | Risk level | `low` \| `medium` \| `high` \| `critical` |
| `immediate_action` | Şimdi Ne Yapmalı | Immediate action | What to do today |
| `treatment_plan` | Tedavi Planı | Treatment plan | Medium-term management (not raw dosages) |
| `prevention` | Önleme | Prevention | Future risk reduction |
| `expert_warning` | Uzman Uyarısı | Expert note | Local agronomist, field variability |

### Formatting pipeline

```
buildNerturaSections(params) → NerturaDoctorSections
formatNerturaAnswerText(sections, lang) → markdown string (formatted)
sectionsToDoctorAnswer(sections, lang, meta) → DoctorAnswer
```

`DoctorAnswer` carries both:

- **Flat fields** — `diagnosis`, `symptoms`, `treatment`, `prevention` (legacy/API compat)
- **Rich fields** — `formatted` (full markdown), `sections` (structured for UI components)

### Natural summary (`formatNaturalDoctorSummary`)

For compact UI (notifications, chat preview, SMS-style surfaces):

```
[short_diagnosis]

[immediate_action]

Confidence: ~XX%

Monitor symptoms; upload a new photo if things change.
```

Rules:

- Confidence shown as **approximate** (`~XX%`), never "100% certain"
- Always ends with monitoring guidance
- No section headers in compact form — prose only

### Risk level labels

Localized via `RISK_TR` / `RISK_EN` maps. UI must use these labels, not raw enum strings.

### Default expert warning

When no custom warning is supplied, `buildNerturaSections` injects:

- **TR:** "Tarla koşulları değişkendir. … Kesin teşhis için yerel ziraat mühendisine danışın."
- **EN:** "Field conditions vary. … Consult a local agronomist for definitive diagnosis."

This is non-optional tone infrastructure — not boilerplate to strip.

---

## Decision Rationale

### Why seven fixed sections?

Farmers scan; they do not read essays. Fixed sections:

- Train UI components once (accordion, cards, print view)
- Force authors (human and LLM) to cover action, not just diagnosis
- Enable A/B testing per section without rewriting entire answers
- Align with evidence cards — each section can cite a source type

### Why "short diagnosis" not "summary"?

"Summary" invites repetition of the whole answer. `short_diagnosis` is explicitly one finding — the thing the farmer came for.

### Why separate immediate action and treatment plan?

Urgency separation reduces harm: immediate action is observational and low-risk; treatment plan may involve products and timing. Clarification answers explicitly withhold treatment until photo quality improves.

### Why markdown in `formatted`?

Dashboard and mobile render markdown headers (`**Kısa Teşhis**`). Structured `sections` allow native components to ignore markdown when desired.

---

## Examples

### Good — KB-direct answer structure (EN)

```markdown
**Short diagnosis**
Early blight (Alternaria) is the most likely cause of the brown leaf spots on your tomatoes.

**Possible causes**
Warm, humid conditions and overhead irrigation spread spores. Lower leaves are usually affected first.

**Risk level**
Medium

**Immediate action**
Remove affected lower leaves. Avoid wetting foliage when watering.

**Treatment plan**
Apply a registered fungicide according to local label guidance. Repeat at intervals specified on the label.

**Prevention**
Rotate crops, improve airflow, and use resistant varieties where available.

**Expert note**
Field conditions vary. Assessment for Tomato Early Blight. Consult a local agronomist for definitive diagnosis.
```

### Good — Compact natural summary (TR)

```
Domates yapraklarındaki kahverengi lekeler büyük olasılıkla Erken Yanıklık belirtisi.

Etkilenen alt yaprakları budayın; sulamada yaprakları ıslatmayın.

Güven: yaklaşık %78

Belirtileri izleyin; değişirse yeni bir fotoğraf yükleyin.
```

### Bad — Raw Gemini style (never ship)

```
Based on my analysis of your image and the symptoms you described, it appears that your tomato plants 
might be suffering from a fungal infection, possibly early blight or septoria leaf spot. I recommend 
applying Mancozeb at 2g/L every 7 days...
```

Problems: no sections, implied certainty, specific dosage, no disclaimer, no risk level.

---

## Best Practices

- Use `buildNerturaSections` for **every** answer path — including clarifications (`buildClarificationAnswer` in `vision-analysis.ts`).
- Pass `topHit` when available so expert warning includes crop-specific context (`Assessment for …`).
- Render `sections` in UI when possible; fall back to `formatted` markdown for simple views.
- Show confidence as approximate in all user-facing surfaces.
- Keep `immediate_action` actionable in one or two sentences.

## Bad Practices

- Concatenating Gemini JSON fields into a paragraph without section mapping.
- Using alarmist language ("CRITICAL EMERGENCY") unless `risk_level` is actually `critical`.
- Hiding the expert warning below the fold or omitting it on mobile.
- Mixing TR section headers with EN body text.
- Replacing structured sections with bullet-free LLM monologues for "naturalness."

---

## Future Considerations

- **Voice / TTS** — `formatNaturalDoctorSummary` is the TTS source of truth; do not read full markdown headers aloud.
- **Progressive disclosure** — UI may collapse prevention and expert warning by default, but they must exist in the payload.
- **WhatsApp channel** — Compact summary first; link to full section view.
- **Literacy variants** — Simpler vocabulary layer should still map to the same seven keys, not a different schema.

---

## Source References

- `packages/ai/src/answer-formatter.ts` — `buildNerturaSections`, `formatNerturaAnswerText`, `formatNaturalDoctorSummary`, `sectionsToDoctorAnswer`
- `packages/ai/src/vision-analysis.ts` — `buildClarificationAnswer` (tone for low-confidence photo path)
- `packages/ai/src/knowledge-bank-doctor.ts` — `combineKbAndGemini`, `buildFallbackAnswer`
