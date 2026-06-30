# Nertura — Incident Response Plan

> Structured response process for security, privacy, availability, and AI safety incidents.

**Status:** Pre-implementation · **Owner:** CSO  
**Review:** Quarterly tabletop exercise

---

## Severity Classification

| Level | Definition | Examples | Response time |
|-------|------------|----------|---------------|
| **P0** | Active breach, data exfil, prod down | RLS bypass exploited, DB public, ransomware | 15 min ack; all-hands |
| **P1** | Major degradation or partial breach | Auth broken, Stripe webhook fail, AI cost runaway | 1 hour ack |
| **P2** | Limited impact bug | Single tenant data leak bug (patched), elevated errors | 4 hours ack |
| **P3** | Minor / latent | Dependency CVE medium, non-exploitable | Next business day |

---

## Incident Response Team

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | CSO or delegated CTO; coordinates response |
| **Technical Lead** | Engineering on-call; containment and fix |
| **Communications Lead** | CEO/COO; customer and regulator comms |
| **Legal Counsel** | External; breach notification obligations |
| **DPO / Privacy** | GDPR/KVKK assessment |

On-call rotation: weekly primary + secondary in PagerDuty/Better Stack.

---

## Response Phases

### 1. Detect

Sources: Sentry alerts, Cloudflare WAF, user report security@nertura.com, admin anomaly dashboard, Stripe fraud alerts, uptime monitor.

### 2. Triage (15 min P0)

- Assign IC and severity
- Open `#incident-YYYYMMDD` Slack channel
- Start incident log (Google Doc template)
- Preserve evidence — do not delete logs

### 3. Contain

| Action | When |
|--------|------|
| Revoke compromised API keys | Key leak |
| Disable affected admin accounts | Account compromise |
| Enable Cloudflare Under Attack mode | DDoS |
| Pause Brain inference | Cost abuse |
| Block IP ranges | Active attack |
| Rotate Supabase service role | DB credential suspicion |
| Take admin offline | Admin panel exploit |

### 4. Eradicate

- Patch vulnerability
- Deploy fix via emergency change process (CEO + CTO sign-off for prod)
- Verify RLS policies
- Scan for persistence

### 5. Recover

- Restore from backup if needed (test restore quarterly)
- Monitor error rates 24h post-fix
- Re-enable services gradually

### 6. Post-Incident (within 5 business days)

- Postmortem document: timeline, root cause, impact, action items
- Update runbooks
- Notify affected users if personal data affected (see Legal)
- Notify KVKK Board within **72 hours** if TR data subjects affected
- Notify EU DPA within **72 hours** if GDPR breach with risk to rights

---

## Communication Templates

### Internal (P0)

> P0 incident declared: [title]. IC: [name]. Channel: #incident-*. Standby for updates every 30 min.

### Customer (data breach)

> We identified a security issue affecting [scope]. We have [contained/remediated]. Actions you should take: [reset password, etc.]. Contact privacy@nertura.com.

Requires Legal approval before send.

### Regulator

Follow [`legal-compliance-master-plan.md`](legal-compliance-master-plan.md) notification matrix.

---

## AI-Specific Incidents

| Scenario | Response |
|----------|----------|
| Prompt injection mass exfil attempt | Block pattern; rotate prompts; audit affected orgs |
| Harmful ag advice caused damage | Preserve interaction; legal review; improve guardrails |
| Provider outage | Failover routing OpenAI → Claude → Gemini |
| Runaway credit burn | Global Brain kill switch; per-org caps |

---

## Contact List (maintain in 1Password)

| Contact | Channel |
|---------|---------|
| Supabase support | Dashboard ticket |
| Vercel support | Pro support |
| Cloudflare | Enterprise support |
| Stripe | Dashboard |
| External counsel | Phone |
| KVKK VERBIS | As required |
| EU DPA | Per lead establishment |

---

## Testing

- **Quarterly:** Tabletop scenario (ransomware, RLS bug, webhook spoof)
- **Annual:** Simulated phishing on staff
- **After every P0/P1:** Update this document

---

*Incident Response Plan v1.0 — Pre-implementation.*
