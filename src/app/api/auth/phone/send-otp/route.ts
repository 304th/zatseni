import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { smsRatelimit } from "@/lib/ratelimit";

// Normalize Russian phone number
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) {
    return "7" + digits.slice(1);
  }
  if (digits.startsWith("7") && digits.length === 11) {
    return digits;
  }
  if (digits.length === 10) {
    return "7" + digits;
  }
  return digits;
}

// Validate phone format
function isValidRussianPhone(phone: string): boolean {
  return /^7\d{10}$/.test(phone);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "anonymous";
    const { success } = await smsRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Слишком много запросов" },
        { status: 429 }
      );
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Укажите номер телефона" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (!isValidRussianPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: "Неверный формат номера телефона" },
        { status: 400 }
      );
    }

    // Rate limiting: check if OTP was sent recently (1 min cooldown)
    const recentOtp = await prisma.phoneOTP.findFirst({
      where: {
        phone: normalizedPhone,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "Подождите минуту перед повторной отправкой" },
        { status: 429 }
      );
    }

    // Delete expired OTPs for this phone
    await prisma.phoneOTP.deleteMany({
      where: {
        phone: normalizedPhone,
        expires: { lt: new Date() },
      },
    });

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP (5 min expiry)
    await prisma.phoneOTP.create({
      data: {
        phone: normalizedPhone,
        code,
        expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send SMS
    const smsResult = await sendSms(
      normalizedPhone,
      `Зацени: ваш код ${code}`
    );

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || "Ошибка отправки SMS" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
