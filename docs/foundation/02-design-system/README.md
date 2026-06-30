# Book 02 — Nertura Design System

> **The visual and interaction language of the Agriculture Operating System.**

---

## Purpose

This book defines **how Nertura looks, feels, and behaves in the product**. It is the canonical reference for designers, frontend engineers, and AI agents implementing UI in `packages/ui/` and `apps/dashboard/`. Every screen must feel calm, farmer-first, and ChatGPT-inspired — without visual noise.

Implementation lives in code; this book explains the *why* behind what ships.

---

## Version

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Status | Canonical |
| Last updated | June 2026 |
| Owner | Design + Frontend Lead |
| Code source of truth | `packages/ui/src/`, `packages/ui/tailwind.config.ts`, `packages/ui/src/styles/globals.css` |

---

## Design North Star

Nertura UI should feel like **precision agriculture meets precision software**:

- Calm enough for a farmer in the field at dawn
- Credible enough for a cooperative boardroom
- Intelligent enough to earn trust through evidence, not gimmicks

Influence: **ChatGPT simplicity** (one focal action, conversational layout), **Stripe trust** (typographic clarity, restrained color), **Apple calm** (whitespace, invisible chrome).

---

## Chapters

See [`table-of-contents.md`](table-of-contents.md) for the full index.

| # | Chapter | Summary |
|---|---------|---------|
| 01 | [Design Principles](01-design-principles.md) | Calm, farmer-first, no visual noise |
| 02 | [Color System](02-color-system.md) | void, signal, shadcn HSL tokens |
| 03 | [Typography](03-typography.md) | Inter, scale, chat copy |
| 04 | [Spacing & Layout](04-spacing-and-layout.md) | chat-container, cards, panels |
| 05 | [Responsive Behavior](05-responsive-behavior.md) | Breakpoints, 73/27 map split |
| 06 | [Components Foundation](06-components-foundation.md) | Button, Card, Input, Alert, CVA |
| 07 | [Doctor UI](07-doctor-ui.md) | AiChatShell, DoctorAnswerCard, composer |
| 08 | [Map UI](08-map-ui.md) | MapView, farm-map-client patterns |
| 09 | [Farm & Field UI](09-farm-and-field-ui.md) | Field cards, farm selector |
| 10 | [History UI](10-history-ui.md) | Conversations, field cases |
| 11 | [States: Loading, Empty, Error](11-states-loading-empty-error.md) | Friendly errors, info vs destructive |
| 12 | [Accessibility & Motion](12-accessibility-and-motion.md) | WCAG, reduced motion |
| 13 | [Dark & Light Mode](13-dark-and-light-mode.md) | `class` strategy, ThemeProvider |
| 14 | [Interaction Principles](14-interaction-principles.md) | Progressive disclosure, ChatGPT flow |

---

## Related Books

- Product philosophy → [Book 01 — Product Bible](../01-product-bible/) (farmer psychology, calm UX in [07-product-principles.md](../01-product-bible/07-product-principles.md))
- Implementation law → [Book 03 — Engineering Standards](../03-engineering-standards/)
- AI answer structure → [Book 04 — AI Behaviour Manual](../04-ai-behaviour/)
- Credits and limits UI → [Book 05 — Growth & Business Manual](../05-growth-business/)

---

## Code Cross-References

| Domain | Primary paths |
|--------|---------------|
| Shared UI package | `packages/ui/src/` |
| Tailwind tokens | `packages/ui/tailwind.config.ts` |
| CSS variables | `packages/ui/src/styles/globals.css` |
| Doctor chat | `apps/dashboard/src/components/doctor/chat-app.tsx` |
| Farm map | `apps/dashboard/src/components/farm/farm-map-client.tsx` |
| Dashboard layout | `apps/dashboard/src/app/layout.tsx` |

---

## Legacy References

This book supersedes narrative sections of `docs/design-system.md` where they conflict with shipped code. The legacy doc remains useful for brand asset paths (`/brand/`) until fully migrated.

---

*Nertura Design System v1.0 · June 2026 · Grounded in `packages/ui`.*
