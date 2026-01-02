"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";

const plans = [
  {
    id: "start",
    name: "Старт",
    price: "1 190",
    period: "мес",
    description: "Для небольшого бизнеса",
    features: [
      "1 точка",
      "До 3 сотрудников",
      "100 SMS в месяц",
      "Полная аналитика",
    ],
    notIncluded: [
      "AI-ответы на отзывы",
      "Интеграции с CRM/POS",
    ],
    cta: "Попробовать бесплатно",
    ctaLoggedIn: "Выбрать",
    popular: false,
  },
  {
    id: "business",
    name: "Бизнес",
    price: "4 990",
    period: "мес",
    description: "Для растущих компаний",
    features: [
      "До 5 точек",
      "До 20 сотрудников",
      "400 SMS в месяц",
      "50 AI-ответов в месяц",
      "Интеграции с CRM/POS",
    ],
    notIncluded: [],
    cta: "Попробовать бесплатно",
    ctaLoggedIn: "Выбрать",
    popular: true,
  },
  {
    id: "network",
    name: "Сеть",
    price: "16 990",
    period: "мес",
    description: "Для сетей и франшиз",
    features: [
      "Неограниченно точек",
      "Неограниченно сотрудников",
      "1000 SMS в месяц",
      "100 AI-ответов в месяц",
    ],
    notIncluded: [],
    cta: "Попробовать бесплатно",
    ctaLoggedIn: "Выбрать",
    popular: false,
  },
];

const faqs = [
  {
    q: "Как работает пробный период?",
    a: "14 дней бесплатно с 20 SMS. Полный функционал без ограничений. Карта не требуется. После пробного периода выберите подходящий тариф.",
  },
  {
    q: "Что будет после пробного периода?",
    a: "Вы сможете выбрать любой тариф. Если не выберете — аккаунт приостановится, но данные сохранятся. Можете вернуться в любой момент.",
  },
  {
    q: "Можно ли менять тариф?",
    a: "Да, вы можете перейти на другой тариф в любое время. При повышении — сразу, при понижении — со следующего месяца.",
  },
  {
    q: "Что если SMS закончатся?",
    a: "Вы можете докупить SMS-пакеты или перейти на более высокий тариф. Стоимость дополнительных SMS — от 6₽ за штуку.",
  },
  {
    q: "Почему SMS, а не WhatsApp?",
    a: "WhatsApp заблокирован в России с октября 2025. SMS работает везде и всегда — гарантированная доставка на любой телефон.",
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
      <section className="pt-32 pb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Простые и понятные тарифы</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          14 дней бесплатно с 20 SMS. Никаких скрытых платежей.
        </p>
      </section>

      {/* Trial Banner */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
          <div className="text-2xl font-bold mb-2">Пробный период — 14 дней бесплатно</div>
          <div className="text-blue-100">
            20 SMS • Полный функционал • Без привязки карты
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
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
              { sms: 50, price: 650, per: "13₽" },
              { sms: 100, price: 1200, per: "12₽" },
              { sms: 250, price: 2750, per: "11₽" },
              { sms: 500, price: 5000, per: "10₽" },
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
          14 дней бесплатно • 20 SMS • Без привязки карты
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
            Попробовать бесплатно
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
