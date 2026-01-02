import { prisma } from "./prisma";
import { sendSms } from "./sms";

export interface WebhookResult {
  success: boolean;
  phone?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Process a webhook request - validate API key and send SMS
 */
export async function processWebhook(
  apiKey: string,
  phone: string,
  source: string
): Promise<WebhookResult> {
  // Find API key
  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { business: true },
  });

  if (!keyRecord) {
    return { success: false, error: "Invalid API key" };
  }

  const business = keyRecord.business;

  // Normalize phone
  const normalizedPhone = phone.replace(/\D/g, "").replace(/^8/, "7");

  if (normalizedPhone.length < 10) {
    return { success: false, phone, error: "Invalid phone number" };
  }

  // Check SMS limit
  if (business.smsUsed >= business.smsLimit) {
    return { success: false, phone: normalizedPhone, error: "SMS limit exceeded" };
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
    return { success: true, phone: normalizedPhone, skipped: true };
  }

  // Create request
  await prisma.reviewRequest.create({
    data: {
      businessId: business.id,
      phone: normalizedPhone,
      source,
    },
  });

  // Increment SMS counter
  await prisma.business.update({
    where: { id: business.id },
    data: { smsUsed: { increment: 1 } },
  });

  // Update last used
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  // Send SMS with review link
  // TODO: support custom sender name per business (requires sms.ru registration)
  const reviewUrl = `${process.env.NEXTAUTH_URL}/r/${business.slug}`;
  const message = `Спасибо за визит в ${business.name}! Оцените нас: ${reviewUrl}`;

  const smsResult = await sendSms(normalizedPhone, message);

  if (!smsResult.success) {
    return { success: false, phone: normalizedPhone, error: smsResult.error };
  }

  return { success: true, phone: normalizedPhone };
}

/**
 * Extract phone from various formats
 */
export function extractPhone(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const parts = field.split(".");
    let value: unknown = data;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        value = null;
        break;
      }
    }

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return null;
}
