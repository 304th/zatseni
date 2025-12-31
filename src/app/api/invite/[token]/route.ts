import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get invite details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      business: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Приглашение не найдено" },
      { status: 404 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Приглашение истекло" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    business: invite.business,
  });
}

// POST - Accept invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { business: true },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Приглашение не найдено" },
      { status: 404 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Приглашение истекло" },
      { status: 400 }
    );
  }

  // Check if email matches
  if (invite.email !== session.user.email) {
    return NextResponse.json(
      { error: "Приглашение для другого email" },
      { status: 403 }
    );
  }

  // Check if already a member
  const existingMember = await prisma.businessMember.findUnique({
    where: {
      businessId_userId: {
        businessId: invite.businessId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    // Delete invite and return success
    await prisma.invite.delete({ where: { id: invite.id } });
    return NextResponse.json({
      success: true,
      businessId: invite.businessId,
      alreadyMember: true,
    });
  }

  // Create membership and delete invite
  await prisma.$transaction([
    prisma.businessMember.create({
      data: {
        businessId: invite.businessId,
        userId: session.user.id,
        role: invite.role,
      },
    }),
    prisma.invite.delete({ where: { id: invite.id } }),
  ]);

  return NextResponse.json({
    success: true,
    businessId: invite.businessId,
  });
}
