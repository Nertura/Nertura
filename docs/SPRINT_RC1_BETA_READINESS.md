# RC-1 Release Candidate Sprint

**Codename:** Product Polish • UX • Stability • Beta Readiness  
**Date:** June 2026  
**Scope:** Polish existing surfaces — no new major modules

---

## Completed in RC-1

### UX consistency
- Shared design tokens: `nertura-empty-state`, status badges (open/monitoring/resolved), success pulse animation
- Improved `AiChatThinking` — expert loading card with Knowledge Bank context hint
- Marketing FAQ section; removed raw "Gemini" copy from feature steps
- Outreach + field cases empty states upgraded

### AI Doctor
- Example prompt chips on empty state
- Case banner visual polish
- Premium reports hidden until conversation starts (less clutter)
- Loading UX: "Nertura Agriculture Doctor is thinking…"

### Geo / Map
- Intake auto-geocode loading indicator ("Flying to your intake location…")
- Draw phase tips card (click, undo, min 3 points)
- Success feedback with primary pulse animation

### Field cases
- Patient file framing in sidebar
- Status badges, relative dates, last diagnosis preview
- Refresh button, improved empty state

### Content Engine
- Generation progress label
- Draft preview scroll + citation metadata note

### CRM
- Premium empty state for outreach queue

---

## Verification checklist

```bash
pnpm typecheck
pnpm build
pnpm test:gemini
pnpm test:geo-intelligence
pnpm supabase:push   # should report up to date
```

After build:
```bash
cd apps/dashboard && pnpm dev:fresh
cd apps/admin && pnpm dev:fresh
cd apps/marketing && pnpm dev:fresh
```

---

## RC-2 recommendation

1. Streaming doctor responses (SSE)
2. Case resolve/reopen actions in sidebar
3. Mobile field-case drawer polish
4. Stripe credits live for premium reports
5. Full dark-mode pass on admin tables
6. E2E Playwright smoke suite
