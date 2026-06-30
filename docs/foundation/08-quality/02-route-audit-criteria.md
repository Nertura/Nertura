# 02 — Route Audit Criteria

## Purpose

Standard evaluation checklist for **every route** in Marketing, Dashboard, and Admin.

Use during QA sprints and before public launch.

---

## Routes to Audit

### Marketing (`:3000`)

| Route | Priority |
|-------|----------|
| `/` | P0 |
| `/privacy`, `/terms`, `/kvkk`, `/cookies` | P0 |
| `/[slug]` legal pages | P1 |
| `/api/doctor` | P0 (API) |

### Dashboard (`:3001`)

| Route | Priority |
|-------|----------|
| `/doctor` | P0 |
| `/cases`, `/cases/[id]` | P0 |
| `/login`, `/register`, `/onboarding` | P0 |
| `/history`, `/account`, `/settings` | P1 |
| `/farms`, `/fields/[id]` | P1 |
| Plus-tier routes | P1 |

### Admin (`:3002`)

| Route | Priority |
|-------|----------|
| `/login` | P0 |
| `/knowledge`, `/users` | P1 |
| Growth AI routes | P2 |

---

## Per-Route Evaluation (18 criteria)

For each route, score **Pass / Fail / N/A**:

| # | Criterion | Question |
|---|-----------|----------|
| 1 | **Purpose** | Is the screen's job obvious in 5 seconds? |
| 2 | **User goal** | Can the primary goal be completed? |
| 3 | **Visual hierarchy** | One focal action; no noise |
| 4 | **Trust** | Disclaimers, honest limits, no dark patterns |
| 5 | **Accessibility** | Focus visible; labels; 44px targets |
| 6 | **Performance** | Loads without layout shift; acceptable LCP |
| 7 | **SEO** | (Public only) title, meta, canonical |
| 8 | **Security** | Auth correct; no data leak |
| 9 | **Consistency** | Matches Design + Experience Language |
| 10 | **Responsiveness** | Mobile, tablet, desktop |
| 11 | **Loading** | Skeleton or honest loading state |
| 12 | **Empty state** | Helpful, actionable |
| 13 | **Error state** | TR-friendly + next step |
| 14 | **Success state** | Confirmation when needed |
| 15 | **Animations** | Functional only; reduced-motion respected |
| 16 | **Copy** | Writing System compliant |
| 17 | **AI integration** | (If applicable) Intelligence Engine path |
| 18 | **Premium readiness** | Tier locks honest; no fake paid state |

---

## Audit Record Template

```markdown
## Route: /doctor
Date: YYYY-MM-DD
Auditor: name

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Purpose | Pass | |
...
```

Store completed audits in `docs/testing/` or link from SESSION_SUMMARY.

---

## Automation Proxy

Not all criteria are automatable. Current script coverage:

| Criterion | Automated proxy |
|-----------|-----------------|
| Copy / mixed language | `pnpm check:i18n`, `pnpm test:doctor-language` |
| CSS / consistency | `pnpm check:css-imports`, CSS smoke tests |
| AI path | `pnpm test:no-legacy-chat`, doctor tests |
| Build | `pnpm build`, `pnpm typecheck` |
| Interactions | `pnpm test:dashboard-interactions` |

Manual browser required for: accessibility, animation feel, mobile drawers, cookie banner.

---

## Pass Threshold

- **P0 routes:** 0 Fail on criteria 1–4, 11–13, 16–17
- **P1 routes:** ≤ 1 Fail with documented fix sprint
- **Launch:** All P0 Pass
