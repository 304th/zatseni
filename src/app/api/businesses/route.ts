import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get user's businesses (owned + member of)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Get owned businesses
    const owned = await prisma.business.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { requests: true, members: true },
        },
      },
    });

    // Get businesses user is a member of
    const memberships = await prisma.businessMember.findMany({
      where: { userId: session.user.id },
      include: {
        business: {
          include: {
            _count: {
              select: { requests: true, members: true },
            },
          },
        },
      },
    });

    // Combine and add role info
    const businesses = [
      ...owned.map((b) => ({ ...b, userRole: "owner" })),
      ...memberships.map((m) => ({ ...m.business, userRole: m.role })),
    ];

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}

// Create new business
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { name, phone, address, yandexUrl, gisUrl } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);

    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });

    const finalSlug = existingBusiness
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    const business = await prisma.business.create({
      data: {
        name,
        slug: finalSlug,
        phone,
        address,
        yandexUrl,
        gisUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: "Ошибка создания бизнеса" },
      { status: 500 }
    );
  }
}
