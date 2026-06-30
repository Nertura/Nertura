# Google OAuth Setup — Nertura Dashboard

## Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers**
2. Enable **Google**
3. Add Google Cloud OAuth 2.0 Client ID and Client Secret
4. Save provider

## Google Cloud Console

1. APIs & Services → Credentials → OAuth 2.0 Client
2. Authorized JavaScript origins:
   - `https://app.nertura.com`
   - `http://localhost:3001` (dev)
3. Authorized redirect URIs (Supabase callback):
   - `https://<project-ref>.supabase.co/auth/v1/callback`

## Supabase redirect URLs

Authentication → URL Configuration → Redirect URLs:

```
https://app.nertura.com/auth/callback
http://localhost:3001/auth/callback
```

## Dashboard environment

```env
NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://app.nertura.com
```

The app also detects Google via Supabase `/auth/v1/settings` — either method enables the button.

## Flow

1. User clicks **Continue with Google**
2. Supabase OAuth → Google → callback ` /auth/callback?code=...`
3. Session exchanged server-side
4. New user → `/onboarding`
5. Onboarded user → `/doctor` (or `next` param)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Button hidden | Set `NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED=true` or verify Supabase Google provider enabled |
| redirect_uri_mismatch | Add exact Supabase callback URL in Google Console |
| auth_callback_failed | Check Supabase redirect URL whitelist |
| Lands on login after OAuth | Verify email not blocked; check Supabase auth logs |
