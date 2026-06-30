# Nertura — Audit Log System

> Immutable, queryable audit trail for security, compliance, and operational forensics.

**Status:** Pre-implementation · **Owner:** CSO  
**Companion:** [`security-master-plan.md`](security-master-plan.md), [`admin-panel-spec.md`](admin-panel-spec.md)

---

## Purpose

Every security-relevant and compliance-relevant action produces an **append-only** audit record. Audit logs support KVKK/GDPR accountability, SOC 2, incident investigation, and admin accountability.

---

## Architecture

```
Application / Brain / Webhook
        │
        ▼
  audit.emit(event)  ──►  Route Handler or DB trigger
        │
        ▼
  audit_logs table (append-only)
        │
        ├──► Admin Panel → Security / Audit views
        ├──► Axiom (structured log mirror)
        └──► SIEM export (Enterprise V3)
```

**Immutability:** Application roles have INSERT only on `audit_logs`. No UPDATE or DELETE except automated archive to cold storage after retention period (legal hold exempt).

---

## AuditLog Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `occurred_at` | TIMESTAMPTZ | Event time (UTC) |
| `actor_type` | ENUM | `user`, `admin`, `system`, `webhook` |
| `actor_id` | UUID | User or admin id; null for system |
| `actor_email` | VARCHAR | Denormalized for forensic readability |
| `organization_id` | UUID | Nullable for platform events |
| `category` | ENUM | See categories below |
| `action` | VARCHAR | e.g. `login.success`, `data.export` |
| `resource_type` | VARCHAR | e.g. `farm`, `diagnosis`, `subscription` |
| `resource_id` | UUID | |
| `severity` | ENUM | `info`, `warning`, `critical` |
| `ip_address` | INET | |
| `user_agent` | TEXT | |
| `request_id` | VARCHAR | Correlation id |
| `metadata` | JSONB | Before/after diff (redacted), extra context |
| `impersonation` | BOOLEAN | True if admin acting as user |

---

## Event Categories

| Category | Example actions |
|----------|-----------------|
| **auth** | login.success, login.failed, logout, mfa.enabled, password.reset |
| **authorization** | role.assigned, role.revoked, permission.denied |
| **data.read** | export.requested, export.completed, bulk.list |
| **data.write** | farm.created, field.updated, task.deleted |
| **ai** | inference.completed, diagnosis.feedback, action.executed |
| **consent** | consent.granted, consent.revoked |
| **billing** | subscription.created, payment.failed, credit.purchased |
| **approval** | content.submitted, content.approved, content.rejected |
| **admin** | impersonation.start, impersonation.end, config.changed |
| **security** | rate_limit.exceeded, upload.rejected, injection.blocked |
| **privacy** | deletion.requested, deletion.completed |

---

## Mandatory Audit Events

| Trigger | Required fields |
|---------|-----------------|
| Admin login | actor, ip, mfa status |
| Data export | org, actor, record count |
| Account deletion | user, org, retention exception list |
| Impersonation | admin id, target user, start/end |
| RLS bypass (service role) | log at application layer with justification code |
| Stripe webhook processed | event id, type, org |
| AI action execution | interaction id, action type, confirmed by user |
| Consent change | purpose, version, granted boolean |

---

## Retention

| Tier | Retention |
|------|-----------|
| Standard org events | 2 years |
| Security / auth events | 7 years |
| Consent records | 7 years after relationship end |
| Admin actions | 7 years |
| Enterprise contract | Custom up to indefinite |

Archive: move to `audit_logs_archive` cold table or S3 parquet monthly.

---

## Access Control

| Role | Access |
|------|--------|
| Super Admin | Full search |
| Security Admin | Full security + auth categories |
| Legal Admin | Consent + privacy + deletion |
| Read-only Analyst | Redacted metadata; no IP for non-security |
| Org owner | Own org audit summary (V2 self-service) |

---

## Admin UI

Location: Admin Panel → **Audit Logs**

Filters: date range, category, actor, org, action, severity, free text on resource id.

Export: CSV for legal hold; max 100K rows per export; export itself audited.

---

## Performance

- Partition `audit_logs` by month on `occurred_at`
- Indexes: `(organization_id, occurred_at)`, `(actor_id, occurred_at)`, `(category, action)`
- Async insert via queue if write latency >50ms on hot path

---

## Alerting Rules

| Condition | Alert |
|-----------|-------|
| 10+ failed logins same IP in 5 min | Slack #security |
| Admin impersonation started | Slack #admin-actions |
| Bulk export >10K records | Email Security Admin |
| `injection.blocked` spike | PagerDuty |

---

*Audit Log System v1.0 — Pre-implementation.*
