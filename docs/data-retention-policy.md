# Nertura — Data Retention Policy (Draft)

> **⚠️ REQUIRES FINAL LAWYER REVIEW BEFORE PUBLICATION**

**Document version:** 1.0-draft  
**Effective date:** [TBD]  
**Last updated:** June 2026

---

## 1. Purpose

This policy defines how long Nertura retains categories of data and when deletion occurs.

---

## 2. Retention Schedule

| Data category | Active account | After account deletion request | Legal hold |
|---------------|----------------|-------------------------------|------------|
| **Account profile** | Account life | Hard delete after 30-day grace | Extended if litigation |
| **Organization metadata** | Org life | Anonymized or deleted with org | Extended if litigation |
| **Farm/field/crop data** | Account life | Deleted in grace period | Extended |
| **Photos/observations** | Account life | Deleted with entity unless export taken | Extended |
| **AI interactions** | 3 years rolling (operational) | Deleted in grace; anonymized aggregates may remain if opted in | Extended |
| **Diagnosis images** | Account life + 1 year archive | Deleted in grace | Extended |
| **Consent records** | 7 years after relationship ends | Retained for proof | Retained |
| **Audit logs (security)** | 7 years | Retained | Retained |
| **Audit logs (general)** | 2 years | Retained 2 years min | Extended |
| **Invoices/payments** | 7 years (tax) | Retained | Retained |
| **Support tickets** | 3 years | Anonymized | Extended |
| **Marketing lists** | Until unsubscribe + 30 days | Deleted | — |
| **Backups** | Rolling 30-day PITR | Overwritten per cycle | — |
| **Anonymized analytics** | Indefinite | Indefinite | — |

---

## 3. Account Deletion Process

1. User requests deletion in Settings or via privacy@nertura.com
2. Identity verification
3. **30-day grace period** — account deactivated; user may cancel deletion
4. Hard delete job removes tenant data from primary DB and storage
5. Confirmation email sent
6. Backups purge within backup retention window
7. Audit/consent/financial records retained per table above

---

## 4. Data Export Process

Before deletion, user may request export (JSON + CSV + photos ZIP). Export link valid **7 days**. Export event audit logged.

SLA: **30 days** maximum; target **72 hours** for standard requests.

---

## 5. Inactive Accounts

Accounts with no login for **24 months** receive warning email. After **30 days** without response, account may be archived then deleted per schedule above (with data export offer).

---

## 6. Enterprise Contracts

Retention may be modified by written DPA; minimums in this policy apply unless contract specifies longer retention for compliance.

---

## 7. Contact

privacy@nertura.com

---

*Draft v1.0 — Requires final lawyer review.*
