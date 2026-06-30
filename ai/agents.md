# Nertura — AI Agent Architecture

> Specialized autonomous agents operating within the Nertura AI Brain — each with defined responsibilities, permission boundaries, and orchestration rules for a self-improving agriculture intelligence OS.

---

## Agent Philosophy

Nertura agents are **not separate chatbots**. They are **role-specialized execution personas** invoked by the AI Brain when task type, user role, or workflow context matches. All agents share:

- Unified **Memory System** (`/ai/memory-system.md`)
- Unified **Knowledge Graph** (`/ai/knowledge-graph.md`)
- Shared **Credit Gate**, **Consent Gate**, and **Action Executor**
- Common **audit trail** and **approval workflow** boundaries

```
User / System trigger
        │
        ▼
┌───────────────────┐
│   Agent Router    │  ← intent + role + org type
└─────────┬─────────┘
          │
    ┌─────┴─────┬─────────┬─────────┬─────────┐
    ▼           ▼         ▼         ▼         ▼
 AI Farmer  AI Agronomist  AI Content  AI CRM  ...
    │           │         Director    Manager
    └───────────┴─────────┴───────────┴─────────┘
                        │
                        ▼
              Memory + Knowledge Graph + Brain
```

---

## Agent Router

### Selection logic

| Input signal | Weight |
|--------------|--------|
| Explicit user request ("help me export") | Highest |
| User persona / role | High |
| Organization type (farm, exporter, cooperative) | High |
| Active module / screen context | Medium |
| Scheduled workflow trigger | Medium |
| Multi-agent orchestration plan | System-initiated |

### Multi-agent orchestration

Complex workflows decompose into agent handoffs:

```
Frost alert (system)
    → AI Farmer: assess field impact, recommend actions
    → AI Agronomist: validate disease risk if stress-related
    → AI CRM Manager: notify cooperative members [if co-op]
    → AI Support Agent: escalate if user confusion detected
```

Orchestrator agent (Brain core) maintains session state across handoffs.

---

## Agent Catalog

| Agent | Code | Primary users | Phase |
|-------|------|---------------|-------|
| AI Farmer | `agent.farmer` | Farmers, operators | 1 |
| AI Agronomist | `agent.agronomist` | Managers, agronomists | 1 |
| AI Content Director | `agent.content` | Marketing, founder | 4 |
| AI Social Media Manager | `agent.social` | Marketing | 4 |
| AI CRM Manager | `agent.crm` | Suppliers, co-ops, exporters | 3 |
| AI Export Manager | `agent.export` | Exporters, trade ops | 5 |
| AI Finance Advisor | `agent.finance` | Owners, finance, co-op admins | 2 |
| AI Support Agent | `agent.support` | All users | 1 |

---

## 1. AI Farmer

### Mission

Daily field companion — translates complex agronomy into **actionable, today-focused guidance** for owner-operators and field workers.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Daily ops** | Summarize today's tasks, weather, alerts |
| **Field guidance** | When to spray, irrigate, scout — plain language |
| **Photo help** | Guide photo capture; interpret diagnosis results |
| **Quick logging** | Propose task completion, observation notes |
| **Season awareness** | Growth stage reminders, upcoming deadlines |
| **WhatsApp parity** | Same persona on WhatsApp — concise, mobile-friendly |

### Knowledge access

| Layer | Access |
|-------|--------|
| User memory | Full |
| Field / crop memory | Assigned farms only |
| Org memory | Read (co-op policies if member) |
| Global corpus | RAG retrieve |
| Knowledge graph | Field → crop → task paths |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Answer questions | ✓ | No |
| Photo diagnosis | ✓ | No (credit gate) |
| Create task (self) | ✓ | User confirm |
| Create task (assign other) | ✗ | Route to manager |
| Modify crop plan | ✗ | Suggest only |
| Send WhatsApp | ✓ (self) | Template auto; AI reply in session |
| Publish content | ✗ | — |
| CRM write | ✗ | — |
| Financial transactions | ✗ | — |
| Bulk org actions | ✗ | — |

### Tone & constraints

- Second person; max 3 sentences per mobile reply
- Local language priority
- Never recommend off-label pesticide rates — reference product labels only
- Escalate to AI Agronomist when confidence <70% or query is technical

### Credit profile

Primarily TEXT + VISION + WA. Low media/voice consumption.

---

## 2. AI Agronomist

### Mission

Technical crop and soil expert — supports managers, agronomists, and cooperatives with **evidence-based recommendations** backed by citations and confidence scores.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Crop science** | Growth stages, input timing, rotation planning |
| **Disease / pest** | Deep diagnosis; differential diagnosis lists |
| **Soil & nutrition** | Interpret soil tests; fertilizer programs |
| **Yield analysis** | Forecast interpretation; scenario modeling |
| **Compliance** | PHI, organic constraints, regional regulations |
| **Validation** | Second opinion on AI Farmer diagnoses |
| **Expert loop** | Queue uncertain cases for human agronomist review |

### Knowledge access

| Layer | Access |
|-------|--------|
| All memory layers | Read within org scope |
| Knowledge graph | Full agronomic subgraph |
| Global corpus | Priority retrieval |
| Research corpus | Curated papers, extension guides |
| Learning System | Feedback and outcome nodes |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Technical Q&A | ✓ | No |
| Vision analysis (advanced) | ✓ | No |
| Propose crop plan changes | ✓ | Manager confirm |
| Propose input program | ✓ | Manager confirm |
| Override Farmer agent answer | ✓ (internal) | Logged |
| Create multi-field task batch | ✓ | Manager confirm |
| Export compliance report draft | ✓ | User confirm |
| Training data flag | ✓ | Consent-gated |
| Publish externally | ✗ | — |

### Escalation triggers

- Confidence <70%
- Conflicting RAG sources
- Regulatory-sensitive recommendation (restricted chemicals)
- User requests "expert human"

### Credit profile

TEXT (weighted higher for deep analysis) + VISION. Used by Professional+ tiers primarily.

---

## 3. AI Content Director

### Mission

Strategic editorial brain for Nertura brand and white-label customers — owns **topic strategy, narrative arc, and content quality** before production.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Topic strategy** | Daily/weekly content themes from Learning System trends |
| **Editorial calendar** | Plan slots across platforms and regions |
| **Script oversight** | Review and refine AI-generated scripts |
| **Brand voice** | Enforce tone, disclaimer, AI disclosure rules |
| **Campaign arcs** | Multi-part series (e.g., "Corn week") |
| **Performance review** | Analyze what topics drive engagement and signups |
| **White-label** | Adapt strategy per org brand kit [Business+] |

### Knowledge access

| Layer | Access |
|-------|--------|
| Global learning trends | Anonymized question/diagnosis frequency |
| Marketing analytics | UTM, social metrics |
| Org memory | Brand kit, banned topics |
| Competitor gap analysis | External trend feeds |
| **No access** | Individual farmer PII, field GPS |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Generate topic briefs | ✓ | No |
| Assign to Media Engine | ✓ | No |
| Edit scripts | ✓ | No |
| Submit to approval queue | ✓ | **Founder/admin required to publish** |
| Auto-publish | ✗ (L0 launch) | Future L1+ |
| Access user farm data | ✗ | — |
| Send user email/WA | ✗ | Route to CRM/Support agents |

### Handoff to AI Social Media Manager

Content Director produces **approved brief + script**; Social Media Manager handles platform adaptation and scheduling.

### Credit profile

TEXT (strategy) + MEDIA (brief previews). Heavy usage in Phase 4.

---

## 4. AI Social Media Manager

### Mission

Platform-native execution agent — transforms approved content into **per-platform assets, schedules, and engagement drafts**.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Platform adaptation** | Caption length, hashtags, aspect ratios |
| **Scheduling** | Optimal post times per platform/region |
| **Asset coordination** | Trigger Media Engine image/video/voice jobs |
| **Engagement drafts** | Draft replies to comments (approval L0) |
| **A/B variants** | Generate caption variants for testing |
| **Analytics reporting** | Weekly performance summaries |

### Platforms

Instagram, TikTok, YouTube Shorts, Facebook, LinkedIn — see `/automation/social-media-automation.md`.

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Generate platform variants | ✓ | No |
| Queue Media Engine jobs | ✓ | Credit gate |
| Schedule post (pending approval) | ✓ | **Must be approved** |
| Publish live | ✗ (L0) | Approval workflow |
| Reply to comment | Draft only (L0) | Admin approve |
| DM users | ✗ | — |
| Access operational farm data | ✗ | — |

### Credit profile

MEDIA + VOICE + TEXT. Bounded by daily media budget cap.

---

## 5. AI CRM Manager

### Mission

Relationship intelligence for cooperatives, suppliers, and exporters — **never loses a follow-up**, surfaces account health, drafts outreach.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Account health** | Score suppliers, members, buyers |
| **Follow-up detection** | Flag overdue interactions |
| **Outreach drafts** | Personalized email/WA messages |
| **Pipeline hygiene** | Stale deal alerts; stage recommendations |
| **Member engagement** | Cooperative member activity scoring |
| **Post-transaction** | Auto-suggest CRM account from marketplace order |
| **Segmentation** | Build cohorts for campaigns |

### Knowledge access

| Layer | Access |
|-------|--------|
| CRM entities | Full org scope |
| Marketplace history | Linked orders |
| Org memory | Member policies, contact prefs |
| User memory | Interaction history with accounts |
| Operational data | Aggregate only (yield trends per member) |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Read CRM | ✓ | RBAC |
| Log interaction (draft) | ✓ | User confirm |
| Create deal (draft) | ✓ | User confirm |
| Send email/WA | Draft | **Admin approval** if bulk >10 |
| Bulk message >500 | ✗ | Human only + board approval |
| Modify account data | Suggest | User confirm |
| Access unrelated user PII | ✗ | — |

### Credit profile

TEXT + WA. Email sends via Email Engine — not direct agent SMTP.

---

## 6. AI Export Manager

### Mission

Trade operations intelligence — supply visibility, compliance deadlines, documentation, and market timing for export organizations.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Supply forecasting** | Aggregate supplier harvest timing |
| **Compliance tracking** | Phytosanitary, origin cert deadlines |
| **Doc pack assembly** | Draft traceability reports |
| **Sourcing match** | Match buyer requirements to marketplace listings |
| **Supplier health** | Quality and documentation scores |
| **Market timing** | Sell/hold recommendations with disclaimers |
| **Shipment timeline** | Proactive deadline alerts |

### Knowledge access

| Layer | Access |
|-------|--------|
| Marketplace + CRM | Full (trade scope) |
| Supplier crop plans | With permission / transaction link |
| Traceability graph | Farm → harvest → order chain |
| Market forecast models | Business+ |
| Global corpus | Export regulations by destination |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Supply/demand analysis | ✓ | No |
| Draft traceability report | ✓ | User confirm before send |
| Draft compliance checklist | ✓ | No |
| Contact supplier | Draft message | CRM approval flow |
| Modify order status | ✗ | Suggest only |
| Legal/export compliance sign-off | ✗ | Human required |
| Financial commitment | ✗ | — |

### Credit profile

TEXT (reports) + MARKET forecast credits [Business+].

---

## 7. AI Finance Advisor

### Mission

Operational and agricultural economics advisor — **cost per hectare, input ROI, credit usage, subscription efficiency** — not a licensed financial securities advisor.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Cost analysis** | Input, water, labor cost per field/crop |
| **Scenario modeling** | "What if fertilizer +10%?" |
| **Credit optimization** | Suggest tier/pack based on usage |
| **Invoice summary** | Explain billing, forecast next invoice |
| **Co-op member dues** | Dues calculation assistance |
| **Market margin** | Export margin estimates (with disclaimers) |
| **ROI narratives** | Irrigation AI savings vs cost |

### Knowledge access

| Layer | Access |
|-------|--------|
| Billing + credits | User/org scope |
| Inventory costs | Org scope |
| Harvest + marketplace revenue | Org scope |
| Yield outcomes | For ROI linking |
| **No access** | Payment card details, bank accounts |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Cost reports | ✓ | No |
| Credit usage advice | ✓ | No |
| Recommend subscription change | ✓ | User action required |
| Execute payment | ✗ | — |
| Tax filing advice | ✗ | Disclaimer + refer professional |
| Investment advice | ✗ | Hard block |
| Modify billing | ✗ | — |

### Mandatory disclaimer

All outputs include: *"General operational guidance only. Not financial, tax, or investment advice. Consult qualified professionals."*

### Credit profile

TEXT primarily. Low cost per interaction; high retention value.

---

## 8. AI Support Agent

### Mission

First-line platform support — onboarding, how-to, troubleshooting, credit/billing questions, escalation to human support.

### Responsibilities

| Domain | Actions |
|--------|---------|
| **Platform help** | Feature navigation, settings |
| **Onboarding** | Guide first field, first diagnosis |
| **Troubleshooting** | Sync issues, login, WhatsApp linking |
| **Billing FAQ** | Credits, subscriptions, invoices |
| **Privacy requests** | Initiate export/deletion workflows |
| **Escalation triage** | Route to human with context bundle |
| **Sentiment detection** | Flag frustrated users |

### Knowledge access

| Layer | Access |
|-------|--------|
| Platform documentation | Full |
| User account metadata | Name, tier, credit balance — no farm detail unless user confirms identity |
| Audit log summary | Last 10 actions for troubleshooting |
| **Restricted** | Other users' data, admin configs |

### Permissions

| Action | Permission | Approval |
|--------|------------|----------|
| Answer help questions | ✓ | No |
| Guide through UI flows | ✓ | No |
| Initiate password reset | ✓ (link only) | Email flow |
| Trigger data export job | ✓ | MFA confirm |
| Trigger deletion request | ✓ | MFA + cooling-off |
| Impersonate user | ✗ | Human support only |
| Issue credit refund | ✗ | Human support |
| Modify RBAC | ✗ | — |

### Escalation to human

Triggers: billing dispute, data breach report, legal request, 3× unresolved loop, explicit "talk to human".

### Credit profile

TEXT — free for support interactions (does not consume user credits). Cost center for Nertura.

---

## Permission Matrix (Summary)

| Action | Farmer | Agronomist | Content | Social | CRM | Export | Finance | Support |
|--------|:------:|:----------:|:-------:|:------:|:---:|:------:|:-------:|:-------:|
| Read own field data | ✓ | ✓ | ✗ | ✗ | ◐ | ◐ | ✓ | ◐ |
| Vision diagnosis | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Create task | ◐ | ◐ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Publish social | ✗ | ✗ | ◐ | ◐ | ✗ | ✗ | ✗ | ✗ |
| CRM write | ✗ | ✗ | ✗ | ✗ | ◐ | ◐ | ✗ | ◐ |
| Marketplace actions | ✗ | ✗ | ✗ | ✗ | ◐ | ✓ | ✗ | ✗ |
| Billing read | ◐ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Cross-user data | ✗ | ◐ | ✗ | ✗ | ◐ | ◐ | ✗ | ✗ |

**✓** allowed · **◐** draft/suggest/confirm · **✗** denied

---

## Agent System Prompts

Each agent receives a **base Nertura system prompt** plus agent-specific overlay:

| Component | Content |
|-----------|---------|
| Safety | Agricultural scope; no medical/legal/investment where blocked |
| Memory injection | Retrieved memory chunks from Memory System |
| Graph context | Knowledge Graph subgraph for current entities |
| Agent persona | Role, tone, permission boundaries |
| Output schema | JSON structure for actions and citations |
| Citation rule | Source IDs required for factual claims |

Prompts versioned in registry; changes audited.

---

## Autonomous Workflow (Future)

Agents graduate to autonomous mode per `/product/approval-workflow.md` trust levels:

| Agent | L3 autonomous candidate (future) |
|-------|----------------------------------|
| AI Farmer | Task reminders, irrigation advisory |
| AI Agronomist | Scout scheduling on validated patterns |
| AI Social | Template category auto-publish |
| AI CRM | Single-recipient follow-up templates |
| AI Export | Deadline reminders |
| AI Finance | Monthly usage report delivery |
| AI Support | Tier-1 fully automated |

AI Content Director and bulk CRM never fully autonomous without human category approval.

---

## Observability

| Metric | Per agent |
|--------|-----------|
| Invocations / day | Volume |
| User satisfaction | Feedback rate |
| Escalation rate | To human or higher agent |
| Action confirm rate | Proposed → confirmed |
| Credit consumption | Cost center |
| Policy blocks | Safety triggers |

---

## Integration Map

| System | Integration |
|--------|-------------|
| AI Brain | Parent orchestrator — `/ai/nertura-ai-brain.md` |
| Memory System | Context injection — `/ai/memory-system.md` |
| Knowledge Graph | Entity resolution — `/ai/knowledge-graph.md` |
| Learning System | Feedback routing — `/ai/learning-system.md` |
| Approval workflow | Publish and bulk actions — `/product/approval-workflow.md` |
| Credits | Per-agent metering — `/product/credit-system.md` |

---

*Document owner: Chief AI Platform Architect*  
*Last updated: June 2026*  
*Status: Approved foundation*
