# Nertura — Security Master Plan

> Enterprise security architecture for production. Supersedes detail in [`security-compliance.md`](security-compliance.md) for implementation phase; that document remains compliance framework reference.

**Status:** Pre-implementation · **Owner:** CSO / CTO  
**Classification:** Internal — redact before external sharing

---

## Security Principles

1. **Assume breach** — minimize blast radius via RLS, least privilege, encryption
2. **Defense in depth** — Cloudflare → Vercel → Auth → RLS → application validation
3. **Zero trust admin** — MFA, audit, optional IP allowlist
4. **Privacy by design** — data minimization, consent gates, export/delete
5. **Secure defaults** — deny-all RLS; opt-in to sharing and training

---

## Threat Model (STRIDE Summary)

| Threat | Surface | Mitigation |
|--------|---------|------------|
| **Spoofing** | Auth endpoints | MFA, email verify, bot protection |
| **Tampering** | API, webhooks | Signatures, CSRF, idempotency keys |
| **Repudiation** | Admin actions | Immutable audit logs |
| **Information disclosure** | RLS bypass, logs | RLS tests in CI, PII redaction in logs |
| **Denial of service** | Public API | Cloudflare rate limits, Brain credit caps |
| **Elevation of privilege** | Role manipulation | Server-side RBAC; JWT claims verified |

---

## Layer 1 — Edge (Cloudflare)

| Control | Configuration |
|---------|---------------|
| HTTPS | Force HTTPS; HSTS max-age 31536000; includeSubDomains |
| WAF | OWASP CRS; block SQLi, XSS patterns |
| Bot protection | Super Bot Fight Mode on login/register |
| Rate limiting | See [`infrastructure-stack.md`](infrastructure-stack.md) |
| Geo blocking | Optional block high-fraud regions on admin only |
| mTLS | V2 for enterprise API consumers |

---

## Layer 2 — Application (Next.js / Vercel)

| Control | Implementation |
|---------|----------------|
| CSP | `default-src 'self'; script-src 'self' 'unsafe-inline' vercel/posthog domains; img-src 'self' data: https: *.supabase.co; connect-src 'self' *.supabase.co sentry posthog` |
| Headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |
| CSRF | SameSite cookies; double-submit token on sensitive mutations |
| Input validation | Zod schemas on all Route Handlers |
| Output encoding | React default; sanitize markdown in AI responses |
| Dependency scanning | Dependabot + `npm audit` in CI; block critical |
| Secret scanning | GitHub secret scanning; pre-commit hook |

---

## Layer 3 — Authentication & Sessions

| Control | Requirement |
|---------|-------------|
| Password policy | Min 12 chars; complexity not required if length ≥16; breach check |
| MFA | **Mandatory** for all admin panel roles; optional app users; enforced Enterprise |
| Session fixation | Regenerate session on login |
| Idle timeout | Admin: 30 min; App: 8 hours default |
| Concurrent sessions | Max 5; user can revoke all in settings |
| Impersonation | Super Admin only; banner shown to user; full audit |
| OAuth (V2) | PKCE; state parameter; account linking verification |

---

## Layer 4 — Authorization (RBAC + RLS)

Application RBAC enforced **server-side** in Route Handlers — never trust client role display.

Supabase **Row Level Security** on every tenant table — see [`database-security-rules.md`](database-security-rules.md).

Admin permissions: [`admin-permission-matrix.md`](admin-permission-matrix.md).

---

## Layer 5 — Data Protection

| State | Control |
|-------|---------|
| Transit | TLS 1.3 |
| Rest (DB) | Supabase AES-256 |
| Rest (Storage) | Encrypted buckets; private default |
| Backups | Encrypted; access logged |
| PII in logs | Redact email, phone, field GPS in Axiom |
| Field boundaries | Treat as sensitive location data |

---

## Layer 6 — AI Security

| Risk | Control |
|------|---------|
| **Prompt injection** | Input sanitization; system prompt isolation; tool allowlist; no raw SQL from LLM |
| **Data exfiltration via AI** | Brain only retrieves org-scoped memory; cross-tenant retrieval impossible |
| **Abuse / cost** | Credit gate; rate limit; anomaly detection on inference volume |
| **Unsafe ag advice** | Disclaimers; confidence thresholds; human review queue for low confidence |
| **PII in prompts** | Minimize injection; strip other users' PII from context |
| **Provider retention** | API calls with zero-retention flags where available; no training on customer data via provider settings |

Policy: [`ai-usage-policy.md`](ai-usage-policy.md).

---

## Layer 7 — File Upload Security

| Rule | Detail |
|------|--------|
| MIME whitelist | jpeg, png, webp, pdf only (MVP) |
| Magic byte validation | Server verifies file header |
| Max size | 10 MB observations |
| Malware scan | ClamAV or cloud API before `status=clean` |
| EXIF | Strip GPS unless explicit field-tag consent |
| SVG | Disallowed in user uploads (XSS vector) |
| Signed URLs | 15-minute expiry; single use upload |

---

## Layer 8 — Webhook Security

| Provider | Verification |
|----------|--------------|
| Stripe | `stripe-signature` header, webhook secret |
| Meta WhatsApp | `X-Hub-Signature-256` HMAC |
| Resend | Svix signature |
| Supabase | Shared secret header |

All webhooks: idempotency key stored; replay rejected.

---

## Layer 9 — Secrets Management

| Secret type | Storage |
|-------------|---------|
| Supabase service role | Vercel encrypted env (production only) |
| Stripe keys | Vercel encrypted env |
| AI provider keys | Vercel encrypted env; Brain service only |
| Webhook secrets | Vercel + rotation quarterly |
| Admin break-glass | 1Password vault; 2-person rule |

**Never:** commit `.env`, log secrets, expose service role to client.

---

## Layer 10 — Audit & Monitoring

Full spec: [`audit-log-system.md`](audit-log-system.md).

Sentry alerts: new issue → Slack; regression → PagerDuty on-call rotation.

---

## Layer 11 — Backup & Recovery

| Asset | RPO | RTO |
|-------|-----|-----|
| Postgres | 24h (PITR minutes) | 4h |
| Storage | 24h | 8h |
| Config (Vercel) | Git is source of truth | 1h |

Quarterly restore drill documented in [`production-checklist.md`](production-checklist.md).

---

## Layer 12 — Incident Response

Process: [`incident-response-plan.md`](incident-response-plan.md).

Severity P0–P3 with 15-minute P0 acknowledgment target.

---

## Layer 13 — Secure SDLC

| Phase | Activity |
|-------|----------|
| Design | Threat modeling for new modules |
| PR | Code review; security checklist |
| CI | Lint, test, SAST, dependency scan |
| Staging | DAST smoke; RLS policy tests |
| Prod | Change log; rollback plan |

Penetration test: before Enterprise GA; annual thereafter.

---

## Layer 14 — Account Lifecycle Security

| Event | Action |
|-------|--------|
| Registration | Email verify; consent capture |
| Deactivation | Soft delete; revoke sessions |
| Deletion request | 30-day grace; hard delete job; audit retention per policy |
| Export request | Signed URL; 7-day expiry; logged |

---

## Compliance Roadmap

| Milestone | Target |
|-----------|--------|
| GDPR/KVKK operational | Day 90 GA |
| SOC 2 Type I | Month 12 |
| SOC 2 Type II | Month 18 |
| ISO 27001 | Month 24+ |

---

*Security Master Plan v1.0 — Pre-implementation.*
