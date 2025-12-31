import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// Poster POS webhook handler
// Triggers on: transaction closed, receipt printed
// Docs: https://dev.joinposter.com/

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // Poster sends transaction/client data
    // client.phone, transaction.client.phone
    const phone = extractPhone(body, [
      "client.phone",
      "client_phone",
      "transaction.client.phone",
      "data.client.phone",
      "phone",
    ]);

    if (!phone) {
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "poster");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Poster webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
