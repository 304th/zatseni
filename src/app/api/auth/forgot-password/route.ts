import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  // Store token in VerificationToken table
  await prisma.verificationToken.upsert({
    where: {
      identifier_token: {
        identifier: email,
        token: "password-reset",
      },
    },
    update: {
      token,
      expires,
    },
    create: {
      identifier: email,
      token,
      expires,
    },
  });

  // In production, send email here
  // For now, log the reset link
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log("Password reset link:", resetUrl);

  // TODO: Send email with resetUrl
  // await sendEmail({
  //   to: email,
  //   subject: "Сброс пароля - Зацени",
  //   html: `<p>Для сброса пароля перейдите по ссылке:</p><a href="${resetUrl}">${resetUrl}</a>`,
  // });

  return NextResponse.json({ success: true });
}
