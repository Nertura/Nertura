# Nertura — Data Privacy (KVKK & GDPR)

> Regulatory data architecture for Turkey (KVKK) and European Union (GDPR) compliance — consent management, data subject rights, AI training governance, and cross-border transfer controls.

---

## Scope

Nertura operates globally. This document defines how personal data, farm operational data, photos, and AI interaction records are processed lawfully under:

| Law | Authority | Applies when |
|-----|-----------|--------------|
| **KVKK** (6698) | KVKK Board / VERBIS | User or data subject in Turkey; TR residency option |
| **GDPR** | EU supervisory authorities | User or data subject in EU; EU residency option |
| **LGPD, POPIA, etc.** | Local | Phase 5+ regional addenda |

Farm and crop data may constitute personal data when linked to identifiable farmers or sole proprietors.

---

## Data Classification

| Class | Examples | Default retention |
|-------|----------|-------------------|
| **Personal data** | Name, email, phone, IP | Account life + 30d |
| **Sensitive (special category)** | Rare in ag; health if ever collected | Explicit consent only |
| **Operational / farm data** | Fields, yields, inputs | Account life; exportable |
| **Photos / media** | Field photos, WA images | User-controlled delete |
| **AI interactions** | Q&A, diagnoses, feedback | See AI retention below |
| **Consent records** | Opt-in proofs | 7 years post-relationship |
| **Financial** | Invoices, payments | 7 years tax compliance |
| **Anonymized aggregates** | Regional yield stats | Indefinite |

---

## Lawful Basis Matrix

| Processing activity | GDPR basis | KVKK basis |
|---------------------|------------|------------|
| Account creation | Contract (Art 6(1)(b)) | PDPL Art 5/8 contract |
| Farm management | Contract | Contract |
| AI Q&A (operational) | Contract | Contract |
| Photo diagnosis | Contract + consent (training separate) | Explicit consent for special processing if needed |
| AI global training | Consent (Art 6(1)(a)) | Explicit consent |
| Marketing email | Consent | Explicit consent |
| WhatsApp AI | Consent (double opt-in) | Explicit consent |
| Fraud prevention | Legitimate interest (balanced) | Legal obligation / legitimate |
| Legal retention | Legal obligation | Legal obligation |
| Anonymized research | Legitimate interest / consent | Anonymization per KVKK guidelines |

---

## Consent Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSENT SERVICE                               │
├─────────────────────────────────────────────────────────────────┤
│  ConsentRecord · ConsentVersion · ConsentAudit                   │
│  UI: granular toggles · timestamp · IP · version · locale         │
└─────────────────────────────────────────────────────────────────┘
```

### ConsentRecord Entity

| Column | Description |
|--------|-------------|
| `id` | UUID |
| `user_id` | |
| `organization_id` | |
| `purpose` | ENUM — see below |
| `granted` | BOOLEAN |
| `version` | Policy version string |
| `channel` | web, mobile, whatsapp, email |
| `ip_address` | INET |
| `user_agent` | |
| `locale` | |
| `granted_at` | |
| `revoked_at` | |
| `proof_text` | Exact consent language shown |

### Consent purposes (granular)

| Purpose code | Description | Required? |
|--------------|-------------|-----------|
| `terms_of_service` | Platform use | Yes |
| `privacy_policy` | Data processing | Yes |
| `ai_operational` | AI for your farm (RAG, diagnosis) | Yes for AI features |
| `ai_training_global` | Anonymized contribution to global corpus | No |
| `photo_gps` | Retain GPS in photo EXIF | No |
| `marketing_email` | Newsletters, promotions | No |
| `marketing_whatsapp` | WA marketing templates | No |
| `whatsapp_ai` | AI assistant on WhatsApp | No (separate opt-in) |
| `social_white_label` | Use org brand in media | Business+ opt-in |

Withdrawal effective immediately for future processing; past lawful processing unaffected.

---

## AI Training Consent

| Data use | Consent required | Default |
|----------|------------------|---------|
| Store interaction for user history | `ai_operational` | On with AI use |
| Org-level RAG from corrections | `ai_operational` | On |
| Anonymized global corpus | `ai_training_global` | **Off** |
| Model fine-tuning export | `ai_training_global` | **Off** |
| Photo in global disease dataset | `ai_training_global` + explicit photo checkbox | **Off** |

UI pattern:

```
☐ Help improve Nertura for farmers worldwide
  Share anonymized data from my diagnoses and questions.
  My farm name and location will never be shared.
  [Learn more]
```

Separate from Terms; cannot be bundled pre-checked (KVKK + GDPR).

---

## Data Subject Rights

### GDPR / KVKK aligned rights

| Right | KVKK | GDPR | Nertura implementation |
|-------|------|------|------------------------|
| Access | ✓ | Art 15 | Self-service export + dashboard |
| Rectification | ✓ | Art 16 | Profile edit + support ticket |
| Erasure | ✓ | Art 17 | Deletion workflow (see below) |
| Restriction | ✓ | Art 18 | Flag account `processing_restricted` |
| Portability | ✓ | Art 20 | JSON/CSV export |
| Object | ✓ | Art 21 | Marketing opt-out; training opt-out |
| Automated decision-making | ✓ | Art 22 | AI is advisory; human override always |

### Request channels

- In-app: Settings → Privacy → Data rights
- Email: privacy@nertura.com
- Postal: Registered agent [EU/TR]

SLA: **30 days** (GDPR); KVKK **30 days** maximum.

---

## Data Deletion Workflow

```
User requests deletion
    → Identity verification (MFA or email confirm)
    → 7-day cooling-off (cancel window)
    → Soft delete account (login disabled)
    → 30-day grace (support recovery)
    → Hard delete job:
        · User PII purged
        · Photos removed from object storage
        · AI interactions anonymized OR deleted (user choice)
        · Org sole member → org deleted
        · Org member → user unlinked; org data retained
        · Consent records retained 7y (legal proof, PII minimized)
        · Billing records retained 7y (legal obligation)
        · Anonymized global nodes NOT deleted (no longer personal data)
    → Deletion certificate emailed
```

### Cascading rules

| Entity | On user delete |
|--------|----------------|
| Farms (sole owner) | Delete with confirmation |
| Marketplace orders | Anonymize party reference; retain transaction |
| CRM contacts | Delete or anonymize |
| WhatsApp messages | Delete content; retain metadata stub if legal hold |
| Audit logs | Anonymize user_id; retain event |

---

## Data Export (Portability)

Self-service export (`/app/settings/privacy/export`):

| Bundle | Format |
|--------|--------|
| Profile | JSON |
| Farms, fields, crops | JSON + GeoJSON |
| AI interactions | JSON |
| Photos | ZIP of originals |
| Reports | PDF |
| Consent history | JSON |
| Credit transactions | CSV |

Generated async; download link expires 72h; logged in audit.

---

## Photo Storage Policy (Privacy)

| Policy | Detail |
|--------|--------|
| Purpose limitation | Crop analysis, records, traceability only |
| GPS EXIF | Stripped unless `photo_gps` consent |
| Face detection | Incidental faces blurred in global training export |
| Third-party AI | Photos sent to vision API with zero-retention flag |
| Retention free tier | 90 days unless in active crop plan |
| Retention paid | Unlimited until user deletes |
| Children | Platform 18+; no knowing collection |

---

## Cross-Border Transfers

| Scenario | Mechanism |
|----------|-----------|
| EU user → US provider (OpenAI) | SCCs + DPA + zero retention |
| TR user → EU hosting | KVKK Board adequacy or explicit consent |
| EU user → TR processing | SCCs + TR addendum |
| Enterprise EU residency | Data stays in `eu-west` region; EU providers preferred |

`TransferImpactAssessment` documented per subprocessors.

---

## VERBIS & GDPR Register

| Obligation | Owner |
|------------|-------|
| VERBIS registration (Turkey) | Legal / DPO before TR launch |
| GDPR ROPA | Maintained quarterly |
| DPIA for AI + photos | Completed before Phase 2 AI scale |
| LIAs for legitimate interest | Marketing analytics |

Records of Processing Activities published internally; summary at `nertura.com/legal/privacy`.

---

## DPO & Representatives

| Role | Requirement |
|------|-------------|
| DPO (GDPR) | Appointed before EU scale; privacy@ contact |
| EU representative | Art 27 if no EU establishment |
| TR contact | KVKK inventory contact person |

---

## Children's Data

Nertura is not directed at under-18 users. Age affirmation at registration. Accounts flagged as minor → immediate deletion.

---

## Complete Data Inventory

Entities requiring storage (architecture reference):

| Domain | Entities |
|--------|----------|
| **Identity** | User, UserSession, Role, UserRole |
| **Organization** | Organization, Subscription |
| **Operations** | Farm, Field, Zone, CropPlan, CropTask, HarvestRecord, Observation, ObservationPhoto |
| **AI** | AIInteraction, AIInteractionDetail, AIInteractionMedia, AIPrediction, KnowledgeNode |
| **Learning** | Feedback events, LearningPipelineJob |
| **Credits** | CreditBalance, CreditTransaction |
| **Commerce** | Invoice, Payment, MarketplaceListing, Order |
| **CRM** | CRMAccount, CRMContact, CRMInteraction, CRMDeal |
| **Social** | SocialAccount, SocialPost, SocialPostAnalytics, MediaProductionJob |
| **WhatsApp** | WhatsAppMessage |
| **Email** | EmailLog |
| **Consent** | ConsentRecord, ConsentVersion |
| **Approval** | ApprovalRequest |
| **Governance** | AuditLog, FileUpload, DataExportJob, DeletionJob |

Full schemas: `/docs/database-blueprint.md` + extensions in `/ai/nertura-ai-brain.md`.

---

## Privacy by Design Checklist (New Features)

| Question | Must pass |
|----------|-----------|
| Lawful basis identified? | ✓ |
| Consent needed? If yes, granular? | ✓ |
| Data minimization applied? | ✓ |
| Retention period defined? | ✓ |
| Cross-border transfer assessed? | ✓ |
| DSR impact (export/delete)? | ✓ |
| Audit log event defined? | ✓ |
| DPIA required? | If high risk |

---

## KVKK-Specific Notes

| Requirement | Nertura approach |
|-------------|------------------|
| Explicit consent | Separate checkboxes; Turkish language consent text |
| Data inventory | VERBIS category mapping |
| Right to erasure | Same workflow as GDPR |
| Anonymization | KVKK Art 7 — irreversible; documented methodology |
| Data security | Technical + administrative measures documented |
| Breach notification | KVKK Board + affected data subjects if risk |

---

## GDPR-Specific Notes

| Requirement | Nertura approach |
|-------------|------------------|
| Privacy by design/default | Minimal default consents; training off |
| Cookie consent | Essential only without banner; analytics opt-in |
| Processor agreements | All AI/email/payment vendors |
| Art 22 | AI recommendations labeled advisory |
| CNIL / ICO guidance on AI | Transparency on model use; human review path |

---

*Document owner: Chief Systems Architect / DPO*  
*Last updated: June 2026*  
*Companion: `/docs/security-compliance.md`, `/ai/learning-system.md`*
