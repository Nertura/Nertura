# Nertura Intelligence

> **Governance for how Nertura thinks, knows, and learns.**

**Version:** 1.0 · June 2026  
**Parent:** [`NERTURA_CORE.md`](../NERTURA_CORE.md)  
**Runtime companion:** Book 04 — AI Behaviour Manual

---

## Purpose

Nertura Intelligence defines **constitutional rules** for AI and knowledge — above implementation details in `packages/ai/`.

The Intelligence Engine (`runIntelligenceEngine`) is the only path to farmer-facing AI answers.

---

## Chapters

| # | Chapter | Topics |
|---|---------|--------|
| 01 | [AI Constitution](01-ai-constitution.md) | Certainty, safety, farmer impact |
| 02 | [Knowledge Constitution](02-knowledge-constitution.md) | Sources, ranking, review |
| 03 | [Evidence Ranking](03-evidence-ranking.md) | Evidence cards, source order |
| 04 | [Confidence System](04-confidence-system.md) | Scores, gates, language |
| 05 | [Learning Rules](05-learning-rules.md) | What may learn; what may not |

---

## Code References

| Component | Path |
|-----------|------|
| Intelligence Engine | `packages/ai/src/intelligence-engine.ts` |
| Knowledge search | `packages/ai/src/knowledge-search.ts` |
| Evidence cards | `packages/ai/src/evidence-cards.ts` |
| Language normalizer | `packages/ai/src/language-output-normalizer.ts` |
| Doctor API | `apps/dashboard/src/app/api/ai/doctor/route.ts` |

---

## Gate Question

Does this make Nertura's advice **more trustworthy and explainable** for the farmer?
