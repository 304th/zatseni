import Link from "next/link";
import { Logo1 } from "@/components/Logo";
import PublicHeader from "@/components/PublicHeader";
import CTALink from "@/components/CTALink";

const StarIcon = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const features = [
  {
    icon: "📱",
    title: "SMS и WhatsApp",
    description: "Автоматическая отправка просьбы об отзыве после визита клиента"
  },
  {
    icon: "🔗",
    title: "Умные ссылки",
    description: "Один клик — и клиент на странице отзыва в Яндекс Картах или 2ГИС"
  },
  {
    icon: "🛡️",
    title: "Фильтр негатива",
    description: "Недовольные клиенты пишут вам лично, а не публично"
  },
  {
    icon: "📊",
    title: "Аналитика",
    description: "Отслеживайте конверсию: отправлено → открыто → оставлен отзыв"
  },
  {
    icon: "📍",
    title: "Мультифилиалы",
    description: "Управляйте отзывами всех точек из одного кабинета"
  },
  {
    icon: "⚡",
    title: "Быстрый старт",
    description: "Настройка за 5 минут, первые отзывы — в тот же день"
  }
];

const pricing = [
  {
    id: "start",
    name: "Старт",
    price: "990",
    period: "₽/мес",
    features: [
      "1 точка",
      "100 SMS в месяц",
      "Базовая аналитика",
      "Email поддержка"
    ],
    cta: "Начать бесплатно",
    popular: false
  },
  {
    id: "business",
    name: "Бизнес",
    price: "2 490",
    period: "₽/мес",
    features: [
      "До 5 точек",
      "500 SMS в месяц",
      "Интеграции с CRM/POS",
      "Брендирование страницы",
      "Приоритетная поддержка"
    ],
    cta: "Выбрать план",
    popular: true
  },
  {
    id: "network",
    name: "Сеть",
    price: "7 990",
    period: "₽/мес",
    features: [
      "Неограниченно точек",
      "2000 SMS в месяц",
      "Персональный менеджер",
      "Интеграции с CRM/POS",
      "White label"
    ],
    cta: "Выбрать план",
    popular: false
  }
];

const steps = [
  {
    num: "1",
    title: "Клиент посещает вас",
    description: "После визита его номер попадает в систему (из CRM, POS или вручную)"
  },
  {
    num: "2",
    title: "Отправляем сообщение",
    description: "SMS или WhatsApp: «Спасибо за визит! Оцените нас: [ссылка]»"
  },
  {
    num: "3",
    title: "Клиент оставляет отзыв",
    description: "Один клик — и он на странице вашего бизнеса в Яндекс Картах"
  },
  {
    num: "4",
    title: "Рейтинг растёт",
    description: "Больше отзывов → выше в поиске → больше клиентов"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm mb-6">
            <span>🚀</span>
            <span>Первые 14 дней бесплатно</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Отзывы на <span className="text-indigo-600">Яндекс Картах</span><br />
            на автопилоте
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Автоматически собирайте отзывы от довольных клиентов.
            Поднимите рейтинг с 3.8 до 4.6+ за первый месяц.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <CTALink
              href="/signup"
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Попробовать бесплатно
            </CTALink>
            <Link
              href="#how"
              className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
            >
              Как это работает?
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
              </div>
              <span className="ml-2">4.9 из 5</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div>500+ бизнесов</div>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div>50 000+ отзывов собрано</div>
          </div>
        </div>
      </section>

      {/* Before/After */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
              <div className="text-red-500 font-semibold mb-4">❌ Без Отзовик</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex">{[1,2,3].map(i => <StarIcon key={i} />)}<span className="w-5 h-5 text-gray-300">☆</span><span className="w-5 h-5 text-gray-300">☆</span></div>
                  <span className="text-gray-600">3.2 — низкий рейтинг</span>
                </div>
                <p className="text-gray-500">12 отзывов за год</p>
                <p className="text-gray-500">Страница 2 в поиске</p>
                <p className="text-gray-500">20 звонков в месяц</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100">
              <div className="text-green-500 font-semibold mb-4">✅ С Отзовик</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex">{[1,2,3,4,5].map(i => <StarIcon key={i} />)}</div>
                  <span className="text-gray-600">4.7 — отличный рейтинг</span>
                </div>
                <p className="text-gray-500">150+ отзывов за год</p>
                <p className="text-gray-500">Топ-3 в районе</p>
                <p className="text-gray-500">60+ звонков в месяц</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Всё для роста рейтинга
            </h2>
            <p className="text-xl text-gray-600">
              Простые инструменты, которые реально работают
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Как это работает
            </h2>
            <p className="text-xl text-gray-600">
              4 простых шага к высокому рейтингу
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Demo phone */}
          <div className="mt-16 max-w-sm mx-auto">
            <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
              <div className="bg-white rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-2">SMS от Кофейня «Бодрое утро»</div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-gray-800">
                    Спасибо за визит! ☕<br/><br/>
                    Нам важно ваше мнение. Оставьте отзыв — это займёт 30 секунд:<br/><br/>
                    <span className="text-indigo-600">otzovik.ai/r/bodroe</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Простые цены
            </h2>
            <p className="text-xl text-gray-600">
              Без скрытых платежей. Отмена в любой момент.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl ${plan.popular ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' : 'bg-white border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="text-indigo-200 text-sm font-semibold mb-2">ПОПУЛЯРНЫЙ</div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-indigo-200' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckIcon />
                      <span className={plan.popular ? 'text-indigo-100' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <CTALink
                  href={`/signup?plan=${plan.id}`}
                  className={`block w-full py-3 rounded-xl font-semibold transition text-center ${
                    plan.popular
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {plan.cta}
                </CTALink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Готовы получать больше отзывов?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Начните бесплатный 14-дневный период прямо сейчас
          </p>
          <CTALink
            href="/signup"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition shadow-lg"
          >
            Попробовать бесплатно
          </CTALink>
          <p className="text-indigo-200 mt-4 text-sm">
            Не нужна карта • Настройка за 5 минут • Отмена в любой момент
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo1 size={28} />
              <span className="text-xl font-bold text-white">Отзовик</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/how-it-works" className="hover:text-white">О сервисе</Link>
              <Link href="/privacy" className="hover:text-white">Конфиденциальность</Link>
              <Link href="/terms" className="hover:text-white">Условия</Link>
            </div>
            <div className="text-sm">
              © 2025 Отзовик. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
