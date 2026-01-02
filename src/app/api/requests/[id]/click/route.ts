import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scheduleScrapeJob } from "@/lib/qstash";

// Track when user clicks external review link (Yandex/2GIS)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { platform } = await req.json();

    if (!["yandex", "gis"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const field = platform === "yandex" ? "clickedYandexAt" : "clickedGisAt";

    // Check if already clicked (only schedule once)
    const request = await prisma.reviewRequest.findUnique({
      where: { id },
      select: { businessId: true, clickedYandexAt: true, clickedGisAt: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const alreadyClicked = platform === "yandex"
      ? request.clickedYandexAt
      : request.clickedGisAt;

    if (!alreadyClicked) {
      // Update click timestamp
      await prisma.reviewRequest.update({
        where: { id },
        data: { [field]: new Date() },
      });

      // Schedule scrape job for 2 hours later
      await scheduleScrapeJob(id, request.businessId, platform);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
