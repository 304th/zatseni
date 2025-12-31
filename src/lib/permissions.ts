import { prisma } from "./prisma";

export type Role = "owner" | "manager";
export type SystemRole = "user" | "support" | "admin";

export interface UserAccess {
  hasAccess: boolean;
  role: Role | null;
  isOwner: boolean;
}

/**
 * Check if user has support or admin system role
 */
export function isSupport(systemRole: string | undefined): boolean {
  return systemRole === "support" || systemRole === "admin";
}

export function isAdmin(systemRole: string | undefined): boolean {
  return systemRole === "admin";
}

/**
 * Check if user has access to a business and return their role
 * Support/admin users have access to all businesses
 */
export async function checkBusinessAccess(
  userId: string,
  businessId: string,
  systemRole?: string
): Promise<UserAccess & { isSupport: boolean }> {
  // Support/admin can access any business
  if (isSupport(systemRole)) {
    return { hasAccess: true, role: "manager", isOwner: false, isSupport: true };
  }

  // Check if user is the owner
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      userId,
    },
  });

  if (business) {
    return { hasAccess: true, role: "owner", isOwner: true, isSupport: false };
  }

  // Check if user is a member
  const member = await prisma.businessMember.findUnique({
    where: {
      businessId_userId: {
        businessId,
        userId,
      },
    },
  });

  if (member) {
    return {
      hasAccess: true,
      role: member.role as Role,
      isOwner: member.role === "owner",
      isSupport: false,
    };
  }

  return { hasAccess: false, role: null, isOwner: false, isSupport: false };
}

/**
 * Get all businesses a user has access to (owned + member of)
 * Support users get all businesses
 */
export async function getUserBusinesses(userId: string, systemRole?: string) {
  // Support/admin can see all businesses
  if (isSupport(systemRole)) {
    const allBusinesses = await prisma.business.findMany({
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { requests: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return allBusinesses.map((b: typeof allBusinesses[number]) => ({
      ...b,
      userRole: "support" as const,
    }));
  }

  const [owned, memberships] = await Promise.all([
    prisma.business.findMany({
      where: { userId },
      include: {
        _count: { select: { requests: true, members: true } },
      },
    }),
    prisma.businessMember.findMany({
      where: { userId },
      include: {
        business: {
          include: {
            _count: { select: { requests: true, members: true } },
          },
        },
      },
    }),
  ]);

  // Combine and mark roles
  const businesses = [
    ...owned.map((b: typeof owned[number]) => ({ ...b, userRole: "owner" as Role })),
    ...memberships.map((m: typeof memberships[number]) => ({
      ...m.business,
      userRole: m.role as Role,
    })),
  ];

  return businesses;
}

/**
 * Get all users (for support/admin)
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { businesses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Permission checks for specific actions
 * Support users have view + write but not delete/ownership actions
 */
export const permissions = {
  canEdit: (role: Role | null, supportAccess = false) =>
    role === "owner" || supportAccess,
  canDelete: (role: Role | null) => role === "owner",
  canInvite: (role: Role | null) => role === "owner",
  canRemoveMember: (role: Role | null) => role === "owner",
  canSendSms: (role: Role | null, supportAccess = false) =>
    role === "owner" || role === "manager" || supportAccess,
  canViewStats: (role: Role | null, supportAccess = false) =>
    role === "owner" || role === "manager" || supportAccess,
};
