"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface PhoneAuthProps {
  plan?: string;
  onSuccess?: () => void;
}

export default function PhoneAuth({ plan, onSuccess }: PhoneAuthProps) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone for display
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 1) return digits;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (!value.startsWith("7") && value.length > 0) {
      if (value.startsWith("8")) {
        value = "7" + value.slice(1);
      } else {
        value = "7" + value;
      }
    }
    setPhone(formatPhone(value));
  };

  const handleSendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка отправки");
        return;
      }

      setNormalizedPhone(data.phone);
      setStep("code");
      setCountdown(60);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Неверный код");
        return;
      }

      // Sign in with the verified user
      const result = await signIn("phone", {
        userId: data.user.id,
        redirect: false,
      });

      if (result?.error) {
        setError("Ошибка входа");
        return;
      }

      onSuccess?.();
      window.location.href = "/dashboard";
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep("phone");
    setCode("");
    setCountdown(0);
  };

  if (step === "code") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Код из SMS
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="0000"
            maxLength={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            Отправлен на {phone}
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleVerifyCode}
          disabled={loading || code.length !== 4}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Проверка..." : "Подтвердить"}
        </button>

        <div className="text-center text-sm">
          {countdown > 0 ? (
            <span className="text-gray-500">
              Отправить повторно через {countdown} сек
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-indigo-600 hover:underline"
            >
              Отправить код повторно
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Номер телефона
        </label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+7 (___) ___-__-__"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        onClick={handleSendCode}
        disabled={loading || phone.replace(/\D/g, "").length !== 11}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Отправка..." : "Получить код"}
      </button>
    </div>
  );
}
