# Nertura — Agent Instructions



## Constitution (read first)



**[`docs/foundation/CONSTITUTION.md`](docs/foundation/CONSTITUTION.md)**



The Foundation is **supreme law**. No feature, UI change, AI behavior, API, schema, or product decision may contradict it.



When Foundation and code disagree, **Foundation wins** until explicitly updated by the product team.



---



## Nertura Core (read second)



**[`docs/foundation/NERTURA_CORE.md`](docs/foundation/NERTURA_CORE.md)**



Every task passes:



```

Constitution → Nertura Core → Operating System → Review System → Code

```



**No isolated feature work.**



---



## Mandatory workflow — every task



1. **Read** relevant Core + Foundation chapters (see read order below)

2. **Identify** chapters for this task

3. **State compliance** — before writing code or docs

4. **Answer gate question:** Does this help the farmer make a better decision faster?

5. **Implement** to match compliance statement

6. **Run quality matrix** (see below)

7. **Complete 12-dimension review** when merging (see Review System)

8. **Produce 14-item sprint report** at sprint end



### Read order (mandatory)



1. `docs/foundation/CONSTITUTION.md`

2. `docs/foundation/NERTURA_CORE.md`

3. Task-specific Core layer (Experience / Writing / Intelligence / Quality / Review)

4. Relevant Five Book chapter(s)

5. `docs/foundation/PRE_COMMIT_CHECKLIST.md`



### Compliance template



```

Foundation: docs/foundation/[core-or-book]/[chapter].md

Compliance: [1–3 sentences]

Gate question: [yes/no + rationale]

12-dimension review: [total /120 or N/A for docs-only]

```



---



## Quality matrix



Run whenever possible:



```bash

pnpm typecheck

pnpm build

pnpm check:i18n

pnpm check:css-imports

pnpm test:doctor-language

pnpm test:dashboard-doctor

pnpm test:projects-engine

pnpm test:dashboard-interactions

pnpm test:marketing-css    # requires :3000

pnpm test:dashboard-css     # requires :3001

pnpm test:admin-css          # requires :3002

```



---



## Sprint report (required at end of every sprint)



1. Foundation chapters used

2. Compliance statement

3. Gate question result

4. Files modified

5. Architectural decisions

6. Security review

7. Performance review

8. SEO review

9. Accessibility review

10. Responsive review

11. Tests executed

12. Production readiness score

13. Remaining blockers

14. Recommended next sprint



---



## Core layers quick map



| Layer | Path |

|-------|------|

| Experience Language | `docs/foundation/03-experience-language/` |

| Writing System | `docs/foundation/04-writing-system/` |

| Quality / DoD | `docs/foundation/08-quality/` |

| Security principles | `docs/foundation/09-security/` |

| Intelligence Constitution | `docs/foundation/11-nertura-intelligence/` |

| Review System | `docs/foundation/12-review-system/` |

| Decision Archive | `docs/foundation/10-decision-archive/` |



## Five books



| Book | Path |

|------|------|

| Product Bible | [`docs/foundation/01-product-bible/`](docs/foundation/01-product-bible/) |

| Design System | [`docs/foundation/02-design-system/`](docs/foundation/02-design-system/) |

| Engineering Standards | [`docs/foundation/03-engineering-standards/`](docs/foundation/03-engineering-standards/) |

| AI Behaviour Manual | [`docs/foundation/04-ai-behaviour/`](docs/foundation/04-ai-behaviour/) |

| Growth & Business | [`docs/foundation/05-growth-business/`](docs/foundation/05-growth-business/) |



---



## Monorepo (dev)



```bash

pnpm install

pnpm dev          # marketing :3000, dashboard :3001, admin :3002

pnpm typecheck

pnpm lint

pnpm check:css-imports

pnpm check:i18n

```



## Design system CSS (non-negotiable)



- App `layout.tsx`: **only** `import './globals.css'`

- App `globals.css`: **only** `@import "@nertura/ui/globals.css"`

- Shared styles: `packages/ui/src/styles/`

- See [`02-design-system/15-design-system-architecture.md`](docs/foundation/02-design-system/15-design-system-architecture.md)



## Writing system (non-negotiable)



- Farmer-facing: **analiz hakkı** not "credits"

- Centralized i18n only — `pnpm check:i18n`

- See [`04-writing-system/`](docs/foundation/04-writing-system/)



## Authority



1. **Constitution + Nertura Core** — wins over code

2. **Five Books** — domain law

3. **Code** — when Foundation is silent

4. **Legacy docs** — reference only



## Current priority



Nertura Core governance · production stabilization · consistency · no contradictions.

