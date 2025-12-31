import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers, isSupport } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  if (!isSupport(session.user.role)) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const users = await getAllUsers();
  return NextResponse.json(users);
}
