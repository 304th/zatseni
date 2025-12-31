import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkBusinessAccess, permissions } from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id, session.user.role);

  if (!access.hasAccess) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, requests: true } },
    },
  });

  if (!business) {
    return NextResponse.json({ error: "Бизнес не найден" }, { status: 404 });
  }

  return NextResponse.json({
    ...business,
    userRole: access.isSupport ? "support" : access.role,
    isSupport: access.isSupport,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id, session.user.role);

  if (!access.hasAccess || !permissions.canEdit(access.role, access.isSupport)) {
    return NextResponse.json(
      { error: "Нет прав для редактирования" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const business = await prisma.business.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone || null,
      address: body.address || null,
      yandexUrl: body.yandexUrl || null,
      gisUrl: body.gisUrl || null,
    },
  });

  return NextResponse.json(business);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id, session.user.role);

  // Support users cannot delete - only owners can
  if (!access.hasAccess || !permissions.canDelete(access.role) || access.isSupport) {
    return NextResponse.json(
      { error: "Нет прав для удаления" },
      { status: 403 }
    );
  }

  await prisma.business.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
