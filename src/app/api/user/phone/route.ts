import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TRIAL_DAYS = 14;

// Link phone to existing user account and start trial
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Укажите номер и код" },
        { status: 400 }
      );
    }

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

    // Check if phone already used by another user
    const existingUserWithPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserWithPhone && existingUserWithPhone.id !== session.user.id) {
      return NextResponse.json(
        { error: "Этот номер уже привязан к другому аккаунту" },
        { status: 400 }
      );
    }

    // Check if phone already used for trial
    const existingTrialPhone = await prisma.trialPhone.findUnique({
      where: { phone },
    });

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Start trial only if phone not used before AND user doesn't already have trial
    const now = new Date();
    const canStartTrial = !existingTrialPhone && !user.trialStartedAt;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phone,
        phoneVerified: now,
        ...(canStartTrial && {
          trialStartedAt: now,
          trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        }),
      },
    });

    // Record phone as used for trial
    if (canStartTrial) {
      await prisma.trialPhone.create({
        data: {
          phone,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      trialStarted: canStartTrial,
      trialBlocked: !!existingTrialPhone,
    });
  } catch (error) {
    console.error("Link phone error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
