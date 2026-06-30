# Mobile LAN QA checklist

Use this on a real iPhone before continuing Experience Lock.

**Current dev LAN IP:** `192.168.1.104` (verify with `pnpm dev:mobile` if your IP changed)

## Prerequisites

- [ ] iPhone and dev PC on the **same Wi‑Fi**
- [ ] Windows Firewall allows Node on ports 3000–3002 (private network)
- [ ] `pnpm clean:next` run if you saw ENOENT / vendor-chunk errors
- [ ] Three dev servers running (`pnpm dev:mobile` instructions)
- [ ] Supabase redirect URL includes `http://<LAN-IP>:3001/auth/callback` (see [DEV_MOBILE_TESTING.md](../development/DEV_MOBILE_TESTING.md))

## 1. Marketing auth links (P0)

- [ ] Open `http://192.168.1.104:3000`
- [ ] Tap **Ücretsiz hesap oluştur** (header)
- [ ] **Expected:** `http://192.168.1.104:3001/register?next=%2Fdoctor` — **NOT** localhost
- [ ] Back to marketing
- [ ] Tap **Giriş yap** (header)
- [ ] **Expected:** `http://192.168.1.104:3001/login?next=%2Fdoctor` — **NOT** localhost

## 2. Guest doctor signup prompt

- [ ] On marketing, tap **+** → locked action (or exhaust guest limit)
- [ ] Signup prompt appears
- [ ] Tap **Ücretsiz hesap oluştur**
- [ ] **Expected:** LAN dashboard register URL, not localhost

## 3. Register & login (dashboard on LAN)

- [ ] Open `http://192.168.1.104:3001/register?next=%2Fdoctor`
- [ ] Form loads, mobile layout clean
- [ ] Consent links open on `http://192.168.1.104:3000/terms` (or production), **not** localhost
- [ ] Tap **Google ile devam et**
- [ ] **Expected Supabase redirectTo:** `http://192.168.1.104:3001/auth/callback?next=/doctor`
- [ ] After Google auth, land on `http://192.168.1.104:3001/doctor` — **NOT** localhost
- [ ] If Supabase shows redirect error → add LAN callback URL to Supabase allowlist
- [ ] Email register: confirmation link uses LAN callback or correct dashboard host
- [ ] Password login at `http://192.168.1.104:3001/login` → after success: `http://192.168.1.104:3001/doctor`

## 4. AI Doctor

- [ ] Open `http://192.168.1.104:3001/doctor`
- [ ] Composer reachable at bottom (no overlap)
- [ ] Ask: `salatalık yetiştirmek istiyorum ankarada yetişirmi`
- [ ] Answer fully Turkish, no English leak
- [ ] Upload photo + Turkish question
- [ ] Answer card hierarchy visible
- [ ] Mobile menu / drawers work

## 5. Layout & regressions

- [ ] No horizontal scroll on marketing or doctor
- [ ] Cookie banner does not block composer or primary CTAs
- [ ] Safari back/forward does not break auth state badly
- [ ] Sign out → returns to `http://192.168.1.104:3001/login`, not localhost

## 6. Cases / history (if logged in)

- [ ] `/cases` links work
- [ ] `/history` links work
- [ ] No localhost in any CTA href or address bar

## Fail criteria

Stop and fix before merge if **any** auth flow, OAuth callback, login success, or internal navigation opens `localhost` while the session started from LAN IP.

## Automated guard

```powershell
pnpm test:mobile-lan-urls
pnpm test:dashboard-auth-urls
pnpm test:marketing-urls
pnpm test
```
