import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_PLANS = ["start", "business", "business_plus", "network"];
const TRIAL_DAYS = 14;

export async function POST(req: NextRequest) {
  try {
    const { phone, code, plan } = await req.json();

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

    // Check if phone already used for trial
    const existingTrialPhone = await prisma.trialPhone.findUnique({
      where: { phone },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user
      const selectedPlan = VALID_PLANS.includes(plan) ? plan : "start";

      // Start trial only if phone not used before
      const now = new Date();
      const trialEndsAt = existingTrialPhone
        ? null
        : new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      user = await prisma.user.create({
        data: {
          phone,
          phoneVerified: now,
          plan: selectedPlan,
          trialStartedAt: existingTrialPhone ? null : now,
          trialEndsAt,
        },
      });

      // Record phone as used for trial (if not already)
      if (!existingTrialPhone) {
        await prisma.trialPhone.create({
          data: {
            phone,
            userId: user.id,
          },
        });
      }
    } else if (!user.phoneVerified) {
      // Existing user verifying phone for first time
      const now = new Date();
      const canStartTrial = !existingTrialPhone && !user.trialStartedAt;

      await prisma.user.update({
        where: { id: user.id },
        data: {
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

      // Refresh user data
      user = await prisma.user.findUnique({ where: { id: user.id } });
    }

    // Return user data for client-side signIn
    return NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        phone: user!.phone,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        plan: user!.plan,
        trialEndsAt: user!.trialEndsAt,
      },
      isNewUser,
      trialBlocked: !!existingTrialPhone && isNewUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
