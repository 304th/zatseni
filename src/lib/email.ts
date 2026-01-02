import { Resend } from "resend";

// Lazy initialization to avoid build errors
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM || "noreply@otzovik.ai";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const client = getResend();

  // In development without API key, just log
  if (!client) {
    console.log("=== EMAIL (dev mode) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html.substring(0, 200) + "...");
    console.log("========================");
    return { success: true, dev: true };
  }

  try {
    const { error } = await client.emails.send({
      from: `Отзовик <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  return sendEmail({
    to: email,
    subject: "Подтвердите email - Отзовик",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .logo-icon { width: 32px; height: 32px; background: #4F46E5; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #FBBF24; font-size: 18px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="logo-icon">★</span> Отзовик</div>
          </div>

          <h2>Подтвердите ваш email</h2>

          <p>Спасибо за регистрацию в Отзовик! Для завершения регистрации подтвердите ваш email, нажав на кнопку ниже:</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" class="button">Подтвердить email</a>
          </p>

          <p>Или скопируйте эту ссылку в браузер:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verifyUrl}</p>

          <p>Ссылка действительна 24 часа.</p>

          <p>Если вы не регистрировались в Отзовик, просто проигнорируйте это письмо.</p>

          <div class="footer">
            <p>&copy; 2025 Отзовик. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  return sendEmail({
    to: email,
    subject: "Сброс пароля - Отзовик",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .logo-icon { width: 32px; height: 32px; background: #4F46E5; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #FBBF24; font-size: 18px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="logo-icon">★</span> Отзовик</div>
          </div>

          <h2>Сброс пароля</h2>

          <p>Вы запросили сброс пароля для вашего аккаунта в Отзовик.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Сбросить пароль</a>
          </p>

          <p>Или скопируйте эту ссылку в браузер:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>

          <p>Ссылка действительна 1 час.</p>

          <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>

          <div class="footer">
            <p>&copy; 2025 Отзовик. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendInviteEmail(
  email: string,
  token: string,
  businessName: string,
  inviterName: string
) {
  const inviteUrl = `${APP_URL}/invite/${token}`;

  return sendEmail({
    to: email,
    subject: `Приглашение в команду "${businessName}" - Отзовик`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .logo-icon { width: 32px; height: 32px; background: #4F46E5; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; color: #FBBF24; font-size: 18px; }
          .button { display: inline-block; background: #22C55E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="logo-icon">★</span> Отзовик</div>
          </div>

          <h2>Приглашение в команду</h2>

          <p><strong>${inviterName}</strong> приглашает вас в команду <strong>"${businessName}"</strong> на платформе Отзовик.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" class="button">Принять приглашение</a>
          </p>

          <p>Или скопируйте эту ссылку в браузер:</p>
          <p style="word-break: break-all; color: #4F46E5;">${inviteUrl}</p>

          <p>Приглашение действительно 7 дней.</p>

          <div class="footer">
            <p>&copy; 2025 Отзовик. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
