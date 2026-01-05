import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// YCLIENTS webhook handler
// Triggers on: visit status changed to "Клиент пришел" (client arrived)
// Docs: https://yclients.docs.apiary.io/

// Visit attendance statuses
// 0 = Ожидание клиента (waiting)
// 1 = Клиент пришел (arrived) ✓
// 2 = Клиент не пришел (no-show)
// -1 = Клиент подтвердил (confirmed, still waiting)
const COMPLETED_ATTENDANCE = [1, "1", 2, "2"]; // arrived or explicitly marked

function extractValue(data: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let value: unknown = data;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // Log payload for debugging
    console.log("[yclients webhook]", JSON.stringify(body, null, 2));

    // Check visit attendance status
    const attendance = extractValue(body, "resource.visit_attendance")
      ?? extractValue(body, "data.visit_attendance")
      ?? extractValue(body, "record.visit_attendance")
      ?? extractValue(body, "visit_attendance")
      ?? extractValue(body, "attendance");

    // If attendance is provided, check if it's a completed visit
    if (attendance !== null && attendance !== undefined) {
      const isCompleted = COMPLETED_ATTENDANCE.includes(attendance as number | string);
      if (!isCompleted) {
        console.log(`[yclients] Skipping attendance: ${attendance}`);
        return NextResponse.json({ skipped: true, reason: "visit_not_completed" });
      }
    }

    // Check for deleted flag
    const deleted = extractValue(body, "resource.deleted")
      ?? extractValue(body, "data.deleted")
      ?? extractValue(body, "deleted");

    if (deleted === true || deleted === 1 || deleted === "1") {
      console.log("[yclients] Skipping deleted record");
      return NextResponse.json({ skipped: true, reason: "record_deleted" });
    }

    // Extract phone from various YCLIENTS payload structures
    const phone = extractPhone(body, [
      // Resource wrapper (common in webhooks)
      "resource.client.phone",
      "resource.phone",
      // Data wrapper
      "data.client.phone",
      "data.phone",
      // Record wrapper
      "record.client.phone",
      "record.phone",
      // Direct fields
      "client.phone",
      "phone",
    ]);

    if (!phone) {
      console.log("[yclients] Phone not found in payload");
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "yclients");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("YCLIENTS webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
