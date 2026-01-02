# Отзовик — Pricing Strategy & Cost Analysis

## Current Pricing Tiers

| Plan | Price | SMS | Locations | Team | AI Replies | Target |
|------|-------|-----|-----------|------|------------|--------|
| **Пробный период** | 0₽ | 20 (14 days) | 1 | 1 | 0 | Try before buy |
| Старт | 1,190₽ | 100/mo | 1 | 3 | 0 | Small business |
| Бизнес | 4,990₽ | 400/mo | 5 | 20 | 50 | Growing companies |
| Сеть | 16,990₽ | 1000/mo | ∞ | ∞ | 100 | Networks/franchises |

### Trial Model
- **14 days free trial** with 20 SMS and full features
- No credit card required
- After trial: choose a plan or account pauses (data preserved)
- Trial users can upgrade anytime during trial

### Pricing Strategy (Airline Model)
- **Старт**: Entry tier, 42% margin, not competitive vs Business on arbitrage
- **Бизнес**: Mid-tier profit center, 48% margin
- **Сеть**: Premium tier, 62% margin, unlimited for chains
- Margins scale UP with tier (42% → 48% → 62%)
- No free tier = no freeloaders, higher quality leads

### Why SMS (not WhatsApp)

**WhatsApp is blocked/restricted in Russia since Oct 2025.** Roskomnadzor actively restricts Meta services. SMS is the only channel that:
- Works on 100% of phones (no app required)
- Guaranteed delivery (no blocks/throttling)
- Reaches older demographics
- No dependency on foreign tech companies

> "В отличие от WhatsApp, SMS работает везде и всегда."

---

## 1. SMS Costs — Deep Dive

### Current Provider Options (Russia, Jan 2025)

| Provider | MTS | Megafon | Beeline | Tele2 | Notes |
|----------|-----|---------|---------|-------|-------|
| **[sms.ru](https://sms.ru/price)** | 5.55₽ | 7.75₽ | 8.80₽ | 6.37₽ | Good API, already integrated |
| **[SMSC.ru](https://smsc.ru/tariffs/)** | 5.70₽ | 8.00₽ | 25.00₽* | 6.50₽ | High reliability |
| **[TargetSMS](https://targetsms.ru/tarify)** | 5.51₽ | 7.17₽ | varies | 5.67₽ | Free sender registration |
| **[Exolve/MTS](https://exolve.ru/tariffs/)** | 4.50₽ | 6.00₽ | 7.30₽ | 4.77₽ | Direct carrier, best for volume |
| **[P1SMS](https://p1sms.ru/ceny-na-sms-rassylki)** | ~5₽ | ~5₽ | varies | ~5₽ | Good for OTP |

*\*international sender name*

**Average cost: ~6₽/SMS** (weighted by carrier market share)

### Sender Name Registration Fees (monthly)
- MTS: 1,000-2,000₽ + 1,000₽ per template
- MegaFon: 2,500-3,000₽
- Beeline: 1st free, then 1,000₽
- Tele2: Free
- Волна/Win mobile (Crimea): 4,000₽ each

### Our SMS Cost Structure

**Assumption: Using sms.ru at ~6₽/SMS average**

| Tier | SMS | SMS Cost | Other | Total Cost | Revenue | Margin |
|------|-----|----------|-------|------------|---------|--------|
| Пробный (14 дней) | 20 | 120₽ | 20₽ | 140₽ | 0₽ | -140₽ (CAC) |
| Старт | 100 | 600₽ | 90₽ | 690₽ | 1,190₽ | **500₽ (42%)** |
| Бизнес | 400 | 2,400₽ | 170₽ | 2,570₽ | 4,990₽ | **2,420₽ (48%)** |
| Сеть | 1000 | 6,000₽ | 420₽ | 6,420₽ | 16,990₽ | **10,570₽ (62%)** |

**Note:** Margins scale with tier (42% → 48% → 62%). Trial cost (140₽) recovered in first month. Arbitrage-proof: 4× Start (4,760₽) < Business (4,990₽) but Business has more users + features.

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

AI replies are included in higher tiers:
- **Пробный/Старт**: 0 AI replies (upsell driver)
- **Бизнес**: 50 AI replies/month
- **Сеть**: 100 AI replies/month
- **Extra**: 5₽ per additional reply

---

## 3. Infrastructure Costs

### Current Stack

| Service | Plan | Cost/month | Notes |
|---------|------|------------|-------|
| **Railway** | Hobby | $5 | Hosting |
| **Supabase** | Free→Pro | $0-25 | PostgreSQL + Auth |
| **Resend** | Free→Pro | $0-20 | Transactional email |
| **Domain** | .ru | ~100₽/year | Negligible |
| **Total** | | **~$5-50** | ~500-5,000₽ |

### Scaling Projections

| Users | Railway | Supabase | Email | Total |
|-------|---------|----------|-------|-------|
| 0-50 | $5 | $0 | $0 | $5 |
| 50-200 | $5-20 | $25 | $20 | $50-65 |
| 200-500 | $20-40 | $25 | $20 | $65-85 |
| 500-1000 | $40-80 | $25-100 | $90 | $155-270 |
| 1000+ | $80+ | $100+ | $90+ | $270+ |

### Cost per Customer (Infrastructure only)

| Scale | Users | Infra Cost | Per User |
|-------|-------|------------|----------|
| Early | 50 | 4,000₽ | 80₽ |
| Growth | 200 | 8,000₽ | 40₽ |
| Scale | 500 | 15,000₽ | 30₽ |
| Mature | 1000 | 35,000₽ | 35₽ |

---

## 4. Full Cost Analysis per Tier

### Пробный период (14 дней бесплатно)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (20) | 120₽ | @6₽, one-time |
| Infrastructure | 20₽ | Minimal usage |
| Support | 0₽ | Self-service |
| **Total Cost** | **140₽** | CAC investment |
| **Payback** | **<1 month** | On any paid plan |

**Trial Economics:**
- Cost per trial: 140₽
- If 30% convert to Старт: 140₽ / 0.3 = 467₽ CAC
- LTV (12 months on Старт): 500₽ × 12 = 6,000₽
- LTV:CAC = 12.8:1 ✅

### Старт (1,190₽/month) — Entry Tier

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (100) | 600₽ | @6₽ |
| Infrastructure | 40₽ | Allocated share |
| Support | 50₽ | Email only |
| **Total Cost** | **690₽** | |
| **Gross Margin** | **500₽ (42%)** | Entry tier |

### Бизнес (4,990₽/month) — Mid-Tier Profit

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (400) | 2,400₽ | @6₽ |
| Infrastructure | 60₽ | Higher usage |
| AI replies (50) | 10₽ | Negligible |
| Support | 100₽ | Priority |
| **Total Cost** | **2,570₽** | |
| **Gross Margin** | **2,420₽ (48%)** | |

### Сеть (16,990₽/month) — Premium Profit

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| SMS (1000) | 6,000₽ | @6₽ |
| Infrastructure | 120₽ | Heavy usage |
| AI replies (100) | 20₽ | Negligible |
| Support | 280₽ | Personal manager |
| **Total Cost** | **6,420₽** | |
| **Gross Margin** | **10,570₽ (62%)** | |

---

## 5. Pricing Strategy Notes

### Why 3 Paid Tiers + Trial

We use trial model instead of free tier:
- **No freeloaders** — trial expires, must choose plan
- **Higher quality leads** — users commit with intent to pay
- **20 SMS** — enough to see real results (3-4 reviews), drives conversion
- Cleaner decision path: Trial → Старт → Бизнес → Сеть

### Trial Economics

Trial costs us 140₽/user (one-time). Break-even if:
- 30% convert to Старт: 467₽ CAC, LTV 4,800₽ (10.3:1)
- 20% convert to Бизнес: 700₽ CAC, LTV 36,240₽ (51.8:1)

Target: 30%+ conversion to paid within 14 days.

### Add-on Packages

SMS packs are "emergency refills" — premium priced to incentivize tier upgrades.
Purchased SMS never expire (tier SMS reset monthly).

| Package | Price | Per SMS |
|---------|-------|---------|
| 50 SMS | 650₽ | 13₽ |
| 100 SMS | 1,200₽ | 12₽ |
| 250 SMS | 2,750₽ | 11₽ |
| 500 SMS | 5,000₽ | 10₽ |

| Other Add-ons | Price |
|---------------|-------|
| AI Replies 50 | 200₽ (4₽/reply) |

---

## 6. Growth Projections (3-Year)

### Assumptions
- **ARPU:** 3,650₽/month average (blended tiers)
- **Churn:** 5%/month Year 1, 3%/month Year 2-3
- **Growth:** 15% month-over-month Year 1, 10% Year 2, 7% Year 3
- **Costs:** 45% of revenue (airline model: low on Старт, high on Бизнес/Сеть)

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
| Conservative | Month 1-2 | ~20 paying users |
| Optimistic | Month 1 | ~20 paying users |

**Fixed costs:** ~10k₽/month (Railway + Supabase + misc)

**Blended margin calculation** (assumed mix: 60% Старт, 30% Бизнес, 10% Сеть):

| Tier | Users | Revenue | Margin | Profit |
|------|-------|---------|--------|--------|
| Старт | 60 | 71,400₽ | 42% | 30,000₽ |
| Бизнес | 30 | 149,700₽ | 48% | 71,856₽ |
| Сеть | 10 | 169,900₽ | 62% | 105,358₽ |
| **Total** | 100 | 391,000₽ | **53%** | **207,214₽** |

**ARPU:** 3,910₽ | **Avg margin:** 2,072₽ | **Break-even:** 25,000 ÷ 2,072 = ~12 users

✅ **Pricing model works:**
- Margins scale with tier (42% → 48% → 62%)
- Higher tiers = higher profit per user
- Arbitrage-proof via team limits + features

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
- **CAC** (Customer Acquisition Cost): Target <3,000₽
- **LTV** (Lifetime Value): Target >31,000₽ (15+ months × 2,072₽ margin)
- **LTV:CAC ratio**: Target >10:1
- **Gross Margin**: Target >50% blended (42% Старт, 48% Бизнес, 62% Сеть)

### Operational
- SMS delivery rate: >95%
- Review conversion rate: >15%
- Churn rate: <5%/month
- Support tickets/user: <1/month

---

## Sources

### SMS Pricing (verified Jan 2025)
- [sms.ru](https://sms.ru/price) — 5.55-8.80₽/SMS
- [SMSC.ru](https://smsc.ru/tariffs/) — 5.70-8.00₽/SMS
- [TargetSMS](https://targetsms.ru/tarify) — 5.51-7.17₽/SMS
- [Exolve/MTS](https://exolve.ru/tariffs/messengers/) — 4.50-7.30₽/SMS (direct carrier)
- [P1SMS](https://p1sms.ru/ceny-na-sms-rassylki) — ~5₽/SMS

### AI API Pricing
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Anthropic Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Google Gemini Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [xAI Grok Pricing](https://docs.x.ai/docs/models)

### Infrastructure
- [Railway Pricing](https://railway.app/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Resend Email Pricing](https://resend.com/pricing)

---

*Last updated: January 2026*
