# Production Security Checklist

> Run before beta launch. Foundation: Book 03 Ch. 08–09.

## Authentication & sessions

- [ ] Supabase Auth email verification enabled in production
- [ ] OAuth redirect URLs whitelisted (dashboard + marketing only)
- [ ] Session cookies `httpOnly`, `secure`, `sameSite=lax`
- [ ] Sign-out clears session on all apps

## Supabase RLS

- [ ] `pnpm supabase:verify:rls` passes on production project
- [ ] All tenant tables scoped by `organization_id` / `user_id`
- [ ] Admin tables use `private.is_platform_admin()`
- [ ] Service role key **never** exposed to client bundles

## Storage & uploads

- [ ] Bucket policies: authenticated upload only to own org paths
- [ ] Image validation: magic bytes + MIME + 5MB limit (dashboard doctor route)
- [ ] Signed URLs for private assets; no public patient/farm photos

## API authorization

- [ ] Every `/api/*` route validates session or cron secret
- [ ] Admin routes require platform admin membership
- [ ] Rate limits on AI doctor, auth OTP, outreach cron

## Headers & XSS

- [ ] Marketing: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] User content escaped in UI; AI output rendered as text/markdown safe subset

## Growth / outreach

- [ ] Email send gated on `onaylandi` status only
- [ ] Suppression list checked before send
- [ ] `do_not_contact` honored on leads
- [ ] Audit log for approve/send/content actions

## Secrets

- [ ] `.env.local` not committed; CI uses GitHub secrets
- [ ] Rotate keys if ever exposed in logs
- [ ] Cron endpoints protected by `CRON_SECRET`

## Documented risks (accept or fix pre-launch)

- CSP not yet strict (inline scripts from Next.js)
- Multi-tenant admin impersonation not implemented
- Guest doctor limits marketing-side only
