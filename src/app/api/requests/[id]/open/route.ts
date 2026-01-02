import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mark request as opened
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Update only if not already opened
    await prisma.reviewRequest.updateMany({
      where: {
        id,
        openedAt: null,
      },
      data: {
        status: "opened",
        openedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track open error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
