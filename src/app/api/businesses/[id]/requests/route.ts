import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  // Check ownership
  const business = await prisma.business.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!business) {
    return NextResponse.json({ error: "Бизнес не найден" }, { status: 404 });
  }

  const requests = await prisma.reviewRequest.findMany({
    where: { businessId: id },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json(requests);
}
