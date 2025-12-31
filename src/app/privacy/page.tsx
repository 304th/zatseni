import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-bold text-gray-900">Зацени</span>
          </Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Войти
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>

        <div className="bg-white rounded-lg shadow p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Последнее обновление: 1 января 2025 г.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">1. Общие положения</h2>
          <p>
            Настоящая Политика конфиденциальности описывает, как ООО «Зацени»
            (далее — «мы», «нас», «Сервис») собирает, использует и защищает
            персональные данные пользователей сервиса zatseni.ru.
          </p>
          <p>
            Используя наш Сервис, вы соглашаетесь с условиями данной Политики
            конфиденциальности.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. Какие данные мы собираем
          </h2>
          <p>Мы собираем следующие категории данных:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Данные аккаунта:</strong> email, имя, пароль (в
              зашифрованном виде)
            </li>
            <li>
              <strong>Данные бизнеса:</strong> название, адрес, телефон, ссылки
              на карты
            </li>
            <li>
              <strong>Данные клиентов:</strong> номера телефонов для отправки SMS
            </li>
            <li>
              <strong>Данные об использовании:</strong> статистика отправленных
              сообщений, открытий, отзывов
            </li>
            <li>
              <strong>Технические данные:</strong> IP-адрес, тип браузера, данные
              cookies
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            3. Как мы используем данные
          </h2>
          <p>Собранные данные используются для:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Предоставления услуг Сервиса</li>
            <li>Отправки SMS-сообщений клиентам от имени вашего бизнеса</li>
            <li>Улучшения качества Сервиса</li>
            <li>Связи с вами по вопросам использования Сервиса</li>
            <li>Выполнения юридических обязательств</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            4. Передача данных третьим лицам
          </h2>
          <p>Мы можем передавать данные:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              SMS-провайдерам для отправки сообщений (SMS.ru и аналогичные
              сервисы)
            </li>
            <li>Платёжным системам для обработки платежей</li>
            <li>По требованию государственных органов в соответствии с законом</li>
          </ul>
          <p>
            Мы не продаём персональные данные третьим лицам в маркетинговых
            целях.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Хранение данных</h2>
          <p>
            Данные хранятся на серверах в Европейском Союзе (Supabase) с
            использованием современных методов шифрования. Мы храним данные в
            течение срока действия вашего аккаунта и 90 дней после его удаления.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">6. Ваши права</h2>
          <p>Вы имеете право:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Запросить доступ к своим данным</li>
            <li>Исправить неточные данные</li>
            <li>Удалить свои данные</li>
            <li>Ограничить обработку данных</li>
            <li>Перенести данные в другой сервис</li>
            <li>Отозвать согласие на обработку</li>
          </ul>
          <p>
            Для реализации этих прав свяжитесь с нами по адресу:{" "}
            <a href="mailto:privacy@zatseni.ru" className="text-blue-600">
              privacy@zatseni.ru
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">7. Cookies</h2>
          <p>
            Мы используем cookies для аутентификации пользователей и улучшения
            работы Сервиса. Вы можете отключить cookies в настройках браузера,
            однако это может ограничить функциональность Сервиса.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">8. Безопасность</h2>
          <p>
            Мы применяем технические и организационные меры для защиты данных:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Шифрование данных при передаче (HTTPS/TLS)</li>
            <li>Хеширование паролей (bcrypt)</li>
            <li>Регулярное резервное копирование</li>
            <li>Ограничение доступа сотрудников к данным</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            9. Изменения политики
          </h2>
          <p>
            Мы можем обновлять данную Политику. О существенных изменениях мы
            уведомим вас по email или через уведомление в Сервисе.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">10. Контакты</h2>
          <p>По вопросам конфиденциальности:</p>
          <ul className="list-none space-y-1">
            <li>
              Email:{" "}
              <a href="mailto:privacy@zatseni.ru" className="text-blue-600">
                privacy@zatseni.ru
              </a>
            </li>
            <li>Адрес: г. Москва, ул. Примерная, д. 1</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Вернуться на главную
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 Зацени. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
