import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/yookassa";
import { PLANS } from "@/lib/plans";

// Create a payment for plan upgrade or SMS pack
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { type, planId, smsAmount } = await req.json();

    let amount = 0;
    let description = "";

    if (type === "subscription" && planId) {
      const plan = PLANS[planId as keyof typeof PLANS];
      if (!plan) {
        return NextResponse.json({ error: "Неверный тариф" }, { status: 400 });
      }
      amount = plan.price;
      description = `Тариф "${plan.name}" на 1 месяц`;
    } else if (type === "sms_pack" && smsAmount) {
      const packs: Record<number, number> = {
        100: 350,
        300: 900,
        500: 1250,
        1000: 2000,
      };
      amount = packs[smsAmount];
      if (!amount) {
        return NextResponse.json({ error: "Неверный пакет SMS" }, { status: 400 });
      }
      description = `Пакет ${smsAmount} SMS`;
    } else {
      return NextResponse.json({ error: "Неверный тип платежа" }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const payment = await createPayment({
      amount,
      description,
      returnUrl: `${baseUrl}/dashboard/billing?status=success`,
      metadata: {
        userId: session.user.id,
        type,
        planId: planId || "",
        smsAmount: smsAmount?.toString() || "",
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Ошибка создания платежа" }, { status: 500 });
    }

    // Save pending payment
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amount * 100, // kopecks
        type,
        planId,
        smsAmount,
        yookassaId: payment.id,
        description,
      },
    });

    return NextResponse.json({
      paymentUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// Get user's payment history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
