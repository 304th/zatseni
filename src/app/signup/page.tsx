"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthProviders from "@/components/auth/AuthProviders";
import { Logo1 } from "@/components/Logo";

const PLAN_NAMES: Record<string, string> = {
  start: "Старт",
  business: "Бизнес",
  network: "Сеть",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const selectedPlan = planParam && ["start", "business", "network"].includes(planParam) ? planParam : "start";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        setLoading(false);
        return;
      }

      setVerificationSent(true);
    } catch {
      setError("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2">Проверьте почту</h1>
          <p className="text-gray-600 mb-4">
            Мы отправили ссылку для подтверждения на <strong>{formData.email}</strong>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Перейдите по ссылке в письме, чтобы активировать аккаунт. Ссылка действительна 24 часа.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo1 size={36} />
            <span className="text-2xl font-bold text-gray-900">Отзовик</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Создать аккаунт</h1>
          <p className="text-gray-600 mt-2">
            14 дней бесплатно, без карты
          </p>
          {selectedPlan !== "start" && (
            <p className="text-indigo-600 text-sm mt-1">
              Выбран тариф: {PLAN_NAMES[selectedPlan]}
            </p>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* Social auth providers */}
          <AuthProviders plan={selectedPlan} />

          {/* Email/password form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Минимум 6 символов"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Создание..." : "Создать аккаунт"}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Войти
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>}>
      <SignupForm />
    </Suspense>
  );
}
