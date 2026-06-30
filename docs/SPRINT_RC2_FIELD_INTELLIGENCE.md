# Sprint RC-2 — Field Intelligence Experience

Release Candidate phase. Product center shifts from **AI Doctor chat** to **Fields** as the digital twin / agriculture operating system.

## Philosophy

**Before:** AI Doctor → Farm → Field  
**After:** Fields → Cases → Recommendations → AI Doctor

Every AI interaction starts from a field. The user should feel: *"This is MY farm."*

## Delivered

### Dashboard home (`/`)
- Agriculture OS layout: greeting, field cards with health score, active cases, Today placeholders, AI recommendations, AI Doctor CTA, Knowledge, Reports
- Replaces redirect to `/doctor`

### Field workspace (`/fields/[id]`)
- Tabbed workspace: Overview, AI Doctor (link), Cases, Timeline, Reports, History, Boundary (map), Settings
- Health score placeholder, recommendations, last diagnosis placeholders
- Case patient records with Resolve / Reopen / Monitoring / Archive actions

### AI Doctor field context
- Server-loaded greeting when `?fieldId=` is set
- Banner: *"Today I am monitoring your {field} in {location}."*
- Hero copy adapts to field context

### Field intelligence lib
- `health-score.ts` — placeholder score from boundary, cases, crop
- `recommendations.ts` — proactive placeholder cards
- `home-loader.ts`, `field-workspace-loader.ts`

### API
- `GET/PATCH /api/field-cases/[id]` — case detail and status updates

### Navigation
- Home and Fields first in sidebar and mobile nav

## Not in this sprint (placeholders)

- Live weather / disease risk APIs
- Field satellite imagery
- Irrigation/fertilizer logging (metadata placeholders only)
- Premium reports checkout (still gated)
- Full field-scoped history filter

## Tests

```bash
pnpm typecheck
pnpm build
# Smoke: /, /fields, /fields/[id], /doctor?fieldId=, /intake, marketing :3000, admin :3002
pnpm dev:fresh   # after build — never dev on production .next
```

## Production readiness

~82% for closed beta — field-centric UX in place; weather/reports imagery need polish before GA.

## QA closure (June 2026)

- `pnpm typecheck` / `pnpm build` — pass
- Smoke: marketing `/` 200; dashboard auth routes 307→login; admin `/content-engine`, `/outreach` render
- Bugs fixed in closure: reopen cleared `archived` metadata; shell logo → `/`; home/field workspace mobile padding
- RC-2 **CLOSED** for sprint scope; GA blockers remain placeholders (weather, imagery, premium checkout)
