# Next Session — Post P0 Lock

**Updated:** 2026-06-28

---

## P0 — Closed ✅

| # | Task | Status |
|---|------|--------|
| 1 | Cookie consent banner (KVKK/GDPR) | ✅ Done (prior sprint) |
| 2 | Wire `resolveUserTier()` to subscription metadata | ✅ Done |
| 3 | Remove `/api/ai/chat` legacy route | ✅ Done (410) |
| 4 | GitHub Actions CI pipeline | ✅ Done |
| 5 | CSS smoke + globals.css guard | ✅ Done |
| 6 | Vision Turkish depth + test | ✅ Done |
| 7 | Doctor language lock tests | ✅ Done |

---

## P0 remaining before closed beta sign-off

| # | Task | Hours |
|---|------|-------|
| 1 | **Execute full `MANUAL_QA_CHECKLIST_v1.md` in browser** | 8–12 |
| 2 | Configure GitHub Actions secrets + verify green CI | 1–2 |
| 3 | Production RLS verify (`pnpm supabase:verify:rls`) | 2–4 |

---

## P1 — Public beta (est. 80–120h)

| # | Task | Hours |
|---|------|-------|
| 4 | Stripe checkout wired to account page | 16–24 |
| 5 | Legal TR bodies for privacy/terms/cookies (lawyer review) | 24–40 |
| 6 | In-app delete account + data export flows | 24–32 |
| 7 | Distributed rate limits (Upstash/Redis) | 16–24 |
| 8 | WCAG accessibility pass on Doctor + auth | 32–48 |
| 9 | Playwright E2E smoke suite | 24–40 |

---

## Dev server note

Do **not** run `pnpm build` (turbo) while `pnpm dev:fresh` servers are running — concurrent writes to `.next` cause marketing 500s. Stop dev servers first, or run CSS smoke only against live dev.

**CSS smoke startup:**
```bash
pnpm --filter @nertura/marketing dev:fresh   # :3000
pnpm --filter @nertura/dashboard dev:fresh  # :3001
pnpm test:marketing-css && pnpm test:dashboard-css
```

**Plus tier QA:**
```bash
NEXT_PUBLIC_NERTURA_DEV_TIER=plus pnpm --filter @nertura/dashboard dev:fresh
```

---

## Gate question

Does the next task help the farmer solve the problem faster?

**Yes:** browser QA, Stripe, legal TR bodies.  
**No:** new features before closed beta validation.
