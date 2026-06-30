# Nertura — AI Governance Policy

> Enterprise governance framework for AI across operations, growth automation, and the path to full-auto publishing — ensuring Nertura grows intelligently without compromising safety, trust, or compliance.

---

## Purpose

Nertura is a **self-growing AI company**: Brain, agents, Media Factory, and Distribution Engine generate decisions and content at scale. This policy defines **who decides, what is allowed, how risk is managed, and when autonomy is earned**.

Applies to: all employees, contractors, AI agents, automated pipelines, and third-party models processing Nertura data.

**Companion docs:** `/product/approval-workflow.md`, `/docs/data-ownership-policy.md`, `/docs/data-privacy-kvkk-gdpr.md`, `/docs/security-compliance.md`, `/ai/brain-architecture.md`.

---

## Governance Principles

| # | Principle |
|---|-----------|
| 1 | **Human accountability** — AI recommends; humans remain accountable for approved publishes and high-impact actions |
| 2 | **Approval-first launch** — No public auto-publish until trust level earned |
| 3 | **Transparency** — Users know when AI is involved; sponsors labeled |
| 4 | **Privacy by default** — Training on customer data opt-in only |
| 5 | **Safety over engagement** — Agronomic harm prevention beats viral content |
| 6 | **Model humility** — Confidence thresholds; escalate when uncertain |
| 7 | **Audit everything** — Interactions, routing decisions, approvals logged |
| 8 | **Graduated autonomy** — Full-auto is earned per domain, revocable |

---

## Governance Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI GOVERNANCE BOARD (quarterly)               │
│  CEO · Chief AI Architect · DPO · Head of Ag Science · Legal    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  Operational AI            Growth AI              Risk & Compliance
  (farm, diagnosis)         (content, social)       (privacy, security)
        │                       │                       │
        ▼                       ▼                       ▼
  AI Agronomist owner      Content Director owner    DPO owner
```

### Roles

| Role | Responsibility |
|------|----------------|
| **AI Governance Board** | Policy approval, model promotion, incident review, auto-mode graduation |
| **Chief AI Platform Architect** | Architecture, model routing, agent permissions |
| **Data Protection Officer** | Consent, KVKK/GDPR, DPIA |
| **Head of Agricultural Science** | Agronomic accuracy, expert validation |
| **Founder / CMO** | Brand content approval (launch) |
| **On-call incident lead** | P1 AI incidents (24/7 rotation at scale) |

---

## Operating Modes (Mandatory Framework)

### Mode 1 — Approval-first (Launch default)

**Effective:** Phase 1–4 launch · **Scope:** All channels

| Activity | Requirement |
|----------|-------------|
| TikTok / Instagram / YouTube publish | Named approver sign-off |
| Blog publish | Editor approval |
| Email newsletter / campaign | Marketing approval |
| WhatsApp marketing broadcast | Admin approval |
| WhatsApp utility template | Meta approval + admin enable |
| AI bulk CRM message (>10) | Admin approval |
| Sponsor-labeled content | Compliance + approver |
| High-risk agronomic recommendation | User confirm + log |

**Technical enforcement:** Distribution Engine rejects non-`approved` bundles. No org flag may override at launch.

### Mode 2 — Assisted auto (Internal only)

| Activity | Rule |
|----------|------|
| Transactional email | Auto (verification, password, invoice) |
| AI Support tier-1 | Auto within policy |
| Internal analytics | Auto |

### Mode 3 — Graduated full-auto (Future)

Domains graduate independently via **Trust Level** (L0–L4):

| Level | Name | Example |
|-------|------|---------|
| **L0** | Manual only | Launch state; all public content |
| **L1** | Trusted templates | Pre-approved "weather tip" reel template |
| **L2** | Category auto | Evergreen blog; lifecycle email; frost WhatsApp |
| **L3** | Policy auto | Irrigation advisory if user opt-in |
| **L4** | Full autonomous | Calendar end-to-end with anomaly alerts |

**Graduation requires:** AI Governance Board or delegated approver + documented criteria met (`/product/approval-workflow.md`).

**Never auto (any phase):**

- Sponsor promotional claims without human review
- Pesticide rate recommendations off-label
- Bulk WhatsApp marketing without per-campaign approval [until L3+ with caps]
- Cross-customer data exposure
- Financial/investment advice

### Kill switches

| Scope | Authority |
|-------|-----------|
| Global auto-publish off | CEO or Chief AI Architect |
| Channel pause | CMO + Chief AI Architect |
| Model rollback | ML lead + Chief AI Architect |
| Single org | Org admin |

---

## Model Governance

### Approved model providers

| Provider | Use cases | Data agreement |
|----------|-----------|----------------|
| **OpenAI (GPT)** | JSON, email, fast tasks, vision fallback | Zero retention API |
| **Anthropic (Claude)** | Reasoning, scripts, blog | Zero retention API |
| **Google (Gemini)** | Regional language, long context | Zero retention API |
| **ElevenLabs** | Voice clone | DPA |
| **Runway / Veo / Kling** | Video | DPA |
| **Nertura Model** | Domain tasks when promoted | Internal |

New providers require DPA + Board notification.

### Model routing governance

| Decision | Rule |
|----------|------|
| Router selection | Logged per `/ai/brain-architecture.md` |
| Failover | Automatic; no human required |
| Nertura Model promotion | Eval suite pass + Board approval |
| Deprecation | 90-day notice for Enterprise API consumers |

### Model cards (required for production models)

- Intended use and limitations
- Training data summary (consented scope)
- Eval metrics and bias probes
- Known failure modes
- Version and rollback procedure

---

## Agent Governance

Eight agents per `/ai/agents.md` — each bound by:

| Control | Implementation |
|---------|----------------|
| Permission matrix | Hard-coded action allowlist |
| Sensitive actions | User or admin confirm |
| Cross-agent handoff | Logged in orchestrator |
| Prompt versions | Registry; change requires review |
| Support agent | No access to unrelated customer data |

Agents may not modify governance policies or approval records.

---

## Content & Growth AI Governance

### Media Factory + Content Pipeline

| Gate | Owner |
|------|-------|
| Agronomic fact check | AI Agronomist agent + sample human review |
| Brand | Marketing |
| Legal / sponsor label | Legal |
| Final publish (launch) | Founder or delegate |

### Social Distribution Engine

| Rule | Detail |
|------|--------|
| Approval token | Cryptographically tied to approver session |
| Schedule tamper | Post-approval edits re-enter approval |
| Auto mode | Mode Controller domain key + trust level |
| Incident | Unpublish playbook within 1h target |

### Channel-specific

| Channel | Additional rule |
|---------|-----------------|
| **TikTok / IG / YT** | AI disclosure in description where platform requires |
| **Blog** | Expert review for medical/food safety adjacent topics |
| **Email** | CAN-SPAM, GDPR list hygiene |
| **WhatsApp** | Meta template policy; opt-in |

---

## Data & Privacy Governance

| Topic | Policy |
|-------|--------|
| Customer data ownership | `/docs/data-ownership-policy.md` |
| Training consent | Opt-in; default off |
| PII in prompts | Redact before external API |
| Photo GPS | Strip unless consent |
| Global corpus | Anonymization pipeline + 1% human audit |
| DSR | 30-day SLA |

DPO may veto model training or feature launch on privacy grounds.

---

## Risk Classification

| Tier | Examples | Controls |
|------|----------|----------|
| **Critical** | Wrong pesticide advice; data breach; unauthorized publish | Block + human review + incident |
| **High** | Incorrect diagnosis; bulk wrong email | Confidence gate + confirm |
| **Medium** | Suboptimal irrigation tip | Disclaimer + feedback |
| **Low** | Generic platform help | Auto |

### Agronomic safety rules (hard blocks)

- Off-label chemical rates
- Recommendations contradicting organic certification constraints
- Confident diagnosis below 70% without uncertainty language
- Advice outside agricultural scope presented as fact

---

## Human Oversight Requirements

| Function | Minimum oversight (launch) |
|----------|----------------------------|
| Public content publish | 100% human approve |
| Expert agronomy content | Ag science spot-check 10% |
| Diagnosis QA | User feedback + 1% expert audit |
| Model promotion | Board review |
| Auto mode graduation | Board or delegated + documented |

Scale: oversight percentage may decrease only with proven eval metrics — never zero for sponsor or regulatory content.

---

## Incident Response (AI-specific)

| Severity | Example | Response |
|----------|---------|----------|
| **P1** | Harmful publish live; breach | Kill switch; unpublish; notify users if required; Board within 24h |
| **P2** | Widespread wrong diagnosis spike | Pause vision routing; rollback model |
| **P3** | Single user harm report | Triage; correction; feedback loop |
| **P4** | Eval regression in staging | Block promotion |

Post-incident: root cause, Learning System update, policy patch if needed.

---

## Evaluation & Monitoring

| Practice | Frequency |
|----------|-----------|
| Nertura eval suite | Every model/router change |
| Red team (prompt injection, jailbreak) | Quarterly |
| Bias probes (crop/region) | Quarterly |
| Approval queue audit | Weekly |
| Auto-mode domain review | Monthly |
| Provider cost vs quality | Monthly |
| User satisfaction (AI) | Continuous |

Public commitment: publish annual **AI Transparency Report** (Phase 3+).

---

## Third-Party AI

| Requirement | Detail |
|-------------|--------|
| DPA with all inference providers | ✓ |
| Subprocessor list public | ✓ |
| No training on Customer Data by providers | Contractual zero retention |
| Transfer impact assessment | EU/TR transfers documented |

---

## Employee & Contractor Use

- Internal use of external AI on Customer Data prohibited outside Brain infrastructure
- Prompt injection training for content reviewers
- Access to production AI logs: RBAC + audit

---

## Policy Review

| Trigger | Action |
|---------|--------|
| Quarterly | Board review standing |
| New channel launch | Addendum before go-live |
| Regulatory change (AI Act, KVKK) | DPO-led update |
| P1 incident | Immediate patch |

Version history maintained; material changes communicated to customers.

---

## Compliance Mapping

| Regulation | Governance alignment |
|------------|------------------------|
| **GDPR Art 22** | AI advisory; human override; no solely automated legal effects |
| **KVKK** | Explicit consent; VERBIS |
| **EU AI Act** | Risk assessment for high-risk ag decision support [monitor classification] |
| **Meta WhatsApp** | Template + opt-in |
| **Platform ToS** | No deceptive AI engagement |

---

## Summary

| Phase | Governance posture |
|-------|-------------------|
| **Launch** | Approval-first everything public; store everything; opt-in training |
| **Growth** | L1/L2 auto for narrow template domains only |
| **Scale** | Nertura Model with same gates; Board-governed autonomy |
| **Always** | Kill switches, audit, DPO veto, agronomic safety blocks |

Nertura grows by earning autonomy — not by taking it.

---

*Document owner: Chief Growth & Intelligence Architect / AI Governance Board*  
*Last updated: June 2026*  
*Status: Final platform foundation*
