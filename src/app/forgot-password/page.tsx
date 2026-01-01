"use client";

import { useState } from "react";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-32 pb-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">📧</div>
              <h1 className="text-2xl font-bold mb-4">Проверьте почту</h1>
              <p className="text-gray-600 mb-6">
                Если аккаунт с email <strong>{email}</strong> существует, мы отправили инструкции по сбросу пароля.
              </p>
              <Link href="/login" className="text-indigo-600 hover:underline">
                Вернуться к входу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="pt-32 pb-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Сброс пароля</h1>
          <p className="text-gray-600 mt-2">
            Введите email, на который зарегистрирован аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Отправка..." : "Отправить ссылку"}
          </button>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-gray-600 hover:underline">
              Вернуться к входу
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
