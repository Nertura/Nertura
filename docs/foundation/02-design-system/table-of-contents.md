# Book 02 — Table of Contents

> Nertura Design System · v1.0 · June 2026

---

## Foundation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Book overview, version, code paths |
| [table-of-contents.md](table-of-contents.md) | This index |

---

## Part I — Principles & Tokens

| # | Chapter | Topics |
|---|---------|--------|
| 01 | [Design Principles](01-design-principles.md) | Calm UX, farmer-first, ChatGPT-inspired, no noise |
| 02 | [Color System](02-color-system.md) | void `#0B1220`, signal `#2DDAAF`, HSL semantic tokens |
| 03 | [Typography](03-typography.md) | Inter, headings, chat body copy, tabular numbers |
| 04 | [Spacing & Layout](04-spacing-and-layout.md) | `--chat-max-width`, card padding, panel scroll |
| 05 | [Responsive Behavior](05-responsive-behavior.md) | 1920 / 1366 / tablet / mobile, 73/27 map split |

---

## Part II — Components & Patterns

| # | Chapter | Topics |
|---|---------|--------|
| 06 | [Components Foundation](06-components-foundation.md) | Button, Card, Input, Alert, CVA, `cn()` |
| 07 | [Doctor UI](07-doctor-ui.md) | AiChatShell, DoctorAnswerCard, composer, evidence |
| 08 | [Map UI](08-map-ui.md) | MapView, geolocation cards, drawing overlay |
| 09 | [Farm & Field UI](09-farm-and-field-ui.md) | Field cards, FieldContextSelector |
| 10 | [History UI](10-history-ui.md) | Conversations drawer, field cases panel |

---

## Part III — Quality & Interaction

| # | Chapter | Topics |
|---|---------|--------|
| 11 | [States: Loading, Empty, Error](11-states-loading-empty-error.md) | `friendlyAiError`, Alert variants |
| 12 | [Accessibility & Motion](12-accessibility-and-motion.md) | SkipLink, ARIA, animations |
| 13 | [Dark & Light Mode](13-dark-and-light-mode.md) | `darkMode: ['class']`, ThemeProvider |
| 14 | [Interaction Principles](14-interaction-principles.md) | Progressive disclosure, one action per view |
| 15 | [Design System Architecture](15-design-system-architecture.md) | Single CSS source, app import rules, regression guards |

---

## Reading Paths

| Role | Suggested order |
|------|-----------------|
| **Designer** | 01 → 02 → 03 → 04 → 07 → 14 |
| **Frontend engineer** | 06 → 02 → 13 → 07 → 08 → 11 |
| **AI agent (Cursor)** | README → 06 → 07 → 11 → cross-ref Book 03 |
| **New hire onboarding** | Book 01 ch. 05 + 07 → Book 02 ch. 01 → 06 → 07 |

---

## External Links

- [Book 01 — Product Bible](../01-product-bible/)
- [Book 03 — Engineering Standards](../03-engineering-standards/)
- [Foundation library index](../README.md)
