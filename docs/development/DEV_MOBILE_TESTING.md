# Mobile LAN development

Test Nertura from a real iPhone on the same Wi‑Fi as your dev PC.

## Quick start

```powershell
pnpm clean:next
pnpm dev:mobile
```

Run **three terminals** (commands printed by `pnpm dev:mobile`):

```powershell
pnpm dev:mobile:marketing
pnpm dev:mobile:dashboard
pnpm dev:mobile:admin
```

Each binds `0.0.0.0` so LAN devices can connect.

## Environment

In `apps/marketing/.env.local`:

- **LAN auto-detect (recommended):** comment out or remove `NEXT_PUBLIC_DASHBOARD_URL`
- **Explicit LAN:** `NEXT_PUBLIC_DASHBOARD_URL=http://192.168.1.104:3001` (your PC IP)
- **Do not** use `http://localhost:3001` when testing from a phone

In `apps/dashboard/.env.local` (for OAuth / email auth on LAN):

- Comment out `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_DASHBOARD_URL` for auto-detect, **or**
- Set `NEXT_PUBLIC_APP_URL=http://192.168.1.104:3001` (your PC IP)
- **Do not** leave `http://localhost:3001` when testing OAuth from iPhone

## Supabase redirect URLs (required for OAuth / email auth)

When Supabase rejects a redirect, OAuth falls back to `site_url` (often `localhost`) and breaks on iPhone.

### Local Supabase (`supabase start`)

`supabase/config.toml` includes LAN patterns. After IP change, add your IP and restart:

```powershell
npx supabase stop
npx supabase start
```

Required entries in `[auth].additional_redirect_urls`:

- `http://localhost:3001/auth/callback`
- `http://192.168.1.104:3001/auth/callback` (your current LAN IP)
- `http://192.168.1.104:3001/**`

### Hosted Supabase (required for Google OAuth on iPhone)

This project uses **hosted Supabase** (`NEXT_PUBLIC_SUPABASE_URL` in `.env.local`).  
Changes to `supabase/config.toml` only apply when running `supabase start` locally.

**You must add LAN URLs in the Supabase Dashboard:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://192.168.1.104:3001/auth/callback`
   - `http://192.168.1.104:3001/**`
3. Keep existing entries for localhost and production

**If OAuth still opens localhost on iPhone:** Supabase rejected the LAN `redirectTo` and fell back to **Site URL**. The allowlist entry above fixes it.

Run `pnpm dev:mobile` — it prints your current LAN IP and the exact URLs to add.

| Environment | URL |
|-------------|-----|
| Local PC | `http://localhost:3001/auth/callback` |
| LAN mobile | `http://192.168.1.104:3001/auth/callback` |
| Production | `https://app.nertura.com/auth/callback` |

Update the LAN IP whenever your router assigns a new address.

## URL rules

| Marketing opened at | Register / Login / OAuth callback |
|---------------------|-----------------------------------|
| `http://localhost:3000` | `http://localhost:3001` |
| `http://192.168.x.x:3000` | `http://192.168.x.x:3001` |
| Production | `https://app.nertura.com` |

Implementation: `packages/utils/src/nertura-urls.ts`

Auth flows use **browser/request origin**, not env localhost, when host is a LAN IP.

## Clean cache

Stale `.next` vendor chunks cause ENOENT errors:

```powershell
pnpm clean:next
```

## Tests

```powershell
pnpm test:marketing-urls
pnpm test:mobile-lan-urls
pnpm test:dashboard-auth-urls
pnpm test
```

## QA checklist

See [MOBILE_LAN_QA_CHECKLIST.md](../testing/MOBILE_LAN_QA_CHECKLIST.md).
