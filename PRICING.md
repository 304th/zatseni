# Отзовик — Pricing Strategy & Cost Analysis

## Current Pricing Tiers

| Plan | Price | SMS/mo | Locations | AI Replies | Target |
|------|-------|--------|-----------|------------|--------|
| Бесплатный | 0₽ | 10 | 1 | 0 | Try it free |
| Старт | 990₽ | 100 | 1 | 0 | Small business |
| Бизнес | 3,990₽ | 500 | 5 | 50 | Growing companies |
| Сеть | 9,990₽ | 2000 | Unlimited | 100 | Networks/franchises |

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
| Бесплатный | 10 | 25₽ | 0₽ | -25₽ (marketing) |
| Старт | 100 | 250₽ | 990₽ | 740₽ (75%) |
| Бизнес | 500 | 1,250₽ | 3,990₽ | 2,740₽ (69%) |
| Сеть | 2000 | 5,000₽ | 9,990₽ | 4,990₽ (50%) |

**Note:** Free tier is a marketing cost (~25₽/user/month). Бизнес tier has healthy margins after price adjustment.

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
| SMS (10) | 25₽ | @2.5₽ |
| Infrastructure | 20₽ | Minimal usage |
| Support | 0₽ | Self-service |
| **Total Cost** | **45₽** | |
| **Gross Margin** | **-45₽** | Marketing cost |

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
| SMS (2000) | 5,000₽ | @2.5₽ |
| Infrastructure | 100₽ | Heavy usage |
| AI replies (100) | 20₽ | Negligible |
| Support | 300₽ | Personal manager |
| **Total Cost** | **5,420₽** | |
| **Gross Margin** | **4,570₽ (46%)** | |

---

## 5. Pricing Strategy Notes

### Why 4 Tiers (not 5)

We consolidated from 5 to 4 tiers for simplicity:
- Removed Бизнес+ (4,990₽) — too similar to Бизнес
- Бизнес now includes priority support and more AI replies
- Cleaner decision path: Free → Старт → Бизнес → Сеть

### Free Tier Economics

Free tier costs us ~45₽/user/month. Break-even if:
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

## 6. Profit Projections

### Conservative Scenario (Year 1)

| Month | Users | MRR | Costs | Profit |
|-------|-------|-----|-------|--------|
| 1-3 | 20 | 30k₽ | 25k₽ | 5k₽ |
| 4-6 | 50 | 80k₽ | 50k₽ | 30k₽ |
| 7-9 | 100 | 170k₽ | 100k₽ | 70k₽ |
| 10-12 | 150 | 270k₽ | 150k₽ | 120k₽ |

**Year 1 Total:** ~600k₽ profit

### Optimistic Scenario (Year 1)

| Month | Users | MRR | Costs | Profit |
|-------|-------|-----|-------|--------|
| 1-3 | 50 | 75k₽ | 45k₽ | 30k₽ |
| 4-6 | 150 | 250k₽ | 140k₽ | 110k₽ |
| 7-9 | 300 | 550k₽ | 280k₽ | 270k₽ |
| 10-12 | 500 | 950k₽ | 450k₽ | 500k₽ |

**Year 1 Total:** ~2.7M₽ profit

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
