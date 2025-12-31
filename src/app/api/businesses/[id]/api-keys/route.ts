import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkBusinessAccess } from "@/lib/permissions";
import { canUseIntegrations } from "@/lib/plans";
import crypto from "crypto";

// GET - list API keys for business
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

  const apiKeys = await prisma.apiKey.findMany({
    where: { businessId: id },
    select: {
      id: true,
      name: true,
      key: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Mask keys (show only last 8 chars)
  const maskedKeys = apiKeys.map(k => ({
    ...k,
    key: "zts_..." + k.key.slice(-8),
    fullKey: undefined, // Don't expose full key in list
  }));

  return NextResponse.json(maskedKeys);
}

// POST - create new API key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const access = await checkBusinessAccess(session.user.id, id, session.user.role);

  if (!access.hasAccess || !access.isOwner) {
    return NextResponse.json({ error: "Только владелец может создавать API ключи" }, { status: 403 });
  }

  // Check plan allows integrations
  if (!canUseIntegrations(session.user.plan)) {
    return NextResponse.json(
      { error: "Интеграции доступны на тарифах Бизнес и Сеть", upgrade: true },
      { status: 403 }
    );
  }

  const body = await request.json();
  const name = body.name || "API Key";

  // Generate unique key
  const key = "zts_" + crypto.randomBytes(24).toString("hex");

  const apiKey = await prisma.apiKey.create({
    data: {
      businessId: id,
      name,
      key,
    },
  });

  // Return full key only on creation
  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key, // Full key shown only once
    createdAt: apiKey.createdAt,
  });
}

// DELETE - revoke API key
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

  if (!access.hasAccess || !access.isOwner) {
    return NextResponse.json({ error: "Только владелец может удалять API ключи" }, { status: 403 });
  }

  const body = await request.json();
  const keyId = body.keyId;

  if (!keyId) {
    return NextResponse.json({ error: "keyId required" }, { status: 400 });
  }

  await prisma.apiKey.deleteMany({
    where: {
      id: keyId,
      businessId: id,
    },
  });

  return NextResponse.json({ success: true });
}
