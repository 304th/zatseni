import { prisma } from "./prisma";

export type Role = "owner" | "manager";

export interface UserAccess {
  hasAccess: boolean;
  role: Role | null;
  isOwner: boolean;
}

/**
 * Check if user has access to a business and return their role
 */
export async function checkBusinessAccess(
  userId: string,
  businessId: string
): Promise<UserAccess> {
  // Check if user is the owner
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      userId,
    },
  });

  if (business) {
    return { hasAccess: true, role: "owner", isOwner: true };
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
    };
  }

  return { hasAccess: false, role: null, isOwner: false };
}

/**
 * Get all businesses a user has access to (owned + member of)
 */
export async function getUserBusinesses(userId: string) {
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
    ...owned.map((b) => ({ ...b, userRole: "owner" as Role })),
    ...memberships.map((m) => ({
      ...m.business,
      userRole: m.role as Role,
    })),
  ];

  return businesses;
}

/**
 * Permission checks for specific actions
 */
export const permissions = {
  canEdit: (role: Role | null) => role === "owner",
  canDelete: (role: Role | null) => role === "owner",
  canInvite: (role: Role | null) => role === "owner",
  canRemoveMember: (role: Role | null) => role === "owner",
  canSendSms: (role: Role | null) => role === "owner" || role === "manager",
  canViewStats: (role: Role | null) => role === "owner" || role === "manager",
};
