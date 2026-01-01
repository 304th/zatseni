"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthProviders from "@/components/auth/AuthProviders";
import PublicHeader from "@/components/PublicHeader";

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
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="pt-28 pb-8 px-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-sm w-full text-center">
            <div className="text-3xl mb-3">📧</div>
            <h1 className="text-xl font-bold mb-2">Проверьте почту</h1>
            <p className="text-gray-600 text-sm mb-3">
              Ссылка для подтверждения отправлена на <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-500 text-xs mb-4">
              Ссылка действительна 24 часа
            </p>
            <Link href="/login" className="text-indigo-600 hover:underline text-sm">
              Перейти к входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="pt-28 pb-8 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold text-gray-900">Создать аккаунт</h1>
            <p className="text-gray-600 text-sm mt-1">
              14 дней бесплатно, без карты
              {selectedPlan !== "start" && (
                <span className="text-indigo-600"> · {PLAN_NAMES[selectedPlan]}</span>
              )}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <AuthProviders plan={selectedPlan} />

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Минимум 6 символов"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Создание..." : "Создать аккаунт"}
              </button>

              <p className="text-center text-gray-500 text-sm mt-3">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline">
                  Войти
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">
            Регистрируясь, вы соглашаетесь с <Link href="/terms" className="underline">условиями</Link>
          </p>
        </div>
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
