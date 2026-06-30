# 09 — Safety & Agricultural Ethics

---

## Purpose

Codify non-negotiable safety rules: **no automatic chemical dosages**, mandatory disclaimers, withholding treatment on uncertain photos, and ethical defaults when providers fail.

---

## Principles

1. **Advisor, not prescriber** — Nertura guides; certified agronomists and product labels decide dosages.
2. **Disclaimer on every answer** — `DOCTOR_DISCLAIMER` is appended via `finalizeAnswer` without exception.
3. **Withhold when uncertain** — Low vision confidence → no fungicide/pesticide recommendations.
4. **Risk levels are honest** — `critical` reserved for genuine crop-loss urgency, not engagement.
5. **Fallback is safe generic** — Provider failure never returns empty or hallucinated chemical schedules.

---

## Architecture

### Universal disclaimer

From `types.ts`:

```typescript
export const DOCTOR_DISCLAIMER =
  'AI tavsiyesi sertifikalı bir tarım uzmanının yerini almaz. / AI advice does not replace a certified agricultural expert.';
```

Applied in:

- `finalizeAnswer` — every doctor output
- `buildClarificationAnswer` — vision gate path
- `sectionsToDoctorAnswer` — all section-built answers
- Content engine and legacy providers (re-exported)

**UI requirement:** Display disclaimer on every diagnosis surface — chat, PDF export, share cards.

### No auto dosages — enforcement layers

| Layer | Mechanism |
|-------|-----------|
| **Vision gate** | `buildClarificationAnswer` treatment_plan explicitly withholds chemicals until clear photo |
| **Section schema** | `treatment_plan` describes approach + "according to local label" — not ml/L presets |
| **Expert warning** | Default urges local agronomist for definitive diagnosis |
| **KB content** | Ingestion review queue flags dosage claims for expert approval |
| **Prompt design** | Gemini agriculture doctor prompts (in `gemini.ts`) steer toward label compliance |

Clarification copy (TR/EN):

> "Net fotoğraf gelene kadar kesin ilaç/gübre önerisi vermiyorum."  
> "I will not recommend specific chemicals until a clear photo is provided."

### Risk level ethics

`RiskLevel`: `low` | `medium` | `high` | `critical`

- Assigned in KB content, Gemini synthesis, or safe defaults (`medium` for generic fallback)
- Clarification answers use `low` — asking for photo is not an emergency
- UI must not animate/alarm on `medium` for engagement

### Fallback safety (`buildFallbackAnswer`)

**With KB hit:**

- Confidence capped at 0.72
- Source: `fallback`
- Internal note explains Gemini unavailable
- Treatment from KB — still under disclaimer

**Without KB hit:**

- Diagnosis: "General agricultural guidance (safe fallback)"
- `riskLevel: medium`
- Immediate action: monitor, balanced irrigation
- Treatment: consult local agronomist
- Confidence: **0.4** — visibly uncertain

Never returns raw error strings to farmers.

### Crop conflict safety

When text crop ≠ photo crop, Nertura stops before retrieval:

> "Clarity first — misidentifying the plant leads to wrong advice."

Wrong-plant diagnosis is a primary path to unsafe chemical recommendation.

### Provider failure handling

```typescript
catch (err) {
  return buildFallbackAnswer(...);
  rawGemini: { error: message, status };
}
```

Errors logged server-side; farmer sees safe guidance.

### Guest limits (abuse / cost safety)

From `types.ts`:

- `GUEST_QUESTION_LIMIT = 3`
- `REGISTERED_FREE_LIMIT = 10`

Rate limits are product safety — prevent automated scraping and encourage account creation for sustained advice.

---

## Decision Rationale

### Why bilingual disclaimer in one constant?

Farmers and regulators may screenshot answers. Both languages visible reduces "I didn't understand the disclaimer" claims in TR market with EN UI elements.

### Why block chemicals on bad photos?

Misidentified disease → wrong active ingredient → crop damage, residue violations, farmer loss. Cheaper to ask for another photo.

### Why not embed dosages in KB for "convenience"?

Label rates vary by country, formulation, and applicator license. KB describes *classes* of treatment; labels are authoritative.

### Why safe fallback instead of error toast?

Empty errors destroy trust in field connectivity. Generic monitoring advice is low-risk and keeps the conversation open.

---

## Examples

### Good — Treatment language

```
Apply a registered fungicide according to local label guidance.
Improve airflow and reduce leaf wetness.
Consult your local agricultural extension office before spraying near harvest.
```

### Bad — Blocked pattern (never ship)

```
Mix Mancozeb 2.5 g per liter and spray every 7 days for 3 applications.
```

Even if Gemini returns this, product QA should treat as ingestion/KB review failure; prompts should steer to label reference.

### Good — Clarification withhold

```
Treatment plan: I will not recommend specific chemicals until a clear photo is provided.
Expert warning: Clarity first — misidentifying the plant leads to wrong advice.
Disclaimer: AI tavsiyesi sertifikalı bir tarım uzmanının yerini almaz. / ...
```

### Good — Fallback without KB

```
Diagnosis: General agricultural guidance (safe fallback)
Confidence: ~40%
Treatment plan: Consult a local agronomist; prepare your field records.
```

---

## Best Practices

- Show disclaimer persistently — footer on chat, not one-time modal.
- Train support to cite `reasoning_steps` and `feedback_status` for disputed advice.
- Route KB ingestion with dosage numbers to `needs_expert` review status.
- Log `vision_clarification:*` internal notes for safety audit counts.
- Escalate `risk_level: critical` UI to show emergency contact / extension office links (product layer).

## Bad Practices

- Stripping disclaimer for "cleaner" UI.
- Parsing Gemini output for numeric dosages to display prominently.
- Raising confidence on fallback answers to avoid "looking weak."
- Auto-purchasing or affiliate links to chemicals from treatment text.
- Diagnosing protected crops or controlled substances without jurisdiction checks (future compliance).

---

## Future Considerations

- **Jurisdiction packs** — EU vs TR vs US label reference templates.
- **PHI / REI reminders** — Pre-harvest interval warnings when KB includes crop-specific data.
- **Organic mode** — Exclude synthetic chem suggestions by farm certification flag.
- **Human-in-the-loop escalation** — Auto-queue `critical` + low confidence for agronomist callback.
- **Toxicology blocklist** — Post-process filter for banned active ingredients by region.

---

## Source References

- `packages/ai/src/types.ts` — `DOCTOR_DISCLAIMER`, `GUEST_QUESTION_LIMIT`, `RiskLevel`
- `packages/ai/src/knowledge-bank-doctor.ts` — `finalizeAnswer`, `buildFallbackAnswer`
- `packages/ai/src/vision-analysis.ts` — `buildClarificationAnswer` withhold copy
- `packages/ai/src/answer-formatter.ts` — default expert warning
- `docs/knowledge-ingestion.md` — review queue for risky claims
- `docs/security-master-plan.md` — unsafe ag advice mitigations
