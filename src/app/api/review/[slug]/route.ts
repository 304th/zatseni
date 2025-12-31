import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get business info for review page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        logo: true,
        yandexUrl: true,
        gisUrl: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Бизнес не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Get business error:", error);
    return NextResponse.json(
      { error: "Ошибка получения данных" },
      { status: 500 }
    );
  }
}

// Track review action (opened, rated, feedback)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { action, rating, feedback, requestId } = await req.json();

    const business = await prisma.business.findUnique({
      where: { slug },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Бизнес не найден" },
        { status: 404 }
      );
    }

    // If we have a requestId, update that specific request
    if (requestId) {
      if (action === "opened") {
        await prisma.reviewRequest.update({
          where: { id: requestId },
          data: {
            status: "opened",
            openedAt: new Date(),
          },
        });
      } else if (action === "rated" && rating) {
        await prisma.reviewRequest.update({
          where: { id: requestId },
          data: {
            status: rating >= 4 ? "reviewed" : "feedback",
            rating,
            reviewedAt: new Date(),
          },
        });
      } else if (action === "feedback" && feedback) {
        await prisma.reviewRequest.update({
          where: { id: requestId },
          data: {
            status: "feedback",
            feedback,
          },
        });
      }
    }

    // Return redirect URLs based on rating
    if (action === "rated" && rating >= 4) {
      return NextResponse.json({
        redirect: "external",
        yandexUrl: business.yandexUrl || "https://yandex.ru/maps",
        gisUrl: business.gisUrl || "https://2gis.ru",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track review error:", error);
    return NextResponse.json(
      { error: "Ошибка сохранения" },
      { status: 500 }
    );
  }
}
