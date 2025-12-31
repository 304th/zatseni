import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { name, email } = await request.json();

  // Check if email is already taken by another user
  if (email) {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email уже используется" },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || null,
      email: email || null,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}
