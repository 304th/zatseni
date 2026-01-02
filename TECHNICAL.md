# Zatseni Technical Documentation

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Prisma    │────▶│  PostgreSQL │
│  Frontend   │     │     ORM     │     │  (Supabase) │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ├───────────────────────────────┐
       ▼                               ▼
┌─────────────┐     ┌─────────────┐  ┌─────────────┐
│  NextAuth   │     │  External   │  │   Upstash   │
│    JWT      │     │   APIs      │  │    Redis    │
└─────────────┘     └─────────────┘  │ (ratelimit) │
                          │          └─────────────┘
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         SMS.ru      YooKassa      SMTP
```

## Database Models

### User
```prisma
model User {
  id            String   
  email         String   @unique
  password      String?
  name          String?
  role          String   @default("user")    // user, support, admin
  plan          String   @default("start")   // start, business, network
  businesses    Business[]
  memberships   BusinessMember[]
}
```

### Business
```prisma
model Business {
  id          String
  name        String
  slug        String   @unique
  phone       String?
  address     String?
  yandexUrl   String?
  gisUrl      String?
  userId      String   // owner
  smsLimit    Int      @default(100)
  smsUsed     Int      @default(0)
  members     BusinessMember[]
  requests    ReviewRequest[]
  apiKeys     ApiKey[]
}
```

### ReviewRequest
```prisma
model ReviewRequest {
  id          String
  businessId  String
  phone       String
  status      String   // sent, opened, reviewed, feedback
  rating      Int?     // 1-5
  feedback    String?  // private feedback text
  source      String?  // manual, bitrix24, amocrm, etc.
  sentAt      DateTime
  openedAt    DateTime?
  reviewedAt  DateTime?
}
```

---

## User Flows

### 1. Authentication

#### Sign Up
```
POST /api/auth/signup
Body: { name, email, password }

Flow:
1. Validate email not taken
2. Hash password (bcrypt)
3. Create User with plan="start"
4. Generate verification token
5. Send verification email
6. Return success

Response: { success: true }
```

#### Email Verification
```
GET /verify-email?token=xxx&email=xxx

Flow:
1. Find VerificationToken by token+email
2. Check not expired (24h)
3. Update User.emailVerified = now()
4. Delete token
5. Redirect to /login
```

#### Login
```
POST /api/auth/callback/credentials
Body: { email, password }

Flow:
1. Find user by email
2. Compare password hash
3. Generate JWT with { id, email, role, plan }
4. Set session cookie
5. Return session

Services: NextAuth CredentialsProvider
```

#### Password Reset - Request
```
POST /api/auth/forgot-password
Body: { email }

Flow:
1. Find user (silent fail if not found)
2. Delete existing reset tokens for email
3. Generate random token (32 bytes hex)
4. Create PasswordResetToken (expires 1h)
5. Send email with reset link

Services: SMTP (nodemailer)
```

#### Password Reset - Execute
```
POST /api/auth/reset-password
Body: { token, email, password }

Flow:
1. Find valid token (not expired)
2. Hash new password
3. Update User.password
4. Delete token
5. Return success
```

---

### 2. Business Management

#### List Businesses
```
GET /api/businesses

Flow:
1. Get session user
2. If role=support/admin: return all businesses
3. Else: return owned + member businesses
4. Include _count for requests, members

Response: Business[]
```

#### Create Business
```
POST /api/businesses
Body: { name, phone?, address?, yandexUrl?, gisUrl? }

Flow:
1. Check plan.businessLimit not exceeded
2. Generate slug from name
3. If slug exists, append timestamp
4. Create Business with smsLimit from plan
5. Return business

Validation:
- start: max 1 business
- business: max 5 businesses
- network: unlimited
```

#### Update Business
```
PUT /api/businesses/[id]
Body: { name?, phone?, address?, yandexUrl?, gisUrl? }

Flow:
1. Check user is owner or support
2. Update fields
3. Return updated business
```

#### Delete Business
```
DELETE /api/businesses/[id]

Flow:
1. Check user is owner (support cannot delete)
2. Cascade delete: members, requests, apiKeys, invites
3. Return success
```

---

### 3. Review Request Flow

#### Send SMS (Manual)
```
POST /api/requests
Body: { businessId, phone }

Flow:
1. Verify user owns/manages business
2. Check smsLimit not exceeded
3. Normalize phone (remove non-digits, 8→7)
4. Build message: "Спасибо за визит в {name}! Оцените нас: {url}"
5. Call SMS.ru API
6. Create ReviewRequest(status=sent)
7. Increment Business.smsUsed
8. Return request

Services: SMS.ru
Endpoint: https://sms.ru/sms/send?api_id=KEY&to=PHONE&msg=TEXT&json=1
```

#### Send SMS (Webhook)
```
POST /api/webhook?key=API_KEY
POST /api/webhook/[provider]?key=API_KEY
Body: varies by provider

Flow:
1. Validate API key
2. Extract phone from provider-specific payload
3. Check 24h dedup (same phone+business)
4. Check smsLimit
5. Send SMS
6. Create ReviewRequest(source=provider)
7. Update ApiKey.lastUsedAt

Providers:
- /api/webhook (generic): { phone } or { phones: [] }
- /api/webhook/bitrix24: { PHONE } or { data.PHONE }
- /api/webhook/amocrm: { contacts[0].phone }
- /api/webhook/yclients: { client.phone }
- /api/webhook/iiko: { order.phone } or { customer.phone }
- /api/webhook/poster: { client_phone }
```

#### Customer Review Page
```
GET /r/[slug]

Flow:
1. Find business by slug
2. Render rating UI (5 stars)
3. On star click: POST /api/review
```

#### Submit Rating
```
POST /api/review
Body: { businessId, rating, feedback? }

Flow:
1. Find most recent ReviewRequest (24h, unrated)
2. Update: rating, feedback, status, reviewedAt
3. Return success

Client-side routing:
- rating >= 4: Show Yandex/2GIS buttons
- rating < 4: Show feedback form
```

---

### 4. Team Management

#### List Team
```
GET /api/businesses/[id]/team

Flow:
1. Check user has access
2. Return { owner, members[], invites[], userRole }
```

#### Invite Member
```
POST /api/businesses/[id]/team
Body: { email, role? }

Flow:
1. Check user can invite (owner only)
2. Check plan.teamLimit not exceeded
3. Check not already owner/member
4. Generate invite token (32 bytes hex)
5. Create/update Invite (expires 7 days)
6. Send invite email

Response: { invite, renewed? }
```

#### Accept Invite
```
GET /invite/[token]

Flow:
1. Find valid invite
2. If user logged in: create BusinessMember
3. If not: redirect to signup, then accept
4. Delete invite
5. Redirect to business dashboard
```

#### Remove Member
```
DELETE /api/businesses/[id]/team?memberId=xxx
DELETE /api/businesses/[id]/team?inviteId=xxx

Flow:
1. Check user can remove (owner only)
2. Delete member or invite
```

---

### 5. API Keys & Integrations

#### List API Keys
```
GET /api/businesses/[id]/api-keys

Flow:
1. Check user is owner
2. Check plan allows integrations (business+)
3. Return keys (masked: first 8 chars + ***)
```

#### Create API Key
```
POST /api/businesses/[id]/api-keys
Body: { name }

Flow:
1. Check plan allows integrations
2. Generate key: "zk_" + 32 random bytes hex
3. Create ApiKey
4. Return full key (only time it's shown)
```

#### Delete API Key
```
DELETE /api/businesses/[id]/api-keys
Body: { keyId }

Flow:
1. Delete key
2. Webhooks using this key will fail with 401
```

---

### 6. Payments & Billing

#### Create Payment
```
POST /api/payments
Body: { type: "subscription"|"sms_pack", planId?, smsAmount? }

Flow:
1. Calculate amount from plan or SMS pack
2. Call YooKassa API to create payment
3. Save Payment(status=pending)
4. Return { paymentUrl }

YooKassa Request:
POST https://api.yookassa.ru/v3/payments
Auth: Basic base64(shopId:secretKey)
Body: {
  amount: { value, currency: "RUB" },
  confirmation: { type: "redirect", return_url },
  capture: true,
  description,
  metadata: { userId, type, planId, smsAmount }
}
```

#### Payment Webhook
```
POST /api/payments/webhook
Body: YooKassa notification

Flow:
1. Parse event (payment.succeeded | payment.canceled)
2. Find Payment by yookassaId
3. If succeeded:
   - Update Payment.status, paidAt
   - If subscription: update User.plan, Business.smsLimit
   - If sms_pack: increment Business.smsLimit
4. If canceled: update Payment.status
```

#### Payment History
```
GET /api/payments

Flow:
1. Return user's payments ordered by date
```

---

### 7. Analytics

#### Get Analytics
```
GET /api/analytics?businessId=xxx&period=30

Flow:
1. Check user has access
2. Query ReviewRequests in period
3. Calculate:
   - totalSent, opened, reviewed
   - openRate, reviewRate
   - avgRating, positiveCount, negativeCount
   - dailyData (grouped by date)
   - ratingDistribution [1-5]
   - sources breakdown

Response: {
  summary: { ... },
  dailyData: [{ date, sent, opened, reviewed }],
  ratingDistribution: [count1, count2, count3, count4, count5],
  sources: { manual: n, bitrix24: n, ... }
}
```

---

## External Services

### SMS.ru
```
Base URL: https://sms.ru

Send SMS:
GET /sms/send?api_id=KEY&to=PHONE&msg=TEXT&json=1

Response:
{
  "status": "OK",
  "status_code": 100,
  "sms": {
    "79991234567": {
      "status": "OK",
      "status_code": 100,
      "sms_id": "xxx"
    }
  }
}

Check Balance:
GET /my/balance?api_id=KEY&json=1

Error Codes:
200 - Invalid API key
201 - Insufficient funds
202 - Invalid recipient
```

### YooKassa
```
Base URL: https://api.yookassa.ru/v3
Auth: Basic base64(shopId:secretKey)

Create Payment:
POST /payments
Headers: Idempotence-Key: unique-id

Get Payment:
GET /payments/{id}

Webhook Events:
- payment.succeeded
- payment.canceled
- payment.waiting_for_capture
- refund.succeeded
```

### Email (Resend)
```
Base URL: https://api.resend.com

Send Email:
POST /emails
Headers: Authorization: Bearer RESEND_API_KEY

Templates:
- Verification email (24h expiry)
- Password reset (1h expiry)
- Team invite (7d expiry)
```

### Upstash Redis (Rate Limiting)
```
Console: https://console.upstash.com
SDK: @upstash/ratelimit, @upstash/redis

Rate Limits:
- General API: 60 req/min (sliding window)
- Auth endpoints: 10 req/min
- SMS/OTP: 3 req/min

Usage in src/lib/ratelimit.ts:
- ratelimit: general API
- authRatelimit: login/signup
- smsRatelimit: OTP sending
```

---

## Permission Matrix

| Action | Owner | Manager | Support | Admin |
|--------|-------|---------|---------|-------|
| View business | ✓ | ✓ | ✓ | ✓ |
| Send SMS | ✓ | ✓ | ✓ | ✓ |
| Edit business | ✓ | ✗ | ✓ | ✓ |
| Delete business | ✓ | ✗ | ✗ | ✓ |
| Manage team | ✓ | ✗ | ✗ | ✓ |
| Manage integrations | ✓ | ✗ | ✗ | ✓ |
| View all businesses | ✗ | ✗ | ✓ | ✓ |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://zatseni.ru
NEXTAUTH_SECRET=random-32-bytes

# SMS
SMSRU_API_KEY=xxx

# Payments
YOOKASSA_SHOP_ID=xxx
YOOKASSA_SECRET_KEY=xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
RESEND_FROM=noreply@zatseni.ru

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## Error Handling

All API routes return:
```json
// Success
{ "data": ... }
// or just the data directly

// Error
{ "error": "Human readable message in Russian" }
```

HTTP Status Codes:
- 200: Success
- 400: Bad request (validation error)
- 401: Not authenticated
- 403: Not authorized (plan limit, permission)
- 404: Not found
- 500: Server error
