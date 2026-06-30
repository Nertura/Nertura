# 02 — Knowledge Constitution

## Purpose

Rules for what may enter Nertura's knowledge base and how sources are ranked.

**Never invent knowledge. Always explain provenance.**

---

## Source Ranking (Highest → Lowest)

| Rank | Source type | Usage |
|------|-------------|-------|
| 1 | Internal expert-verified Nertura knowledge | KB direct serve |
| 2 | University / extension publications | KB ingestion with review |
| 3 | Government agriculture agencies | KB ingestion with review |
| 4 | Peer-reviewed / public scientific sources | KB ingestion with review |
| 5 | Trusted agronomy publications | KB ingestion with review |
| 6 | User cases | Only after human review |
| 7 | AI-generated suggestions | **Draft only** — never auto-publish |

Lower ranks cannot override higher ranks without reviewer approval.

---

## Knowledge Item Requirements

Every KB item must have:

| Field | Required |
|-------|----------|
| Source | Yes |
| Language (`summary_tr`, `summary_en`) | Yes — TR required for TR serve |
| Crop | When applicable |
| Category (disease / pest / nutrition / cultivation) | Yes |
| Region | When relevant |
| Confidence / quality score | Yes |
| Reviewer status | Yes before production serve |

---

## Forbidden

| Action | Why |
|--------|-----|
| Uncontrolled self-learning into KB | Quality / liability |
| Auto-add from AI output without review | Hallucination risk |
| English-only body served to TR farmers | Language policy |
| User-generated content as fact without review | Trust |

---

## Ingestion Flow

1. Source identified (admin / ingestion pipeline)
2. Draft created
3. Human review queue (`knowledge-ingestion`)
4. Approve → production KB
5. Reject → archived with reason

---

## Cross-References

- Book 04 Ch. 06 — Knowledge bank and evidence
- `packages/knowledge-ingestion/`
- Admin `/knowledge`, `/knowledge-ingestion`
