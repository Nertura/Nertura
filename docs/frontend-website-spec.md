# Nertura — Frontend Website Specification

> Marketing and public web surface at `nertura.com`. Next.js on Vercel; Cloudflare edge; conversion-optimized enterprise aesthetic.

**Status:** Pre-implementation · **Owner:** CGO + CPO  
**UX reference:** [`../wireframes/homepage-wireframe.md`](../wireframes/homepage-wireframe.md)  
**Design:** [`design-system.md`](design-system.md), [`../brand/README.md`](../brand/README.md)

---

## Purpose

The marketing site acquires, educates, and converts — without exposing authenticated app complexity. It establishes **AI OS category** positioning, drives registration, and hosts legal/compliance pages.

---

## Technology

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel (project: `nertura-web`) |
| CMS (V2) | Sanity or MDX in repo for blog |
| Forms | Server Actions → Supabase + Resend |
| Analytics | GA4 + Vercel Analytics; PostHog marketing (consent-gated) |
| i18n (V2) | next-intl; EN + TR Day 90 |

---

## Information Architecture

```
nertura.com/
├── /                          Homepage
├── /about                     Company, mission, team
├── /product/
│   ├── /ai-assistant          AI Agriculture Assistant
│   ├── /disease-detection     Photo diagnosis product page
│   ├── /farm-management       Operations module page
│   └── /whatsapp              WhatsApp Assistant (Phase 3 — hide until live)
├── /pricing                   Plans + FAQ anchor
├── /enterprise                Enterprise sales page
├── /blog                      Blog index (V2; static OK MVP)
├── /blog/[slug]               Article
├── /contact                   Contact form
├── /demo                      Demo request form
├── /waitlist                  Early access / community waitlist
├── /login                     → redirect app.nertura.com/login
├── /register                  → redirect app.nertura.com/register
├── /legal/
│   ├── /privacy               Privacy Policy (published HTML from admin)
│   ├── /terms                 Terms of Service
│   ├── /cookies               Cookie Policy
│   ├── /ai-usage              AI Usage Policy
│   ├── /sub-processors        Sub-processor list
│   └── /data-retention        Data Retention Policy
└── /status                    → status.nertura.com redirect
```

---

## Page Specifications

### Homepage (`/`)

Sections per homepage wireframe: Hero, Brain, AI Assistant, WhatsApp, Farm Management, Marketplace, Analytics, Mobile, Content, Pricing, FAQ, Footer.

CTA primary: **Start free** → `/register`  
Performance: LCP <2.5s; hero image WebP; font subset.

### About (`/about`)

Mission, leadership, advisors, press kit link, careers link (V2).

### Product pages

Each product page: problem → solution → UI mock → proof → CTA. Schema.org `SoftwareApplication` where applicable.

### Pricing (`/pricing`)

Stripe Pricing Table embed or custom cards; monthly/annual toggle; link to full feature matrix; Enterprise contact CTA.

### Enterprise (`/enterprise`)

SSO, SLA, data residency, dedicated support, demo request form, logo social proof (when available).

### Blog (`/blog`) — V2

Categories: crop guides, disease ID, regional ag, product updates. Author pages. RSS feed.

### Contact / Demo / Waitlist

| Form | Fields | Backend |
|------|--------|---------|
| Contact | name, email, company, message | Resend to hello@; CRM sheet V2 |
| Demo | name, email, org, hectares, crops, message | Sales queue admin |
| Waitlist | email, role, country | `waitlist_signups` table |

Honeypot + Cloudflare Turnstile on all forms.

### Legal pages

Rendered from `legal_document_versions` API or static MDX until admin publish live. Last updated date visible. Print-friendly CSS.

---

## Auth redirects

Marketing site does **not** implement auth logic beyond links:

- `/login` → `https://app.nertura.com/login`
- `/register` → `https://app.nertura.com/register?plan=` (optional query)

Shared cookie domain: `.nertura.com` if SSO session needed (V2).

---

## SEO integration

Full spec: [`seo-engine-spec.md`](seo-engine-spec.md). Every page: title, description, canonical, OG, Twitter card, JSON-LD where applicable.

---

## Performance & Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS | Cloudflare Full Strict |
| CSP | Restrict scripts to self + analytics (after consent) |
| Images | next/image; Supabase CDN for uploads |
| Caching | Static pages ISR; `Cache-Control` on assets |
| No tenant data | Marketing Supabase anon key unused for OLTP |

---

## Component Library

Shared `@nertura/ui`: Button, Card, Navigation, Footer, PricingCard, FAQAccordion, FeatureGrid, CTA band.

Marketing-specific: HeroDashboardMock, BrainDiagram, LogoStrip.

---

## MVP vs Full

| Page | Day 90 | V2 |
|------|--------|-----|
| Homepage, pricing, legal, login/register redirect | ✓ | — |
| About, contact | ✓ | — |
| Product subpages (4) | ✓ simplified | Full mocks |
| Blog | Static 3 articles optional | CMS |
| Enterprise, demo | ✓ form | CRM integration |
| WhatsApp product page | Hidden or "coming soon" | Live when channel ships |

---

*Frontend Website Specification v1.0 — Pre-implementation.*
