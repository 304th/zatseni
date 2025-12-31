import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkBusinessAccess } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const period = searchParams.get("period") || "30"; // days

    if (!businessId) {
      return NextResponse.json({ error: "businessId обязателен" }, { status: 400 });
    }

    const access = await checkBusinessAccess(session.user.id, businessId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get all requests in period
    const requests = await prisma.reviewRequest.findMany({
      where: {
        businessId,
        sentAt: { gte: startDate },
      },
      orderBy: { sentAt: "asc" },
    });

    // Calculate stats
    const totalSent = requests.length;
    const opened = requests.filter((r) => r.openedAt).length;
    const reviewed = requests.filter((r) => r.rating !== null).length;
    const feedbackCount = requests.filter((r) => r.feedback).length;

    const ratings = requests.filter((r) => r.rating !== null).map((r) => r.rating as number);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const positiveCount = ratings.filter((r) => r >= 4).length;
    const negativeCount = ratings.filter((r) => r < 4).length;

    // Group by day for chart
    const dailyData: Record<string, { sent: number; opened: number; reviewed: number }> = {};

    requests.forEach((r) => {
      const day = r.sentAt.toISOString().split("T")[0];
      if (!dailyData[day]) {
        dailyData[day] = { sent: 0, opened: 0, reviewed: 0 };
      }
      dailyData[day].sent++;
      if (r.openedAt) dailyData[day].opened++;
      if (r.rating !== null) dailyData[day].reviewed++;
    });

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0];
    ratings.forEach((r) => {
      ratingDistribution[r - 1]++;
    });

    // Source breakdown
    const sources: Record<string, number> = {};
    requests.forEach((r) => {
      const source = r.source || "manual";
      sources[source] = (sources[source] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        totalSent,
        opened,
        openRate: totalSent > 0 ? (opened / totalSent * 100).toFixed(1) : 0,
        reviewed,
        reviewRate: totalSent > 0 ? (reviewed / totalSent * 100).toFixed(1) : 0,
        avgRating: avgRating.toFixed(1),
        positiveCount,
        negativeCount,
        feedbackCount,
      },
      dailyData: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      })),
      ratingDistribution,
      sources,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
