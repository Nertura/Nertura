# 01 — Product Security Principles

## Purpose

Product-level security principles for Nertura Core. Implementation detail remains in Book 03 Ch. 07.

**Companion:** [`03-engineering-standards/07-security-standards.md`](../03-engineering-standards/07-security-standards.md)

---

## Principles

### 1. Tenant isolation is non-negotiable

Every farmer's data is isolated by organization/user via Supabase RLS. No cross-tenant reads.

### 2. Authentication before intelligence

`/api/ai/*` and farmer data APIs require valid session unless explicitly public (guest Doctor with limits).

### 3. Upload safety

Images: magic-byte validation, size limits, private storage, user-scoped paths.

### 4. Secrets never in repo

Environment variables only; `.env.example` documents keys without values.

### 5. Rate limits protect abuse

Guest, IP, and OTP limits exist. Production scale requires distributed limits (P1 — document honestly).

### 6. AI outputs are not executable code

Doctor responses are text — never auto-run scripts, purchases, or chemical applications.

### 7. Admin is gated

Admin app requires platform admin role + external access controls (Cloudflare Access documented).

### 8. Auditability

Security-sensitive actions should log to audit trail (see engineering security chapter for gaps).

### 9. Headers and cookies

Security headers in Next config; SameSite cookies via Supabase SSR; KVKK cookie consent on marketing.

### 10. Never weaken security for speed

A faster insecure path is not acceptable. Fix properly or defer feature.

---

## Merge Blocks (Security P0)

| Issue | Action |
|-------|--------|
| RLS bypass | No merge |
| Auth bypass on private route | No merge |
| Secret in committed file | No merge + rotate secret |
| Unvalidated file upload | No merge |
| XSS in farmer-rendered HTML | No merge |

---

## Verification Commands

```bash
pnpm supabase:verify:rls    # production project before launch
pnpm test:no-legacy-chat    # AI path guard
```

---

## Cross-References

- Book 03 Ch. 07 — Security standards
- `docs/security/PRODUCTION_SECURITY_CHECKLIST.md`
- Book 05 Ch. 04 — Legal / KVKK
