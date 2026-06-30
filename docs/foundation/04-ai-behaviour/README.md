# Book 04 — Nertura AI Behaviour Manual

> **How Nertura thinks, speaks, remembers, and refuses to overclaim.**

---

## Purpose

This book is the operational contract for Nertura's agricultural intelligence layer. It describes **what the AI must do**, **what it must never do**, and **how behaviour is enforced in code** — primarily in `packages/ai/src/`.

Every engineer, prompt author, and AI agent working on diagnosis, vision, memory, or language must treat these chapters as binding. Product and design should reference them when defining UX that surfaces confidence, evidence, or follow-ups.

---

## Version

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Status | Canonical |
| Last updated | June 2026 |
| Owner | AI Platform / Chief Product Officer |
| Source of truth | `packages/ai/src/` |

---

## Chapters

See [`table-of-contents.md`](table-of-contents.md) for the full index.

| # | Chapter | Summary |
|---|---------|---------|
| 01 | [AI Architecture Overview](01-ai-architecture-overview.md) | `runIntelligenceEngine` pipeline; never raw Gemini |
| 02 | [Communication Style](02-communication-style.md) | Short first, structured sections, tone rules |
| 03 | [Memory Systems](03-memory-systems.md) | Field memory, conversation, disease history, `ai_memory_events` |
| 04 | [Confidence & Uncertainty](04-confidence-and-uncertainty.md) | Low-confidence gates; never claim certainty |
| 05 | [Vision-First Pipeline](05-vision-first-pipeline.md) | Gemini vision, species validation, `VISION_MIN_CONFIDENCE` |
| 06 | [Knowledge Bank & Evidence](06-knowledge-bank-and-evidence.md) | Evidence card types, review queue |
| 07 | [Language Policy](07-language-policy.md) | TR/EN, conversation lock, no mixed language |
| 08 | [Photo-Only & Follow-Ups](08-photo-only-and-follow-ups.md) | Photo without text behaviour |
| 09 | [Safety & Agricultural Ethics](09-safety-and-agricultural-ethics.md) | No auto dosages, disclaimers |
| 10 | [Intelligence Evolution](10-intelligence-evolution.md) | Feedback, similar cases, outcomes |

---

## Core Modules

| Module | Responsibility |
|--------|----------------|
| `intelligence-engine.ts` | Orchestration: intent, entities, doctor pipeline, evidence, memory events |
| `knowledge-bank-doctor.ts` | KB search, vision gates, Gemini synthesis, fallbacks |
| `vision-analysis.ts` | Vision parsing, species validation, clarification answers |
| `evidence-cards.ts` | Transparent source cards shown to users |
| `answer-formatter.ts` | Nertura section structure and display formatting |
| `conversation-language.ts` | TR/EN resolution, lock, photo-only detection |

---

## Related Books

- Company constitution → [Book 01 — Product Bible](../01-product-bible/)
- Design execution → [Book 02 — Design System](../02-design-system/)
- Implementation standards → [Book 03 — Engineering Standards](../03-engineering-standards/)
- Business → [Book 05 — Growth & Business Manual](../05-growth-business/)

---

## Legacy References

This book consolidates and supersedes narrative sections of:

- `docs/nertura-brain-architecture.md`
- `docs/NERTURA_ARCHITECTURE_BIBLE.md` (AI / memory sections)
- `docs/knowledge-ingestion.md` (review queue cross-reference)
