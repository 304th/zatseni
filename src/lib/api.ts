// API functions for use with react-query

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  yandexUrl: string | null;
  gisUrl: string | null;
  plan: string;
  smsLimit: number;
  smsUsed: number;
  userRole: "owner" | "manager";
  _count?: { members: number; requests: number };
}

export interface ReviewRequest {
  id: string;
  phone: string;
  status: string;
  rating: number | null;
  feedback: string | null;
  sentAt: string;
  openedAt: string | null;
  reviewedAt: string | null;
}

export interface AnalyticsData {
  summary: {
    totalSent: number;
    opened: number;
    openRate: string;
    reviewed: number;
    reviewRate: string;
    avgRating: string;
    positiveCount: number;
    negativeCount: number;
    feedbackCount: number;
  };
  dailyData: Array<{ date: string; sent: number; opened: number; reviewed: number }>;
  ratingDistribution: number[];
  sources: Record<string, number>;
}

export interface TeamData {
  owner: { id: string; name: string | null; email: string | null };
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string | null };
    createdAt: string;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: string;
    expiresAt: string;
    createdAt: string;
  }>;
  userRole: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
}

// Fetch helpers
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function mutate<T>(url: string, method: string, body?: unknown): Promise<T> {
  return fetchJson(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Businesses
export const api = {
  // Businesses
  getBusinesses: () => fetchJson<Business[]>("/api/businesses"),
  getBusiness: (id: string) => fetchJson<Business>(`/api/businesses/${id}`),
  createBusiness: (data: Partial<Business>) => mutate<Business>("/api/businesses", "POST", data),
  updateBusiness: (id: string, data: Partial<Business>) => mutate<Business>(`/api/businesses/${id}`, "PUT", data),
  deleteBusiness: (id: string) => mutate<void>(`/api/businesses/${id}`, "DELETE"),

  // Requests
  getRequests: (businessId: string) => fetchJson<ReviewRequest[]>(`/api/businesses/${businessId}/requests`),
  sendSms: (businessId: string, phone: string) => mutate<void>("/api/requests", "POST", { businessId, phone }),

  // Analytics
  getAnalytics: (businessId: string, period: string) =>
    fetchJson<AnalyticsData>(`/api/analytics?businessId=${businessId}&period=${period}`),

  // Team
  getTeam: (businessId: string) => fetchJson<TeamData>(`/api/businesses/${businessId}/team`),
  inviteTeamMember: (businessId: string, email: string, role: string) =>
    mutate<void>(`/api/businesses/${businessId}/team`, "POST", { email, role }),
  removeTeamMember: (businessId: string, memberId: string) =>
    mutate<void>(`/api/businesses/${businessId}/team?memberId=${memberId}`, "DELETE"),
  cancelInvite: (businessId: string, inviteId: string) =>
    mutate<void>(`/api/businesses/${businessId}/team?inviteId=${inviteId}`, "DELETE"),

  // API Keys
  getApiKeys: (businessId: string) => fetchJson<ApiKey[]>(`/api/businesses/${businessId}/api-keys`),
  createApiKey: (businessId: string, name: string) =>
    mutate<{ key: string }>(`/api/businesses/${businessId}/api-keys`, "POST", { name }),
  deleteApiKey: (businessId: string, keyId: string) =>
    mutate<void>(`/api/businesses/${businessId}/api-keys`, "DELETE", { keyId }),

  // Payments
  getPayments: () => fetchJson<Payment[]>("/api/payments"),
  createPayment: (type: string, planId?: string, smsAmount?: number) =>
    mutate<{ paymentUrl: string }>("/api/payments", "POST", { type, planId, smsAmount }),

  // User
  updateProfile: (name: string, email: string) =>
    mutate<void>("/api/user/profile", "PUT", { name, email }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    mutate<void>("/api/user/password", "PUT", { currentPassword, newPassword }),

  // Yandex parsing
  parseYandex: (url: string) =>
    mutate<{ name?: string; address?: string; phone?: string; images?: string[]; yandexUrl?: string }>(
      "/api/parse-yandex",
      "POST",
      { url }
    ),

  // Support (admin)
  getSupportUsers: () =>
    fetchJson<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      emailVerified: string | null;
      createdAt: string;
      _count: { businesses: number };
    }>>("/api/support/users"),
};
