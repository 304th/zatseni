# Otzovik.ai — Review Booster for Russian Market

## What It Does

Otzovik.ai helps local businesses collect more positive reviews on Yandex Maps and 2GIS by intercepting customer feedback before it goes public.

**The Problem:** Most customers only leave reviews when angry. Happy customers rarely bother.

**The Solution:** Send SMS after each visit asking for feedback. Route happy customers (4-5★) to public review platforms. Capture unhappy customers (1-3★) privately before they damage your rating.

## How It Works

```
Customer Visit → SMS Sent → Customer Rates → Routing Decision
                                    ↓
                            4-5★ → Yandex/2GIS (public review)
                            1-3★ → Private feedback form
```

### Core Flow

1. **Business Setup**
   - Owner signs up, adds business info
   - Configures Yandex Maps and 2GIS review URLs
   - Gets unique review page: `otzovik.ai/r/business-slug`

2. **SMS Sending**
   - Manual: Dashboard button, enter phone
   - Automated: CRM/POS webhook integration (Bitrix24, AmoCRM, YCLIENTS, iiko, Poster)

3. **Customer Experience**
   - Receives SMS: "Thanks for visiting [Business]! Rate us: otzovik.ai/r/slug"
   - Opens link, sees 5-star rating selector
   - **If 4-5 stars:** "Thanks! Please leave a review" + Yandex/2GIS buttons
   - **If 1-3 stars:** "What went wrong?" + private feedback form

4. **Business Dashboard**
   - See all requests: sent, opened, rated
   - Analytics: conversion rates, rating distribution
   - Private feedback inbox for complaints

## Pricing Strategy

### Tiers

| Plan | Price | SMS/mo | Locations | Target Customer |
|------|-------|--------|-----------|-----------------|
| Старт | 990₽ | 100 | 1 | Solo entrepreneur, testing |
| Бизнес | 2,490₽ | 500 | 5 | Growing business, multiple staff |
| Сеть | 7,990₽ | 2,000 | ∞ | Franchise, chain |

### Rationale

**Why these prices?**
- Competitors (Revvy, GetReview): 2,000-5,000₽/mo for similar features
- SMS cost: ~2₽/SMS wholesale, so 100 SMS = 200₽ cost, 790₽ margin
- Sweet spot: Low enough to try, high enough to filter out non-serious users

**Why SMS limits, not unlimited?**
- Prevents abuse (spam)
- Creates natural upgrade path
- Aligns cost with usage (SMS has real cost)

**Why location limits?**
- Creates clear upgrade triggers
- Franchises naturally need "Сеть" plan
- Solo owners don't pay for features they don't use

### SMS Packs (Add-on)

| Pack | Price | Per SMS |
|------|-------|---------|
| 100 | 350₽ | 3.50₽ |
| 300 | 900₽ | 3.00₽ |
| 500 | 1,250₽ | 2.50₽ |
| 1,000 | 2,000₽ | 2.00₽ |

Volume discount encourages larger purchases. Margin ~50% at highest tier.

## User Flows

### New User Onboarding

```
Landing Page → Sign Up → Email Verification → Add Business → Configure URLs → Send First SMS
     ↓
14-day free trial on "Старт" plan with 50 free SMS
```

### Daily Operations (Business Staff)

```
Customer Leaves → Open Dashboard → Click "Request Review" → Enter Phone → Send
                        or
POS/CRM auto-triggers webhook → SMS sent automatically
```

### Plan Upgrade

```
Hit SMS limit or need more locations
     ↓
Dashboard shows upgrade prompt → /dashboard/billing → Select plan → YooKassa payment → Plan activated
```

### Team Management (Бизнес+ plans)

```
Owner → Business Settings → Team → Invite by email
     ↓
Invitee receives email → Clicks link → Creates account or logs in → Added as Manager
     ↓
Manager can: send SMS, view analytics
Manager cannot: delete business, manage team, access integrations
```

### CRM Integration Setup

```
Owner → Integrations page → Create API key → Copy webhook URL
     ↓
In CRM (e.g., iiko): Settings → Webhooks → Add URL with ?key=API_KEY
     ↓
On each completed order: CRM POSTs phone → Otzovik.ai sends SMS
```

## Key Metrics to Track

**Acquisition:**
- Signups/week
- Trial → Paid conversion rate
- CAC (if running ads)

**Engagement:**
- SMS sent per business/month
- Review page open rate (~60-70% typical for SMS)
- Rating submission rate (~20-30%)

**Revenue:**
- MRR by plan
- SMS pack revenue
- Churn rate by plan

**Product:**
- Positive (4-5★) vs Negative (1-3★) ratio
- Private feedback volume
- Integration usage (% of SMS via webhook vs manual)

## Competitive Advantages

1. **Russian-first:** Yandex Maps + 2GIS focus (not Google/Yelp)
2. **SMS-based:** Higher open rates than email/push
3. **Negative feedback capture:** Saves public ratings
4. **CRM integrations:** Automation for high-volume businesses
5. **Simple pricing:** No per-review fees, predictable monthly cost

## Technical Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **SMS:** SMS.ru API
- **Payments:** YooKassa
- **Auth:** NextAuth.js with credentials + JWT
- **Hosting:** Railway

## Future Roadmap Ideas

- [ ] WhatsApp/Telegram as SMS alternatives
- [ ] QR code generation for tables/receipts
- [ ] Auto-response to negative feedback
- [ ] Review monitoring (scrape Yandex/2GIS ratings)
- [ ] White-label for agencies
- [ ] Mobile app for staff
