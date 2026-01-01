"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginProps {
  botUsername?: string;
  plan?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

export default function TelegramLogin({ botUsername, plan, onSuccess }: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const username = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!username || !containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = "";

    // Create callback function
    const callbackName = `TelegramLoginCallback_${Date.now()}`;
    (window as unknown as Record<string, (user: TelegramUser) => void>)[callbackName] = async (user: TelegramUser) => {
      try {
        const result = await signIn("telegram", {
          telegramData: JSON.stringify(user),
          plan: plan || "start",
          redirect: false,
        });

        if (result?.error) {
          console.error("Telegram auth error:", result.error);
          alert("Ошибка авторизации через Telegram");
          return;
        }

        onSuccess?.();
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Telegram auth error:", error);
        alert("Ошибка авторизации через Telegram");
      }
    };

    // Create script element
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", username);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-request-access", "write");
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };
  }, [username, plan, onSuccess]);

  if (!username) {
    return null;
  }

  return (
    <div ref={containerRef} className="flex justify-center" />
  );
}
