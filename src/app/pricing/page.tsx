"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";

const plans = [
  {
    id: "free",
    name: "Бесплатный",
    price: "0",
    period: "мес",
    description: "Попробуйте бесплатно",
    features: [
      "1 точка",
      "10 SMS в месяц",
      "Базовая аналитика",
    ],
    notIncluded: [
      "AI-ответы на отзывы",
      "Интеграции с CRM/POS",
    ],
    cta: "Начать бесплатно",
    ctaLoggedIn: "Текущий",
    popular: false,
  },
  {
    id: "start",
    name: "Старт",
    price: "990",
    period: "мес",
    description: "Для небольшого бизнеса",
    features: [
      "1 точка",
      "100 SMS в месяц",
      "Полная аналитика",
    ],
    notIncluded: [
      "AI-ответы на отзывы",
      "Интеграции с CRM/POS",
    ],
    cta: "Выбрать план",
    ctaLoggedIn: "Выбрать",
    popular: false,
  },
  {
    id: "business",
    name: "Бизнес",
    price: "3 990",
    period: "мес",
    description: "Для растущих компаний",
    features: [
      "До 5 точек",
      "500 SMS в месяц",
      "50 AI-ответов в месяц",
      "Интеграции с CRM/POS",
      "Приоритетная поддержка",
    ],
    notIncluded: [],
    cta: "Выбрать план",
    ctaLoggedIn: "Выбрать",
    popular: true,
  },
  {
    id: "network",
    name: "Сеть",
    price: "9 990",
    period: "мес",
    description: "Для сетей и франшиз",
    features: [
      "Неограниченно точек",
      "2000 SMS в месяц",
      "100 AI-ответов в месяц",
      "White label",
    ],
    notIncluded: [],
    cta: "Выбрать план",
    ctaLoggedIn: "Выбрать",
    popular: false,
  },
];

const faqs = [
  {
    q: "Как работает бесплатный тариф?",
    a: "Вы получаете 10 SMS в месяц бесплатно навсегда. Карта не требуется. Можете перейти на платный тариф в любой момент.",
  },
  {
    q: "Можно ли менять тариф?",
    a: "Да, вы можете перейти на другой тариф в любое время. При повышении — сразу, при понижении — со следующего месяца.",
  },
  {
    q: "Что если SMS закончатся?",
    a: "Вы можете докупить SMS-пакеты или перейти на более высокий тариф. Стоимость дополнительных SMS — от 3₽ за штуку.",
  },
  {
    q: "Есть ли скидки при оплате за год?",
    a: "Да, при оплате за год вы получаете 2 месяца бесплатно (скидка ~17%).",
  },
  {
    q: "Какие способы оплаты принимаете?",
    a: "Банковские карты, ЮKassa, СБП, оплата по счёту для юридических лиц.",
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated";
  const currentPlan = session?.user?.plan || "start";

  const handlePlanClick = (planId: string) => {
    if (isLoggedIn) {
      if (planId === currentPlan) {
        router.push("/dashboard");
      } else {
        router.push(`/dashboard/billing?upgrade=${planId}`);
      }
    } else {
      router.push(`/signup?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Простые и понятные тарифы</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Начните бесплатно, платите только когда растёте. Никаких скрытых платежей.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = isLoggedIn && plan.id === currentPlan;
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                  plan.popular ? "ring-2 ring-blue-600" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                    Популярный
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}₽</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.notIncluded.length > 0 && (
                  <ul className="space-y-2 mb-8 opacity-50">
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {plan.notIncluded.length === 0 && <div className="mb-8" />}

                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isCurrentPlan}
                  className={`block w-full text-center py-3 rounded-lg font-medium ${
                    isCurrentPlan
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {isCurrentPlan
                    ? "Текущий тариф"
                    : isLoggedIn
                    ? plan.ctaLoggedIn
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SMS Packages */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Дополнительные SMS-пакеты
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { sms: 100, price: 350, per: "3.50₽" },
              { sms: 300, price: 900, per: "3.00₽" },
              { sms: 500, price: 1250, per: "2.50₽" },
              { sms: 1000, price: 2000, per: "2.00₽" },
            ].map((pkg) => (
              <div
                key={pkg.sms}
                className="border rounded-lg p-4 text-center hover:border-blue-300"
              >
                <div className="text-2xl font-bold mb-1">{pkg.sms}</div>
                <div className="text-sm text-gray-500 mb-2">SMS</div>
                <div className="text-lg font-semibold">{pkg.price}₽</div>
                <div className="text-xs text-gray-400">{pkg.per}/SMS</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Частые вопросы</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-lg shadow p-4 group"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
        <p className="text-xl mb-8 opacity-90">
          Бесплатный тариф навсегда. Без привязки карты.
        </p>
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Перейти в панель
          </Link>
        ) : (
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Начать бесплатно
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 Отзовик. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
