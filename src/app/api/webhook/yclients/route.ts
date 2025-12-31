import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// YCLIENTS webhook handler
// Triggers on: record completed, visit finished
// Docs: https://developers.yclients.com/ru/

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // YCLIENTS sends client data on record events
    // resource.client.phone, data.client.phone
    const phone = extractPhone(body, [
      "resource.client.phone",
      "data.client.phone",
      "client.phone",
      "record.client.phone",
      "phone",
    ]);

    if (!phone) {
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
