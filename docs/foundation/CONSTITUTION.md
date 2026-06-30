# Nertura Foundation — Constitution

> **Binding law for all product, design, engineering, AI, and business work.**  
> Version 1.0 · June 2026 · Owner: Product Team

---

## Article I — Supremacy

The **Foundation Documentation** (`docs/foundation/`) is the **constitution of Nertura**.

No new feature, UI change, AI behavior, API, database schema, or product decision may **contradict** the Foundation.

When the Foundation and the code disagree, **the Foundation wins** until the Foundation is **explicitly updated** by the product team.

Code is not an excuse to bypass Foundation law. Legacy behavior that violates Foundation must be **fixed**, not copied.

---

## Article II — Scope of Law

The Foundation governs:

| Domain | Book |
|--------|------|
| Product decisions, MVP scope, roadmap | Book 01 — Product Bible |
| UI, layout, typography, states, a11y | Book 02 — Design System |
| Code, APIs, migrations, security, DoD | Book 03 — Engineering Standards |
| AI prompts, memory, language, safety | Book 04 — AI Behaviour Manual |
| Pricing, credits, growth, KPIs | Book 05 — Growth & Business Manual |

---

## Article III — Mandatory Implementation Workflow

Before writing or changing code, **every implementer** (human or AI agent) must:

### Step 1 — Identify

Name the **relevant Foundation chapter(s)** for the task.

Examples:

| Task | Chapters |
|------|----------|
| Farm map layout fix | Book 02 Ch. 05, 08 · Book 01 Ch. 07 |
| New Doctor API field | Book 03 Ch. 06, 07 · Book 04 Ch. 01 |
| Turkish error messages | Book 02 Ch. 11 · Book 04 Ch. 07 |
| New database table | Book 03 Ch. 05, 11 |
| Credit deduction change | Book 05 Ch. 02 · Book 03 Ch. 06 |

### Step 2 — Comply

**Explain how the implementation complies** with those chapters — in PR description, task comment, or agent response **before** code appears.

Minimum compliance statement:

```
Foundation: [book/chapter paths]
Compliance: [1–3 sentences — which principles/rules are satisfied]
Gate question: [yes/no + one sentence if feature work]
```

### Step 3 — Implement

Write code that matches the compliance statement.

### Step 4 — Verify

Confirm the shipped change still satisfies Foundation at review time.

---

## Article IV — Amendments

Foundation changes require **explicit product team approval**:

1. **Proposer** documents why existing law is wrong or incomplete
2. **Product team** approves amendment (CPO or delegate)
3. **Chapter updated** in `docs/foundation/` with decision rationale
4. **Version noted** in book README if material
5. **Then** code may follow the new law

**Forbidden:** silently changing code to contradict Foundation without updating the chapter.

---

## Article V — Conflict Resolution

```
Foundation chapter says X
Code currently does Y (Y ≠ X)

→ Fix code to match X
→ OR amend Foundation via Article IV
→ Never leave X and Y in permanent conflict
```

Priority order:

1. Foundation (`docs/foundation/`)
2. Code (only when Foundation is silent on the point)
3. Legacy docs (Manifesto, Architecture Bible — reference only)

---

## Article VI — The Gate Question

Every feature must pass [Book 01, Chapter 12](01-product-bible/12-feature-gate-criteria.md):

> **Does this solve the farmer's problem faster?**

If not — it does not ship during stabilization, regardless of technical elegance.

---

## Article VII — Enforcement

| Mechanism | Role |
|-----------|------|
| `.cursor/rules/nertura-foundation.mdc` | Always-on agent law |
| [`AGENTS.md`](../AGENTS.md) | Repository agent entry point |
| [Definition of Done](03-engineering-standards/12-code-review-and-dod.md) | PR checklist includes Foundation compliance |
| Code review | Reviewer rejects Foundation violations |

---

*This constitution is permanent until superseded by Foundation v2.0 with explicit product team ratification.*
