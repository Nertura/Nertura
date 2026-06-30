# Nertura — MVP Definition

> **Exact scope for Day 90 GA launch.** This document is the cut line. If it is not listed under **Must have**, it does not ship in 90 days.

**Launch goal:** 90 days from engineering start to paid GA  
**Launch customer:** Mid-size commercial farmer / farm manager (P0 only)  
**Launch surface:** Responsive web + PWA · **One** primary region · **Two** languages (EN + 1 pilot)  
**Authority:** Defers to [`founder-decisions.md`](founder-decisions.md) on strategy; **this document wins on launch scope and timing**

**Status:** Final MVP scope · **Review:** Weekly during build  
**Last updated:** June 2026

---

## Launch Thesis (90 Days)

Nertura MVP is **not** an AgOS. It is **one product**:

> **AI in the field + enough operations to make AI useful.**

A farmer signs up, maps fields, plans a crop, logs a photo, gets a diagnosis, asks a question with field context, and completes a task — **on web or phone, in one session, without support.**

Everything else is Version 2 or later.

---

## Success Criteria (Day 90)

| Metric | Target | Why |
|--------|--------|-----|
| Time to first diagnosis | <24 hours from signup | First AI module proof |
| Weekly active farms | 100 paid or trialing | PMF signal |
| 30-day retention | >50% | Stickiness |
| AI feedback rate | >15% of diagnoses | Learning loop alive |
| P0 support tickets / user / month | <0.5 | Scope is small enough to support |
| Critical bugs in production | 0 open >48h | Trust |

**Not measured at Day 90:** GMV, community MAU, social followers, WhatsApp volume, enterprise logos.

---

## Global MoSCoW

### Must have (Day 90)

| Area | Scope |
|------|-------|
| **Identity** | Email/password auth · email verify · password reset · org + up to 3 users · roles: owner, operator, viewer (fixed) |
| **Tenant** | Single org · row-level isolation · 1 farm · up to 10 fields |
| **Dashboard** | Farmer home only · fixed layout · KPI strip · alert feed · today’s tasks · 1 AI insight slot · no customize |
| **Field Management** | Farm CRUD · field draw on map · field list · field overview (area, crop link, status) |
| **Crop ops** | One active crop plan per field · task list (create, assign, complete, due date) · observation log with photo attach |
| **Weather** | 7-day forecast · current conditions · **rule-based** frost + heavy-rain alerts · in-app + email alert delivery |
| **AI Assistant** | Farm-aware Q&A · floating panel · references active field/crop when on entity page · action: create task only · EN + 1 language |
| **Disease Detection** | Photo in → diagnosis out · **4 crops:** corn, soybean, wheat, tomato · confidence score · confirm/wrong feedback · link to field |
| **Notifications** | In-app center · email for alerts and auth · read/unread |
| **Billing** | Stripe · **Starter ($29)** + **Professional ($99)** only · 14-day trial on Pro · hard AI limits on Starter (no assistant) |
| **Mobile** | PWA · installable · offline observation queue · camera capture · sync on reconnect |
| **Brain foundation** | Store 100% AI interactions · consent record on signup · credit ledger (generous grants; minimal UI) |
| **Compliance** | Privacy policy · Terms · GDPR/KVKK-ready export/delete · no training on customer data without opt-in checkbox |
| **Marketing site** | Homepage + pricing + register/login · no blog CMS required (static OK) |

### Should have (Day 90 only if ahead of schedule — cut first)

| Item | Condition to include |
|------|----------------------|
| 5 standard PDF reports (harvest, tasks, inputs, weather summary, field summary) | Core flows stable by Day 75 |
| Basic inventory (50 SKU, manual stock) | Do not slip AI or field work |
| GDD on weather widget | 1 engineer-day or less |
| Second language fully QA’d | Not at expense of EN UX |
| Professional tier: up to 5 farms | Only if multi-farm is 3 days or less incremental |

### Could have (nice; never block launch)

| Item |
|------|
| ⌘K global search (fields + tasks only) |
| Onboarding checklist widget on dashboard |
| Help center (10 static articles) |
| Referral link on settings |
| Dark mode |

### Not now (explicitly out of Day 90)

| Item | Earliest |
|------|----------|
| WhatsApp product module | Version 2 (post Day 90); full AI WhatsApp per founder Phase 3 |
| Marketplace | Version 2 |
| CRM | Version 2 |
| Dedicated Analytics module | Version 2 |
| Content Engine | Version 3 |
| Email automation (marketing/lifecycle) | Version 2 (transactional only in MVP) |
| Social media automation | Version 3 |
| Cooperative / Enterprise / Agronomist dashboards | Version 2+ |
| Native iOS/Android apps | Version 2 |
| Irrigation module | Version 2 |
| Full inventory / warehouses | Version 2 |
| Expert agronomist review queue | Version 2 |
| Yield prediction · irrigation AI · market AI | Version 2 |
| Business ($349) · Enterprise tiers | Version 2 |
| Public API · webhooks · SSO | Version 2 / 3 |
| Custom dashboard layout | Version 2 |
| Community network | Version 3 |
| Media Factory · voice clone · video gen | Version 3 |
| Sponsor network | Version 3 |
| Multi-region deployment | Version 3 |
| Autonomous AI actions without user confirm | Never at launch; governance applies |

---

## 90-Day Timeline

| Phase | Days | Ship |
|-------|------|------|
| **Foundation** | 1–30 | Auth · org · users · farm/field CRUD · map draw · empty dashboard shell |
| **Operations** | 31–60 | Crop plan · tasks · observations · weather + alerts · notifications · PWA offline capture |
| **Intelligence + GA** | 61–90 | AI Assistant (Pro) · disease detection (4 crops) · billing · onboarding · polish · beta → GA |

**Gate at Day 60:** Internal dogfood — team completes full loop (signup → field → photo → diagnosis → task → AI question) on mobile PWA. **No Day 61 AI work if gate fails.**

**Gate at Day 75:** Feature freeze. Days 76–90: bugs, performance, compliance, app store PWA manifest only.

---

## Module Definitions

For each module: **Must / Should / Could / Not now** for Day 90, then **MVP (Day 90) · Version 2 · Version 3**.

---

### 1. AI Assistant

**Job:** Answer farm questions with context; create tasks from chat; prove Brain is not generic ChatGPT.

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| Floating panel on `/app/*` | Full-page `/app/ai` with history | Suggested prompt chips (3) | Voice input |
| Farm + field context auto-attach | 50 queries/day soft cap on Pro | Export conversation | Proactive insights beyond 1 dashboard card |
| GPT/Claude via Brain gateway (no direct module calls) | | | Multi-agent routing (Agronomist, Commerce) |
| Streaming text response | | | Report generation in chat |
| Source line: which field/crop/weather used | | | Markdown tables, charts in chat |
| **One action:** create task from AI suggestion | | | Schedule irrigation, publish listing |
| User confirm before task created | | | Auto-execute any action |
| Thumbs up/down on response | | | |
| Professional tier only (Starter sees upgrade lock) | | | Unlimited queries |
| EN + 1 pilot language | | | 5+ languages |
| Credit check before send (block with upgrade if empty) | | | |
| Store 100% messages in Brain DB | | | |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | Panel Q&A · field context · create task · feedback · Pro tier · 2 languages · credit gate |
| **Version 2** | Full-page chat + history · action execution (log observation, reschedule task) · AI insights widget (3 cards) · spray window answers · 100 queries/day · 5 languages · dashboard “Ask why?” deep links |
| **Version 3** | Yield/market/irrigation answers · executive briefs · team shared conversations · custom org knowledge base · Nertura Foundation Model routing · voice (field hands-free) |

---

### 2. Field Management

**Job:** System of record for land parcels — minimum viable map + metadata so AI and disease have somewhere to attach.

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| 1 farm per org (MVP) | 5 farms (Pro stretch) | Farm photo on profile | Equipment registry |
| Up to 10 fields | Field name search | | Infrastructure (storage, greenhouse) |
| Draw polygon boundary on map (web) | Import GeoJSON | | KML/Shapefile import |
| Tap-to-place + drag vertices | | | IoT device linking |
| Field list + map view toggle | | | Team per-field permissions |
| Field overview: name, area (auto calc), active crop, status color | | | Soil lab PDF upload |
| Link observation/diagnosis to field | | | Multi-season history analytics |
| Assign field to crop plan | | | Satellite NDVI layers |
| 3 users max (Starter) / 10 (Pro) | | | |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | 1 farm · 10 fields · draw boundary · list/map · overview · link to crop/AI |
| **Version 2** | 5 farms · unlimited fields · equipment · soil records · KML import · IoT pins · cooperative member farm view · infrastructure tabs |
| **Version 3** | Unlimited farms · NDVI/satellite layers · boundary change audit · enterprise region roll-up · telematics integration |

---

### 3. Disease Detection

**Job:** First AI wow moment — photo → labeled diagnosis → feedback in <60 seconds.

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| Capture/upload photo (web + PWA camera) | Retake / crop photo before send | | Heatmap overlay on leaf |
| Select crop: corn, soybean, wheat, tomato | | | 8+ crops |
| Select field (required) | | | Offline/on-device inference |
| Cloud vision via Brain (GPT-4o Vision or equivalent) | | | Custom Nertura CNN |
| Primary diagnosis + confidence % | Top-3 differential list | | Expert agronomist queue |
| Recommended next steps (text, not auto prescription) | | | Treatment product links / sponsor tips |
| Confirm / Wrong buttons | | | Similar cases gallery |
| Case history list per org | | | Bulk export for research |
| VISION credit deduct (5 free/mo registered; Pro grant) | | | |
| Professional tier only | | | Starter access |
| Store photo + result in Brain | | | |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | 4 crops · cloud inference · confidence · feedback · field link · case list · Pro tier |
| **Version 2** | 8+ crops · top-20 diseases · offline mobile inference (top cases) · expert review queue · agronomist validate/override · WhatsApp photo inbound · learning loop promotes validated labels |
| **Version 3** | Nertura Disease CNN primary · all launch-region crops · real-time scout mode · cooperative incidence dashboard · regulatory export (spray records link) |

---

### 4. WhatsApp

**Job:** Field channel for emerging markets — **not in Day 90 scope.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| — | — | Static `wa.me` link on marketing site footer | WhatsApp Center UI |
| | | | WABA integration |
| | | | Inbound AI Q&A |
| | | | Inbound photo diagnosis |
| | | | Outbound templates |
| | | | Double opt-in flow |
| | | | Broadcast composer |
| | | | CRM sync from WA |

**Rationale:** WABA verification, Meta templates, and channel parity with Brain typically exceed 90 days. Founder decision: Phase 3 (Month 12–20). Web/mobile is the launch channel.

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | **None.** Marketing wa.me link optional only. |
| **Version 2** | Connect account in settings · double opt-in · inbound text Q&A · inbound photo diagnosis · utility templates (frost, task reminder) · conversation log in app · WA credits · manual broadcast approval |
| **Version 3** | Cooperative bulk broadcast · CRM outbound · voice notes · regional numbers (TR, BR, IN) · acquisition attribution from TikTok → wa.me → signup funnel |

---

### 5. Marketplace

**Job:** B2B commerce — **deferred; adds payments, trust, moderation, and legal surface area.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| — | — | “Coming soon” nav item hidden | Browse listings |
| | | | Create listing |
| | | | Offers / negotiation |
| | | | Orders module |
| | | | Messaging |
| | | | Transaction fees |
| | | | Traceability from field |
| | | | Group/cooperative listings |

**Rationale:** Founder decision — marketplace transaction fees activate Phase 2, not launch. No revenue dependency on Day 90.

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | **None.** Remove from sidebar. Homepage may mention future capability. |
| **Version 2** | Browse · create listing · offers · in-app messaging · order flow · 3% fee · field traceability basic · cooperative group listing |
| **Version 3** | Escrow · export compliance docs · buyer requirements feed · market price AI · priority placement · ERP order sync |

---

### 6. CRM

**Job:** Relationship and pipeline management for cooperatives and B2B — **no launch customer need for P0 farmer.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| — | — | — | Entire module |
| | | | Accounts / contacts |
| | | | Member management |
| | | | Pipeline / deals |
| | | | Interaction logging |
| | | | Bulk messaging |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | **None.** |
| **Version 2** | Basic CRM (Pro): 100 accounts · log interaction · link to marketplace counterparty · cooperative member profiles · pipeline board |
| **Version 3** | Full CRM · deal tracking · bulk SMS/email from CRM · sponsor account linking · health scores · API sync to external CRM |

---

### 7. Analytics

**Job:** Operational intelligence — **Day 90 = dashboard KPIs only, not a module.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| 4 KPI cards on dashboard (tasks, weather score, field health, season week) | Sparkline on 1 KPI | | `/app/analytics` route |
| Alert feed (severity coded) | | | Custom date ranges |
| Field map with status colors on dashboard | | | Saved views |
| | | | Comparison across farms |
| | | | Export CSV |
| | | | Chart builder |
| | | | Executive roll-up |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | Dashboard-embedded KPIs + alert feed + field map only |
| **Version 2** | Analytics module · yield/water/task charts · 7d/30d/season ranges · cooperative aggregate · 2 standard analytics reports · export PNG/CSV |
| **Version 3** | Custom dashboards · scheduled email · enterprise region compare · compliance analytics · API export · predictive overlays |

---

### 8. Content Engine

**Job:** AI-powered content production (blog, scripts, assets) — **Media Factory is Phase 4 in founder decisions.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| — | — | 5 static help articles (handwritten) | AI content pipeline |
| | | | Blog CMS |
| | | | Topic research agent |
| | | | Script generation |
| | | | Image/video generation |
| | | | Approval queue for content |
| | | | SEO automation |

**Rationale:** Content Engine is an internal growth system, not a farmer retention requirement. Building it before 100 paying farms diverts AI/engineering from P0 loop.

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | **None.** Static marketing copy + manual help docs. |
| **Version 2** | Manual blog (CMS) · weekly founder-written newsletter · email templates hand-edited · no AI generation |
| **Version 3** | Full Content Engine: research → script → image → voice → video → approve → queue · Media Factory · ElevenLabs voice · multi-channel packaging · founder approval workflow |

---

### 9. Email Automation

**Job:** Lifecycle and campaign email — **Day 90 = transactional only.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| Auth emails (verify, reset) | | | Newsletter |
| Weather/critical alert email (opt-out per type) | | | Drip campaigns |
| Task due reminder email (daily digest, 1x) | | | AI-written email |
| Billing/Stripe receipt emails (Stripe-hosted OK) | | | Segmented campaigns |
| | | | A/B testing |
| | | | Email Engine admin UI |
| | | | Approval workflow for campaigns |

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | Transactional + alert + single task digest only |
| **Version 2** | Lifecycle emails (onboarding day 1/7/14) · weekly product newsletter · cooperative admin broadcasts · template editor · unsubscribe management |
| **Version 3** | AI Email Engine · personalized crop tips · re-engagement · sponsor co-marketing · full approval pipeline · deliverability dashboard |

---

### 10. Social Media Automation

**Job:** Publish AI-generated social content — **explicitly Phase 4; approval-first even when built.**

#### Day 90 MoSCoW

| Must have | Should have | Could have | Not now |
|-----------|-------------|------------|---------|
| — | — | Founder personal posts (manual, off-platform) | Entire module |
| | | | Social account connect |
| | | | Post scheduler |
| | | | AI video generation |
| | | | Auto-publish |
| | | | Performance analytics |
| | | | White-label customer social |

**Rationale:** Social automation without Media Factory is hollow; with Media Factory is 90+ days alone. Not a farmer product requirement.

#### Versions

| Version | Scope |
|---------|-------|
| **MVP (Day 90)** | **None.** |
| **Version 2** | — (still none; focus on product) |
| **Version 3** | Social Distribution Engine · connect accounts · approval queue · schedule · TikTok/Reels/Shorts · performance loop · L2 auto for whitelisted templates only |

---

## Supporting Modules (Not in Top 10 — Day 90 Scope)

These are required for MVP but were not in the module list. Scope is strict.

| Module | MVP (Day 90) | Not now |
|--------|--------------|---------|
| **Dashboard** | Farmer fixed layout only | Customize · cooperative · enterprise variants |
| **Crop Management** | Plan · tasks · observations · manual growth stage | Gantt · PHI compliance · harvest workflow (Should: basic harvest log) |
| **Weather** | 7-day · frost/rain alerts · GDD optional (Should) | Hourly · spray window · historical · ML composite risk |
| **Tasks** | List · create · assign · complete · due date · link field | Board · calendar · recurrence · bulk |
| **Notifications** | In-app + email | Push native · SMS · WhatsApp |
| **Reports** | None (Should: 5 PDF exports) | Custom builder |
| **Inventory** | None (Should: 50 SKU basic) | Warehouses · barcode |
| **Billing** | Starter + Pro · Stripe Checkout · portal link | Business · Enterprise · member billing |
| **Users** | Invite · 3 roles fixed | Custom roles · SSO |
| **Settings** | General · notifications · password · delete account | Integrations · API keys · SSO · audit log |

---

## Tier Scope (Day 90)

| Tier | Ship? | Includes |
|------|-------|----------|
| **Free registered** | Yes | 50 TEXT + 5 VISION credits/mo · browse-only if marketplace existed (N/A) · no AI Assistant |
| **Starter ($29)** | Yes | 1 farm · 10 fields · 3 users · weather · tasks · observations · **no AI Assistant · no disease** |
| **Professional ($99)** | Yes | AI Assistant · disease detection · higher credits · 10 users |
| **Business ($349)** | **No** | Version 2 |
| **Enterprise** | **No** | Version 3 |

**Note:** Starter without AI is intentional — upgrade path to Pro is the business model. Disease and Assistant are Pro differentiators.

---

## Role Scope (Day 90)

| Role | Ship? |
|------|-------|
| **Farmer / owner-operator** | Yes — only dashboard variant |
| **Operator** | Yes — limited write (tasks, observations) |
| **Viewer** | Yes — read-only |
| **Cooperative admin** | No — Version 2 |
| **Agronomist** | No — Version 2 |
| **Enterprise admin** | No — Version 3 |

---

## Platform Scope (Day 90)

| Component | MVP | Not now |
|-----------|-----|---------|
| Web app | Responsive React · desktop + tablet | Native shell |
| Mobile | PWA offline observations | App Store / Play Store native |
| Auth | Email/password · optional MFA | SSO · SAML |
| Search | — (Could: ⌘K fields/tasks) | Global entity search |
| API | Internal only | Public REST |
| Regions | **Single** cloud region | Multi-region · data residency |
| Languages | EN + 1 | 8 languages |
| Brain storage | 100% interactions | Admin Brain dashboard |
| Credits | Ledger + block on zero | Credit purchase UI (Can invoice manually) |

---

## Team Assumption (90 Days)

Minimum viable team — **if smaller, cut Should have and Could have first:**

| Role | FTE |
|------|-----|
| Product manager | 1 |
| Tech lead / architect | 1 |
| Full-stack engineers | 3 |
| Frontend / PWA | 1 |
| AI engineer | 1 |
| Designer (50%) | 0.5 |
| QA | 1 |

**Do not hire for:** Content, social, WhatsApp ops, community moderation, enterprise sales engineering — all post-GA.

---

## Cut Priority (When Behind Schedule)

Execute in order — **never cut Must have from AI + Field + Disease + Billing:**

1. Drop all **Should have**
2. Drop all **Could have**
3. Reduce languages to **EN only**
4. Reduce disease crops from 4 → **2** (corn + tomato)
5. Remove Starter tier — **Pro-only launch** (last resort)
6. **Slip GA** — do not ship Marketplace, WhatsApp, CRM, or Content partials

---

## Version Summary Table

| Module | MVP (Day 90) | Version 2 | Version 3 |
|--------|--------------|-----------|-----------|
| **AI Assistant** | Panel · context Q&A · create task · Pro · 2 langs | Full chat · actions · insights · 5 langs | Foundation model · voice · org KB |
| **Field Management** | 1 farm · 10 fields · draw map | 5 farms · equipment · IoT · import | Unlimited · satellite · enterprise |
| **Disease Detection** | 4 crops · cloud · feedback · Pro | 8+ crops · offline · expert queue · WA photo | Proprietary CNN · regional full catalog |
| **WhatsApp** | **None** | Opt-in · Q&A · photo · templates | Broadcast · regions · acquisition funnel |
| **Marketplace** | **None** | Listings · offers · orders · fees | Escrow · export · price AI |
| **CRM** | **None** | Basic + cooperative members | Full pipeline · integrations |
| **Analytics** | Dashboard KPIs only | Analytics module · charts · export | Custom · scheduled · enterprise |
| **Content Engine** | **None** | Manual blog/newsletter | Full Media Factory + AI pipeline |
| **Email Automation** | Transactional + alerts | Lifecycle · newsletter | AI Email Engine · campaigns |
| **Social Media Automation** | **None** | **None** | Distribution engine · approval · auto L2 |

---

## Definition of Done (Day 90 GA)

- [ ] New user completes onboarding in <10 minutes (1 farm, 1 field, 1 crop plan)
- [ ] Pro user receives disease result on PWA with photo from camera
- [ ] Pro user asks AI question referencing that field; answer cites field name
- [ ] AI-suggested task created only after user taps Confirm
- [ ] Frost alert fires in test; appears in-app + email
- [ ] Starter user sees locked AI with upgrade path; can still manage fields/tasks
- [ ] Stripe subscription activates and enforces tier limits
- [ ] User can export and delete data (GDPR/KVKK request flow)
- [ ] No WhatsApp, Marketplace, CRM, Content, or Social code in production nav
- [ ] Founder sign-off on 90-day scope compliance with this document

---

## Document Hierarchy

| Conflict | Winner |
|----------|--------|
| This doc vs feature request in sprint | **This doc** |
| This doc vs `roadmap.md` timeline | **This doc** for Day 90; roadmap for V2/V3 |
| This doc vs `founder-decisions.md` strategy | **founder-decisions.md** (e.g., no data sale, approval-first content) |
| This doc vs UX wireframes | **This doc** for scope; wireframes for design within scope |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`founder-decisions.md`](founder-decisions.md) | Strategic locks |
| [`roadmap.md`](roadmap.md) | Longer-horizon V2/V3 detail |
| [`subscription-model.md`](subscription-model.md) | Full tier definitions |
| [`approval-workflow.md`](../product/approval-workflow.md) | When automation ships |
| [`ui/dashboard-wireframe.md`](../ui/dashboard-wireframe.md) | UX within MVP scope |

---

*Nertura MVP Definition v1.0 — 90-day launch scope. No application code.*
