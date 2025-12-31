import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generic webhook endpoint for CRM/POS integrations
// POST /api/webhook?key=API_KEY
// Body: { phone: "+79991234567" } or { phones: ["+79991234567", "+79991234568"] }

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // Find API key and get business
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { business: true },
    });

    if (!keyRecord) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const business = keyRecord.business;

    // Parse body
    const body = await req.json();
    const phones: string[] = body.phones || (body.phone ? [body.phone] : []);
    const source = body.source || "api";

    if (phones.length === 0) {
      return NextResponse.json({ error: "phone or phones required" }, { status: 400 });
    }

    // Check SMS limit
    if (business.smsUsed + phones.length > business.smsLimit) {
      return NextResponse.json({
        error: "SMS limit exceeded",
        remaining: business.smsLimit - business.smsUsed,
      }, { status: 429 });
    }

    // Create review requests
    const results = [];
    for (const phone of phones) {
      // Normalize phone
      const normalizedPhone = phone.replace(/\D/g, "").replace(/^8/, "7");

      if (normalizedPhone.length < 10) {
        results.push({ phone, status: "error", error: "Invalid phone" });
        continue;
      }

      // Check if already sent recently (within 24h)
      const recent = await prisma.reviewRequest.findFirst({
        where: {
          businessId: business.id,
          phone: normalizedPhone,
          sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (recent) {
        results.push({ phone, status: "skipped", reason: "Already sent within 24h" });
        continue;
      }

      // Create request
      await prisma.reviewRequest.create({
        data: {
          businessId: business.id,
          phone: normalizedPhone,
          source,
        },
      });

      // TODO: Actually send SMS via SMS.ru
      // For now just increment counter
      await prisma.business.update({
        where: { id: business.id },
        data: { smsUsed: { increment: 1 } },
      });

      results.push({ phone, status: "sent" });
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      results,
      smsRemaining: business.smsLimit - business.smsUsed - results.filter(r => r.status === "sent").length,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", version: "1.0" });
}
