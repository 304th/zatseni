import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/webhook";

// AmoCRM webhook handler
// Triggers on: lead status change to "won" (status_id = 142)
// Docs: https://www.amocrm.ru/developers/content/crm_platform/webhooks

// System status IDs in AmoCRM pipelines
const WON_STATUS_ID = 142;  // Successfully closed
const LOST_STATUS_ID = 143; // Unsuccessfully closed

// We only send review requests for won deals
const TRIGGER_STATUSES = [WON_STATUS_ID];

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("key");
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    // AmoCRM can send JSON or URL-encoded data
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Parse URL-encoded form data
      const text = await req.text();
      body = parseAmoCrmPayload(text);
    }

    // Log payload for debugging
    console.log("[amocrm webhook]", JSON.stringify(body, null, 2));

    // Extract lead status change data
    const leads = body.leads as Record<string, unknown[]> | undefined;
    const statusLeads = leads?.status || leads?.update || [];

    if (!Array.isArray(statusLeads) || statusLeads.length === 0) {
      console.log("[amocrm] No leads in payload");
      return NextResponse.json({ skipped: true, reason: "no_leads" });
    }

    const lead = statusLeads[0] as Record<string, unknown>;
    const statusId = Number(lead.status_id);

    // Check if this is a won deal
    if (!TRIGGER_STATUSES.includes(statusId)) {
      console.log(`[amocrm] Skipping status_id: ${statusId}`);
      return NextResponse.json({ skipped: true, reason: "status_not_won" });
    }

    // Extract phone from lead or linked contact
    const phone = extractPhoneFromAmo(body, lead);

    if (!phone) {
      console.log("[amocrm] Phone not found in payload");
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

/**
 * Parse AmoCRM URL-encoded webhook payload
 * Format: leads[status][0][id]=123&leads[status][0][status_id]=142&...
 */
function parseAmoCrmPayload(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const params = new URLSearchParams(text);

  for (const [key, value] of params.entries()) {
    setNestedValue(result, key, value);
  }

  return result;
}

/**
 * Set nested value from bracket notation key
 * e.g., "leads[status][0][id]" -> { leads: { status: [{ id: value }] } }
 */
function setNestedValue(obj: Record<string, unknown>, key: string, value: string): void {
  const parts = key.replace(/\]/g, "").split("[");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const isNextArray = /^\d+$/.test(nextPart);

    if (!(part in current)) {
      current[part] = isNextArray ? [] : {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  // Try to parse as number if it looks like one
  current[lastPart] = /^\d+$/.test(value) ? Number(value) : value;
}

/**
 * Extract phone number from AmoCRM payload
 */
function extractPhoneFromAmo(
  body: Record<string, unknown>,
  lead: Record<string, unknown>
): string | null {
  // Try to get phone from lead's main contact
  const mainContact = lead.main_contact as Record<string, unknown> | undefined;
  if (mainContact?.phone) {
    return normalizePhone(String(mainContact.phone));
  }

  // Try to get from linked contacts in the same webhook
  const contacts = body.contacts as Record<string, unknown[]> | undefined;
  const contactList = contacts?.update || contacts?.add || [];

  for (const contact of contactList) {
    const c = contact as Record<string, unknown>;

    // Check custom_fields_values (API v4 format)
    const customFieldsValues = c.custom_fields_values as Array<{
      field_name?: string;
      field_code?: string;
      values?: Array<{ value?: string }>;
    }> | undefined;

    if (customFieldsValues) {
      for (const field of customFieldsValues) {
        if (
          field.field_name?.toLowerCase().includes("телефон") ||
          field.field_name?.toLowerCase().includes("phone") ||
          field.field_code === "PHONE"
        ) {
          const phone = field.values?.[0]?.value;
          if (phone) return normalizePhone(phone);
        }
      }
    }

    // Check custom_fields (legacy format)
    const customFields = c.custom_fields as Array<{
      name?: string;
      code?: string;
      values?: Array<{ value?: string }>;
    }> | undefined;

    if (customFields) {
      for (const field of customFields) {
        if (
          field.name?.toLowerCase().includes("телефон") ||
          field.name?.toLowerCase().includes("phone") ||
          field.code === "PHONE"
        ) {
          const phone = field.values?.[0]?.value;
          if (phone) return normalizePhone(phone);
        }
      }
    }

    // Direct phone field
    if (c.phone) {
      return normalizePhone(String(c.phone));
    }
  }

  // Fallback: try direct phone field in body
  if (body.phone) {
    return normalizePhone(String(body.phone));
  }

  return null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^8/, "7");
}
