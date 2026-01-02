import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

// Link phone to existing user account
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { phone: rawPhone, code } = await req.json();

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

    // Link phone to user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        phoneVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Link phone error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
