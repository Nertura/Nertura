# Nertura — Security & Compliance

> Enterprise security architecture for a global agriculture intelligence platform handling farm operational data, photos, AI interactions, and cross-border personal data.

---

## Security Philosophy

Security is not a feature — it is a **platform prerequisite**. Nertura handles geolocation of farms, financial records, crop photos, and personal data subject to KVKK and GDPR. Every layer assumes breach attempts, insider risk, and regulatory audit.

---

## Compliance Framework Map

| Regulation | Scope | Document |
|------------|-------|----------|
| **KVKK** (Turkey Law 6698) | Turkish users, data in TR | `/docs/data-privacy-kvkk-gdpr.md` |
| **GDPR** (EU 2016/679) | EU users, data in EU | `/docs/data-privacy-kvkk-gdpr.md` |
| **SOC 2 Type II** | Enterprise customers | This document |
| **ISO 27001** | Phase 5 certification target | This document |
| **Meta WhatsApp Commerce Policy** | WhatsApp channel | `/automation/whatsapp-integration.md` |

---

## Identity & Access Management

### Authentication

| Control | Implementation |
|---------|----------------|
| Password policy | Min 12 chars; breach list check (HaveIBeenPwned API) |
| MFA | TOTP required for admin; optional all users; enforced Enterprise |
| SSO/SAML | Enterprise — Okta, Azure AD, Google Workspace |
| Session timeout | Configurable 15min–24h; default 8h |
| Concurrent sessions | Limit 5; admin can revoke all |
| API keys | Scoped permissions; 90-day rotation reminder; never logged |

### Authorization (RBAC + ABAC)

| Layer | Model |
|-------|-------|
| **RBAC** | Owner, Admin, Manager, Operator, Viewer, Partner, Member |
| **ABAC** | Farm-scoped, module-scoped, credit-pool-scoped |
| **Row-level** | `organization_id` on every tenant query |
| **Field-level** | PII masked for Viewer role |

Principle of least privilege enforced at API gateway.

---

## Encryption

| State | Standard |
|-------|----------|
| **In transit** | TLS 1.3 minimum; HSTS; certificate pinning mobile |
| **At rest (DB)** | AES-256; managed KMS (AWS KMS / GCP CMEK) |
| **At rest (objects)** | SSE-S3 or SSE-KMS; photos in regional buckets |
| **Application secrets** | Vault / Secrets Manager; never in code |
| **Provider tokens** | Encrypted SocialAccount, WhatsApp tokens |
| **Backups** | Encrypted; separate KMS key; tested restore quarterly |

### Key management

| Key type | Rotation |
|----------|----------|
| Data encryption keys | Annual |
| API signing keys | 90 days |
| JWT signing | 30 days with overlap |
| KMS master | Provider-managed + annual audit |

---

## Network Security

| Control | Detail |
|---------|--------|
| WAF | OWASP Top 10 rules; rate limiting |
| DDoS | Cloudflare or AWS Shield |
| API gateway | Auth, rate limit, request validation |
| Internal services | Private VPC; no public DB ports |
| Admin tools | VPN or IP allowlist + MFA |
| Webhook endpoints | Signature validation (Stripe, Meta, Resend) |

---

## Application Security

| Practice | Implementation |
|----------|----------------|
| SDLC | Security review on PR; dependency scanning (Snyk/Dependabot) |
| SAST | CI pipeline |
| Penetration test | Annual third-party; before Enterprise GA |
| Bug bounty | Phase 5 — HackerOne program |
| Input validation | Schema validation all API inputs |
| SQL injection | Parameterized queries ORM only |
| XSS | CSP headers; React auto-escape |
| CSRF | SameSite cookies + token for mutations |
| Prompt injection | Brain input sanitization layer |

---

## Audit Logging

### Immutable audit trail

| Event category | Logged data |
|----------------|-------------|
| Authentication | Login, logout, MFA, failed attempts, SSO |
| Authorization | Permission change, role assignment |
| Data access | Export, bulk read, admin impersonation |
| Data mutation | Create, update, delete (soft) |
| AI actions | Inference, action execution, feedback |
| Consent | Grant, revoke, scope change |
| Billing | Subscription, credit purchase |
| Approval | Submit, approve, reject, publish |
| Admin | Impersonation start/end, config change |

### AuditLog retention

| Tier | Retention |
|------|-----------|
| Standard | 1 year |
| Business | 3 years |
| Enterprise | Unlimited + SIEM export |

Logs append-only; tamper detection via hash chain [Enterprise].

---

## Photo & Media Storage Policy

| Rule | Implementation |
|------|----------------|
| Storage location | Regional bucket matching data residency |
| Access | Signed URLs; TTL 15 min default |
| EXIF GPS | Stripped by default; opt-in per user |
| Public access | Blocked at bucket policy |
| Virus scan | ClamAV on upload |
| Content moderation | CSAM hash check (PhotoDNA or equivalent) |
| Deletion | User delete → 30-day soft → hard purge + CDN invalidate |
| AI training | Separate consent; never default |

---

## AI-Specific Security

| Risk | Control |
|------|---------|
| Provider data retention | Zero-retention API flags |
| PII in prompts | Redaction pipeline before external API |
| Output leakage | No cross-tenant context in RAG |
| Action abuse | Confirm before execute; rate limits |
| Model poisoning | Feedback trust score; anomaly detection |
| Credit fraud | Atomic ledger; anomaly alerts |

---

## Incident Response

### Severity levels

| Level | Example | Response SLA |
|-------|---------|--------------|
| P1 | Data breach, full outage | 15 min acknowledge; 4h contain |
| P2 | Partial outage, auth issue | 1h acknowledge; 24h resolve |
| P3 | Single tenant issue | 4h acknowledge; 72h resolve |
| P4 | Low risk finding | Next sprint |

### Breach notification

| Regulation | Timeline |
|------------|----------|
| GDPR | 72h to supervisory authority |
| KVKK | 72h to VERBIS / affected users |
| Customer contract | Per Enterprise DPA |

Runbook documented; tabletop exercise semi-annual.

---

## Business Continuity

| Component | RPO | RTO |
|-----------|-----|-----|
| Primary database | 1 hour | 4 hours |
| Object storage | 0 (replicated) | 1 hour |
| AI gateway | N/A (degraded mode) | 2 hours |
| WhatsApp webhooks | Queue replay 24h | 1 hour |

Multi-AZ minimum; cross-region DR for Enterprise.

---

## Vendor Security

| Vendor | Data shared | DPA required |
|--------|-------------|--------------|
| OpenAI / Anthropic / Google | Redacted prompts | Yes |
| ElevenLabs | Script text | Yes |
| Meta (WhatsApp) | Messages, media | Yes |
| Stripe | Payment metadata | Yes |
| Resend | Email addresses | Yes |
| AWS/GCP | All infrastructure | Yes |

Annual vendor review; subprocessors list published at `nertura.com/legal/subprocessors`.

---

## SOC 2 Readiness

| Trust criterion | Status target |
|-----------------|---------------|
| Security | Phase 2 Type I; Phase 3 Type II |
| Availability | 99.9% SLA documented |
| Confidentiality | Encryption + access control |
| Processing integrity | Credit ledger accuracy |
| Privacy | GDPR/KVKK alignment |

---

## User Permission System Summary

| Permission domain | Granularity |
|-------------------|-------------|
| Module access | View / create / edit / delete / admin |
| Farm scope | All farms or assigned list |
| AI features | By credit type allocation |
| Data export | Admin only default |
| WhatsApp send | Admin / manager |
| Approval authority | Role + domain configured |
| API access | Scoped keys |

Documented in `/product/core-modules.md` User Management; enforced at API + UI.

---

## Security Contacts

| Channel | Address |
|---------|---------|
| Vulnerability report | security@nertura.com |
| Privacy / DSR | privacy@nertura.com |
| PGP key | Published on security page |

---

*Document owner: Chief Systems Architect / Security*  
*Last updated: June 2026*  
*Companion: `/docs/data-privacy-kvkk-gdpr.md`*
