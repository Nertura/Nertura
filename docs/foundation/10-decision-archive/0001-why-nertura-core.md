# ADR 0001 — Why Nertura Core

**Status:** Accepted  
**Date:** 2026-06-28  
**Deciders:** Product Team

---

## Context

Nertura has grown beyond a single AI Doctor feature. The platform now includes:

- Marketing guest Doctor
- Authenticated dashboard with cases, farms, fields, history
- Admin with Growth AI and knowledge management
- Shared design system (`packages/ui`)
- Intelligence Engine (`packages/ai`)
- Multiple AI agents and Cursor rules working in parallel

Development risk: **isolated feature work** causing drift in language, design, AI behaviour, security, and quality — especially across web, future mobile, and admin.

The Five Books (Foundation v1.0) provide domain law but lack a **unified operating index** connecting Experience Language, Writing System, Review System, and Intelligence Constitution in one governance flow.

---

## Decision

Create **Nertura Core v1.0** as the top-level governance layer inside `docs/foundation/`:

- `NERTURA_CORE.md` — master index
- Experience Language (`03-experience-language/`)
- Writing System (`04-writing-system/`)
- Quality System (`08-quality/`)
- Security System (`09-security/`)
- Intelligence Constitution (`11-nertura-intelligence/`)
- Product Review System (`12-review-system/`)
- Decision Archive (`10-decision-archive/`)

Every future sprint must pass: Constitution → Nertura Core → Operating System → Review → Code.

---

## Reason

1. **Prevent drift** — one workflow for developers, designers, and AI agents
2. **Protect farmer trust** — writing, experience, and AI rules in one place
3. **Scale the team** — new hires and agents start from Core, not scattered docs
4. **Quality gate** — 12-dimension review bar before merge
5. **Long-term architecture** — decisions archived, not lost in chat history

---

## Consequences

### Positive

- Consistency across marketing, dashboard, admin, future mobile
- Clear merge gates (i18n, CSS imports, AI certainty)
- Agent workflow standardized in AGENTS.md
- Foundation remains supreme; Core organizes without replacing Five Books

### Negative / Tradeoffs

- Feature velocity may slow slightly (review overhead)
- Documentation maintenance burden increases
- Team must learn new read order

### Follow-ups

- [ ] Execute full route audit per `08-quality/02-route-audit-criteria.md`
- [ ] Replace farmer-visible "credits" with "analiz hakkı" in code (separate sprint)
- [ ] Wire full quality matrix into CI
- [ ] Complete manual browser QA sign-off

---

## References

- [`NERTURA_CORE.md`](../NERTURA_CORE.md)
- [`CONSTITUTION.md`](../CONSTITUTION.md)
- Book 03 Ch. 12 — Code review and DoD
