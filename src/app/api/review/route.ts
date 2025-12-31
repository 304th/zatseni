import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { businessId, rating, feedback } = await req.json();

    if (!businessId || !rating) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Find the most recent request for this business (within last 24h)
    const recentRequest = await prisma.reviewRequest.findFirst({
      where: {
        businessId,
        rating: null,
        sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { sentAt: "desc" },
    });

    if (recentRequest) {
      await prisma.reviewRequest.update({
        where: { id: recentRequest.id },
        data: {
          rating,
          feedback: feedback || null,
          status: feedback ? "feedback" : rating >= 4 ? "reviewed" : "feedback",
          reviewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
