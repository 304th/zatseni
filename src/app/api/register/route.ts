import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, businessName } = await req.json();

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: "Email, пароль и название бизнеса обязательны" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);

    // Check if slug exists
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });

    const finalSlug = existingBusiness
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    // Create user and business in transaction
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businesses: {
          create: {
            name: businessName,
            slug: finalSlug,
          },
        },
      },
      include: {
        businesses: true,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      business: user.businesses[0],
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ошибка регистрации" },
      { status: 500 }
    );
  }
}
