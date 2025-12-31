import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Токен и email обязательны" },
        { status: 400 }
      );
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Недействительная ссылка" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });
      return NextResponse.json(
        { error: "Ссылка истекла. Запросите новую" },
        { status: 400 }
      );
    }

    // Update user and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Ошибка подтверждения" },
      { status: 500 }
    );
  }
}
