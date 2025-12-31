// YooKassa Payment Integration
// Docs: https://yookassa.ru/developers/api

const YOOKASSA_API = "https://api.yookassa.ru/v3";

interface PaymentParams {
  amount: number; // in rubles
  description: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

interface PaymentResponse {
  id: string;
  status: string;
  confirmation?: {
    confirmation_url: string;
  };
}

export async function createPayment(params: PaymentParams): Promise<PaymentResponse | null> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    console.error("YooKassa not configured");
    return null;
  }

  const idempotenceKey = crypto.randomUUID();

  try {
    const response = await fetch(`${YOOKASSA_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: {
          value: params.amount.toFixed(2),
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: params.returnUrl,
        },
        capture: true,
        description: params.description,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("YooKassa error:", error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("YooKassa request failed:", error);
    return null;
  }
}

export async function getPayment(paymentId: string): Promise<PaymentResponse | null> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    return null;
  }

  try {
    const response = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
