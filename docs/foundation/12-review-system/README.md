# Nertura Product Review System

> **12 dimensions. Score before merge.**

**Version:** 1.0 · June 2026  
**Parent:** [`NERTURA_CORE.md`](../NERTURA_CORE.md)

---

## Purpose

Formal review bar for every change that touches farmer experience, AI, or platform integrity.

---

## Chapters

| # | Chapter | Topics |
|---|---------|--------|
| 01 | [12-Dimension Review Bar](01-12-dimension-review-bar.md) | Dimensions defined |
| 02 | [Review Scorecard](02-review-scorecard.md) | Reusable template |
| 03 | [Merge Gate Rules](03-merge-gate-rules.md) | Pass/fail thresholds |

---

## Quick Reference

| Threshold | Score |
|-----------|-------|
| Dimension pass | ≥ 8 / 10 |
| Internal merge | ≥ 95 / 120 total |
| Production-ready | ≥ 108 / 120 (90%) |
| Public launch | No dimension < 9 |

---

## Integration

- [`08-quality/PRODUCT_REVIEW_SYSTEM.md`](../08-quality/PRODUCT_REVIEW_SYSTEM.md)
- [`PRE_COMMIT_CHECKLIST.md`](../PRE_COMMIT_CHECKLIST.md)
- CI automated gates (subset)
