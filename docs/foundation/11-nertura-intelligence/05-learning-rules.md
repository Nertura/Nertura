# 05 — Learning Rules

## Purpose

What Nertura may learn from — and what requires human control.

---

## Allowed Learning Inputs

| Input | Storage | Auto-promote to KB? |
|-------|---------|-------------------|
| Doctor feedback (👍/👎) | `ai_feedback`, memory events | No |
| Case outcomes | Case timeline, memory | No — informs context only |
| Similar case ranking | Memory engine | No — retrieval only |
| Admin-approved KB ingestion | Knowledge Bank | Yes — after review |
| Conversation history | User-scoped DB | No — context only |

---

## Forbidden Learning

| Action | Why |
|--------|-----|
| Auto-write KB from Gemini output | Hallucination / liability |
| Train on user photos without consent | Privacy |
| Self-modifying prompts in production | Uncontrolled behaviour |
| Cross-tenant learning | Privacy / RLS |

---

## Feedback Loop (Safe)

```
Ask → Infer → Present with confidence → Farmer feedback
  → Store event → Human/analyst review → Optional KB update
```

No step may skip human review for KB promotion.

---

## Future Considerations

- Outcome-labeled dataset for model fine-tuning (Book 04 Ch. 10)
- Regional calibration layers
- All require explicit product decision + ADR

---

## Cross-References

- Book 04 Ch. 03 — Memory systems
- Book 04 Ch. 10 — Intelligence evolution
- Knowledge Constitution
