# Alternative B2B SaaS Ideas

## Why B2B Wins Over SMB

| Factor | Otzovik.ai (SMB) | B2B SaaS |
|--------|------------------|----------|
| ARPU | 3-5k₽/mo | 20-100k₽/mo |
| Churn | 5-10%/mo | 2-3%/mo |
| Sales cycle | Self-serve | 1-4 weeks |
| Support | High (many small) | Low (few large) |
| CAC payback | 2-3 months | 3-6 months |
| Defensibility | Low | Medium-High |

**10 B2B customers at 50k₽ = 500k₽ MRR = same as 170 SMB customers**

---

## Idea 1: CRM Integration Middleware

### Problem

Russian businesses use iiko, YCLIENTS, Bitrix24, amoCRM — none talk to each other.

### Solution

Zapier-like connectors for Russian software stack.

```
"Когда клиент оплатил в iiko → создай сделку в amoCRM → отправь SMS"
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 15-50k₽/mo |
| Target customers | 200-500 |
| TAM | Every business using 2+ Russian SaaS |
| Competition | Albato (expensive), make.com (not localized) |

### Why Better Than Otzovik

- Sticky (workflows break if cancelled)
- Higher ARPU
- Technical moat (integrations are hard)

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 4-6 months |
| Dev cost (if outsourced) | 500-800k₽ |
| Monthly infra | 10-20k₽ |
| Difficulty | Hard (many APIs, error handling) |

### Financial Projections

**Assumptions:** 30k₽ ARPU, 65% gross margin, 3% monthly churn

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 6 | 15 | 450k₽ | - | 290k₽ |
| Year 1 | 40 | 1.2M₽ | 14.4M₽ | 780k₽/mo |
| Year 2 | 120 | 3.6M₽ | 43M₽ | 2.3M₽/mo |
| Year 3 | 250 | 7.5M₽ | 90M₽ | 4.9M₽/mo |

**Break-even:** Month 4-5 (need ~10 customers)

**3-Year Profit:** ~50M₽

**Exit Value (3x ARR):** 130-270M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| API changes break integrations | High | Monitor, quick fixes, SLA |
| Albato/make.com localize | Medium | Move faster, better UX |
| Complex support | Medium | Good docs, templates |

---

## Idea 2: Employee Background Check SaaS

### Problem

HR needs to verify candidates — criminal records, debt history, previous employment. Currently done manually or via shady services.

### Solution

API + dashboard for instant background checks via official sources (ФССП, суды, ФНС).

```
HR uploads candidate → system checks 10+ sources → report in 5 min
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 30-100k₽/mo (subscription + per-check) |
| Target customers | 500-2000 (HR departments, agencies) |
| TAM | Every company hiring 10+ people/year |
| Competition | CheckPerson, Контур.Фокус (enterprise-focused) |

### Why Better Than Otzovik

- Compliance-driven (companies must verify)
- High switching cost (integrated into hiring flow)
- Per-usage revenue scales with client growth

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 3-4 months |
| Dev cost (if outsourced) | 300-500k₽ |
| Monthly infra | 5-15k₽ |
| Data source costs | 50-100k₽/mo (API fees) |
| Difficulty | Medium (API aggregation, scraping) |

### Financial Projections

**Assumptions:** 50k₽ ARPU (20k₽ sub + 30k₽ per-check), 55% gross margin, 2% monthly churn

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 6 | 20 | 1M₽ | - | 550k₽ |
| Year 1 | 60 | 3M₽ | 36M₽ | 1.6M₽/mo |
| Year 2 | 180 | 9M₽ | 108M₽ | 5M₽/mo |
| Year 3 | 400 | 20M₽ | 240M₽ | 11M₽/mo |

**Break-even:** Month 3-4 (need ~8 customers)

**3-Year Profit:** ~100M₽

**Exit Value (3.5x ARR):** 350-850M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Data sources block access | High | Multiple providers, legal contracts |
| Legal issues (data privacy) | Medium | Proper consent flows, ФЗ-152 compliance |
| Enterprise competitors enter | Medium | Focus on mid-market, speed |

---

## Idea 3: Contractor Payment Automation

### Problem

Paying freelancers/contractors in Russia is painful — ИП invoices, self-employed receipts, taxes, 1C integration.

### Solution

Deel/Remote for Russia. Contractor submits work → auto-invoice → auto-payment → auto-accounting.

```
Company adds contractors → система генерирует акты → платит → сдаёт в 1С
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 50-200k₽/mo (% of payroll or per-contractor) |
| Target customers | 200-1000 (IT companies, agencies, studios) |
| TAM | Every company with 5+ contractors |
| Competition | Solar Staff, Бухгалтерия.ру (outdated UX) |

### Why Better Than Otzovik

- Touches money (extremely sticky)
- Solves legal/tax pain (high willingness to pay)
- Revenue scales with client's contractor base

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 6-9 months |
| Dev cost (if outsourced) | 1-2M₽ |
| Monthly infra | 30-50k₽ |
| Legal/compliance setup | 200-500k₽ |
| Difficulty | Very Hard (payments, legal, accounting) |

### Financial Projections

**Assumptions:** 100k₽ ARPU, 40% gross margin (payment processing costs), 1.5% monthly churn

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 9 | 10 | 1M₽ | - | 400k₽ |
| Year 1 | 25 | 2.5M₽ | 30M₽ | 1M₽/mo |
| Year 2 | 80 | 8M₽ | 96M₽ | 3.2M₽/mo |
| Year 3 | 200 | 20M₽ | 240M₽ | 8M₽/mo |

**Break-even:** Month 8-10 (need ~15 customers to cover high infra)

**3-Year Profit:** ~70M₽

**Exit Value (4x ARR):** 400-960M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Payment license requirements | High | Partner with licensed bank/PSP |
| 1C integration complexity | High | Start with popular configs only |
| Solar Staff competition | Medium | Better UX, focus on niche |
| Long sales cycle | High | Content marketing, referrals |

---

## Idea 4: AI Document Processing for Legal/Finance

### Problem

Lawyers, accountants, banks manually review contracts, extract data, check for risks.

### Solution

Upload contract → AI extracts key terms, flags risks, compares to templates.

```
Upload договор поставки → система: "срок оплаты 60 дней (обычно 30), нет неустойки"
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 30-100k₽/mo |
| Target customers | 300-1000 (law firms, in-house legal, banks) |
| TAM | Every company with 50+ contracts/year |
| Competition | None good in Russia |

### Why Better Than Otzovik

- AI creates technical moat
- Professionals value time highly
- Clear ROI (hours saved per contract)

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 4-6 months |
| Dev cost (if outsourced) | 400-700k₽ |
| Monthly AI costs | 20-50k₽ (scales with usage) |
| Monthly infra | 10-20k₽ |
| Difficulty | Hard (AI/ML, document parsing, legal domain) |

### Financial Projections

**Assumptions:** 50k₽ ARPU, 70% gross margin (AI costs are low), 2% monthly churn

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 6 | 10 | 500k₽ | - | 350k₽ |
| Year 1 | 35 | 1.75M₽ | 21M₽ | 1.2M₽/mo |
| Year 2 | 100 | 5M₽ | 60M₽ | 3.5M₽/mo |
| Year 3 | 250 | 12.5M₽ | 150M₽ | 8.75M₽/mo |

**Break-even:** Month 5-6 (need ~6 customers)

**3-Year Profit:** ~80M₽

**Exit Value (4x ARR):** 250-600M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| AI accuracy issues | High | Human review option, confidence scores |
| Long enterprise sales cycle | High | Start with mid-size law firms |
| Domain expertise needed | Medium | Hire legal consultant, user feedback |
| OpenAI/Anthropic dependency | Low | Model-agnostic architecture |

---

## Idea 5: Inventory/Procurement for SMB Retail

### Problem

Small retail (магазины, аптеки, кофейни) manage inventory in Excel or 1С (painful). No good mid-market solution.

### Solution

Simple inventory + auto-reorder + supplier price comparison.

```
Stock low → система сравнивает цены поставщиков → заказ в 1 клик
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 10-30k₽/mo |
| Target customers | 1000-5000 |
| TAM | 500k+ retail points in Russia |
| Competition | МойСклад (complex), 1С (nightmare UX) |

### Why Better Than Otzovik

- Daily usage (extremely sticky)
- Saves real money (reduced waste, better prices)
- Clear, measurable ROI

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 3-4 months |
| Dev cost (if outsourced) | 250-400k₽ |
| Monthly infra | 5-10k₽ |
| Difficulty | Medium (CRUD, supplier APIs) |

### Financial Projections

**Assumptions:** 15k₽ ARPU, 75% gross margin, 4% monthly churn (SMB)

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 6 | 50 | 750k₽ | - | 560k₽ |
| Year 1 | 150 | 2.25M₽ | 27M₽ | 1.7M₽/mo |
| Year 2 | 400 | 6M₽ | 72M₽ | 4.5M₽/mo |
| Year 3 | 800 | 12M₽ | 144M₽ | 9M₽/mo |

**Break-even:** Month 2-3 (need ~15 customers)

**3-Year Profit:** ~90M₽

**Exit Value (2.5x ARR):** 180-360M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| МойСклад/1С improve UX | Medium | Focus on niche (cafes, pharmacies) |
| High SMB churn | High | Sticky features, annual plans |
| Supplier integration costs | Medium | Start with top 10 suppliers |
| Price pressure | Medium | Add value-add features (analytics) |

---

## Idea 6: Compliance/Audit Automation

### Problem

Companies must comply with ФЗ-152 (data protection), ФЗ-54 (receipts), labor law, etc. Usually hire consultants or just hope for the best.

### Solution

Checklist + document generator + audit trail for common compliance requirements.

```
Answer questions → система: "вам нужны эти 12 документов" → генерирует → напоминает о сроках
```

### Metrics

| Metric | Value |
|--------|-------|
| ARPU | 20-50k₽/mo |
| Target customers | 500-2000 |
| TAM | Every company with 10+ employees |
| Competition | Consultants (expensive), nothing SaaS |

### Why Better Than Otzovik

- Fear-driven sales (fines are real)
- Recurring (laws and requirements change)
- Upsell path to audit/consulting services

### Effort & Cost

| Item | Value |
|------|-------|
| Build time | 3-5 months |
| Dev cost (if outsourced) | 300-500k₽ |
| Monthly infra | 5-10k₽ |
| Legal expertise needed | 50-100k₽ (consultant) |
| Difficulty | Medium (forms, docs, reminders) |

### Financial Projections

**Assumptions:** 30k₽ ARPU, 80% gross margin, 2.5% monthly churn

| Period | Customers | MRR | ARR | Gross Profit |
|--------|-----------|-----|-----|--------------|
| Month 6 | 25 | 750k₽ | - | 600k₽ |
| Year 1 | 70 | 2.1M₽ | 25M₽ | 1.7M₽/mo |
| Year 2 | 200 | 6M₽ | 72M₽ | 4.8M₽/mo |
| Year 3 | 450 | 13.5M₽ | 162M₽ | 10.8M₽/mo |

**Break-even:** Month 3-4 (need ~8 customers)

**3-Year Profit:** ~100M₽

**Exit Value (3x ARR):** 200-480M₽

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Laws change frequently | Medium | Subscription model, update service |
| Requires legal expertise | Medium | Partner with law firm |
| Enterprise competitors (Контур) | Medium | Focus on SMB, simpler UX |
| Commoditization | Low | Add audit services upsell |

---

## Comparison Matrix

| Idea | ARPU | Build Effort | Sales Effort | Defensibility | Rating |
|------|------|--------------|--------------|---------------|--------|
| CRM Middleware | 30k₽ | High | Medium | High | ⭐⭐⭐ |
| Background Checks | 50k₽ | Medium | Medium | Medium | ⭐⭐⭐⭐ |
| Contractor Payments | 100k₽ | Very High | High | High | ⭐⭐ |
| AI Doc Processing | 50k₽ | High | High | High | ⭐⭐⭐ |
| Inventory SMB | 15k₽ | Medium | Low | Medium | ⭐⭐⭐⭐ |
| Compliance | 30k₽ | Medium | Medium | Medium | ⭐⭐⭐ |

---

## Financial Summary

| Idea | Build Cost | Break-even | Year 1 MRR | Year 3 MRR | 3-Year Profit | Exit Value |
|------|------------|------------|------------|------------|---------------|------------|
| CRM Middleware | 500-800k₽ | Month 4-5 | 1.2M₽ | 7.5M₽ | ~50M₽ | 130-270M₽ |
| Background Checks | 300-500k₽ | Month 3-4 | 3M₽ | 20M₽ | ~100M₽ | 350-850M₽ |
| Contractor Payments | 1-2M₽ | Month 8-10 | 2.5M₽ | 20M₽ | ~70M₽ | 400-960M₽ |
| AI Doc Processing | 400-700k₽ | Month 5-6 | 1.75M₽ | 12.5M₽ | ~80M₽ | 250-600M₽ |
| Inventory SMB | 250-400k₽ | Month 2-3 | 2.25M₽ | 12M₽ | ~90M₽ | 180-360M₽ |
| Compliance | 300-500k₽ | Month 3-4 | 2.1M₽ | 13.5M₽ | ~100M₽ | 200-480M₽ |

### Best ROI (Profit / Effort)

1. **Background Checks** — 100M₽ profit, medium effort, best ratio
2. **Compliance** — 100M₽ profit, medium effort, fear-driven sales
3. **Inventory SMB** — 90M₽ profit, lowest effort, fastest break-even

### Highest Ceiling

1. **Contractor Payments** — 960M₽ exit potential, but very hard
2. **Background Checks** — 850M₽ exit potential, medium difficulty
3. **AI Doc Processing** — 600M₽ exit potential, needs AI expertise

### Easiest to Start

1. **Inventory SMB** — 2-3 month break-even, self-serve sales
2. **Background Checks** — 3-4 month break-even, clear value prop
3. **Compliance** — 3-4 month break-even, fear-driven demand

---

## Top Recommendations

### If You Want Easier Sales

**→ Inventory for SMB Retail**

- Self-serve possible (no enterprise sales)
- Clear ROI pitch: "save 50k₽/month on waste and better supplier prices"
- Lower ARPU (15k₽) but higher volume potential
- Similar sales motion to Otzovik.ai

### If You Want Higher ARPU

**→ Background Checks**

- HR is a buyer with budget authority
- Dual revenue: subscription + per-check fees
- Compliance angle (companies must verify employees)
- Medium sales complexity (HR managers accessible)

---

## The Trade-off: Otzovik vs B2B

| Factor | Otzovik.ai | B2B SaaS |
|--------|------------|----------|
| Time to first ₽ | 1-2 months | 3-6 months |
| Revenue at 12mo | 500k₽ MRR | 300k₽ MRR |
| Revenue at 24mo | 1M₽ MRR | 2M₽ MRR |
| Daily work | Marketing grind | Sales grind |
| Exit multiple | 2-3x ARR | 3-5x ARR |
| Learning curve | Marketing, ads, SEO | Sales, enterprise, contracts |

---

## Hybrid Strategy

You don't have to choose immediately:

```
Month 1-6:   Ship Otzovik, validate SaaS skills
Month 6-12: Hit 100 customers, learn what works
Month 12+:  Either double down OR pivot to B2B with experience
```

**Otzovik is faster to validate. B2B is better long-term.**

The skills transfer:
- Building SaaS products
- Handling payments and subscriptions
- Customer support and retention
- Basic marketing and positioning

These apply to any future B2B venture.

---

## Otzovik.ai vs Alternatives (Full Comparison)

| Metric | Otzovik.ai | Background Checks | Inventory SMB | Compliance |
|--------|------------|-------------------|---------------|------------|
| **Build time** | Done | 3-4 months | 3-4 months | 3-5 months |
| **Build cost** | Spent | 300-500k₽ | 250-400k₽ | 300-500k₽ |
| **ARPU** | 3.5k₽ | 50k₽ | 15k₽ | 30k₽ |
| **Gross margin** | 50% | 55% | 75% | 80% |
| **Break-even** | Month 2 | Month 3-4 | Month 2-3 | Month 3-4 |
| **Year 1 MRR** | 500k₽ | 3M₽ | 2.25M₽ | 2.1M₽ |
| **Year 3 MRR** | 3M₽ | 20M₽ | 12M₽ | 13.5M₽ |
| **3-Year Profit** | 15-20M₽ | ~100M₽ | ~90M₽ | ~100M₽ |
| **Exit Value** | 30-60M₽ | 350-850M₽ | 180-360M₽ | 200-480M₽ |
| **Sales type** | Self-serve | B2B outbound | Self-serve | B2B outbound |
| **Difficulty** | Easy | Medium | Easy | Medium |
| **Your advantage** | Already built | None yet | None yet | None yet |

### The Real Question

| If you value... | Choose |
|-----------------|--------|
| Speed to revenue | Otzovik.ai (already built) |
| Highest upside | Background Checks |
| Easiest path | Inventory SMB |
| Best profit/effort | Compliance |
| Learning B2B sales | Any B2B option |

### My Recommendation

```
Option A: Ship Otzovik now
├── Validate in 3 months
├── If works (100+ customers) → keep scaling
└── If doesn't → pivot to B2B with SaaS experience

Option B: Abandon Otzovik, start B2B
├── Lose 1-2 months of work
├── Start from zero
└── Higher ceiling but delayed revenue

Option C: Run both (not recommended)
├── Split focus = both fail
└── Only works with co-founder
```

**Best path: Option A.** You've already built Otzovik. Launch it, learn from real customers, decide in 3-6 months.

---

*Last updated: January 2025*
