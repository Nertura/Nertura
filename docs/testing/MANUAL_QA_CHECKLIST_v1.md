# Manual QA Checklist v1

**Version:** 1.1 · 2026-06-28  
**Environment:** Marketing `:3000` · Dashboard `:3001` · Admin `:3002`  
**Gate:** No English leaks on TR farmer surfaces · No 500s · No click blocking

**Last automated run:** 2026-06-28 — engine tests + route/CSS smoke. Browser sign-off pending.

---

## How to use

For each test: run steps → record **Pass / Fail** → add notes.  
Use `NEXT_PUBLIC_NERTURA_DEV_TIER=plus` for Plus-tier checks.

---

## Guest — Marketing

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| G1 | Landing loads | Open `/` | Guest Doctor visible, TR footer/copy for TR browser | Pass | CSS smoke + HTTP 200 |
| G2 | Text analysis (×3) | Ask 3 TR plant questions | Turkish answer, labels: Güven, Kısa teşhis, Bugün ne yapın | Pass | `test:doctor-language` |
| G3 | Photo lock | Tap photo upload without account | Signup gate appears | Pending | Browser only |
| G4 | Signup CTA | Click register from gate | `/register` on dashboard | Pending | Browser only |
| G5 | Legal consent | Open `/register`, `/privacy`, `/kvkk` | Consent checkbox on register; legal pages load | Partial | Legal pages HTTP 200; register not browser-tested |
| G6 | i18n guard | Run `pnpm check:i18n` | PASS | Pass | 226 files scanned |

---

## Free user — Dashboard

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| F1 | Login | Email or Google login | Redirect to `/doctor` or `/onboarding` | | |
| F2 | Onboarding | Complete wizard if new user | Profile saved; map step works | | |
| F3 | Doctor text | Ask TR question (olive balcony) | All UI labels Turkish; no Confidence/Knowledge Bank | Pass | Engine test olive-balcony |
| F4 | Doctor photo | Upload JPG <5MB + question | Image preview "Fotoğraf eklendi"; analysis returns | Pass | `test:dashboard-doctor` + vision-language |
| F5 | History | Open `/history` | Past conversations listed in TR | Pending | Browser only |
| F6 | Vaka Takibi | Open `/cases` | List loads; filters work | Pass | `test:projects-engine`; route 200 |
| F7 | Case detail | Open a case | Güven, Durum, Risk in TR | Pass | Projects engine overview TR |
| F8 | Settings | Open `/settings`, `/account` | All copy Turkish | Pending | Browser only |
| F9 | Logout | Sign out | Returns to `/login` | Pending | Browser only |
| F10 | Header clicks | KA menu, bell, dark mode, composer | All clickable (no overlay) | Partial | Static interaction guard PASS; browser pending |

---

## Plus / dev tier

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| P1 | Locked nav (free) | Without dev tier, click Plus nav items | Upgrade modal or lock icon | Pass | `test:tier-navigation` |
| P2 | Plus unlock | Set `NEXT_PUBLIC_NERTURA_DEV_TIER=plus` | Plus routes unlocked in nav | Pass | `test:tier-navigation` |
| P3 | Farms / map | `/farms`, draw boundary on mobile | Map usable; TR labels | | |
| P4 | Field workspace | `/fields/[id]` | Tabs and stats in Turkish | | |
| P5 | Premium reports | Select field in Doctor | Panel shows TR copy | | |

---

## Admin (internal)

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| A1 | Users | `/users` | List loads | | |
| A2 | Organizations | `/organizations` | List loads | | |
| A3 | Knowledge | `/knowledge` | CRUD accessible | | |
| A4 | Growth outreach | `/growth-ai/outreach` | Draft → approve → send flow | | |
| A5 | Content studio | `/growth-ai/content-studio` | Generate → approve/reject | | |

---

## Mobile

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| M1 | Landing | Phone viewport `/` | Composer usable, safe area OK | | |
| M2 | Doctor | `/doctor` on phone | Bottom composer, no overlay block | | |
| M3 | Mobile nav | Tap bottom nav items | Navigation works | | |
| M4 | Cases | `/cases` on phone | Cards scroll; CTAs tappable | | |
| M5 | Onboarding | Complete on phone | All steps reachable | | |

---

## Route smoke (no 500)

| Route | OK? | Notes |
|-------|-----|-------|
| `/` (marketing) | ✅ | CSS smoke 200 |
| `/privacy`, `/terms`, `/kvkk`, `/cookies`, `/ai-disclaimer`, `/photo-consent` | ✅ | HTTP 200 marketing |
| `/login`, `/register`, `/onboarding`, `/doctor` | Partial | register/doctor 200; login redirect; onboarding auth required |
| `/history`, `/cases`, `/account`, `/settings` | Partial | cases/history 200 (auth redirect may apply) |
| `/fields`, `/farms`, `/crops` | | |

---

**Sign-off:** _________________ **Date:** _________
