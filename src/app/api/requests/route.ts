import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

// Get business requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId обязателен" },
        { status: 400 }
      );
    }

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Бизнес не найден" }, { status: 404 });
    }

    const requests = await prisma.reviewRequest.findMany({
      where: { businessId },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}

// Create new review request (send SMS)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Check phone verification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneVerified: true },
    });

    if (!user?.phoneVerified) {
      return NextResponse.json(
        { error: "Подтвердите номер телефона для отправки SMS", code: "PHONE_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    const { businessId, phone } = await req.json();

    if (!businessId || !phone) {
      return NextResponse.json(
        { error: "businessId и phone обязательны" },
        { status: 400 }
      );
    }

    // Verify ownership and check limits
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Бизнес не найден" }, { status: 404 });
    }

    if (business.smsUsed >= business.smsLimit) {
      return NextResponse.json(
        { error: "Лимит SMS исчерпан. Обновите тариф." },
        { status: 400 }
      );
    }

    // Format phone
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("7")
      ? cleanPhone
      : `7${cleanPhone.slice(1)}`;

    // Create message
    const reviewUrl = `${process.env.NEXTAUTH_URL}/r/${business.slug}`;
    const message = `Спасибо за визит в ${business.name}! Оцените нас: ${reviewUrl}`;

    // Send SMS
    const smsResult = await sendSms(formattedPhone, message);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || "Ошибка отправки SMS" },
        { status: 500 }
      );
    }

    // Create request record
    const request = await prisma.reviewRequest.create({
      data: {
        businessId,
        phone: formattedPhone,
        status: "sent",
      },
    });

    // Update SMS counter
    await prisma.business.update({
      where: { id: businessId },
      data: { smsUsed: { increment: 1 } },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Ошибка отправки запроса" },
      { status: 500 }
    );
  }
}
