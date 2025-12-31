import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "Клиент получает SMS",
    description:
      "После визита отправьте клиенту SMS с просьбой оценить сервис. Ссылка ведёт на вашу персональную страницу.",
    icon: "📱",
  },
  {
    num: "2",
    title: "Клиент ставит оценку",
    description:
      "Клиент видит простую страницу с вопросом «Как вам наш сервис?» и выбирает оценку от 1 до 5 звёзд.",
    icon: "⭐",
  },
  {
    num: "3",
    title: "Умная маршрутизация",
    description:
      "Довольные клиенты (4-5 звёзд) перенаправляются на Яндекс Карты или 2ГИС для публичного отзыва.",
    icon: "🎯",
  },
  {
    num: "4",
    title: "Негатив остаётся приватным",
    description:
      "Недовольные клиенты (1-3 звёзды) оставляют обратную связь вам напрямую. Вы можете решить проблему до публичного негатива.",
    icon: "🔒",
  },
];

const benefits = [
  {
    title: "Больше положительных отзывов",
    description:
      "Довольные клиенты чаще оставляют отзывы, когда их просят. Средний рост — 3-5x отзывов в месяц.",
    stat: "3-5x",
  },
  {
    title: "Меньше негатива",
    description:
      "Недовольные клиенты пишут вам, а не в публичное пространство. Вы можете исправить ситуацию.",
    stat: "-80%",
  },
  {
    title: "Выше рейтинг",
    description:
      "Средний рост рейтинга на картах — 0.3-0.5 звезды за первые 3 месяца использования.",
    stat: "+0.5★",
  },
  {
    title: "Больше клиентов",
    description:
      "Высокий рейтинг привлекает новых клиентов. 90% людей читают отзывы перед визитом.",
    stat: "+25%",
  },
];

const useCases = [
  {
    title: "Рестораны и кафе",
    description: "Отправляйте SMS после оплаты счёта или заказа навынос.",
  },
  {
    title: "Салоны красоты",
    description: "Автоматическая отправка после завершения записи.",
  },
  {
    title: "Автосервисы",
    description: "SMS после выдачи автомобиля клиенту.",
  },
  {
    title: "Медицинские клиники",
    description: "Обратная связь после приёма врача.",
  },
  {
    title: "Фитнес-клубы",
    description: "Оценка после пробного занятия или покупки абонемента.",
  },
  {
    title: "Магазины",
    description: "SMS после покупки или доставки заказа.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Зацени
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-blue-600 font-medium">
              Как работает
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Тарифы
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Войти
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl font-bold mb-4">Как работает Зацени</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Простая система для сбора отзывов и защиты от негатива. Настройка за 5
          минут.
        </p>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex gap-6 items-start ${
                  i % 2 === 1 ? "flex-row-reverse text-right" : ""
                }`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    Шаг {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Так выглядит страница для клиента
          </h2>
          <div className="bg-gray-100 rounded-2xl p-8 max-w-sm mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">☕</span>
              </div>
              <h3 className="font-bold mb-2">Кофейня «Бодрое утро»</h3>
              <p className="text-gray-600 mb-4">Как вам наш сервис?</p>
              <div className="flex justify-center gap-2 text-3xl mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className="hover:scale-110 transition-transform"
                  >
                    {n <= 4 ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Ваша оценка поможет нам стать лучше
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Результаты наших клиентов
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-lg shadow p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {benefit.stat}
                </div>
                <h3 className="font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Кому подходит Зацени
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="border rounded-lg p-6 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-bold mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Интеграция за 5 минут</h2>
          <p className="text-gray-600 mb-8">
            Не нужны разработчики. Просто отправляйте SMS вручную или настройте
            автоматическую отправку через нашу CRM-интеграцию.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["iiko", "Poster", "R-Keeper", "YCLIENTS", "Bitrix24", "amoCRM"].map(
              (crm) => (
                <div
                  key={crm}
                  className="px-4 py-2 bg-white rounded-lg shadow text-gray-600"
                >
                  {crm}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Начните собирать отзывы сегодня</h2>
        <p className="text-xl mb-8 opacity-90">
          Бесплатный пробный период 14 дней
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Попробовать бесплатно
          </Link>
          <Link
            href="/pricing"
            className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
          >
            Посмотреть тарифы
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 Зацени. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
