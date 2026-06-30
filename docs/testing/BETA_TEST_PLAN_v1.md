# Beta Test Plan v1

**Version:** 1.0 · 2026-06-27  
**Target:** Closed beta — TR farmers, core Doctor → Vaka Takibi loop

---

## Beta goals

1. Verify AI Doctor delivers useful agricultural guidance
2. Detect language/copy regressions (zero EN leaks on TR surfaces)
3. Collect real plant disease cases (photo + text)
4. Measure onboarding friction
5. Validate image upload reliability
6. Validate Vaka Takibi auto-creation and timeline
7. Test guest → signup conversion funnel

---

## Beta user groups

| Group | Size (target) | Focus |
|-------|---------------|-------|
| Balcony / houseplant growers | 10–15 | Text-only, small-scale |
| Small farmers (1–5 ha) | 15–20 | Photo + field context |
| Greenhouse owners | 5–10 | Disease + treatment plans |
| Olive growers | 5–10 | TR-specific crops |
| Grape growers | 5–10 | Seasonal disease patterns |
| Agronomists (advisors) | 3–5 | Answer quality, evidence |
| Cooperatives | 2–3 | Multi-field, org flow |

**Total target:** 45–70 beta users over 4 weeks

---

## Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First question completion | ≥85% | Analytics / session logs |
| Image upload success | ≥90% | API error rate |
| Useful answer rating | ≥70% "yararlı" | In-app feedback buttons |
| Auto case creation | ≥50% of photo diagnoses | `field_cases` linked |
| 7-day return rate | ≥40% | Auth sessions |
| Signup conversion (guest) | ≥25% | Marketing funnel |
| Language leaks | **0** reported | `pnpm check:i18n` + user reports |
| Critical bugs | **0** P0 open at week 4 | Issue tracker |

---

## Feedback form questions (TR)

1. **Teşhis faydalı mı?** (1–5)
2. **Cevap anlaşılır mı?** (Evet / Kısmen / Hayır)
3. **Ne eksik?** (açık uçlu)
4. **Tekrar kullanır mısınız?** (Evet / Belki / Hayır)
5. **Fotoğraf yüklemek kolay mı?** (Evet / Hayır)
6. **Vaka Takibi anlaşılır mı?** (Evet / Hayır / Kullanmadım)
7. **Hangi bitki/ürün?** (açık uçlu)
8. **Ekran görüntüsü** (opsiyonel — dil sızıntısı için)

---

## Beta phases

### Week 1 — Internal + friends (10 users)
- Manual QA checklist complete
- Fix P0 bugs only

### Week 2 — Invite cohort A (20 users)
- Balcony + small farmers
- Daily language/copy monitoring

### Week 3 — Invite cohort B (20 users)
- Olive, grape, greenhouse
- Case tracking validation

### Week 4 — Expand + measure (20 users)
- Agronomists + cooperatives
- Go/no-go for public beta

---

## Exit criteria (public beta)

- [ ] `pnpm check:i18n` in CI — always green
- [ ] Manual QA checklist ≥95% pass
- [ ] Cookie consent banner live
- [ ] No P0 open bugs
- [ ] Average feedback ≥3.5/5 on usefulness

---

## Rollback plan

- Feature flags: disable guest doctor limit raise if abuse detected
- Revert deploy via Vercel previous deployment
- Communicate beta users via email if critical AI issue
