# Chapter 07 — Product Principles

## Purpose

Codify the **non-negotiable product rules** that govern every surface — marketing, dashboard, admin — so Nertura feels like one product, not three apps stitched together.

---

## Principles

1. **Calm over clever** — reduce cognitive load every release
2. **Short first, deep optional** — answers and UI both
3. **Field is a patient file** — ongoing cases, not one-off chats
4. **Evidence when it matters** — not on every casual question
5. **Progressive disclosure** — show the next action, hide the rest

---

## Product Laws

### Law 1 — The Doctor is always one click away

From any logged-in surface, the user can reach AI Doctor in **one tap**. No buried navigation.

### Law 2 — Empty states teach the next step

Never show a blank dashboard. Every empty state answers: *What should I do first?*

### Law 3 — Intake is conversation, not forms

Natural language → confirm → map → draw → save → case. Forms exist only for correction.

### Law 4 — Map serves the field, not GIS professionals

Search, confirm, draw, save. No competing buttons. Localized copy always.

### Law 5 — Admin approves, never auto-acts

Content, outreach, knowledge publish — human gate. See AI governance.

### Law 6 — Neutral advisor

No product sales, no affiliate pesticides, no "buy now" in Doctor answers.

---

## Surface-Specific Principles

| Surface | Primary feel | Anti-pattern |
|---------|--------------|--------------|
| **Marketing** | Google-like composer, guest value first | Feature grid homepage |
| **Dashboard** | Field OS home, calm cards | ERP sidebar with 20 items |
| **Doctor** | ChatGPT clarity, evidence expandable | Wall of text diagnosis |
| **Farm map** | Map-primary 70%, panel scrolls | Full-page scroll from panel |
| **Admin** | Professional SaaS, approval queues | Unfinished dev clutter |

---

## The Depth Ladder (Reprise)

Features must respect user depth:

| Depth level | Allowed features |
|-------------|------------------|
| Guest | Ask, upload, 3 questions, signup CTA |
| Registered, no field | Doctor + optional intake |
| Field created | Map, boundary, case, field memory |
| Premium | Reports, advanced monitoring, credits |

**Do not expose depth-3 UI to depth-0 users.**

---

## Decision Rationale

**ChatGPT won** because the interface disappeared. Nertura applies the same law to agriculture — the crop problem is the interface, not our navigation tree.

**Field-as-patient-file** mirrors how farmers already think: "this wheat field has had rust two seasons."

---

## Examples

### Good

- RC-2 dashboard home: fields, open cases, Doctor CTA
- Farm map: single search input, autocomplete, confirm, draw
- Doctor: `DoctorAnswerCard` with expandable sections

### Bad

- Homepage hero with 6 feature cards before input
- Map page: English errors in Turkish session
- Doctor: raw `[object Object]` in evidence panel

---

## Best Practices

- Prototype mobile first
- Every screen answers: **Where am I? What's next? What happens after save?**
- Cross-link flows (save field → open Doctor with `fieldId`)

## Bad Practices

- Shipping admin-only features to dashboard nav
- Feature flags without UX for disabled state
- Breaking the intake → map → case chain

---

## Future Considerations

- Unified **command palette** (⌘K) for power users — optional, not default
- **Role-based nav pruning** — viewers see less, operators see write actions

---

## Cross-References

- [Home Page Philosophy](11-home-page-philosophy.md)
- [Book 02 — Design Principles](../02-design-system/01-design-principles.md)
- [Book 02 — Map UI](../02-design-system/08-map-ui.md)
