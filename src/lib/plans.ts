export type PlanId = "free" | "start" | "business" | "network";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // rubles/month, 0 = free/trial
  smsLimit: number;
  aiRepliesLimit: number; // AI auto-replies to negative reviews
  businessLimit: number;
  teamLimit: number; // -1 = unlimited
  features: {
    integrations: boolean;
    analytics: "basic" | "full";
    priority_support: boolean;
    custom_branding: boolean;
  };
}

// Trial configuration
export const TRIAL_DAYS = 14;
export const TRIAL_SMS_LIMIT = 20;

export const PLANS: Record<PlanId, Plan> = {
  // "free" is now trial - 14 days with 20 SMS, then must upgrade
  free: {
    id: "free",
    name: "Пробный период",
    price: 0,
    smsLimit: TRIAL_SMS_LIMIT, // 20 SMS during trial
    aiRepliesLimit: 0,
    businessLimit: 1,
    teamLimit: 1,
    features: {
      integrations: true, // full features during trial
      analytics: "full",
      priority_support: false,
      custom_branding: false,
    },
  },
  start: {
    id: "start",
    name: "Старт",
    price: 1190,
    smsLimit: 100,
    aiRepliesLimit: 0,
    businessLimit: 1,
    teamLimit: 3,
    features: {
      integrations: false,
      analytics: "full",
      priority_support: false,
      custom_branding: false,
    },
  },
  business: {
    id: "business",
    name: "Бизнес",
    price: 4990,
    smsLimit: 400,
    aiRepliesLimit: 50,
    businessLimit: 5,
    teamLimit: 20,
    features: {
      integrations: true,
      analytics: "full",
      priority_support: true,
      custom_branding: true,
    },
  },
  network: {
    id: "network",
    name: "Сеть",
    price: 16990,
    smsLimit: 1000,
    aiRepliesLimit: 100,
    businessLimit: -1, // unlimited
    teamLimit: -1, // unlimited
    features: {
      integrations: true,
      analytics: "full",
      priority_support: true,
      custom_branding: true,
    },
  },
};

export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] || PLANS.free;
}

export function canUseIntegrations(planId: string): boolean {
  return getPlan(planId).features.integrations;
}

export function canAddBusiness(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  if (plan.businessLimit === -1) return true;
  return currentCount < plan.businessLimit;
}

export function canAddTeamMember(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  if (plan.teamLimit === -1) return true;
  return currentCount < plan.teamLimit;
}

export function getSmsLimit(planId: string): number {
  return getPlan(planId).smsLimit;
}

export function getAiRepliesLimit(planId: string): number {
  return getPlan(planId).aiRepliesLimit;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Бесплатно";
  return `${price.toLocaleString("ru-RU")} ₽/мес`;
}

// Get user's effective price (grandfathered or current)
// planPrice is stored in kopecks, returns rubles
export function getUserPlanPrice(planId: string, planPriceKopecks?: number | null): number {
  if (planPriceKopecks != null) {
    return planPriceKopecks / 100; // convert kopecks to rubles
  }
  return getPlan(planId).price;
}

// Get price in kopecks for storage
export function getPlanPriceKopecks(planId: string): number {
  return getPlan(planId).price * 100;
}

// Trial helpers
export function getTrialEndDate(createdAt: Date): Date {
  const endDate = new Date(createdAt);
  endDate.setDate(endDate.getDate() + TRIAL_DAYS);
  return endDate;
}

export function isTrialActive(planId: string, createdAt: Date): boolean {
  if (planId !== "free") return false;
  return new Date() < getTrialEndDate(createdAt);
}

export function isTrialExpired(planId: string, createdAt: Date): boolean {
  if (planId !== "free") return false;
  return new Date() >= getTrialEndDate(createdAt);
}

export function getTrialDaysLeft(createdAt: Date): number {
  const endDate = getTrialEndDate(createdAt);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatTrialStatus(createdAt: Date): string {
  const daysLeft = getTrialDaysLeft(createdAt);
  if (daysLeft === 0) return "Пробный период истёк";
  if (daysLeft === 1) return "Остался 1 день";
  if (daysLeft <= 4) return `Осталось ${daysLeft} дня`;
  return `Осталось ${daysLeft} дней`;
}
