# Integrations

## WhatsApp

Two providers supported: Meta Cloud API (official) and Exolve (МТС).

### Meta WhatsApp Cloud API

Official API, requires Meta Business verification.

**Setup:**

1. Create Meta Developer account at [developers.facebook.com](https://developers.facebook.com)
2. Create app → Select "Business" type
3. Add Products → WhatsApp → Set Up
4. Go to WhatsApp → API Setup:
   - Copy `Phone number ID` → `META_WHATSAPP_PHONE_NUMBER_ID`
   - Generate permanent token → `META_WHATSAPP_ACCESS_TOKEN`

**Production requirements:**
- Meta Business verification (~1-2 weeks)
- Register your own phone number
- Create message templates (approval ~24h)

**Test limitations:** Can only message numbers added to "recipient phone numbers" list.

**Env vars:**
```
META_WHATSAPP_ACCESS_TOKEN="EAAxxxxx..."
META_WHATSAPP_PHONE_NUMBER_ID="123456789"
```

### Exolve (МТС)

Russian provider, easier local approval.

**Setup:**

1. Register at [exolve.ru](https://exolve.ru)
2. Contact sales (sales@exolve.ru) for WhatsApp API access
3. After approval, set credentials:

```
EXOLVE_WHATSAPP_API_KEY="your-api-key"
EXOLVE_WHATSAPP_SENDER_ID="your-sender-id"
```

### Usage

```typescript
import { sendWhatsapp, sendWhatsappTemplate, isWhatsappConfigured } from "@/lib/whatsapp";

// Check config
const { meta, exolve } = isWhatsappConfigured();

// Send text (auto-selects provider based on env)
await sendWhatsapp("79991234567", "Оставьте отзыв!");

// Force specific provider
await sendWhatsapp("79991234567", "Message", "meta");
await sendWhatsapp("79991234567", "Message", "exolve");

// Template message (for marketing/utility)
await sendWhatsappTemplate("79991234567", "review_request", {
  languageCode: "ru",
  components: [{
    type: "body",
    parameters: [{ type: "text", text: "Кофейня" }]
  }]
});
```

Dev mode: logs messages to console when API keys not configured.

---

## SMS (SMS.ru)

**Setup:**
1. Register at [sms.ru](https://sms.ru)
2. Get API key from dashboard
3. Register sender name (optional)

```
SMSRU_API_KEY="your-api-key"
SMSRU_SENDER="YourBrand"
```

**Usage:**
```typescript
import { sendSms, getSmsBalance } from "@/lib/sms";

await sendSms("79991234567", "Ваш код: 1234");
const balance = await getSmsBalance();
```

---

## Email (Resend)

**Setup:**
1. Register at [resend.com](https://resend.com)
2. Verify domain
3. Get API key

```
RESEND_API_KEY="re_xxxxxxxxxx"
RESEND_FROM="noreply@yourdomain.com"
```

**Usage:**
```typescript
import { sendEmail, sendVerificationEmail } from "@/lib/email";

await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Content</p>"
});
```

---

## iiko (Рестораны/Доставка)

POS/ERP система для ресторанов. Интеграция через iiko Transport (Cloud API).

### Как это работает

1. При закрытии заказа/доставки iiko отправляет POST webhook на наш URL
2. Мы извлекаем телефон клиента из payload
3. Отправляем SMS с просьбой оставить отзыв

### Webhook события

iiko Cloud API поддерживает:
- `DeliveryOrderUpdate` — изменение статуса доставки (основное)
- `TableOrderUpdate` — изменение заказа на столик
- `StopListUpdate` — обновление стоп-листа
- `ReserveUpdate` — изменение брони

### Формат webhook payload

```json
{
  "eventType": "DeliveryOrderUpdate",
  "eventTime": "2024-01-15T14:30:00.000",
  "organizationId": "uuid",
  "correlationId": "uuid",
  "eventInfo": {
    "id": "order-uuid",
    "posId": "pos-uuid",
    "creationStatus": "Success",
    "order": {
      "id": "...",
      "status": "Delivered",
      "customer": {
        "phone": "+79991234567",
        "name": "Иван"
      }
    }
  }
}
```

### Настройка на стороне iiko

**Вариант 1: iikoWeb (рекомендуется)**
1. Войти в [iikoweb.ru](https://iikoweb.ru)
2. Перейти в "Настройки Cloud API"
3. Скопировать API ключ (понадобится для авторизации исходящих запросов)
4. Раздел "Webhook уведомления" → создать подписку
5. Вставить URL: `https://yourdomain.com/api/webhook/iiko?key=YOUR_API_KEY`

**Вариант 2: iikoOffice**
1. Меню "Обмен данными" → "Настройка IikoTransport"
2. В настройках "Источника заказа" указать Endpoint URI

**Вариант 3: Через Источник заказа (SOI)**
1. Настройки → Доставка → Источники заказов
2. Выбрать источник → указать "Endpoint URI" для уведомлений
3. Уведомления придут при статусах "Доставлен" / "Доставка не удалась"

### Наш webhook endpoint

```
POST https://yourdomain.com/api/webhook/iiko?key=YOUR_API_KEY
Content-Type: application/json
```

Извлекаем телефон из полей:
- `order.customer.phone`
- `eventInfo.order.customer.phone`
- `deliveryOrder.customer.phone`
- `customer.phone`
- `phone`

### Лицензирование iiko API

- **Тест бесплатно**: можно экспериментировать с тестовым аккаунтом
- **Продакшн**: требуется лицензия "API iikoDelivery"
- Рекомендуется запросить подключение у менеджера iiko

Тестовые данные:
- Login: `demoDelivery`
- Password: `PI1yFaKFCGvvJKi`
- Примеры: https://examples.iiko.ru

### Текущий статус интеграции

✅ **Реализовано:**
- Прием POST webhook
- Валидация API ключа
- Фильтрация по eventType (`DeliveryOrderUpdate`, `TableOrderUpdate`)
- Проверка статуса заказа (только `Delivered`, `Closed`, `Finished`)
- Извлечение телефона из разных форматов payload
- Логирование payload для отладки
- Отправка SMS через общий processWebhook

### Тестирование

```bash
curl -X POST "https://yourdomain.com/api/webhook/iiko?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "DeliveryOrderUpdate",
    "eventInfo": {
      "order": {
        "status": "Delivered",
        "customer": {
          "phone": "+79991234567"
        }
      }
    }
  }'
```

### Документация iiko

- Основная: https://api-ru.iiko.services/docs
- Помощь: https://ru.iiko.help
- Поддержка: api@iiko.ru
- Python SDK: https://github.com/kebrick/pyiikocloudapi

---

## R-Keeper (Рестораны/Доставка)

POS/ERP система для ресторанов от UCS. Интеграция через External API для push-уведомлений.

### Как это работает

1. При изменении статуса заказа R-Keeper отправляет HTTP POST на наш URL
2. Мы проверяем статус (только "Выполнен"/"Доставлен")
3. Извлекаем телефон клиента и отправляем SMS

### Статусы заказа R-Keeper

**Обязательные:**
- `Новый` — заказ поступил
- `Передан на кухню` — заказ создан на кассе
- `Выполнен` — заказ завершен, оплачен, доставлен ✅
- `Отменен` — отмена

**Опциональные (доставка):**
- `Принят в ресторане`
- `Готовится`
- `Приготовлен`
- `Собран`
- `У курьера`
- `В пути`
- `Доставлен` ✅

Мы отправляем SMS только при статусах `Выполнен` или `Доставлен`.

### Настройка на стороне R-Keeper

**Шаг 1: Создать External API**
1. Админ-панель → Коммуникации → Внешнее API для push-уведомлений
2. Нажать "Создать внешнее API"
3. Заполнить:
   - **Заголовок**: Otzovik.ai
   - **Ссылка**: `https://yourdomain.com/api/webhook/rkeeper?key=YOUR_API_KEY`
   - **Токен**: можно оставить пустым (используем key в URL)
4. Включить статус

**Шаг 2: Создать шаблон уведомления**
1. Админ-панель → Коммуникации → Шаблоны
2. Нажать "Создать шаблон"
3. Канал: API
4. Выбрать созданное внешнее API
5. Добавить условие: `Статус = Выполнен` (или `Доставлен`)
6. Сохранить

### Наш webhook endpoint

```
POST https://yourdomain.com/api/webhook/rkeeper?key=YOUR_API_KEY
Content-Type: application/json
```

Также поддерживаем токен в заголовках:
- `X-Api-Key: YOUR_API_KEY`
- `Authorization: Bearer YOUR_API_KEY`

Извлекаем телефон из полей:
- `order.customer.phone`
- `order.client.phone`
- `customer.phone`
- `client.phone`
- `phone`

### Лицензирование

- Требуется лицензия модуля `Delivery_Api`
- Для White Server API: запрос на integrations@rkeeper.ru

### Текущий статус интеграции

✅ **Реализовано:**
- Прием POST webhook
- Валидация API ключа (query param или headers)
- Проверка статуса заказа (только завершенные)
- Извлечение телефона из разных форматов
- Логирование payload для отладки

### Тестирование

```bash
curl -X POST "https://yourdomain.com/api/webhook/rkeeper?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "status": "Выполнен",
      "customer": {
        "phone": "+79991234567"
      }
    }
  }'
```

### Документация R-Keeper

- Push API: https://docs.rkeeper.ru/delivery/vneshnee-api-dlya-push-uvedomlenij-156074728.html
- Статусы: https://docs.rkeeper.ru/delivery/statusy-zakaza-10818472.html
- Delivery API: https://docs.rkeeper.ru/delivery/
- White Server: https://docs.rkeeper.ru/ws/white-server-api-v2-27845668.html
- Поддержка: integrations@rkeeper.ru

---

## YCLIENTS (Салоны/Услуги)

CRM для салонов красоты, барбершопов, клиник и сервисных бизнесов.

### Как это работает

1. Клиент приходит на визит, администратор меняет статус на "Клиент пришел"
2. YCLIENTS отправляет webhook на наш URL
3. Мы проверяем статус визита и отправляем SMS с просьбой оставить отзыв

### Статусы визита

| Код | Статус | Действие |
|-----|--------|----------|
| 0 | Ожидание клиента | Пропускаем |
| -1 | Клиент подтвердил | Пропускаем |
| 1 | Клиент пришел | ✅ Отправляем SMS |
| 2 | Клиент не пришел | Пропускаем |

Мы отправляем SMS только при `visit_attendance = 1` (клиент пришел).

### Настройка webhook

**Важно:** С сентября 2022 новые webhooks можно добавить только через Маркетплейс YCLIENTS. Существующие webhooks продолжают работать.

**Вариант 1: Существующий webhook (если настроен ранее)**
1. Настройки → Системные настройки → WebHook
2. URL уже должен быть указан

**Вариант 2: Через Маркетплейс (для новых)**
1. Зарегистрироваться как разработчик в YCLIENTS
2. Создать интеграцию в Маркетплейсе
3. Настроить webhook URL

**Вариант 3: Через API (программно)**
```bash
POST https://api.yclients.com/api/v1/hooks/{company_id}
Authorization: Bearer {user_token}, User {user_token}
Content-Type: application/json

{
  "url": "https://yourdomain.com/api/webhook/yclients?key=YOUR_API_KEY",
  "active": true,
  "salon_id": 123456
}
```

### Наш webhook endpoint

```
POST https://yourdomain.com/api/webhook/yclients?key=YOUR_API_KEY
Content-Type: application/json
```

### Формат payload

```json
{
  "resource": {
    "id": 12345,
    "company_id": 4564,
    "visit_attendance": 1,
    "deleted": false,
    "client": {
      "id": 789,
      "name": "Иван Петров",
      "phone": "+79991234567"
    },
    "services": [
      {"id": 1, "title": "Стрижка", "cost": 1500}
    ],
    "staff": {
      "id": 9,
      "name": "Мастер Анна"
    },
    "datetime": 1547622000
  },
  "webhook_type": "record_changed"
}
```

### Извлекаем телефон из полей

- `resource.client.phone`
- `data.client.phone`
- `record.client.phone`
- `client.phone`
- `phone`

### Текущий статус интеграции

✅ **Реализовано:**
- Прием POST webhook
- Валидация API ключа
- Проверка `visit_attendance` (только завершенные визиты)
- Пропуск удаленных записей (`deleted: true`)
- Логирование payload для отладки

### Тестирование

```bash
curl -X POST "https://yourdomain.com/api/webhook/yclients?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "resource": {
      "visit_attendance": 1,
      "deleted": false,
      "client": {
        "phone": "+79991234567"
      }
    }
  }'
```

### Документация YCLIENTS

- REST API: https://yclients.docs.apiary.io/
- Поддержка: support@yclients.com
- Маркетплейс: https://yclients.com/marketplace

---

## AmoCRM (Продажи)

CRM-система для отделов продаж. Интеграция через webhooks при смене статуса сделки.

### Как это работает

1. Менеджер переводит сделку в статус "Успешно реализовано"
2. AmoCRM отправляет webhook на наш URL
3. Мы проверяем status_id и извлекаем телефон из контакта
4. Отправляем SMS с просьбой оставить отзыв

### Системные статусы сделок

| status_id | Статус | Действие |
|-----------|--------|----------|
| 142 | Успешно реализовано | ✅ Отправляем SMS |
| 143 | Закрыто и не реализовано | Пропускаем |
| другие | Этапы воронки | Пропускаем |

Мы отправляем SMS только при `status_id = 142` (успешная сделка).

### Настройка webhook

**Вариант 1: Через интерфейс**
1. Настройки → Интеграции → amoCRM API
2. Или: Сделки → Настроить → Добавить триггер → Отправить webhook
3. Указать URL: `https://yourdomain.com/api/webhook/amocrm?key=YOUR_API_KEY`
4. Выбрать событие: "Смена статуса сделки"

**Вариант 2: Через Digital Pipeline**
1. Сделки → Настроить воронку
2. На этапе "Успешно реализовано" добавить триггер
3. Выбрать "Отправить webhook"
4. Указать URL

### Наш webhook endpoint

```
POST https://yourdomain.com/api/webhook/amocrm?key=YOUR_API_KEY
Content-Type: application/x-www-form-urlencoded (или application/json)
```

### Формат payload

AmoCRM отправляет данные в URL-encoded формате:

```
leads[status][0][id]=12345
leads[status][0][status_id]=142
leads[status][0][pipeline_id]=789
leads[status][0][old_status_id]=456
contacts[update][0][id]=111
contacts[update][0][custom_fields][0][id]=66192
contacts[update][0][custom_fields][0][name]=Телефон
contacts[update][0][custom_fields][0][values][0][value]=79991234567
```

Или JSON:

```json
{
  "leads": {
    "status": [{
      "id": 12345,
      "status_id": 142,
      "pipeline_id": 789,
      "main_contact": {
        "id": 111,
        "phone": "+79991234567"
      }
    }]
  },
  "contacts": {
    "update": [{
      "id": 111,
      "custom_fields_values": [{
        "field_name": "Телефон",
        "field_code": "PHONE",
        "values": [{"value": "79991234567"}]
      }]
    }]
  }
}
```

### Извлечение телефона

Телефон ищем в порядке приоритета:
1. `leads[status][0][main_contact][phone]`
2. `contacts[update][0][custom_fields_values]` → поле "Телефон" или "PHONE"
3. `contacts[update][0][custom_fields]` → legacy формат
4. `contacts[update][0][phone]`

### Текущий статус интеграции

✅ **Реализовано:**
- Парсинг URL-encoded и JSON форматов
- Проверка `status_id = 142` (успешная сделка)
- Извлечение телефона из custom_fields (v4 и legacy)
- Поддержка main_contact.phone
- Логирование payload для отладки

### Тестирование

```bash
curl -X POST "https://yourdomain.com/api/webhook/amocrm?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": {
      "status": [{
        "id": 12345,
        "status_id": 142,
        "main_contact": {
          "phone": "+79991234567"
        }
      }]
    }
  }'
```

### Важные ограничения

- AmoCRM ожидает ответ в течение 2 секунд
- После 100 неудачных попыток webhook отключается
- С 2020 года публичные интеграции требуют OAuth 2.0

### Документация AmoCRM

- Webhooks: https://www.amocrm.ru/developers/content/crm_platform/webhooks
- API v4: https://www.amocrm.ru/developers/content/crm_platform/api-reference
- Kommo (rebrand): https://developers.kommo.com/
