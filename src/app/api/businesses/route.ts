import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserBusinesses } from "@/lib/permissions";
import { canAddBusiness, getPlan, getSmsLimit } from "@/lib/plans";

// Get user's businesses (owned + member of, or all for support)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const businesses = await getUserBusinesses(session.user.id, session.user.role);

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

    const { name, phone, address, yandexUrl, gisUrl, images } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 }
      );
    }

    // Check business limit
    const currentBusinessCount = await prisma.business.count({
      where: { userId: session.user.id },
    });

    const userPlan = session.user.plan || "start";
    if (!canAddBusiness(userPlan, currentBusinessCount)) {
      const plan = getPlan(userPlan);
      return NextResponse.json(
        {
          error: `Лимит бизнесов (${plan.businessLimit}) достигнут. Перейдите на более высокий тариф.`,
          upgrade: true,
        },
        { status: 403 }
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
        images,
        userId: session.user.id,
        smsLimit: getSmsLimit(userPlan),
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
