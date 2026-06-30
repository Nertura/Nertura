# Chapter 06 — Decision Principles

## Purpose

Define **how Nertura leadership and teams decide what to build, fix, or reject** — especially during production stabilization when every pull request competes for attention.

---

## Principles

1. **Farmer problem first** — technology second
2. **Stabilization before expansion** — RC quality gates are not optional
3. **One source of truth** — foundation docs + code, not Slack threads
4. ** reversible decisions fast, irreversible decisions slow**
5. **Say no by default** to features that don't pass the gate question

---

## The Decision Stack

When prioritizing work, evaluate in order:

```
1. SAFETY     → Could this harm a crop, person, or data?
2. TRUST      → Could this break confidence in the AI?
3. SPEED      → Does this help the farmer decide faster?
4. SCALE      → Does this unblock 10x users or 10x fields?
5. REVENUE    → Does this convert retained trust to sustainable business?
6. DELIGHT    → Nice-to-have polish (only after 1–5)
```

If two items tie at the same level, prefer **bug fixes and UX polish over new surfaces**.

---

## Production Stabilization Rules (Current Priority)

| Rule | Meaning |
|------|---------|
| **No new functionality** during UX polish sprints | Fix, translate, layout — don't expand scope |
| **No roadmap redesign** | Ten-year vision is fixed; sprint contents flex |
| **Typecheck + lint pass** | No merge without green CI |
| **RLS never weakened** | Convenience is not worth tenant leak |
| **Friendly errors only** | Technical messages logged server-side |

---

## Who Decides What

| Decision type | Owner | Consult |
|---------------|-------|---------|
| Product scope / MVP gate | CPO | CTO, farmer feedback |
| Architecture / security | CTO | AI architect, DPO |
| AI behaviour / prompts | Chief AI Architect | Ag science advisor |
| Design system changes | Design lead | Frontend lead |
| Pricing / credits | CPO + Finance | Growth |
| Growth auto-send / publish | Founder | AI governance board |
| Emergency hotfix | On-call engineer | CTO post-mortem |

---

## Decision Rationale

**"No new functionality during polish"** exists because mixed sprints produce neither stable UX nor complete features — the worst outcome for beta farmers.

**Documentation as source of truth** exists because Cursor agents and future hires cannot read 59 scattered sprint markdown files reliably.

---

## Examples

### Good decisions

| Situation | Decision |
|-----------|----------|
| Map page has English errors in Turkish flow | P0 localization fix — no new map features |
| Request for pesticide marketplace | Reject — violates neutral advisor (Book 01 Ch. 08) |
| Stripe checkout untested in prod | Keep premium reports behind `NEXT_PUBLIC_PREMIUM_REPORTS_ENABLED` |

### Bad decisions

| Situation | Decision |
|-----------|----------|
| Add social feed "because competitors have it" | Rejected — fails gate question |
| Skip RLS test to ship faster | Rejected — safety stack violation |
| Ship raw Gemini for "speed" | Rejected — breaks AI-first trust philosophy |

---

## Best Practices

- Write **one-paragraph decision records** in PR descriptions for non-obvious choices
- Link PRs to **foundation chapter** when applying product law
- Escalate **safety ambiguity** to AI governance policy, don't guess

## Bad Practices

- "We'll fix trust later" — trust debt compounds like technical debt
- Building for imaginary enterprise customers before smallholder PMF
- Letting highest-paid opinion override farmer evidence

---

## Future Considerations

- Formal **ADR folder** (`docs/foundation/03-engineering-standards/adr/`)
- **Farmer advisory council** — quarterly veto power on roadmap items
- **Automated gate checks** in CI (i18n lint, mixed-language detector)

---

## Cross-References

- [Feature Gate Criteria](12-feature-gate-criteria.md)
- [Book 03 — Definition of Done](../03-engineering-standards/12-code-review-and-dod.md)
- Legacy: `docs/ai-governance-policy.md`
