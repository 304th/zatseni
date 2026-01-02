"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getTrialDaysLeft, formatTrialStatus, TRIAL_SMS_LIMIT } from "@/lib/plans";

const PLANS = [
  {
    id: "start",
    name: "Старт",
    price: 1190,
    features: ["1 точка", "До 3 сотрудников", "100 SMS в месяц"],
  },
  {
    id: "business",
    name: "Бизнес",
    price: 4990,
    features: ["До 5 точек", "До 20 сотрудников", "400 SMS в месяц"],
    popular: true,
  },
  {
    id: "network",
    name: "Сеть",
    price: 16990,
    features: ["Безлимит точек", "Безлимит сотрудников", "1000 SMS в месяц"],
  },
];

const SMS_PACKS = [
  { amount: 50, price: 650, perSms: "13" },
  { amount: 100, price: 1200, perSms: "12" },
  { amount: 250, price: 2750, perSms: "11" },
  { amount: 500, price: 5000, perSms: "10" },
];

interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  description: string;
  createdAt: string;
  paidAt: string | null;
}

function BillingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"plans" | "sms" | "history">("plans");

  const currentPlan = session?.user?.plan || "free";
  const userCreatedAt = session?.user?.createdAt ? new Date(session.user.createdAt) : new Date();
  const isOnTrial = currentPlan === "free";
  const trialDaysLeft = isOnTrial ? getTrialDaysLeft(userCreatedAt) : 0;
  const trialExpired = isOnTrial && trialDaysLeft === 0;
  const successStatus = searchParams.get("status") === "success";
  const upgradeParam = searchParams.get("upgrade");

  useEffect(() => {
    fetchPayments();
    // If upgrade param exists and it's a valid plan, highlight it
    if (upgradeParam && ["start", "business", "network"].includes(upgradeParam)) {
      setTab("plans");
    }
  }, [upgradeParam]);

  async function fetchPayments() {
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        setPayments(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch payments", e);
    }
  }

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan) return;
    setLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", planId }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Ошибка");
      }
    } catch {
      alert("Ошибка создания платежа");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuySms(amount: number) {
    setLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sms_pack", smsAmount: amount }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Ошибка");
      }
    } catch {
      alert("Ошибка создания платежа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Тариф и оплата</h1>
      <p className="text-gray-600 mb-6">
        {isOnTrial ? (
          <>Пробный период: <strong>{formatTrialStatus(userCreatedAt)}</strong></>
        ) : (
          <>Текущий тариф: <strong>{PLANS.find((p) => p.id === currentPlan)?.name}</strong></>
        )}
      </p>

      {/* Trial Banner */}
      {isOnTrial && (
        <div className={`p-4 rounded-lg mb-6 ${trialExpired ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
          {trialExpired ? (
            <div className="text-red-800">
              <div className="font-bold mb-1">Пробный период истёк</div>
              <div className="text-sm">Выберите тариф, чтобы продолжить использование сервиса.</div>
            </div>
          ) : (
            <div className="text-blue-800">
              <div className="font-bold mb-1">Пробный период — {trialDaysLeft} {trialDaysLeft === 1 ? "день" : trialDaysLeft <= 4 ? "дня" : "дней"}</div>
              <div className="text-sm">{TRIAL_SMS_LIMIT} SMS • Полный функционал • Выберите тариф до окончания</div>
            </div>
          )}
        </div>
      )}

      {successStatus && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
          Оплата успешно обработана! Изменения вступят в силу в течение нескольких минут.
        </div>
      )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setTab("plans")}
            className={`pb-3 px-1 font-medium ${tab === "plans" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}
          >
            Тарифы
          </button>
          <button
            onClick={() => setTab("sms")}
            className={`pb-3 px-1 font-medium ${tab === "sms" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}
          >
            SMS-пакеты
          </button>
          <button
            onClick={() => setTab("history")}
            className={`pb-3 px-1 font-medium ${tab === "history" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}
          >
            История платежей
          </button>
        </div>

      {/* Plans */}
      {tab === "plans" && (
        <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isUpgradeTarget = upgradeParam === plan.id && plan.id !== currentPlan;
              return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl p-6 border-2 relative ${
                  plan.id === currentPlan
                    ? "border-indigo-600"
                    : isUpgradeTarget
                    ? "border-green-500 ring-2 ring-green-200"
                    : plan.popular
                    ? "border-indigo-200"
                    : "border-gray-100"
                }`}
              >
                {isUpgradeTarget && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Рекомендуем
                  </div>
                )}
                {plan.popular && !isUpgradeTarget && (
                  <div className="text-xs font-medium text-indigo-600 mb-2">ПОПУЛЯРНЫЙ</div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">
                  {plan.price}₽<span className="text-base font-normal text-gray-500">/мес</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                {plan.id === currentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-lg bg-gray-100 text-gray-500 font-medium"
                  >
                    Текущий тариф
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? "..." : "Выбрать"}
                  </button>
                )}
              </div>
            );
            })}
          </div>
        )}

        {/* SMS Packs */}
        {tab === "sms" && (
          <div className="grid md:grid-cols-4 gap-4">
            {SMS_PACKS.map((pack) => (
              <div
                key={pack.amount}
                className="bg-white rounded-xl p-6 border border-gray-100 text-center"
              >
                <div className="text-2xl font-bold mb-1">{pack.amount}</div>
                <div className="text-gray-500 text-sm mb-4">SMS</div>
                <div className="text-xl font-bold mb-1">{pack.price}₽</div>
                <div className="text-gray-400 text-xs mb-4">{pack.perSms}₽/SMS</div>
                <button
                  onClick={() => handleBuySms(pack.amount)}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "..." : "Купить"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payment History */}
        {tab === "history" && (
          <div className="bg-white rounded-xl border border-gray-100">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                История платежей пуста
              </div>
            ) : (
              <div className="divide-y">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{(p.amount / 100).toLocaleString()}₽</div>
                      <div
                        className={`text-sm ${
                          p.status === "succeeded"
                            ? "text-green-600"
                            : p.status === "canceled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {p.status === "succeeded"
                          ? "Оплачено"
                          : p.status === "canceled"
                          ? "Отменено"
                          : "Ожидает"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20">Загрузка...</div>}>
      <BillingContent />
    </Suspense>
  );
}
