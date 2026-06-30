# Chapter 12 — Feature Gate Criteria

## Purpose

Provide the **single filter** every feature, sprint item, and Cursor task must pass before entering the codebase.

---

## The Gate Question

> **Does this solve the farmer's problem faster?**

If the honest answer is **no** or **not yet**, the feature does not belong in the MVP or current stabilization sprint.

---

## Evaluation Rubric

Score each proposal 0–2 per dimension. **Minimum 8/10 to proceed.** **Any 0 on Safety or Trust is automatic reject.**

| Dimension | 0 | 1 | 2 |
|-----------|---|---|---|
| **Safety** | Could harm crop/person/data | Neutral | Reduces risk |
| **Trust** | Damages AI credibility | Neutral | Builds credibility |
| **Speed** | Slows decision | Neutral | Faster decision |
| **Simplicity** | Adds UI complexity | Neutral | Simplifies UX |
| **Strategic fit** | Off-roadmap product | Tangential | Core ladder step |

---

## Automatic Rejects (No Scoring Required)

| Proposal | Reason |
|----------|--------|
| Marketplace / input sales | Neutral advisor violation |
| Auto-send outreach email | Governance violation |
| Auto-publish content | Governance violation |
| Raw LLM output to user | AI-first violation |
| Skip RLS for convenience | Security violation |
| English-only error in TR flow | Localization violation |
| Dashboard module before Doctor value | Product ladder violation |

---

## Automatic Approves (Still Require DoD)

| Proposal | Condition |
|----------|-----------|
| Bug fix blocking Doctor or map | P0 |
| Mixed-language fix | P0 |
| Friendly error replacement | P0 |
| Performance fix meeting budget | P1 |
| Accessibility fix WCAG AA | P1 |

---

## Decision Rationale

Feature creep killed agtech startups that **built everything for everyone**. One gate question scales from founder to intern to Cursor agent without committee meetings.

"Faster" includes **faster to trust, faster to understand, faster to recover from error** — not only faster to click.

---

## Examples

### Passes gate

| Feature | Why |
|---------|-----|
| Debounced map search | Farmer finds field faster |
| Evidence card localization | Turkish farmer trusts answer faster |
| Field case from Doctor | Ongoing problem tracked faster next visit |

### Fails gate

| Feature | Why |
|---------|-----|
| Social feed for farmers | Does not solve crop problem faster |
| NFT field certificates | Does not solve crop problem faster |
| 14-step onboarding before Doctor | Slows time to value |

---

## Process

1. **Proposer** answers gate question in one sentence
2. **Reviewer** scores rubric (or applies automatic reject/approve)
3. **Link** to foundation chapter in PR description
4. **Merge** only if Book 03 Definition of Done passes

---

## Best Practices

- Ask gate question **before** designing UI
- Deprecate features that fail gate in retrospect
- Teach gate question in onboarding for new hires and Cursor rules

## Bad Practices

- "Ship now, validate later" for trust-affecting features
- Gate question as post-hoc justification
- Exception without written ADR

---

## Future Considerations

- **Automated PR template** with gate checklist
- **Farmer veto** on quarterly roadmap review
- **Agent rule in Cursor** referencing this chapter by default

---

## Cross-References

- [Decision Principles](06-decision-principles.md)
- [MVP & Premium Philosophy](08-mvp-and-premium-philosophy.md)
- [Book 03 — Definition of Done](../03-engineering-standards/12-code-review-and-dod.md)

---

## Final Principle (Company-Wide)

**Every feature must help someone grow something.**

If a change does not help growers make better decisions, do not prioritize it.

*Nertura — the trusted digital agricultural intelligence companion for the world.*
