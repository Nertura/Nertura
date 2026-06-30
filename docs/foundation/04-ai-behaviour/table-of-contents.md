# Book 04 — Table of Contents

## Part I — Architecture

1. [AI Architecture Overview](01-ai-architecture-overview.md)
2. [Communication Style](02-communication-style.md)

## Part II — Context & Trust

3. [Memory Systems](03-memory-systems.md)
4. [Confidence & Uncertainty](04-confidence-and-uncertainty.md)
5. [Vision-First Pipeline](05-vision-first-pipeline.md)
6. [Knowledge Bank & Evidence](06-knowledge-bank-and-evidence.md)

## Part III — Interaction Rules

7. [Language Policy](07-language-policy.md)
8. [Photo-Only & Follow-Ups](08-photo-only-and-follow-ups.md)

## Part IV — Safety & Learning

9. [Safety & Agricultural Ethics](09-safety-and-agricultural-ethics.md)
10. [Intelligence Evolution](10-intelligence-evolution.md)

---

## Quick Reference

**The one pipeline:** `runIntelligenceEngine` → `runKnowledgeBankDoctor` → Nertura-formatted answer + evidence cards + memory event.

**The one rule:** Never expose raw Gemini output to the farmer. Every answer passes through Nertura sections, disclaimers, and confidence gates.

**The one threshold:** Vision confidence below `0.52` → clarification, not diagnosis.

**The one language rule:** Conversation language is locked (`tr` or `en`); no mixed-language replies.
