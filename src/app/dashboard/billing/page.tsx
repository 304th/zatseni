"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Бесплатный",
    price: 0,
    features: ["1 точка", "10 SMS в месяц", "Базовая аналитика"],
  },
  {
    id: "start",
    name: "Старт",
    price: 990,
    features: ["1 точка", "100 SMS в месяц", "Полная аналитика"],
  },
  {
    id: "business",
    name: "Бизнес",
    price: 3990,
    features: ["До 5 точек", "500 SMS в месяц", "50 AI-ответов"],
    popular: true,
  },
  {
    id: "network",
    name: "Сеть",
    price: 9990,
    features: ["Безлимит точек", "2000 SMS в месяц", "White label"],
  },
];

const SMS_PACKS = [
  { amount: 100, price: 350, perSms: "3.50" },
  { amount: 300, price: 900, perSms: "3.00" },
  { amount: 500, price: 1250, perSms: "2.50" },
  { amount: 1000, price: 2000, perSms: "2.00" },
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

  const currentPlan = session?.user?.plan || "start";
  const successStatus = searchParams.get("status") === "success";
  const upgradeParam = searchParams.get("upgrade");

  useEffect(() => {
    fetchPayments();
    // If upgrade param exists and it's a valid plan, highlight it
    if (upgradeParam && ["free", "start", "business", "network"].includes(upgradeParam)) {
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
          Текущий тариф: <strong>{PLANS.find((p) => p.id === currentPlan)?.name}</strong>
        </p>

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
