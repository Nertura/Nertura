# Nertura — CRM Screens

> Complete UX specification for relationship management across customers, suppliers, buyers, and cooperative members. Salesforce pipeline discipline with Stripe-level list clarity.

---

## CRM IA Overview

```
CRM
├── Dashboard (pipeline summary)
├── Accounts
│   └── Account detail (tabbed)
├── Contacts
├── Interactions
├── Pipeline (deals board)
├── Members [Cooperative / Business]
└── Segments & bulk actions [Business+]
```

**CRM visibility by tier:**
- Professional: 100 accounts, interactions, basic list
- Business+: Unlimited, pipeline, members, bulk messaging

---

## Screen 1: CRM Dashboard (`/app/crm`)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CRM                                              [ + Account ] [ Log ]    │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ OPEN DEALS  │ │ PIPELINE    │ │ FOLLOW-UPS  │ │ ACCOUNTS    │        │
│ │ 12          │ │ $1.2M       │ │ 5 due today │ │ 248 active  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
├────────────────────────────────────────────┬─────────────────────────────┤
│ PIPELINE SUMMARY                             │ FOLLOW-UPS DUE            │
│ ┌──────┬──────┬──────┬──────┬──────┬──────┐  │ ┌─────────────────────┐   │
│ │ Lead │ Qual │ Prop │ Neg  │ Won  │ Lost │  │ │ ○ Call Ana R.       │   │
│ │  8   │  6   │  4   │  3   │  24  │  5   │  │ │   Finca del Sur · Today│
│ └──────┴──────┴──────┴──────┴──────┴──────┘  │ │ ○ Send contract     │   │
│ [ Open pipeline board → ]                    │ │   Valle Verde · Tomorrow│
│                                              │ └─────────────────────┘   │
├────────────────────────────────────────────┤ RECENT ACTIVITY           │
│ TOP ACCOUNTS BY REVENUE                      │ · Call logged — 2h ago    │
│ 1. Valle Verde Co-op · $420K                 │ · Deal won — 5h ago       │
│ 2. Nertura Trade · $310K                     │ · Note added — 1d ago     │
│ 3. AgriSupply Ltd · $180K                    │ [ View all → ]            │
└────────────────────────────────────────────┴─────────────────────────────┘
```

Dashboard adapts by org type — see variants below.

---

## CRM Dashboard Variants

### Supplier CRM

| KPI | Emphasis |
|-----|----------|
| Open deals | Customer orders pipeline |
| Pipeline | Revenue forecast |
| Follow-ups | Reorder reminders |
| Accounts | Farm/cooperative customers |

### Exporter CRM

| KPI | Emphasis |
|-----|----------|
| Open deals | Sourcing deals |
| Pipeline | Supply volume (tonnes) |
| Follow-ups | Document/compliance follow-ups |
| Accounts | Supplier health scores |

### Cooperative CRM

| KPI | Emphasis |
|-----|----------|
| Members active | Engagement |
| Deliveries overdue | Operational |
| Follow-ups | Member outreach |
| Pipeline | Collective sales |

---

## Screen 2: Account List (`/app/crm/accounts`)

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Accounts · 248                              [ + Account ]  [ Import ]     │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search accounts...     Type ▾  Status ▾  Tags ▾  [ Table · Cards ]    │
├──────────────────────────────────────────────────────────────────────────┤
│ ☐  Name              Type        Status    Last contact   Revenue   Owner │
│ ☐  Valle Verde       Cooperative Active   2 days ago     $420K    Elena  │
│ ☐  Nertura Trade     Buyer       Active   Today          $310K    Sophie │
│ ☐  Finca del Sur     Supplier    At risk  14 days ago    $85K     Sophie │
│ ☐  AgriSupply Ltd    Supplier    Active   3 days ago     $180K    Ahmed  │
├──────────────────────────────────────────────────────────────────────────┤
│ ☐ 3 selected    [ Tag ] [ Assign ] [ Message ] [ Export ]                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### Bulk Actions [Business+]

Select rows → Tag, Assign owner, Send message, Export CSV.

### Account Card View

For mobile and optional desktop toggle — photo/logo, name, type badge, last interaction, health dot.

---

## Screen 3: Account Detail (`/app/crm/accounts/:id`)

### Wireframe — Overview Tab

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Accounts    Valle Verde Cooperative ✓          [ Edit ] [ Message ]     │
│ Cooperative · Active · Minas Gerais, Brazil                               │
├──────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Contacts] [Interactions] [Deals] [Orders] [Documents]        │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ACCOUNT INFO                               │ HEALTH SCORE                │
│ Type: Cooperative                          │ ┌─────────────────────────┐ │
│ Member since: 2019 (Nertura)               │ │       92 / 100          │ │
│ Primary contact: Elena Vasquez             │ │  ████████████████████░░ │ │
│ Tags: corn, soy, premium                   │ │  Excellent              │ │
│ Linked org: @valle-verde (Nertura)         │ └─────────────────────────┘ │
│                                            │ FACTORS                     │
│ MARKETPLACE ACTIVITY                       │ Delivery  ·········  95%    │
│ 24 completed orders · $420K total          │ Quality   ·········  88%    │
│ Last order: 12 Jun 2026                    │ Response  ·········  91%    │
│ [ View in Marketplace ]                    │ Docs      ·········  94%    │
├────────────────────────────────────────────┤                             │
│ RECENT INTERACTIONS              View all →│ QUICK ACTIONS               │
│ · Call — discussed Q3 volume — 2d ago      │ [ Log call ]                │
│ · Email — contract sent — 1w ago           │ [ Create deal ]             │
│ · Meeting — quality review — 2w ago        │ [ Schedule follow-up ]      │
└────────────────────────────────────────────┴─────────────────────────────┘
```

### Contacts Tab

| Column | Content |
|--------|---------|
| Name | Primary badge if applicable |
| Role | Job title |
| Email / Phone | Click to action |
| Last contact | Relative date |

### Interactions Tab

Chronological activity timeline (Salesforce pattern):

```
● 19 Jun 2026 — Call (15 min)
  Elena Vasquez · Discussed Q3 corn volume
  Follow-up: Send updated pricing — due 21 Jun
  [ Edit ] [ Complete follow-up ]

● 12 Jun 2026 — Email
  Contract ORD-8821 sent
  [ View email ]
```

Filter: All · Calls · Meetings · Emails · Notes

### Deals Tab

Embedded pipeline filtered to this account.

### Orders Tab

Marketplace orders linked to account — read-only mirror.

### Documents Tab

Uploaded files: contracts, certificates, invoices. Drag-drop upload.

---

## Screen 4: Create Account (`/app/crm/accounts/new`)

```
┌─────────────────────────────────────────┐
│ New account                             │
├─────────────────────────────────────────┤
│ Account name *    [________________]    │
│ Type *            [ Cooperative    ▾ ]  │
│ Status            [ Active         ▾ ]  │
│ Country           [ Brazil         ▾ ]  │
│ Tags              [ corn ] [ + ]        │
│ Link Nertura org  [ Search...      ]    │  ← optional
├─────────────────────────────────────────┤
│ PRIMARY CONTACT (optional)              │
│ Name              [________________]    │
│ Email             [________________]    │
│ Phone             [________________]    │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Create ]      │
└─────────────────────────────────────────┘
```

Auto-create from Marketplace: when order completes, prompt "Add as CRM account?"

---

## Screen 5: Log Interaction (`/app/crm/interactions/new`)

Modal or slide-over — accessible from account detail, dashboard, global ⌘K.

```
┌─────────────────────────────────────────┐
│ Log interaction                         │
├─────────────────────────────────────────┤
│ Account *         [ Valle Verde      ▾ ]│
│ Contact           [ Elena Vasquez    ▾ ]│
│ Type *            [ Call             ▾ ]│
│ Date *            [ 19 Jun 2026  14:30 ]│
│ Subject           [ Q3 volume discuss ] │
│ Summary *         ___________________   │
│                   ___________________   │
│ ☐ Schedule follow-up                    │
│   Date [ 21 Jun ]  Assign [ Elena   ▾ ] │
├─────────────────────────────────────────┤
│ [ Cancel ]              [ Save ]        │
└─────────────────────────────────────────┘
```

---

## Screen 6: Pipeline Board (`/app/crm/pipeline`)

### Kanban Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Pipeline · $1.2M total                              [ + Deal ]  [ Filter ]  │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤
│ LEAD     │ QUALIFIED│ PROPOSAL │ NEGOTIATE│ WON      │ LOST             │
│ $320K    │ $280K    │ $410K    │ $190K    │ $2.1M    │ $45K             │
│ 8 deals  │ 6        │ 4        │ 3        │ 24       │ 5                │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────┤
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │                  │
│ │Corn  │ │ │Soy   │ │ │Wheat │ │ │Corn  │ │          │                  │
│ │500t  │ │ │200t  │ │ │150t  │ │ │800t  │ │          │                  │
│ │$105K │ │ │$96K  │ │ │$29K  │ │ │$168K │ │          │                  │
│ │Valle │ │ │Nertura│ │ │Finca │ │ │Valle │ │          │                  │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │          │                  │
│ ┌──────┐ │          │          │          │          │                  │
│ │ ...  │ │          │          │          │          │                  │
│ └──────┘ │          │          │          │          │                  │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────┘
```

### Deal Card

| Element | Content |
|---------|---------|
| Title | Product or deal name |
| Value | Currency |
| Account | Linked account name |
| Close date | Expected |
| Owner | Avatar |

Drag between columns → stage change → optional "Log interaction?" prompt.

---

## Screen 7: Deal Detail (`/app/crm/deals/:id`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Pipeline    Corn export Q3 · Valle Verde              Stage: Negotiation│
├──────────────────────────────────────────────────────────────────────────┤
│ $168,000 USD · Close: 30 Jul 2026 · Owner: Sophie Laurent                │
├────────────────────────────────────────────┬─────────────────────────────┤
│ DEAL INFO                                  │ STAGE HISTORY               │
│ Account: Valle Verde Cooperative           │ 19 Jun — Negotiation        │
│ Product: Yellow Corn · 800t                │ 10 Jun — Proposal sent      │
│ Linked listing: LST-4421                   │ 01 Jun — Qualified          │
│ Linked order: —                            │ 25 May — Lead               │
├────────────────────────────────────────────┤                             │
│ ACTIVITY TIMELINE                          │ ACTIONS                     │
│ [Same component as account interactions]   │ [ Advance stage ]           │
│                                            │ [ Link order ]              │
│                                            │ [ Mark won ] [ Mark lost ]  │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Mark lost** requires reason: Price · Timing · Quality · Competitor · Other.

---

## Screen 8: Members (`/app/crm/members`) [Cooperative]

### Member List

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Members · 320                            [ Invite ] [ Import ] [ Export ] │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search...   Status ▾  Region ▾  Engagement ▾                          │
├──────────────────────────────────────────────────────────────────────────┤
│ Name           Farm              Status   Last active  Delivery  Yield   │
│ José M.        La Esperanza      Active   Today        On track   +5%    │
│ Ana R.         Santa Clara       Active   3d ago       Overdue    -18%   │
│ Pedro S.       Los Altos         Inactive 21d ago      —          —      │
└──────────────────────────────────────────────────────────────────────────┘
```

Engagement: Active (7d login) · Moderate (30d) · Inactive (30d+)

---

## Screen 9: Member Detail (`/app/crm/members/:id`)

Combines CRM account patterns with member-specific data:

| Section | Content |
|---------|---------|
| Performance vs co-op avg | Yield, delivery timeliness |
| Farm link | Deep link to member's farm in Nertura |
| Delivery history | Season table |
| Payment status | Dues, outstanding |
| Messages | Bulk + direct history |

Actions: `Send message`, `View farm`, `Flag for visit`, `Generate member report`

---

## Screen 10: Bulk Message Composer [Business+]

```
┌─────────────────────────────────────────┐
│ Message members                         │
├─────────────────────────────────────────┤
│ To: 45 members matching filters         │
│     [ Edit selection ]                  │
│ Template  [ Frost advisory         ▾ ]  │
│ Channel   ☑ In-app  ☑ Email  ☐ SMS     │
│ Subject   [ Frost advisory — Thu night ]│
│ Message   ___________________________   │
│           ___________________________   │
│ Preview variables: {{first_name}},      │
│                    {{farm_name}}          │
├─────────────────────────────────────────┤
│ [ Cancel ]        [ Send to 45 members ]│
└─────────────────────────────────────────┘
```

Confirmation step shows recipient count and sample preview.

---

## Screen 11: Contact Detail (`/app/crm/contacts/:id`)

Lightweight profile: name, account link, contact info, interaction history filtered to contact, primary contact toggle.

---

## Mobile CRM Screens

| Screen | Adaptation |
|--------|------------|
| Dashboard | KPI carousel + follow-ups list |
| Accounts | Card list; swipe actions |
| Account detail | Tabs as horizontal scroll |
| Log interaction | Full-screen form |
| Pipeline | Horizontal scroll columns; one visible |
| Members | Card list with engagement badge |

Route: `/m/more/crm`

---

## Auto-Linking Rules

| Event | CRM Action |
|-------|------------|
| Marketplace order completed | Create/update account; log interaction |
| Nertura org linked | Sync profile; show verified badge |
| Member joins cooperative | Create member record |
| Deal won | Link to order; update revenue on account |

---

## Empty States

| Screen | Message | CTA |
|--------|---------|-----|
| No accounts | Track customers, suppliers, and buyers | Add account |
| No deals | Visualize your sales pipeline | Create deal |
| No interactions | Log calls and meetings to build history | Log interaction |
| No members | Import your cooperative roster | Import members |

---

## Permissions

| Action | Owner | Admin | Manager | Partner |
|--------|:-----:|:-----:|:-------:|:-------:|
| View accounts | ✓ | ✓ | ✓ | Own |
| Create account | ✓ | ✓ | ✓ | — |
| Delete account | ✓ | ✓ | — | — |
| Pipeline edit | ✓ | ✓ | ✓ | Own deals |
| Bulk message | ✓ | ✓ | — | — |
| Member management | ✓ | ✓ | ✓ | — |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| CRM DAU / paid CRM users | >50% |
| Interaction logging rate | >3 per active account per month |
| Follow-up completion | >70% on due date |
| Pipeline accuracy | Won value within 15% of forecast |
| Auto-account creation adoption | >80% from marketplace orders |

---

*Document owner: Product Design*  
*Last updated: June 2026*  
*Personas: `/docs/user-personas.md`*
