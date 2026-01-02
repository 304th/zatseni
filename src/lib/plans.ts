export type PlanId = "free" | "start" | "business" | "network";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // rubles/month, 0 = free
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

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Бесплатный",
    price: 0,
    smsLimit: 10,
    aiRepliesLimit: 0,
    businessLimit: 1,
    teamLimit: 1,
    features: {
      integrations: false,
      analytics: "basic",
      priority_support: false,
      custom_branding: false,
    },
  },
  start: {
    id: "start",
    name: "Старт",
    price: 990,
    smsLimit: 100,
    aiRepliesLimit: 0,
    businessLimit: 1,
    teamLimit: 1,
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
    price: 3990,
    smsLimit: 500,
    aiRepliesLimit: 50,
    businessLimit: 5,
    teamLimit: 5,
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
    price: 9990,
    smsLimit: 2000,
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
