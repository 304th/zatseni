// SMS.ru API integration
// Docs: https://sms.ru/api

const SMSRU_API_URL = "https://sms.ru/sms/send";

interface SmsResult {
  success: boolean;
  error?: string;
  smsId?: string;
}

// Default sender name (must be registered in sms.ru dashboard)
const DEFAULT_SENDER = process.env.SMSRU_SENDER || "Otzovik";

export async function sendSms(
  phone: string,
  message: string,
  senderName?: string
): Promise<SmsResult> {
  const apiKey = process.env.SMSRU_API_KEY;

  if (!apiKey) {
    console.error("SMSRU_API_KEY not configured");
    // In development, just log and return success
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV SMS] To: ${phone}`);
      console.log(`[DEV SMS] Message: ${message}`);
      return { success: true, smsId: "dev-" + Date.now() };
    }
    return { success: false, error: "SMS сервис не настроен" };
  }

  try {
    const from = senderName || DEFAULT_SENDER;
    const params = new URLSearchParams({
      api_id: apiKey,
      to: phone,
      msg: message,
      from,
      json: "1",
    });

    const response = await fetch(`${SMSRU_API_URL}?${params.toString()}`);
    const data = await response.json();

    // SMS.ru response format
    // { status: "OK", status_code: 100, sms: { "79991234567": { status: "OK", status_code: 100, sms_id: "..." } } }
    if (data.status === "OK" && data.status_code === 100) {
      const phoneData = data.sms?.[phone];
      if (phoneData?.status === "OK") {
        return { success: true, smsId: phoneData.sms_id };
      }
    }

    // Error codes: https://sms.ru/api/status
    const errorMessages: Record<number, string> = {
      200: "Неверный API ключ",
      201: "Недостаточно средств",
      202: "Неверный получатель",
      203: "Нет текста сообщения",
      204: "Имя отправителя не согласовано",
      205: "Сообщение слишком длинное",
      206: "Лимит сообщений в день превышен",
      207: "На этот номер нельзя отправлять",
      208: "Неверное время доставки",
      209: "Вы добавили этот номер в стоп-лист",
      210: "Используйте POST запрос",
      211: "Метод не найден",
      212: "Текст сообщения должен быть в UTF-8",
      230: "Превышен лимит сообщений в минуту",
      231: "Превышен лимит одинаковых сообщений",
      232: "Превышен лимит одинаковых сообщений на этот номер",
    };

    const errorCode = data.status_code || data.sms?.[phone]?.status_code;
    const errorMessage = errorMessages[errorCode] || `Ошибка SMS: ${data.status || errorCode}`;

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, error: "Ошибка соединения с SMS сервисом" };
  }
}

// Check balance
export async function getSmsBalance(): Promise<number | null> {
  const apiKey = process.env.SMSRU_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://sms.ru/my/balance?api_id=${apiKey}&json=1`
    );
    const data = await response.json();

    if (data.status === "OK") {
      return data.balance;
    }
    return null;
  } catch {
    return null;
  }
}
