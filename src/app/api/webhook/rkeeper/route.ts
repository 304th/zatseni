import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// R-Keeper Delivery webhook handler
// Configured via: Admin Panel → Communications → External API for Push Notifications
// Docs: https://docs.rkeeper.ru/delivery/vneshnee-api-dlya-push-uvedomlenij-156074728.html

// Order statuses that trigger review request
const COMPLETED_STATUSES = [
  // Russian
  "Выполнен",
  "Доставлен",
  "Завершен",
  "Закрыт",
  // English
  "Completed",
  "Delivered",
  "Finished",
  "Closed",
];

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
    // R-Keeper can send token in header or query param
    const apiKey = req.nextUrl.searchParams.get("key")
      || req.headers.get("X-Api-Key")
      || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // Log payload for debugging
    console.log("[rkeeper webhook]", JSON.stringify(body, null, 2));

    // Check order status - only send for completed orders
    const status = extractValue(body, "order.status")
      || extractValue(body, "status")
      || extractValue(body, "orderStatus")
      || extractValue(body, "data.status");

    if (status && typeof status === "string") {
      const isCompleted = COMPLETED_STATUSES.some(
        s => status.toLowerCase() === s.toLowerCase()
      );
      if (!isCompleted) {
        console.log(`[rkeeper] Skipping status: ${status}`);
        return NextResponse.json({ skipped: true, reason: "status_not_completed" });
      }
    }

    // Extract phone from various R-Keeper payload structures
    const phone = extractPhone(body, [
      // Order customer fields
      "order.customer.phone",
      "order.client.phone",
      "order.phone",
      "order.customerPhone",
      // Direct fields
      "customer.phone",
      "client.phone",
      "customerPhone",
      "clientPhone",
      // Data wrapper
      "data.customer.phone",
      "data.client.phone",
      "data.phone",
      // Fallback
      "phone",
    ]);

    if (!phone) {
      console.log("[rkeeper] Phone not found in payload");
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "rkeeper");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("R-Keeper webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
