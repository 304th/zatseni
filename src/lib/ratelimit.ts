import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General API rate limit: 60 req/min
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1m"),
  analytics: true,
});

// Stricter limit for auth endpoints: 10 req/min
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// SMS/OTP: 3 req/min
export const smsRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1m"),
  analytics: true,
  prefix: "ratelimit:sms",
});
