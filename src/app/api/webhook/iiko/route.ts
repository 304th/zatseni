import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// iiko webhook handler
// Triggers on: order closed, delivery completed
// Docs: https://api-ru.iiko.services/

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // iiko sends order/delivery data
    // order.customer.phone, eventInfo.order.phone
    const phone = extractPhone(body, [
      "order.customer.phone",
      "order.phone",
      "eventInfo.order.phone",
      "eventInfo.order.customer.phone",
      "customer.phone",
      "deliveryOrder.customer.phone",
      "phone",
    ]);

    if (!phone) {
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "iiko");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("iiko webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
