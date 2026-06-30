# Chapter 09 — AI-First & Trust Philosophy

## Purpose

Define why Nertura's AI is **never a wrapper** and how **trust is engineered** into every layer — from RLS to evidence cards to friendly errors.

---

## Principles

1. **Always `runIntelligenceEngine`** — never raw provider output to users
2. **Grounded when possible** — Knowledge Bank, memory, field context
3. **Transparent when uncertain** — confidence, evidence, follow-up questions
4. **Safe by default** — no auto pesticide dosages; expert escalation path
5. **Auditable** — memory events, provider outputs, feedback loops

---

## AI-First Architecture

```
User input (text / image)
        │
        ▼
┌───────────────────┐
│ Entity extraction │
│ Intent classifier │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Memory context    │ ← field, case, conversation, disease history
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Knowledge Bank    │ ← verified items, citations
│ Doctor synthesis  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Vision analysis   │ ← Gemini (server-only), parsed structured
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Evidence cards    │ ← transparency layer for UI
│ Answer formatter  │ ← short-first sections
└───────────────────┘
```

**Code entry:** `packages/ai/src/intelligence-engine.ts`

---

## Trust Mechanisms

| Mechanism | User impact | Implementation |
|-----------|-------------|----------------|
| **Evidence cards** | "Why did you say that?" | `buildEvidenceCards`, `EvidenceCardsPanel` |
| **Confidence language** | "Most likely" not "Definitely" | Prompt + formatter rules |
| **Knowledge review queue** | Risky claims human-approved | Ingestion admin, `review_pending` |
| **RLS** | No cross-tenant data leak | `supabase/policies/` |
| **Friendly errors** | No stack traces or `[object Object]` | `friendlyAiError`, `userFacingUploadError` |
| **Rate limits** | Abuse prevention | Doctor route middleware |
| **Language lock** | No mixed TR/EN | `conversation_language` migration |

---

## What Users Must Never See

- Raw Gemini / OpenAI error strings
- Other organizations' farm data
- API keys, tokens, internal model names as primary UX
- Overconfident chemical prescriptions
- English errors in Turkish sessions

---

## Decision Rationale

**Wrapper apps die** when models update — Nertura owns the **orchestration, memory, and grounding** layer.

**Evidence cards** convert black-box anxiety into informed consent — farmers accept uncertainty when they see *why*.

---

## Examples

### Good trust UX

- Evidence card: "Image analysis — yellowing on lower leaves, 72% confidence"
- Answer: "Possible causes: (1) nitrogen deficiency (2) water stress..."
- Upload error: "Fotoğraf yüklenemedi. Tekrar deneyin." (technical detail logged server-side)

### Bad trust UX

- "Location permission denied." (red, English, no path forward)
- Evidence: `[object Object]`
- "Apply 2.4L of Brand X pesticide immediately"

---

## Best Practices

- Log technical errors **server-side only**
- Run vision **before** synthesis when image present
- Persist conversation language on first message lock

## Bad Practices

- Bypassing intelligence engine for "quick prototype"
- Auto-approving knowledge items with treatment dosages
- Training marketing copy that promises certainty

---

## Future Considerations

- **Confidence thresholds** for auto-escalation to human agronomist
- **User-facing model transparency** — "Sources consulted" panel
- **Federated learning** — opt-in anonymized case improvement

---

## Cross-References

- [Book 04 — Full AI Manual](../04-ai-behaviour/)
- [Book 03 — Security](../03-engineering-standards/07-security-standards.md)
- Legacy: `docs/ai-governance-policy.md`
