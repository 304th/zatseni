import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkBusinessAccess, permissions } from "@/lib/permissions";
import { canAddTeamMember, getPlan } from "@/lib/plans";
import crypto from "crypto";

// GET - List team members and pending invites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id);

  if (!access.hasAccess) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const [business, members, invites] = await Promise.all([
    prisma.business.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.businessMember.findMany({
      where: { businessId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invite.findMany({
      where: { businessId: id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    owner: business?.user,
    members,
    invites,
    userRole: access.role,
  });
}

// POST - Invite a new member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id);

  if (!access.hasAccess || !permissions.canInvite(access.role)) {
    return NextResponse.json(
      { error: "Нет прав для приглашения" },
      { status: 403 }
    );
  }

  const { email, role = "manager" } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  // Check team member limit
  const currentMemberCount = await prisma.businessMember.count({
    where: { businessId: id },
  });

  const userPlan = session.user.plan || "start";
  if (!canAddTeamMember(userPlan, currentMemberCount + 1)) { // +1 for owner
    const plan = getPlan(userPlan);
    const limitText = plan.teamLimit === -1 ? "без лимита" : plan.teamLimit;
    return NextResponse.json(
      {
        error: `Лимит участников команды (${limitText}) достигнут. Перейдите на более высокий тариф.`,
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Check if user is already owner
  const business = await prisma.business.findUnique({
    where: { id },
    include: { user: true },
  });

  if (business?.user.email === email) {
    return NextResponse.json(
      { error: "Этот пользователь уже владелец" },
      { status: 400 }
    );
  }

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.businessMember.findUnique({
      where: {
        businessId_userId: { businessId: id, userId: existingUser.id },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Пользователь уже в команде" },
        { status: 400 }
      );
    }
  }

  // Check for existing invite
  const existingInvite = await prisma.invite.findUnique({
    where: { businessId_email: { businessId: id, email } },
  });

  if (existingInvite) {
    // Update existing invite
    const token = crypto.randomBytes(32).toString("hex");
    const invite = await prisma.invite.update({
      where: { id: existingInvite.id },
      data: {
        token,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // TODO: Send email
    console.log(
      "Invite link:",
      `${process.env.NEXTAUTH_URL}/invite/${invite.token}`
    );

    return NextResponse.json({ invite, renewed: true });
  }

  // Create new invite
  const token = crypto.randomBytes(32).toString("hex");
  const invite = await prisma.invite.create({
    data: {
      businessId: id,
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // TODO: Send email with invite link
  console.log(
    "Invite link:",
    `${process.env.NEXTAUTH_URL}/invite/${invite.token}`
  );

  return NextResponse.json({ invite });
}

// DELETE - Remove a member or cancel invite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id);

  if (!access.hasAccess || !permissions.canRemoveMember(access.role)) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  const inviteId = searchParams.get("inviteId");

  if (memberId) {
    await prisma.businessMember.delete({
      where: { id: memberId, businessId: id },
    });
    return NextResponse.json({ success: true });
  }

  if (inviteId) {
    await prisma.invite.delete({
      where: { id: inviteId, businessId: id },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Укажите memberId или inviteId" },
    { status: 400 }
  );
}
