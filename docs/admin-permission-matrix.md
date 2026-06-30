# Nertura — Admin Permission Matrix

> Role-based access control for `admin.nertura.com`. Enforced server-side on every Route Handler.

**Status:** Pre-implementation · **Owner:** CSO  
**Companion:** [`admin-panel-spec.md`](admin-panel-spec.md)

---

## Admin Roles

| Role | Code | Purpose |
|------|------|---------|
| **Super Admin** | `super_admin` | Full platform control; impersonation; feature flags |
| **Security Admin** | `security_admin` | Security logs, audit, incident tools |
| **Legal Admin** | `legal_admin` | Consent, policies, deletion/export queue |
| **Content Admin** | `content_admin` | Content approval, blog publish |
| **AI Review Admin** | `ai_review_admin` | Diagnosis review, AI log export |
| **Support Admin** | `support_admin` | Users, orgs, tickets, read-only farms |
| **Finance Admin** | `finance_admin` | Subscriptions, payments, credits |
| **Marketing Admin** | `marketing_admin` | Email/WA campaigns, UTM, social schedule |
| **Read-only Analyst** | `analyst` | Dashboard metrics; redacted logs |

Users may hold **multiple** admin roles. Effective permissions = union of roles.

---

## Permission Matrix

| Permission | Super | Security | Legal | Content | AI Review | Support | Finance | Marketing | Analyst |
|------------|:-----:|:--------:|:-----:|:-------:|:---------:|:-------:|:-------:|:---------:|:-------:|
| **Dashboard view** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Users read** | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓* |
| **Users write** | ✓ | — | — | — | — | ✓ | — | — | — |
| **Users impersonate** | ✓ | — | — | — | — | — | — | — | — |
| **Orgs read** | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓* |
| **Orgs suspend** | ✓ | ✓ | — | — | — | — | — | — | — |
| **Farms read (support)** | ✓ | — | — | — | ✓ | ✓ | — | — | — |
| **AI logs read** | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | ✓* |
| **AI logs export** | ✓ | ✓ | ✓ | — | ✓ | — | — | — | — |
| **Diagnosis review** | ✓ | — | — | — | ✓ | — | — | — | — |
| **Content approve** | ✓ | — | ✓ | ✓ | — | — | — | ✓ | — |
| **Social approve** | ✓ | — | — | ✓ | — | — | — | ✓ | — |
| **WA center** | ✓ | — | ✓ | — | — | — | — | ✓ | — |
| **Email campaigns** | ✓ | — | ✓ | — | — | — | — | ✓ | — |
| **Credits grant** | ✓ | — | — | — | — | — | ✓ | — | — |
| **Credits grant >10K** | ✓† | — | — | — | — | — | ✓† | — | — |
| **Subscriptions manage** | ✓ | — | — | — | — | — | ✓ | — | — |
| **Payment logs** | ✓ | — | — | — | — | — | ✓ | — | ✓* |
| **Security logs** | ✓ | ✓ | — | — | — | — | — | — | — |
| **Audit logs read** | ✓ | ✓ | ✓ | — | — | — | ✓ | — | ✓* |
| **Audit logs export** | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| **Consent records** | ✓ | — | ✓ | — | — | ✓ | — | — | — |
| **Legal doc publish** | ✓ | — | ✓‡ | — | — | — | — | — | — |
| **Support tickets** | ✓ | — | — | — | — | ✓ | — | — | — |
| **System health** | ✓ | ✓ | — | — | — | ✓ | — | — | ✓ |
| **Feature flags** | ✓ | ✓ | — | — | — | — | — | — | — |
| **Admin roles manage** | ✓ | — | — | — | — | — | — | — | — |

\* Analyst: redacted — no IP, no full email (masked), no GPS  
† Requires second Super Admin or Finance Admin approval log entry  
‡ Legal doc publish requires two-person rule (Legal Admin + Super Admin)

---

## Implementation

### Database

```text
admin_users (user_id, roles[], mfa_enforced, created_by, ...)
admin_role_permissions (role, permission) -- seed from this matrix
```

### JWT / Session

Custom claim `admin_roles: string[]` set via Supabase hook after MFA verify on admin login only.

### Route Handler pattern

Every admin API: `requireAdminPermission('audit_logs.read')` → 403 if missing → `audit.emit()`.

### Provisioning

Super Admin creates admin users; Google Workspace group sync (V2). No self-registration on admin domain.

---

## Separation of Duties

| Action | Rule |
|--------|------|
| Publish legal policy | Legal Admin + Super Admin |
| Large credit grant | Two Finance or Super approvers |
| Impersonation | Super Admin; max 1 hour; user notification email (V2) |
| Feature flag prod change | Super Admin + Engineering on-call ack in Slack |

---

*Admin Permission Matrix v1.0 — Pre-implementation.*
