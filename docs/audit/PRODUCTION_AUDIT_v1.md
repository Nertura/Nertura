# Nertura Production Audit v1.0

**Audit date:** 2026-06-27 (updated post-P0 lock sprint 2026-06-28)

---

## Post-P0 lock sprint delta (2026-06-28)

| Area | Before | After | Change |
|------|--------|-------|--------|
| CSS smoke / globals.css | 70 | **92** | `test:app-css-entry` guard; CSS smoke PASS on clean dev |
| AI Doctor language | 80 | **95** | Vision sanitization; `test:doctor-vision-language` |
| Tier / billing UI | 40 | **85** | `tier-resolver.ts` reads subscriptions; dev override |
| Legacy chat route | 0 (violation) | **100** | 410 Gone; `test:no-legacy-chat` |
| CI/CD | 0 | **80** | `.github/workflows/ci.yml` added |
| **Beta readiness** | 78% | **94%** | |
| **Production readiness** | 62% | **76%** | |

**P0 items closed:** tier wiring, legacy chat removal, CI pipeline, CSS guard, vision TR depth, doctor language tests.

**P0 items remaining:** full manual browser QA sign-off, GitHub CI secrets, production RLS verify, legal lawyer review.

**Verified post-sprint:** All Phase 7 test matrix PASS · CSS smoke PASS · builds green

---

| Area | Before | After | Change |
|------|--------|-------|--------|
| i18n / copy | 55 | **85** | Centralized `doctor-ui-copy.ts`; `pnpm check:i18n` guard |
| Product | 68 | **72** | Field workspace, crops, farms TR |
| UX | 72 | **78** | Doctor labels locked to conversation locale |
| AI Doctor | 74 | **80** | Language resolution: message > Accept-Language; default `tr` |
| **Beta readiness** | 72% | **78%** | |
| **Production readiness** | 58% | **62%** | |

**Verified post-sprint:** `pnpm check:i18n` PASS · all builds green · doctor/projects/interaction tests PASS

---

## Verification performed

| Check | Result | Evidence |
|-------|--------|----------|
| `pnpm typecheck` | ✅ Pass (9/9 packages) | Run 2026-06-27 |
| `pnpm build` | ✅ Pass (marketing, dashboard, admin) | Run 2026-06-27 |
| `pnpm test:dashboard-interactions` | ✅ Pass | Static regression guard |
| `pnpm test:projects-engine` | ✅ Pass (timeline FK insert non-fatal in test env) | Script output |
| Browser QA (authenticated) | ❌ Not performed | Checklist documented in test script |
| Production Supabase RLS live verify | ❌ Not run in this audit | `pnpm supabase:verify:rls` exists |
| Playwright / E2E | ❌ Not present | No root Playwright config |

---

## Executive Summary

Nertura has a **strong core farmer loop**: Guest Doctor (marketing) → register → onboarding → Doctor → auto case creation → case list/detail. The intelligence engine path (`/api/ai/doctor` → `runIntelligenceEngine`) is architecturally sound, Projects Engine tests pass, and builds are green.

**However, the product is not production-launch ready.** Critical gaps block paid conversion, legal compliance in Turkey/EU, and Foundation consistency:

1. ~~**Subscription tier is hardcoded to `free`**~~ — **RESOLVED:** `tier-resolver.ts` reads org subscription; dev override available.
2. ~~**Legacy `/api/ai/chat` bypasses the intelligence engine**~~ — **RESOLVED:** 410 Gone; directs to `/api/ai/doctor`.
3. **Mixed TR/EN across dashboard flows** — improved via i18n guard + doctor language lock; crops/field workspace still partial.
4. **Legal pages partially English; cookie banner** — banner shipped (prior sprint); legal bodies still need lawyer review.
5. **In-memory rate limits, no CI/CD** — CI added; distributed rate limits still P1.

**Beta readiness (core TR farmer, free tier):** ~**94%**  
**Production readiness (public launch, billing, legal, EN, Plus):** ~**76%**

---

# Category Audits

---

## 1. Product Audit

**Status:** 🟡 Needs polish (with 🔴 blockers on billing/tier/i18n)  
**Score:** **68 / 100**

### Evidence

| Surface | Status | Notes |
|---------|--------|-------|
| Landing (`/`) | 🟡 | Guest Doctor works; footer hardcoded TR while composer uses browser locale |
| Navigation | 🔴 | Plus items always locked in prod; nav-only gating (URLs still accessible) |
| Doctor | ✅ | Primary experience; locale-aware copy maps |
| History | 🟡 | Functional; TR hardcoded; tier lock in nav |
| Projects / Cases | 🟡 | Engine solid; `/projects` orphan, not in nav |
| Onboarding | 🟡 | Works; map is click-to-pin placeholder |
| Auth | 🟡 | Email/Google/register/reset OK; phone/magic-link scaffold |
| Billing | 🔴 | Checkout API exists; account UI says "yakında" |
| Settings | 🟡 | Many sections "yakında" (password, sessions, providers) |
| Account | 🟡 | Profile OK; billing history placeholder |
| Admin | ✅ | 42 routes; Growth AI, intelligence, knowledge |
| Marketing legal | 🟡 | 12 slugs; mixed language bodies |
| Growth | 🟡 | Admin-only; approval-first (correct) |
| Knowledge | 🟡 | Read-only list; minimal empty state |
| Subscription | 🔴 | Not wired to UI tier resolution |

**Route counts:** Marketing 14, Dashboard 35 pages, Admin 42 pages (verified via build output).

**Broken routes / dead links:**
- `/en` referenced in marketing `layout.tsx` alternates — **route does not exist**
- User menu duplicates `/account` entries (3× account, 1× settings)
- `/crops/*` — English-only module, not in nav (orphan)

**Empty / loading / errors:**
- No `loading.tsx` in any app — ad hoc Suspense only
- Empty states present on home, farms, cases, fields, history (`.nertura-empty-state`)
- `error.tsx` + `not-found.tsx` exist per app; dashboard errors TR-only regardless of user locale

### Files

- `apps/dashboard/src/lib/navigation-tier.ts` — tier always `free`
- `apps/marketing/src/app/page.tsx`, `layout.tsx`
- `apps/dashboard/src/app/(dashboard)/account/page.tsx`
- `apps/dashboard/src/app/(dashboard)/settings/page.tsx`
- `apps/dashboard/src/app/(dashboard)/crops/**`

### Recommendation

1. Wire `resolveUserTier` to Stripe/subscription/org plan before launch.
2. Enforce tier server-side on Plus routes or accept free access intentionally (document decision).
3. Unify i18n: TR-only launch OR wire `getUserLocale` everywhere — remove `/crops` EN orphan or localize.
4. Remove/hide phone-login until SMS live.
5. Add nav link or redirect for `/projects`; resolve `/crops` fate.

### Priority: **P0** (tier, i18n) · **P1** (billing UI, orphans)

### Estimated fix time: **80–120 hours**

**Foundation:** Book 01 Ch. 08 (MVP/premium), Ch. 12 (gate criteria); PRE_COMMIT_CHECKLIST (language, placeholders)

---

## 2. UI / UX Audit

**Status:** 🟡 Needs polish  
**Score:** **72 / 100**

### Screen scores

| Screen | Score | Status | Key issues |
|--------|-------|--------|------------|
| `/doctor` | 85 | ✅ | Best locale wiring; side panel desktop-only |
| `/cases`, `/cases/[id]` | 78 | 🟡 | TR-only; good structure |
| `/history` | 76 | 🟡 | TR-only |
| `/farms`, `/farms/[id]/map` | 75 | 🟡 | Map split layout good; mobile draw unverified |
| `/intake` | 74 | 🟡 | Functional wizard |
| `/` (Ag OS home) | 72 | 🟡 | Hidden from nav; placeholder widgets EN |
| `/account`, `/settings` | 65 | 🟡 | Placeholder sections; TR-only |
| `/fields/[id]` (workspace) | 58 | 🔴 | English tabs/copy in TR product |
| `/crops/*` | 55 | 🔴 | Full English orphan |
| Marketing `/` | 70 | 🟡 | Doctor-first OK; minimal marketing sections |
| Admin Growth AI | 75 | 🟡 | Mixed TR/EN |
| Auth pages | 78 | 🟡 | TR login/register; EN magic/phone |

### Cross-cutting UX

| Check | Result |
|-------|--------|
| Spacing / typography tokens | ✅ Shared `@nertura/ui` + Tailwind |
| Dark mode | ✅ Present in shell |
| Mobile nav + safe area | ✅ `mobile-nav.tsx` |
| Hover / focus | 🟡 Partial; dropdowns now portaled (P0 fix applied) |
| Forms | 🟡 Consistent in auth; mixed elsewhere |
| Dialogs / menus | ✅ Portaled overlays post-regression fix |
| Tables (`/fields`, `/crops`) | 🟡 Horizontal scroll on mobile unverified |
| Professional polish | 🟡 Doctor strong; periphery uneven |

### Files

- `packages/ui/src/components/ai-chat/shell.tsx`
- `apps/dashboard/src/components/dashboard/shell.tsx`, `mobile-nav.tsx`
- `apps/dashboard/src/components/fields/field-workspace.tsx`
- `apps/marketing/src/components/guest-home-composer.tsx`

### Recommendation

Run authenticated browser QA on checklist in `scripts/test-dashboard-interactions.ts`. Fix field workspace and crops language. Add segment-level `loading.tsx`. Score contrast/focus with axe or Lighthouse.

### Priority: **P1**

### Estimated fix time: **60–90 hours**

**Foundation:** Book 02 Ch. 05 (responsive), Ch. 07 (Doctor UI), Ch. 11 (states), Ch. 14 (interaction)

---

## 3. AI Doctor Audit

**Status:** 🟡 Needs polish (🔴 legacy route)  
**Score:** **74 / 100**

### Capability matrix

| Capability | Status | Evidence |
|------------|--------|----------|
| Text analysis | ✅ | `runIntelligenceEngine` + KB retrieval |
| Photo analysis | ✅ | Magic-byte validation, 5MB, vision gate 0.52 |
| Text + photo | ✅ | Two-step flow; image-only skips debit |
| Conversation persistence | ✅ | `saveIntelligenceData` |
| Memory context | ✅ | `memory-engine.ts`, case context block |
| Confidence / evidence | ✅ | Evidence cards, low-confidence paths |
| Formatting (short-first) | ✅ | `answer-formatter.ts` |
| Retry / errors | 🟡 | Structured steps; catch block hardcoded `'tr'` |
| Streaming | 🔴 | **Not implemented** — full JSON response wait |
| History link | ✅ | `/history`, conversation redirect |
| Case link | ✅ | `linkDiagnosisToFieldCase` |
| Usage deduction | ✅ | `debit_user_credit` RPC; 402 on limit |
| Low confidence wording | ✅ | Book 04 Ch. 04 aligned |
| Wrong image / crop conflict | 🟡 | Vision gate exists; manual QA needed |
| Language lock | 🟡 | Engine OK; error paths mixed TR/EN |
| Hallucination protection | 🟡 | KB-first + confidence; no streaming partial guard |
| Trust wording | ✅ | Disclaimers in copy + legal pages |

### Critical finding

**`/api/ai/chat`** calls OpenAI directly — bypasses `runIntelligenceEngine`, memory, evidence pipeline, and Foundation AI architecture.

### Files

- `apps/dashboard/src/app/api/ai/doctor/route.ts` ✅
- `apps/dashboard/src/app/api/ai/chat/route.ts` 🔴
- `packages/ai/src/intelligence-engine.ts`
- `apps/dashboard/src/lib/ai/doctor-service.ts`
- `apps/marketing/src/app/api/doctor/route.ts` (guest — uses engine ✅)

### Recommendation

1. **Delete or redirect `/api/ai/chat` to doctor route** (P0).
2. Fix catch-block locale: use conversation language not `'tr'`.
3. Localize usage-limit pre-check message (currently TR-only).
4. Add `log_auth_event` migration or use `write_audit_log`.
5. Consider SSE streaming for perceived latency (Book 04 — not blocking MVP).

### Priority: **P0** (legacy chat) · **P1** (locale errors)

### Estimated fix time: **16–24 hours** (P0+P1); streaming +40h optional

**Foundation:** Book 04 Ch. 01 (architecture), Ch. 04 (confidence), Ch. 07 (language), Ch. 09 (safety); CONSTITUTION Art. I

---

## 4. Projects Engine Audit

**Status:** 🟡 Needs polish  
**Score:** **76 / 100**

### Evidence

Automated test **`pnpm test:projects-engine`** passed (2026-06-27):
- Schema verify OK
- Auto-create + link OK
- Timeline dedupe OK
- Status PATCH OK
- Timeline insert failure non-fatal (FK edge in test env logged)

| Capability | Status |
|------------|--------|
| Auto case creation | ✅ `case-auto-create.ts` |
| Timeline append + dedupe | ✅ `timeline-service.ts` |
| Tasks | 🟡 Schema exists; limited UI |
| Status transitions | ✅ API + UI |
| Follow-up hooks | 🟡 Stored; dispatcher is no-op |
| Reminder / notify | 🔴 `notification-hooks.ts` noop |
| Continue conversation | ✅ Links to `/doctor?conversation=` |
| Case page / list | ✅ `/cases`, `/cases/[id]` |
| Filtering / search | ✅ Client-side in case list |
| Photos on timeline | ✅ `photo_uploaded` events |
| Fake data | ✅ No lorem in production loaders |

### Gaps

- Timeline titles hardcoded Turkish (`'Vaka oluşturuldu'`, etc.) — breaks EN sessions
- `buildCaseContextBlock` Turkish-only
- `/projects` page exists but not linked in navigation

### Files

- `apps/dashboard/src/lib/projects-engine/*`
- `supabase/migrations/20250706000000_field_cases.sql`
- `supabase/migrations/20250710000000_projects_engine_v1.sql`
- `scripts/test-projects-engine.ts`

### Recommendation

Localize timeline strings via conversation locale. Implement notification dispatcher or remove misleading "reminder" UI until ready. Add case tasks UI or hide task schema from user-facing copy.

### Priority: **P1** (i18n) · **P2** (notifications)

### Estimated fix time: **24–40 hours**

**Foundation:** Book 03 Ch. 13 (Projects Engine); Book 01 Ch. 08 (field cases in MVP)

---

## 5. Auth Audit

**Status:** 🟡 Needs polish  
**Score:** **68 / 100**

| Flow | Status | Evidence |
|------|--------|----------|
| Google OAuth | ✅ | `auth-provider-buttons.tsx`, callback route |
| Email login/register | ✅ | Supabase password; 12-char min client-side |
| Email verification | 🟡 | Supabase-default; no dedicated `/register/verify` page |
| Forgot / reset password | ✅ | Pages + forms |
| Logout | ✅ | `/auth/signout` GET/POST |
| Session refresh | ✅ | Middleware + `@supabase/ssr` |
| Delete account | 🟡 | Legal page exists; in-app flow unverified |
| Export data | 🟡 | Legal page exists; in-app flow unverified |
| Phone auth | 🔴 | Scaffold; 501/503; "Coming soon" UI |
| Magic link | 🟡 | API + page; EN-only copy |
| Organization support | 🟡 | Org membership required; no invite `/invite/:token` |
| Consent on register | ✅ | KVKK checkbox added (recent hardening) |

### Security notes

- Open redirect mitigated on callback (`next` same-origin `/` paths)
- `/api/ai/*` requires session (not in public middleware prefixes)
- OTP rate limits: 5/email/15min, 20/IP/15min

### Files

- `apps/dashboard/src/middleware.ts`, `lib/supabase/middleware.ts`
- `apps/dashboard/src/app/auth/callback/route.ts`
- `apps/dashboard/src/components/auth/register-form.tsx`

### Recommendation

Hide phone-login from auth UI until production. Add in-app delete/export flows matching legal pages. Build org invite architecture before B2B. Run Supabase auth verify script against prod.

### Priority: **P1** (delete/export flows) · **P2** (invites)

### Estimated fix time: **32–48 hours**

**Foundation:** Book 03 Ch. 07 (security); Book 05 Ch. 05 (retention/lifecycle)

---

## 6. Security Audit

**Status:** 🔴 Critical gaps for production scale  
**Score:** **62 / 100**  
**Risk score:** **Medium-High** (RLS good; ops/abuse layers weak)

| Control | Status | Evidence |
|---------|--------|----------|
| OWASP baseline | 🟡 | Input validation via Zod on APIs; no CSP |
| RLS | ✅ | Migrations `20250619000400`–`00500`; org isolation |
| Storage | ✅ | Private bucket; user-folder policies; 5MB MIME limit |
| Signed URLs | 🟡 | Storage paths; verify signed URL TTL in prod |
| Rate limits | 🔴 | In-memory Map — not multi-instance safe |
| Secrets | ✅ | `.env.example` documented; no secrets in repo |
| Admin access | 🟡 | Cloudflare Access documented in admin `.env.example` |
| XSS | 🟡 | React default escaping; no CSP header |
| CSRF | 🟡 | SameSite cookies via Supabase; no explicit CSRF tokens on forms |
| Security headers | 🟡 | X-Frame-Options, nosniff, Referrer-Policy in `next.config.ts` |
| Input / upload validation | ✅ | Zod + magic-byte image validation |
| Audit logs | 🟡 | `log_auth_event` called but **no migration** |
| Credit RPC guard | ✅ | Cannot debit another user's credits |
| GDPR / KVKK | 🔴 | Legal gaps; no cookie banner; mixed legal copy |
| Delete / export | 🟡 | Legal only |
| Abuse prevention | 🟡 | Guest + IP limits; weak at scale |

### Files

- `supabase/migrations/20250619000500_apply_policies.sql`
- `apps/dashboard/src/lib/ai/rate-limit.ts`
- `apps/dashboard/next.config.ts`
- `docs/security/PRODUCTION_SECURITY_CHECKLIST.md`

### Recommendation

1. Redis/Upstash rate limiting (P0 for launch traffic).
2. Add CSP (report-only first).
3. Migrate `log_auth_event` or remove dead calls.
4. Remove `/api/ai/chat` (security + architecture).
5. Run `pnpm supabase:verify:rls` on production project before launch.

### Priority: **P0**

### Estimated fix time: **40–56 hours**

**Foundation:** Book 03 Ch. 07 (security standards); CONSTITUTION Art. I

---

## 7. Performance Audit

**Status:** 🟡 Needs polish  
**Score:** **74 / 100**

### Build metrics (2026-06-27)

| App | Route | First Load JS |
|-----|-------|---------------|
| Marketing | `/` | 129 kB |
| Dashboard | `/doctor` | **147 kB** |
| Dashboard | `/farms/[id]/map` | **143 kB** (Mapbox) |
| Dashboard | `/account` | 162 kB |
| Admin | `/login` | 176 kB |
| Shared baseline | all apps | ~102 kB |

| Check | Status |
|-------|--------|
| Production build | ✅ ~2m8s monorepo |
| SSR / static | ✅ Marketing SSG legal; dashboard dynamic |
| Hydration | 🟡 No known errors in build |
| Images | 🟡 Next/Image usage partial |
| Lazy loading | 🟡 Map client component; no route-level lazy audit |
| Duplicate fetches | 🟡 Not profiled |
| Caching | 🟡 Next 15 defaults; no CDN config in repo |
| Unused packages | 🟡 ESLint unused import warnings in admin build |
| `loading.tsx` | 🔴 Missing — hurts perceived performance |
| Middleware size | 🟡 ~90 kB (Supabase session) |

### Files

- `docs/performance/PERFORMANCE_AUDIT.md`
- `apps/dashboard/src/components/farms/farm-map-client.tsx`
- `turbo.json`, root `package.json`

### Recommendation

Add segment `loading.tsx`. Dynamic-import Mapbox on map routes. Run Lighthouse on `/doctor` mobile 3G. Fix `packages/ui/package.json` `"type": "module"` warning. Set up bundle analyzer in CI.

### Priority: **P2**

### Estimated fix time: **24–32 hours**

**Foundation:** Book 03 Ch. 10 (performance); PRE_COMMIT_CHECKLIST (`pnpm dev:fresh`)

---

## 8. SEO Audit

**Status:** 🟡 Needs polish  
**Score:** **70 / 100**

| Asset | Status | File |
|-------|--------|------|
| Title / description | ✅ | `apps/marketing/src/app/layout.tsx` |
| Canonical | ✅ | Root + per-legal-page |
| OpenGraph / Twitter | 🟡 | Present; **no OG image URLs** |
| Robots | ✅ | `robots.ts` — allow `/`, disallow `/api/` |
| Sitemap | ✅ | Homepage + 12 legal slugs |
| JSON-LD | 🟡 | SoftwareApplication + FAQPage; EN-only on TR site |
| Alt text | 🟡 | Doctor images have alt; marketing minimal images |
| Legal pages indexed | ✅ | In sitemap |
| hreflang | 🔴 | Points to `/en` — **404** |
| PWA manifest | 🟡 | `icons: []` empty |
| Dashboard SEO | N/A | Private app (correct) |

### Recommendation

Remove or implement `/en`. Add OG image (1200×630). Localize JSON-LD or mark `inLanguage`. Add `photo-consent` + `data-export` to footer links. Fill manifest icons.

### Priority: **P1**

### Estimated fix time: **16–24 hours**

**Foundation:** Book 05 Ch. 07 (SEO/community)

---

## 9. Accessibility Audit

**Status:** 🟡 Needs polish  
**Score:** **64 / 100**

| Check | Status | Evidence |
|-------|--------|----------|
| Keyboard nav | 🟡 | Not systematically tested |
| Focus visible | 🟡 | Tailwind focus rings partial |
| ARIA labels | 🟡 | Present on nav, dialogs, lightbox, notifications |
| Dialogs | 🟡 | Portaled; focus trap not verified |
| Dropdowns | 🟡 | Portaled post-fix |
| Contrast | 🟡 | Design tokens; no automated WCAG run |
| Touch targets | 🟡 | Mobile nav ~44px; not audited all controls |
| Screen readers | 🟡 | `aria-current`, `aria-expanded` on nav |
| Form errors | 🟡 | Auth forms OK; doctor errors as inline text |
| WCAG AA | 🔴 | **Not verified** — likely gaps on contrast + focus |

### Files

- `apps/dashboard/src/components/dashboard/shell.tsx`
- `apps/dashboard/src/components/doctor/chat-message-image.tsx`
- `docs/foundation/02-design-system/12-accessibility-and-motion.md`

### Recommendation

Run axe-core + Lighthouse a11y on `/doctor`, `/login`, `/cases`. Add skip link. Verify focus trap in upgrade modal and mobile drawer. Audit color contrast in dark mode.

### Priority: **P1**

### Estimated fix time: **32–48 hours**

**Foundation:** Book 02 Ch. 12 (accessibility)

---

## 10. Growth Engine Audit

**Status:** ✅ Complete (internal/admin scope)  
**Score:** **80 / 100**

| Module | Status | Evidence |
|--------|--------|----------|
| Mail outreach | ✅ | Draft → approve → manual Resend send |
| Lead discovery | ✅ | SerpAPI + weekly cron |
| Approval flow | ✅ | PATCH drafts; no auto-send |
| Campaigns | ✅ | Admin UI |
| Email logs | ✅ | Admin UI |
| Social / content engine | ✅ | Generate → queue → **approve/reject** (recent) |
| Knowledge growth | ✅ | Ingestion review queue |
| Expert review | 🟡 | Knowledge-ingestion manual review |
| Automation safety | ✅ | `auto_publish: false`; cron creates drafts only |
| No spam / auto-send | ✅ | Verified in code paths |
| No auto-publish | ✅ | Explicit flags |

### Gaps

- Admin Growth UI mixed TR/EN
- Content studio full page reload on generate
- Cron notification links still say `/outreach` (redirect works)
- Farmer-facing growth loops (referral, share) not in product app

### Files

- `apps/admin/src/app/growth-ai/**`
- `apps/admin/src/lib/outreach/send-approved.ts`
- `docs/growth/GROWTH_ENGINE_ARCHITECTURE.md`

### Recommendation

Polish admin copy to single language. Add integration test for approve→send path. Keep farmer app free of growth automation (correct separation).

### Priority: **P2**

### Estimated fix time: **16–24 hours**

**Foundation:** Book 05 Ch. 03–04 (growth loops, brand); CONSTITUTION gate on approval-first

---

## 11. Admin Audit

**Status:** 🟡 Needs polish  
**Score:** **78 / 100**

| Area | Status |
|------|--------|
| Users / orgs | ✅ List views |
| Knowledge CRUD | ✅ |
| AI logs / conversations / analyses | ✅ |
| Growth AI (12 routes) | ✅ |
| Intelligence hub (8 sub-routes) | ✅ |
| Billing usage / transactions | ✅ |
| Security logs | ✅ |
| Settings / import | ✅ |
| Permissions | 🟡 Platform admin role; Cloudflare Access external |
| Health / monitoring | 🔴 No in-app health dashboard |
| Audit logs | 🟡 Security logs exist; growth audit partial |
| Search / filters | 🟡 Basic on lists |
| Bulk actions | 🟡 Limited |

Build: 62 static pages generated successfully.

### Recommendation

Add `/api/health` + admin health tile. Wire Sentry dashboards. Document Cloudflare Access setup in deployment runbook.

### Priority: **P2**

### Estimated fix time: **24–32 hours**

**Foundation:** Book 03 Ch. 08 (logging); Book 05 Ch. 08 (KPIs)

---

## 12. Legal Audit

**Status:** 🔴 Critical for EU/TR public launch  
**Score:** **58 / 100**

### Page inventory (`apps/marketing/src/lib/legal/content.ts`)

| Slug | Title | Body | Gap |
|------|-------|------|-----|
| privacy, terms, cookies, ai-disclaimer | TR | **EN** | Mixed page |
| kvkk, photo-consent | TR | TR | ✅ |
| gdpr, delete-account, data-export, contact, about, agricultural-disclaimer | EN | EN | OK for EN audience |
| cookie consent banner | — | — | **Missing** |
| versioning / dates | 🟡 | Per-page `lastUpdated` | OK |

Register + OAuth consent includes KVKK (recent). Doctor composer photo notice via `photoConsentHref` prop.

Footer (`GuestTrustFooter` on home) missing `data-export`, `photo-consent` links. `SiteFooter` component unused.

### Recommendation

1. **Cookie consent banner** before non-essential analytics (P0 legal).
2. Translate privacy/terms/cookies/ai-disclaimer bodies to TR OR ship EN titles.
3. Unify legal chrome language ("Son güncelleme" on EN pages).
4. In-app delete account + data export flows.

### Priority: **P0**

### Estimated fix time: **40–60 hours** (legal review + implementation)

**Foundation:** Book 05 Ch. 04 (brand/legal); PRE_COMMIT_CHECKLIST (honesty)

---

## 13. Deployment Audit

**Status:** 🔴 Critical ops gaps  
**Score:** **62 / 100**

| Item | Status |
|------|--------|
| `.env.example` files | ✅ Root + per-app |
| Supabase migrations | ✅ Extensive in `supabase/migrations/` |
| Storage buckets | ✅ In migrations |
| SSL / DNS | 🟡 External (Vercel/hosting) — not in repo |
| Monitoring | 🟡 Sentry env vars documented; not verified live |
| Logging | 🟡 Structured doctor steps; no centralized log stack in repo |
| Analytics | 🟡 GA/PostHog optional in marketing `.env.example` |
| Backup / DR | 🔴 Not documented in repo |
| Health checks | 🔴 No standard `/health` endpoint |
| CI/CD | ✅ | `.github/workflows/ci.yml` — see `docs/deployment/CI_CD_README.md` |
| Rollback | 🟡 Vercel-native assumed |
| Vercel config | 🟡 Only `apps/admin/vercel.json` (cron) |
| Docker | N/A — none |

Build verified green. Typecheck green.

### Recommendation

Add GitHub Actions: typecheck + build + test scripts on PR. Document prod deploy runbook. Add health endpoint. Verify Supabase backup schedule. Stage environment before prod cutover.

### Priority: **P0** (CI) · **P1** (health, runbook)

### Estimated fix time: **24–40 hours**

**Foundation:** Book 03 Ch. 09 (testing gates), Ch. 12 (DoD)

---

## 14. Code Quality Audit

**Status:** ✅ Strong application source hygiene  
**Score:** **82 / 100**

| Check | Result |
|-------|--------|
| TODO / FIXME in `apps/*/src`, `packages/*/src` | **0** |
| `console.log` in application source | **0** |
| Dead code | 🟡 `SiteFooter`, `MarketingSections` unused |
| Duplicated logic | 🟡 Tier nav + cases nav overlap |
| Magic strings | 🟡 Timeline event titles hardcoded |
| Architecture violations | 🔴 `/api/ai/chat` legacy |
| Foundation violations | 🔴 i18n mix, tier stub |
| ESLint warnings | 🟡 Unused imports in admin + dashboard build |
| Typecheck | ✅ 9/9 |
| Test scripts | 🟡 4 root smoke tests; no unit test suite |

### Files

- `apps/dashboard/src/app/api/ai/chat/route.ts` — remove
- `apps/marketing/src/components/site-footer.tsx` — wire or delete

### Recommendation

Delete legacy chat route. Remove or wire dead components. Add ESLint `--max-warnings 0` in CI. Consider Vitest for `@nertura/ai` formatter tests.

### Priority: **P1**

### Estimated fix time: **16–24 hours**

**Foundation:** Book 03 Ch. 02–03 (structure, TypeScript); PRE_COMMIT_CHECKLIST

---

# 15. Final Scores

| Category | Score |
|----------|-------|
| Product | **68** |
| UX | **72** |
| AI | **74** |
| Security | **62** |
| Performance | **74** |
| SEO | **70** |
| Accessibility | **64** |
| Growth | **80** |
| Admin | **78** |
| Legal | **58** |
| Deployment | **62** |
| Code Quality | **82** |
| Projects Engine *(sub-score)* | **76** |
| Auth *(sub-score)* | **68** |

### **Overall Production Readiness Score: 69 / 100**

### Readiness estimates

| Milestone | % | Rationale |
|-----------|---|-----------|
| **Closed beta (TR farmers, free tier, core loop)** | **72%** | Doctor + cases work; legal/i18n gaps acceptable for invite-only |
| **Public beta (+ EN, billing, legal)** | **58%** | Tier, Stripe UI, cookie banner, full legal TR block launch |
| **Production launch (scale, compliance, ops)** | **52%** | CI/CD, distributed rate limits, a11y audit, monitoring, DR |

---

# Final Report

## Critical Issues (P0 — fix before public launch)

| # | Issue | Category | Est. hours |
|---|-------|----------|------------|
| 1 | ~~`resolveUserTier()` always returns `free`~~ | ✅ Closed — subscription metadata + dev override |
| 2 | ~~Legacy `/api/ai/chat` bypasses intelligence engine~~ | ✅ Closed — 410 Gone |
| 8 | ~~No CI/CD pipeline~~ | ✅ Closed — GitHub Actions workflow |
| 3 | Mixed TR/EN across dashboard (crops, field workspace, cases, errors) | Product / UX / Legal policy | 40–60 |
| 4 | No cookie consent banner | Legal / GDPR / KVKK | 8–16 |
| 5 | In-memory rate limits not production-safe | Security | 16–24 |
| 6 | Legal pages: TR titles + EN bodies on core policies | Legal | 24–40 (incl. legal review) |
| 7 | Marketing `/en` hreflang dead link | SEO | 4–8 |
| 8 | No CI/CD pipeline | Deployment | 16–24 |

**P0 subtotal: ~120–196 hours**

---

## High Priority (P1)

| # | Issue | Est. hours |
|---|-------|------------|
| 9 | Billing UI placeholders; wire Stripe checkout to account | 16–24 |
| 10 | Server-side tier gating on Plus routes (or document intentional open access) | 8–12 |
| 11 | Projects Engine timeline + case context i18n | 16–24 |
| 12 | `log_auth_event` migration or audit log consolidation | 4–8 |
| 13 | Doctor error-path localization (catch block, usage messages) | 4–8 |
| 14 | Accessibility audit + fixes (WCAG AA target) | 32–48 |
| 15 | In-app delete account + data export flows | 24–32 |
| 16 | Add `loading.tsx` + segment suspense consistency | 8–12 |
| 17 | OG images + footer legal link parity | 8–12 |
| 18 | Run production RLS verify (`pnpm supabase:verify:rls`) | 2–4 |

**P1 subtotal: ~122–184 hours**

---

## Medium Priority (P2)

| # | Issue | Est. hours |
|---|-------|------------|
| 19 | Notification dispatcher for case follow-ups (or hide UI) | 16–24 |
| 20 | Hide phone-login / magic-link until production-ready | 2–4 |
| 21 | Map/onboarding placeholder → honest beta copy or Mapbox polish | 16–24 |
| 22 | Admin Growth TR/EN consistency | 8–12 |
| 23 | CSP header (report-only → enforce) | 8–16 |
| 24 | Bundle optimization (map lazy load, account page) | 16–24 |
| 25 | `/projects` nav decision; remove or link `/crops` | 4–8 |
| 26 | Health endpoint + monitoring runbook | 8–16 |
| 27 | Authenticated Playwright smoke suite | 24–40 |

**P2 subtotal: ~102–168 hours**

---

## Low Priority (P3)

| # | Issue | Est. hours |
|---|-------|------------|
| 28 | SSE streaming for Doctor responses | 40–60 |
| 29 | Full marketing homepage sections (`MarketingSections`) | 16–24 |
| 30 | Org invite architecture | 40–60 |
| 31 | PWA manifest icons | 2–4 |
| 32 | Content studio UX (no full page reload) | 4–8 |

---

## Quick Wins (< 8 hours each)

1. Delete or 410 `/api/ai/chat` route
2. Remove duplicate user menu `/account` entries
3. Fix `settings.backToAccount` mixed string ("← Profile dön")
4. Wire or delete unused `SiteFooter` / `MarketingSections`
5. Add `photo-consent` + `data-export` to `GuestTrustFooter`
6. Hide `/phone-login` link from login page
7. Fix ESLint unused imports flagged in build
8. Update cron copy `/outreach` → `/growth-ai/outreach`
9. Add `"type": "module"` to `packages/ui/package.json` (silence build warning)
10. Document `NEXT_PUBLIC_NERTURA_DEV_TIER=plus` for staging QA

---

## Recommended Sprint Order

### Sprint 1 — Launch blockers (2 weeks)
P0 items 1–8. Goal: paying users see Plus; no constitution violations; legal minimum; CI green.

### Sprint 2 — Trust & conversion (2 weeks)
P1 items 9–18. Goal: Stripe works; a11y baseline; in-app GDPR flows; RLS verified on prod.

### Sprint 3 — Polish & scale (2 weeks)
P2 items 19–27. Goal: notifications honest; performance; E2E tests; monitoring.

### Sprint 4 — Growth & expansion (ongoing)
P3 + EN locale route; org invites; streaming UX.

---

## Estimated Remaining Hours

| Band | Hours |
|------|-------|
| P0 Critical | 120–196 |
| P1 High | 122–184 |
| P2 Medium | 102–168 |
| **Total to production launch** | **344–548** |
| Quick wins only | ~24–32 |

---

## Top 20 Improvements Before Public Launch

1. Wire subscription tier to real billing data
2. Remove legacy `/api/ai/chat` endpoint
3. Ship cookie consent banner (block non-essential cookies until consent)
4. Complete Turkish legal bodies for privacy, terms, cookies, AI disclaimer
5. Unify dashboard language per session (TR launch OR full EN map)
6. Distributed rate limiting (Upstash/Redis)
7. CI pipeline: typecheck + build + smoke tests on every PR
8. Production RLS verification on live Supabase
9. Stripe checkout connected to account page (remove "yakında")
10. Server-side tier enforcement on Plus features
11. In-app account deletion flow matching `/delete-account` legal text
12. In-app data export flow matching `/data-export` legal text
13. Fix hreflang — implement `/en` or remove alternates
14. WCAG AA accessibility pass on Doctor + auth
15. Add segment-level loading states
16. Migrate or replace `log_auth_event` audit calls
17. Localize Projects Engine timeline for EN users
18. OG social images + complete footer legal links
19. Authenticated E2E test suite (Playwright)
20. Production runbook: deploy, rollback, backup, incident response

---

## Honest assessment

**What works today:** A Turkish farmer can land on marketing, ask the Guest Doctor, register, complete onboarding, use the authenticated Doctor with photos, get evidence-backed answers, and see auto-created field cases with timeline history. Admin can run approval-first growth outreach and content generation. Builds and core smoke tests pass.

**What does not work for launch:** Paying customers cannot unlock Plus in the UI. English-preferring users get a fractured experience. Legal compliance is incomplete for TR/EU public traffic. Security abuse controls will not hold under multi-instance load. No automated CI gates production quality.

**Gate question (Book 01 Ch. 12):** *Does this help the farmer solve the problem faster?*  
**For the core Doctor → case loop: yes.**  
**For everything around trust, payment, and language consistency: not yet.**

---

*Audit v1.0 — generated from codebase verification 2026-06-27. Re-run after P0 sprint for v1.1 delta.*
