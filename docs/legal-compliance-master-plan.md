# Nertura — Legal & Compliance Master Plan

> Unified compliance architecture for KVKK, GDPR, AI governance, consent, and legal document lifecycle.

**Status:** Pre-implementation · **Owner:** Chief Legal Architect  
**Companion:** [`data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md), policy drafts in `/docs/`

---

## Regulatory Scope

| Regulation | Applies when | Lead document |
|------------|--------------|---------------|
| **KVKK** (Law 6698) | TR data subjects or processing in TR | [`data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md) |
| **GDPR** | EU/EEA data subjects | Same |
| **ePrivacy** | Cookies, marketing email | [`cookie-policy-draft.md`](cookie-policy-draft.md) |
| **Meta WhatsApp Commerce** | WA channel | [`../automation/whatsapp-integration.md`](../automation/whatsapp-integration.md) |
| **Stripe / PCI** | Payments | Stripe Checkout (SAQ A) |

**Legal entity:** Nertura [Legal Entity Name TBD — requires lawyer review]  
**DPO contact:** privacy@nertura.com  
**KVKK representative:** [TBD if required]

---

## Legal Document Registry

| Document | File | Status | Lawyer review |
|----------|------|--------|---------------|
| Privacy Policy | [`privacy-policy-draft.md`](privacy-policy-draft.md) | Draft v1 | **Required** |
| Terms of Service | [`terms-of-service-draft.md`](terms-of-service-draft.md) | Draft v1 | **Required** |
| Cookie Policy | [`cookie-policy-draft.md`](cookie-policy-draft.md) | Draft v1 | **Required** |
| AI Usage Policy | [`ai-usage-policy.md`](ai-usage-policy.md) | Draft v1 | **Required** |
| Data Retention Policy | [`data-retention-policy.md`](data-retention-policy.md) | Draft v1 | **Required** |
| DPA (Enterprise) | Template V2 | Not started | Required before Enterprise |

All public policies versioned: `policy_versions` table with `version`, `effective_at`, `content_hash`, `locale`.

---

## Consent Architecture

### Consent purposes (granular)

| Purpose | Required for | Default | Legal basis |
|---------|--------------|---------|-------------|
| `terms_acceptance` | Account | Required checkbox | Contract |
| `privacy_acknowledgment` | Account | Required checkbox | Contract / legal info |
| `photo_upload` | Observation/diagnosis | Implicit in upload action + notice | Contract |
| `ai_operational` | AI Q&A, diagnosis | Professional tier feature | Contract |
| `ai_training_global` | Global model improvement | **Opt-in OFF** | Consent |
| `marketing_email` | Newsletter | Opt-in OFF | Consent |
| `marketing_whatsapp` | WA messages | Double opt-in OFF | Consent |
| `analytics_cookies` | PostHog/GA detailed | Opt-in (EU) | Consent |
| `field_location_precision` | GPS in photos | Opt-in OFF | Consent |

Stored in `consent_records` — immutable append; revoke updates `revoked_at`.

### UI requirements

- Separate toggles; no bundling training with operational AI
- Exact text stored in `proof_text`
- Version string links to published policy
- Withdraw as easy as grant

---

## Data Subject Rights (GDPR & KVKK)

| Right | SLA | Process |
|-------|-----|---------|
| **Access** | 30 days | Self-service export + manual request |
| **Rectification** | 30 days | In-app edit or support ticket |
| **Erasure** | 30 days | Settings → Delete account; 30-day grace |
| **Restriction** | 30 days | Flag account `processing_restricted` |
| **Portability** | 30 days | JSON + CSV + photos ZIP |
| **Objection** | 30 days | Marketing opt-out immediate |
| **Automated decision** | On request | Human review of diagnosis |

Request channel: privacy@nertura.com or in-app Privacy Center (V2).

Identity verification: email confirmation + login for in-app; signed form for offline.

---

## KVKK-Specific

| Obligation | Implementation |
|------------|----------------|
| **VERBIS registration** | Register before processing TR personal data at scale |
| **Explicit consent** | Separate checkbox for non-contract processing |
| **Data inventory (VERBIS)** | Maintain processing inventory doc |
| **Cross-border transfer** | SCCs or adequacy; document in Privacy Policy |
| **Turkish language** | TR policy translations lawyer-reviewed |

**KVKK clarification text:** Included in Privacy Policy § Turkey and registration flow for TR users.

---

## GDPR-Specific

| Obligation | Implementation |
|------------|----------------|
| **Lawful basis documentation** | Matrix in [`data-privacy-kvkk-gdpr.md`](data-privacy-kvkk-gdpr.md) |
| **DPIA** | Required for AI photo processing at scale — conduct before 10K users |
| **DPO** | Appoint or external DPO before EU marketing push |
| **SCCs** | Supabase/Vercel/US transfers documented |
| **Records of processing** | RoPA maintained quarterly |

---

## AI & Agricultural Advice Disclaimers

Published in Terms + AI Usage Policy:

- Nertura is **decision support**, not licensed agronomic, veterinary, or legal advice
- User must verify recommendations with qualified professionals before chemical application
- Diagnosis confidence scores are probabilistic, not definitive
- Nertura not liable for crop loss from following AI suggestions (cap in Terms — lawyer draft)

---

## Breach Notification Matrix

| Jurisdiction | Authority | Deadline | Trigger |
|--------------|-----------|----------|---------|
| GDPR | Lead DPA | 72h | Risk to rights |
| KVKK | KVKK Board + data subjects | 72h | As per KVKK |
| Users | Direct | Without undue delay | High risk to individuals |

Process: [`incident-response-plan.md`](incident-response-plan.md).

---

## Admin Legal Tools

Admin Panel modules — see [`admin-panel-spec.md`](admin-panel-spec.md):

- Consent record search
- Legal document version manager
- Deletion/export request queue
- DPA status per Enterprise org

---

## Third-Party Processors (Sub-processors)

Maintain public sub-processor list at `nertura.com/legal/sub-processors`:

| Processor | Purpose | Location |
|-----------|---------|----------|
| Supabase | DB, auth, storage | US/EU selectable |
| Vercel | Hosting | US |
| Cloudflare | CDN, WAF | Global |
| Stripe | Payments | US |
| Resend | Email | US |
| OpenAI / Anthropic / Google | AI inference | US |
| PostHog | Analytics | EU option |
| Sentry | Errors | US |
| Meta | WhatsApp | US |
| ElevenLabs | Voice V3 | US |

30-day notice on sub-processor changes for Enterprise DPA.

---

## Pre-Launch Legal Checklist

- [ ] External counsel review of all draft policies
- [ ] Entity formation and signatory authority
- [ ] Stripe Terms of Service acceptance
- [ ] Supabase DPA signed
- [ ] VERBIS if launching TR
- [ ] Cookie banner tested against ePrivacy
- [ ] Insurance: cyber liability policy bound

---

*Legal & Compliance Master Plan v1.0 — Pre-implementation.*
