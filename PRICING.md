# Отзовик — Pricing Strategy & Cost Analysis

## Current Pricing Tiers

| Plan | Price | SMS/mo | Locations | AI Replies | Target |
|------|-------|--------|-----------|------------|--------|
| Бесплатный | 0₽ | 5 | 1 | 0 | Try it free |
| Старт | 990₽ | 100 | 1 | 0 | Small business |
| Бизнес | 3,990₽ | 500 | 5 | 50 | Growing companies |
| Сеть | 9,990₽ | 1000 | Unlimited | 100 | Networks/franchises |

---

## 1. SMS Costs — Deep Dive

### Current Provider Options (Russia)

| Provider | Price/SMS | Monthly Fee | Notes |
|----------|-----------|-------------|-------|
| **sms.ru** | 2.5-4₽ | Free (shared sender) | Good for small volumes |
| **SMSC.ru** | 2.0-3.5₽ | 0₽ | High reliability, good API |
| **TargetSMS** | 0.69-10.99₽ | 0₽ | Free sender registration |
| **p1sms.ru** | 2-4₽ | 0₽ | Good for OTP |
| **МТС Маркетолог** | 5.3-7.5₽ | 0₽ | Direct carrier |
| **REDSMS** | 7.70₽ | Lower with volume | Premium names |

### Sender Name Registration Fees
- MegaFon: 3,000₽/month
- MTS: 2,100₽/month
- Волна/Win mobile (Crimea): 4,000₽/month each
- Others: Usually free

### Our SMS Cost Structure

**Assumption: Using SMSC.ru at ~2.5₽/SMS average**

| Tier | SMS Included | Our Cost | Revenue | SMS Margin |
|------|--------------|----------|---------|------------|
| Бесплатный | 5 | 12.5₽ | 0₽ | -12.5₽ (marketing) |
| Старт | 100 | 250₽ | 990₽ | 740₽ (75%) |
| Бизнес | 500 | 1,250₽ | 3,990₽ | 2,740₽ (69%) |
| Сеть | 1000 | 2,500₽ | 9,990₽ | 7,490₽ (75%) |

**Note:** Free tier is a marketing cost (~12.5₽/user/month). Сеть tier value = unlimited locations + white label, not more SMS.

### Cheaper Alternatives to Consider

1. **Direct carrier contracts** (MTS, MegaFon, Beeline)
   - Requires 100k+ SMS/month
   - Can get 1.0-1.5₽/SMS
   - Setup: 1-2 months, legal paperwork

2. **WhatsApp Business API**
   - ~2₽ per conversation (24h window)
   - Higher open rates (98% vs 20% SMS)
   - Requires Meta verification

3. **Telegram Bot notifications**
   - FREE (only hosting costs)
   - Requires user opt-in
   - Good for existing Telegram users

4. **Push notifications**
   - FREE (Firebase/OneSignal)
   - Requires app installation
   - Future mobile app feature

---

## 2. AI Auto-Reply Feature (Roadmap)

### Use Case
Automatically generate professional responses to negative reviews on Yandex Maps/2GIS.

### AI Provider Comparison (per 1M tokens)

| Provider | Model | Input | Output | Best For |
|----------|-------|-------|--------|----------|
| **Gemini 2.5 Flash** | Flash | $0.15 | $0.60 | **Cheapest, good quality** |
| **GPT-4o mini** | Mini | $0.15 | $0.60 | Similar to Gemini |
| **Claude Haiku 3** | Haiku | $0.25 | $1.25 | Best quality/price |
| **Grok 4.1** | Fast | $0.20 | $0.50 | Good alternative |
| **GPT-4o** | Full | $5.00 | $15.00 | Premium quality |
| **Claude Sonnet** | 4.5 | $3.00 | $15.00 | Best quality |

### Cost Estimation per Reply

**Typical review response generation:**
- Input: ~500 tokens (review + context + prompt)
- Output: ~200 tokens (response)

| Model | Cost/Reply | 100 replies/mo | 1000 replies/mo |
|-------|------------|----------------|-----------------|
| Gemini Flash | ~$0.0002 | $0.02 | $0.20 |
| Claude Haiku 3 | ~$0.0004 | $0.04 | $0.40 |
| GPT-4o | ~$0.006 | $0.60 | $6.00 |

**Recommendation:** Start with Gemini 2.5 Flash or Claude Haiku 3. Cost is negligible (<$1/mo for most users).

### AI Feature Pricing (Implemented)

AI replies are included in paid tiers:
- **Бесплатный/Старт**: 0 AI replies (upsell driver)
- **Бизнес**: 50 AI replies/month
- **Сеть**: 100 AI replies/month
- **Extra**: 5₽ per additional reply

---

## 3. Infrastructure Costs

### Current Stack

| Service | Plan | Cost/month | Notes |
|---------|------|------------|-------|
| **Vercel** | Pro | $20 | Hosting, edge functions |
| **Neon PostgreSQL** | Launch | $19 | Serverless Postgres |
| **Resend** | Free→Pro | $0-20 | Transactional email |
| **Domain** | .ru | ~100₽/year | Negligible |
| **Total** | | **~$40-60** | ~4,000-6,000₽ |

### Scaling Projections

| Users | Vercel | Neon | Email | Total |
|-------|--------|------|-------|-------|
| 0-50 | $20 | $19 | $0 | $39 |
| 50-200 | $20-40 | $19 | $20 | $59-79 |
| 200-500 | $40-80 | $69 | $20 | $129-169 |
| 500-1000 | $80-150 | $69-200 | $90 | $239-440 |
| 1000+ | $150+ | $200+ | $90+ | $440+ |

### Cost per Customer (Infrastructure only)

| Scale | Users | Infra Cost | Per User |
|-------|-------|------------|----------|
| Early | 50 | 4,000₽ | 80₽ |
| Growth | 200 | 8,000₽ | 40₽ |
| Scale | 500 | 15,000₽ | 30₽ |
| Mature | 1000 | 35,000₽ | 35₽ |

---

## 4. Full Cost Analysis per Tier

### Бесплатный (0₽/month)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (5) | 12.5₽ | @2.5₽ |
| Infrastructure | 20₽ | Minimal usage |
| Support | 0₽ | Self-service |
| **Total Cost** | **32.5₽** | |
| **Gross Margin** | **-32.5₽** | Marketing cost |

### Старт (990₽/month)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (100) | 250₽ | @2.5₽ |
| Infrastructure | 40₽ | Allocated share |
| Support | 50₽ | Email only |
| **Total Cost** | **340₽** | |
| **Gross Margin** | **650₽ (66%)** | |

### Бизнес (3,990₽/month)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (500) | 1,250₽ | @2.5₽ |
| Infrastructure | 60₽ | Higher usage |
| AI replies (50) | 10₽ | Negligible |
| Support | 100₽ | Priority |
| **Total Cost** | **1,420₽** | |
| **Gross Margin** | **2,570₽ (64%)** | |

### Сеть (9,990₽/month)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (1000) | 2,500₽ | @2.5₽ |
| Infrastructure | 100₽ | Heavy usage |
| AI replies (100) | 20₽ | Negligible |
| Support | 300₽ | Personal manager |
| **Total Cost** | **2,920₽** | |
| **Gross Margin** | **7,070₽ (71%)** | |

---

## 5. Pricing Strategy Notes

### Why 4 Tiers (not 5)

We consolidated from 5 to 4 tiers for simplicity:
- Removed Бизнес+ (4,990₽) — too similar to Бизнес
- Бизнес now includes priority support and more AI replies
- Cleaner decision path: Free → Старт → Бизнес → Сеть

### Free Tier Economics

Free tier costs us ~32.5₽/user/month. Break-even if:
- 5% convert to Старт (990₽ × 0.05 = 49.5₽)
- Or 2% convert to Бизнес (3,990₽ × 0.02 = 79.8₽)

Target: 10%+ conversion to paid within 3 months.

### SMS Overage Pricing

| Volume | Price/SMS |
|--------|-----------|
| 1-100 extra | 5₽ |
| 101-500 extra | 4₽ |
| 500+ extra | 3.5₽ |

### Add-on Packages

| Package | Price | Contents |
|---------|-------|----------|
| SMS Pack 100 | 350₽ | 3.5₽/SMS |
| SMS Pack 500 | 1,500₽ | 3₽/SMS |
| SMS Pack 1000 | 2,500₽ | 2.5₽/SMS |
| AI Replies 50 | 200₽ | 4₽/reply |
| WhatsApp channel | 500₽/mo | Alternative to SMS |

---

## 6. Growth Projections (3-Year)

### Assumptions
- **ARPU:** 2,000₽/month average (mix of tiers)
- **Churn:** 5%/month Year 1, 3%/month Year 2-3
- **Growth:** 15% month-over-month Year 1, 10% Year 2, 7% Year 3
- **Costs:** 35% of revenue (SMS + infra + support)

---

### Conservative Scenario

| Quarter | Paying Users | MRR | ARR | Costs | Net Profit |
|---------|--------------|-----|-----|-------|------------|
| **Y1 Q1** | 25 | 50k₽ | - | 25k₽ | 25k₽ |
| **Y1 Q2** | 60 | 120k₽ | - | 50k₽ | 70k₽ |
| **Y1 Q3** | 100 | 200k₽ | - | 80k₽ | 120k₽ |
| **Y1 Q4** | 150 | 300k₽ | 3.6M₽ | 110k₽ | 190k₽ |
| | | | **Y1 Total:** | | **~1.2M₽** |
| **Y2 Q1** | 200 | 400k₽ | - | 150k₽ | 250k₽ |
| **Y2 Q2** | 270 | 540k₽ | - | 200k₽ | 340k₽ |
| **Y2 Q3** | 350 | 700k₽ | - | 260k₽ | 440k₽ |
| **Y2 Q4** | 450 | 900k₽ | 10.8M₽ | 330k₽ | 570k₽ |
| | | | **Y2 Total:** | | **~4.8M₽** |
| **Y3 Q1** | 550 | 1.1M₽ | - | 400k₽ | 700k₽ |
| **Y3 Q2** | 650 | 1.3M₽ | - | 470k₽ | 830k₽ |
| **Y3 Q3** | 750 | 1.5M₽ | - | 540k₽ | 960k₽ |
| **Y3 Q4** | 850 | 1.7M₽ | 20.4M₽ | 610k₽ | 1.1M₽ |
| | | | **Y3 Total:** | | **~10.8M₽** |

**3-Year Total Profit:** ~16.8M₽

---

### Optimistic Scenario

| Quarter | Paying Users | MRR | ARR | Costs | Net Profit |
|---------|--------------|-----|-----|-------|------------|
| **Y1 Q1** | 50 | 100k₽ | - | 40k₽ | 60k₽ |
| **Y1 Q2** | 150 | 300k₽ | - | 110k₽ | 190k₽ |
| **Y1 Q3** | 300 | 600k₽ | - | 220k₽ | 380k₽ |
| **Y1 Q4** | 500 | 1M₽ | 12M₽ | 370k₽ | 630k₽ |
| | | | **Y1 Total:** | | **~3.8M₽** |
| **Y2 Q1** | 700 | 1.4M₽ | - | 500k₽ | 900k₽ |
| **Y2 Q2** | 950 | 1.9M₽ | - | 680k₽ | 1.2M₽ |
| **Y2 Q3** | 1,200 | 2.4M₽ | - | 860k₽ | 1.5M₽ |
| **Y2 Q4** | 1,500 | 3M₽ | 36M₽ | 1.1M₽ | 1.9M₽ |
| | | | **Y2 Total:** | | **~16.8M₽** |
| **Y3 Q1** | 1,800 | 3.6M₽ | - | 1.3M₽ | 2.3M₽ |
| **Y3 Q2** | 2,100 | 4.2M₽ | - | 1.5M₽ | 2.7M₽ |
| **Y3 Q3** | 2,400 | 4.8M₽ | - | 1.7M₽ | 3.1M₽ |
| **Y3 Q4** | 2,700 | 5.4M₽ | 65M₽ | 1.9M₽ | 3.5M₽ |
| | | | **Y3 Total:** | | **~35M₽** |

**3-Year Total Profit:** ~55.6M₽

---

### Visual Growth Trajectory

```
Paying Users (Optimistic)
│
│                                          ╭─── 2,700
│                                     ╭────╯
│                                ╭────╯
│                           ╭────╯
│                      ╭────╯ 1,500
│                 ╭────╯
│            ╭────╯
│       ╭────╯ 500
│  ╭────╯
│──╯ 50
└────────────────────────────────────────────────
  Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4
  └────── Y1 ──────┘  └────── Y2 ──────┘  └────── Y3 ──────┘
```

```
MRR Growth (Optimistic)
│
│                                          ╭─── 5.4M₽
│                                     ╭────╯
│                                ╭────╯
│                           ╭────╯ 3M₽
│                      ╭────╯
│                 ╭────╯
│            ╭────╯ 1M₽
│       ╭────╯
│  ╭────╯
│──╯ 100k₽
└────────────────────────────────────────────────
  Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4   Q1   Q2   Q3   Q4
  └────── Y1 ──────┘  └────── Y2 ──────┘  └────── Y3 ──────┘
```

---

### Break-even Analysis

| Scenario | Break-even Point | Users Needed |
|----------|------------------|--------------|
| Conservative | Month 1 | ~15 paying users |
| Optimistic | Month 1 | ~15 paying users |

**Fixed costs:** ~25k₽/month (Vercel + Neon + misc)
**Margin per user:** ~1,300₽ (ARPU 2,000₽ × 65% margin)
**Break-even:** 25,000 ÷ 1,300 = ~19 users

---

### Milestones

| Milestone | Conservative | Optimistic |
|-----------|--------------|------------|
| 100 users | Q3 Y1 | Q2 Y1 |
| 500 users | Q4 Y2 | Q4 Y1 |
| 1M₽ MRR | Q4 Y2 | Q4 Y1 |
| 1,000 users | Q4 Y3 | Q2 Y2 |
| 5M₽ MRR | - | Q4 Y3 |
| 10M₽ ARR | Q4 Y2 | Q4 Y1 |
| 50M₽ ARR | - | Q3 Y3 |

---

## 7. Roadmap Features & Costs

### Phase 1 (Current)
- [x] SMS via sms.ru/SMSC
- [x] Basic analytics
- [x] Manual request sending
- Cost: Included in current pricing

### Phase 2 (Q1)
- [ ] WhatsApp Business API integration
- [ ] CRM integrations (iiko, YCLIENTS, Bitrix24)
- [ ] AI auto-reply to negative reviews
- Cost: +$50/month (WhatsApp fees)

### Phase 3 (Q2)
- [ ] Mobile app (push notifications = free channel)
- [ ] Review monitoring (scraping Yandex/2GIS)
- [ ] Competitor analysis
- Cost: +$100/month (additional infra)

### Phase 4 (Q3-Q4)
- [ ] White-label solution
- [ ] API for partners
- [ ] Advanced AI (sentiment analysis, trend detection)
- Cost: +$200/month (more compute)

---

## 8. Key Metrics to Track

### Unit Economics
- **CAC** (Customer Acquisition Cost): Target <2,000₽
- **LTV** (Lifetime Value): Target >15,000₽ (15+ months retention)
- **LTV:CAC ratio**: Target >7:1
- **Gross Margin**: Target >50% average

### Operational
- SMS delivery rate: >95%
- Review conversion rate: >15%
- Churn rate: <5%/month
- Support tickets/user: <1/month

---

## Sources

### SMS Pricing
- [sms.ru](https://sms.ru/price)
- [SMSC.ru](https://smsc.ru/tariffs/)
- [TargetSMS](https://targetsms.ru/tarify)
- [DTF Top SMS Services](https://dtf.ru/top-raiting/4149545-luchshie-servisy-dlya-sms-rassylok)

### AI API Pricing
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [xAI Grok Pricing](https://docs.x.ai/docs/models)

### Infrastructure
- [Vercel Pricing](https://vercel.com/pricing)
- [Neon PostgreSQL Pricing](https://neon.com/pricing)
- [Resend Email Pricing](https://resend.com/pricing)

---

*Last updated: January 2026*
