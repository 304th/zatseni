import { NextRequest, NextResponse } from "next/server";
import { processWebhook, extractPhone } from "@/lib/webhook";

// AmoCRM webhook handler
// Triggers on: lead status change, deal won
// Docs: https://www.amocrm.ru/developers/content/crm_platform/webhooks

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const body = await req.json();

    // AmoCRM sends leads/contacts data
    // contacts[update][0][custom_fields][0][values][0][value] - phone in custom field
    // leads[status][0][main_contact][phone]
    const phone = extractPhone(body, [
      "contacts.update.0.custom_fields.0.values.0.value",
      "contacts.add.0.custom_fields.0.values.0.value",
      "leads.status.0.main_contact.phone",
      "leads.update.0.main_contact.phone",
      "phone",
    ]);

    if (!phone) {
      return NextResponse.json({ error: "Phone not found in payload" }, { status: 400 });
    }

    const result = await processWebhook(apiKey, phone, "amocrm");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AmoCRM webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
