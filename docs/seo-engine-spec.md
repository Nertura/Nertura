# Nertura — SEO Engine Specification

> Technical and content SEO architecture for global agriculture intelligence discovery.

**Status:** Pre-implementation · **Owner:** CGO  
**Companion:** [`frontend-website-spec.md`](frontend-website-spec.md), [`marketing-growth-system.md`](marketing-growth-system.md)

---

## SEO Objectives

| Horizon | Goal |
|---------|------|
| **Day 90** | Index homepage, pricing, product pages, legal; Core Web Vitals pass |
| **Month 6** | 50 indexed blog + crop pages; top 20 keywords tracking |
| **Month 12** | Programmatic crop/disease/region pages; marketplace SEO V2 |
| **Month 24** | AI answer pages; multi-language index parity |

---

## Technical SEO

### Site architecture

- Flat marketing URLs; max 3 clicks from homepage to any page
- Canonical host: `https://nertura.com` (apex)
- Trailing slash policy: no trailing slash (consistent)
- `hreflang` for EN/TR (V2): `<link rel="alternate" hreflang="tr" href="..." />`

### robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /legal/draft/

Sitemap: https://nertura.com/sitemap.xml
```

`app.nertura.com/robots.txt`:

```
User-agent: *
Disallow: /
```

Authenticated app is **never indexed**.

### Sitemap strategy

| Sitemap | Contents | Update |
|---------|----------|--------|
| `sitemap.xml` | Index | — |
| `sitemap-pages.xml` | Static marketing pages | Weekly |
| `sitemap-blog.xml` | Blog posts | On publish |
| `sitemap-programmatic.xml` | Crop, disease, region pages | Daily gen V2 |
| `sitemap-marketplace.xml` | Public listings V2 | Hourly |

Generated at build (MVP) or via cron Route Handler (V2).

### Core Web Vitals targets

| Metric | Target |
|--------|--------|
| LCP | <2.5s |
| INP | <200ms |
| CLS | <0.1 |

Vercel Analytics + PageSpeed CI on homepage.

### URL rules

- Lowercase only
- Hyphens not underscores
- No query params in canonical (except `?lang=` with hreflang)
- 301 map for renamed URLs in `next.config.js`

---

## On-Page SEO Template

Every public page includes:

| Element | Rule |
|---------|------|
| `<title>` | `{Page} | Nertura — AI Agriculture OS` (≤60 chars) |
| `<meta name="description">` | 150–160 chars; unique |
| `<link rel="canonical">` | Absolute URL |
| Open Graph | og:title, og:description, og:image 1200×630, og:type |
| Twitter Card | summary_large_image |
| `<html lang="">` | en or tr |

---

## Schema.org Structured Data

| Page type | Schema |
|-----------|--------|
| Homepage | `Organization`, `WebSite` with `SearchAction` |
| Product pages | `SoftwareApplication` |
| Pricing | `Product` + `Offer` per tier |
| Blog article | `Article`, `BreadcrumbList` |
| FAQ sections | `FAQPage` |
| Crop/disease pages | `MedicalWebPage` avoided; use `Article` + `HowTo` where appropriate |
| Marketplace listing V2 | `Product` with `Offer` |

JSON-LD injected via `@nertura/seo` package; validate with Google Rich Results Test in CI.

---

## Programmatic SEO (V2+)

### Crop pages (`/crops/[crop-slug]`)

Template: crop overview, growing regions, common diseases, link to Nertura detection, CTA.

Data source: curated JSON + AI-assisted drafts **human-approved** before publish.

### Disease pages (`/diseases/[disease-slug]`)

Symptoms, crops affected, identification tips, disclaimer, link to in-app diagnosis.

### Region pages (`/regions/[country]/[region]`)

Regional ag context, weather patterns, cooperative use case.

### AI answer pages (`/answers/[slug]`) — V3

SEO-friendly summaries of common agronomic questions; generated from anonymized aggregate Brain insights; **no farm-specific data**; expert review required.

---

## Multi-Language SEO

| Locale | URL pattern | MVP |
|--------|-------------|-----|
| English | `/` default | ✓ |
| Turkish | `/tr/...` or `nertura.com.tr` V3 | Pilot V2 |

Translated metadata required before indexing TR URLs. No machine-only publish.

---

## AI-Generated Content Quality Policy

| Rule | Detail |
|------|--------|
| **Human approval** | All programmatic pages approved by Content Admin |
| **E-E-A-T** | Author byline; agronomist review badge where applicable |
| **Accuracy** | Link to extension sources; update date visible |
| **No spam** | Max 50 programmatic pages/week launch ramp |
| **Duplicate content** | Canonical to primary; no thin pages (<300 words) |
| **Disclaimers** | Not a substitute for professional advice |

Google Search Console monitored weekly; manual action response plan in admin.

---

## Marketplace SEO (V2)

Public listing pages: `/marketplace/[listing-slug]` indexable if seller opts in. Default noindex until quality threshold met.

---

## Analytics & Reporting

| Tool | Use |
|------|-----|
| Google Search Console | Index coverage, queries, CWV |
| GA4 | Landing page performance |
| PostHog | Conversion from SEO landing |
| Admin SEO dashboard V2 | Indexed count, top queries, crawl errors |

Weekly SEO report: impressions, clicks, CTR, top 10 queries, new indexed pages.

---

## Launch SEO Checklist

See [`production-checklist.md`](production-checklist.md) § SEO.

---

*SEO Engine Specification v1.0 — Pre-implementation.*
