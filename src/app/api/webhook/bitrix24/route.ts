import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// Bitrix24 webhook handler
// Triggers on: deal won, invoice paid, etc.
// Docs: https://dev.1c-bitrix.ru/rest_help/

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // Bitrix24 sends data in various formats depending on event
    // Common: data[FIELDS][PHONE], data[FIELDS][PHONE][0][VALUE]
    const phone = extractPhone(body, [
      "data.FIELDS.PHONE",
      "data.FIELDS.PHONE.0.VALUE",
      "document.PHONE",
      "document.PHONE.0.VALUE",
      "fields.PHONE",
      "fields.PHONE.0.VALUE",
    ]);

    if (!phone) {
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "bitrix24");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bitrix24 webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
