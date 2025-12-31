import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { token, email, password } = await request.json();

  if (!token || !email || !password) {
    return NextResponse.json(
      { error: "Все поля обязательны" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть минимум 6 символов" },
      { status: 400 }
    );
  }

  // Find the reset token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return NextResponse.json(
      { error: "Недействительная или устаревшая ссылка" },
      { status: 400 }
    );
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 400 }
    );
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: verificationToken.token,
      },
    },
  });

  return NextResponse.json({ success: true });
}
