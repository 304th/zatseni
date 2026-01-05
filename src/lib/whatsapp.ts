// WhatsApp messaging integration
// Supports: Meta Cloud API (official) and Exolve (МТС)

type WhatsappProvider = "meta" | "exolve";

interface WhatsappResult {
  success: boolean;
  error?: string;
  messageId?: string;
  provider: WhatsappProvider;
}

interface WhatsappTemplateComponent {
  type: "body" | "header" | "button";
  parameters: Array<{
    type: "text" | "image" | "document";
    text?: string;
    image?: { link: string };
  }>;
}

// Default provider based on env config
function getDefaultProvider(): WhatsappProvider {
  if (process.env.EXOLVE_WHATSAPP_API_KEY) return "exolve";
  if (process.env.META_WHATSAPP_ACCESS_TOKEN) return "meta";
  return "meta";
}

// ============================================
// META CLOUD API
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
// ============================================

const META_API_VERSION = "v19.0";
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}`;

async function sendViaMeta(
  phone: string,
  message: string
): Promise<WhatsappResult> {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV WA Meta] To: ${phone}`);
      console.log(`[DEV WA Meta] Message: ${message}`);
      return { success: true, messageId: "dev-meta-" + Date.now(), provider: "meta" };
    }
    return { success: false, error: "Meta WhatsApp не настроен", provider: "meta" };
  }

  try {
    const response = await fetch(`${META_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id, provider: "meta" };
    }

    // Error handling
    const error = data.error?.message || data.error?.error_user_msg || "Ошибка отправки";
    return { success: false, error, provider: "meta" };
  } catch (error) {
    console.error("Meta WhatsApp error:", error);
    return { success: false, error: "Ошибка соединения с Meta API", provider: "meta" };
  }
}

async function sendTemplateViaMeta(
  phone: string,
  templateName: string,
  languageCode: string = "ru",
  components?: WhatsappTemplateComponent[]
): Promise<WhatsappResult> {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV WA Meta Template] To: ${phone}`);
      console.log(`[DEV WA Meta Template] Template: ${templateName}`);
      return { success: true, messageId: "dev-meta-tpl-" + Date.now(), provider: "meta" };
    }
    return { success: false, error: "Meta WhatsApp не настроен", provider: "meta" };
  }

  try {
    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (components) {
      (body.template as Record<string, unknown>).components = components;
    }

    const response = await fetch(`${META_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id, provider: "meta" };
    }

    const error = data.error?.message || "Ошибка отправки шаблона";
    return { success: false, error, provider: "meta" };
  } catch (error) {
    console.error("Meta WhatsApp template error:", error);
    return { success: false, error: "Ошибка соединения с Meta API", provider: "meta" };
  }
}

// ============================================
// EXOLVE (МТС) API
// Docs: https://docs.exolve.ru/
// Note: WhatsApp API requires contacting Exolve sales
// ============================================

const EXOLVE_API_URL = "https://api.exolve.ru/messaging/v1";

async function sendViaExolve(
  phone: string,
  message: string
): Promise<WhatsappResult> {
  const apiKey = process.env.EXOLVE_WHATSAPP_API_KEY;
  const senderId = process.env.EXOLVE_WHATSAPP_SENDER_ID;

  if (!apiKey || !senderId) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV WA Exolve] To: ${phone}`);
      console.log(`[DEV WA Exolve] Message: ${message}`);
      return { success: true, messageId: "dev-exolve-" + Date.now(), provider: "exolve" };
    }
    return { success: false, error: "Exolve WhatsApp не настроен", provider: "exolve" };
  }

  try {
    // Exolve WhatsApp API endpoint (verify with actual docs)
    const response = await fetch(`${EXOLVE_API_URL}/whatsapp/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: senderId,
        destination: phone,
        text: message,
      }),
    });

    const data = await response.json();

    if (data.message_id) {
      return { success: true, messageId: data.message_id, provider: "exolve" };
    }

    return { success: false, error: data.error || "Ошибка Exolve", provider: "exolve" };
  } catch (error) {
    console.error("Exolve WhatsApp error:", error);
    return { success: false, error: "Ошибка соединения с Exolve", provider: "exolve" };
  }
}

async function sendTemplateViaExolve(
  phone: string,
  templateName: string,
  _languageCode: string = "ru",
  _components?: WhatsappTemplateComponent[]
): Promise<WhatsappResult> {
  const apiKey = process.env.EXOLVE_WHATSAPP_API_KEY;
  const senderId = process.env.EXOLVE_WHATSAPP_SENDER_ID;

  if (!apiKey || !senderId) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV WA Exolve Template] To: ${phone}`);
      console.log(`[DEV WA Exolve Template] Template: ${templateName}`);
      return { success: true, messageId: "dev-exolve-tpl-" + Date.now(), provider: "exolve" };
    }
    return { success: false, error: "Exolve WhatsApp не настроен", provider: "exolve" };
  }

  try {
    // Exolve template endpoint (verify with actual docs)
    const response = await fetch(`${EXOLVE_API_URL}/whatsapp/template`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: senderId,
        destination: phone,
        template_name: templateName,
      }),
    });

    const data = await response.json();

    if (data.message_id) {
      return { success: true, messageId: data.message_id, provider: "exolve" };
    }

    return { success: false, error: data.error || "Ошибка шаблона Exolve", provider: "exolve" };
  } catch (error) {
    console.error("Exolve template error:", error);
    return { success: false, error: "Ошибка соединения с Exolve", provider: "exolve" };
  }
}

// ============================================
// UNIFIED API
// ============================================

/**
 * Send WhatsApp text message
 * Uses provider from env or specified explicitly
 */
export async function sendWhatsapp(
  phone: string,
  message: string,
  provider?: WhatsappProvider
): Promise<WhatsappResult> {
  const selectedProvider = provider || getDefaultProvider();

  // Normalize phone (remove + prefix, spaces)
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");

  if (selectedProvider === "exolve") {
    return sendViaExolve(normalizedPhone, message);
  }
  return sendViaMeta(normalizedPhone, message);
}

/**
 * Send WhatsApp template message (for marketing/utility)
 * Templates must be pre-approved by Meta/provider
 */
export async function sendWhatsappTemplate(
  phone: string,
  templateName: string,
  options?: {
    languageCode?: string;
    components?: WhatsappTemplateComponent[];
    provider?: WhatsappProvider;
  }
): Promise<WhatsappResult> {
  const selectedProvider = options?.provider || getDefaultProvider();
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");

  if (selectedProvider === "exolve") {
    return sendTemplateViaExolve(
      normalizedPhone,
      templateName,
      options?.languageCode,
      options?.components
    );
  }
  return sendTemplateViaMeta(
    normalizedPhone,
    templateName,
    options?.languageCode,
    options?.components
  );
}

/**
 * Check if WhatsApp is configured for any provider
 */
export function isWhatsappConfigured(): { meta: boolean; exolve: boolean } {
  return {
    meta: !!(process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID),
    exolve: !!(process.env.EXOLVE_WHATSAPP_API_KEY && process.env.EXOLVE_WHATSAPP_SENDER_ID),
  };
}
