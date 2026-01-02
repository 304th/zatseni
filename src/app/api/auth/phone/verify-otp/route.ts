import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanPriceKopecks } from "@/lib/plans";
import { normalizePhone } from "@/lib/phone";

const VALID_PLANS = ["free", "start", "business", "network"];

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone, code, plan } = await req.json();

    if (!rawPhone || !code) {
      return NextResponse.json(
        { error: "Укажите номер и код" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    // Find valid OTP
    const otp = await prisma.phoneOTP.findFirst({
      where: {
        phone,
        code,
        expires: { gt: new Date() },
      },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Неверный или просроченный код" },
        { status: 400 }
      );
    }

    // Delete used OTP
    await prisma.phoneOTP.delete({
      where: { id: otp.id },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user with free plan
      const selectedPlan = VALID_PLANS.includes(plan) ? plan : "free";
      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: new Date(),
          plan: selectedPlan,
          planPrice: getPlanPriceKopecks(selectedPlan),
          planStartedAt: new Date(),
        },
      });
    }

    // Return user data for client-side signIn
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
      isNewUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
