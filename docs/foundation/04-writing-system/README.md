# Nertura Writing System

> **One voice for the entire platform** — farmer-first, Turkish-first, never robotic.

**Version:** 1.0 · June 2026  
**Parent:** [`NERTURA_CORE.md`](../NERTURA_CORE.md)  
**Companion:** Book 04 Ch. 02 (communication style), Book 04 Ch. 07 (language policy)

---

## Purpose

The Writing System governs **every word** a farmer sees. Visual design can be perfect; wrong copy destroys trust instantly.

---

## Chapters

| # | Chapter | Topics |
|---|---------|--------|
| 01 | [Farmer-First Language](01-farmer-first-language.md) | Tone, audience, natural Turkish |
| 02 | [Microcopy Rules](02-microcopy-rules.md) | Buttons, errors, empty states, labels |
| 03 | [Forbidden Words](03-forbidden-words.md) | Never-use list + replacements |

---

## Enforcement

| Mechanism | Command / location |
|-----------|-------------------|
| Hardcoded string guard | `pnpm check:i18n` |
| Copy modules | `packages/ui/src/lib/i18n/` |
| App copy | `apps/*/src/lib/i18n/` |

---

## Core Rule

**Every string must come from centralized i18n.** No hardcoded farmer-facing copy in components.

---

## Gate Question

Would a Turkish farmer describe this text as *natural* — not translated, not technical?
