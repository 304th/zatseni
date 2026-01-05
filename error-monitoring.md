# Error Monitoring SaaS: Deep Dive

Российская альтернатива Sentry — трекер ошибок для разработчиков

---

## Почему сейчас?

### Sentry заблокировал Россию

> **11 сентября 2024 года** Sentry начал блокировать российские IP-адреса в ответ на санкции США от 12 июня 2024.

**Это создало вакуум:**
- Тысячи dev-команд остались без error tracking
- Альтернативы слабые или сложные (self-hosted)
- Момент для захвата рынка

---

## Суть продукта

### Проблема

**Для разработчиков:**
- Как узнать об ошибках в production до пользователей?
- Как понять контекст ошибки (stack trace, user actions)?
- Как приоритизировать баги?
- Как отслеживать quality releases?

**Текущие решения в России (после ухода Sentry):**

| Решение | Проблема |
|---------|----------|
| **Hawk** | Маленький, новый, limited features |
| **GlitchTip** | Open source, нет SaaS, сложно |
| **Self-hosted Sentry** | 20+ сервисов, дорого поддерживать |
| **Elastic APM** | Слишком сложный, enterprise |
| **Логи вручную** | Примитивно, нет aggregation |

### Решение

```
SDK интегрируется в код →
  автоматически ловит ошибки →
    группирует похожие →
      алертит в Telegram/Slack →
        показывает контекст для debug
```

### Ключевые функции

1. **Error Tracking** — автоматический перехват exceptions
2. **Stack Traces** — полный call stack с source maps
3. **Breadcrumbs** — что делал пользователь до ошибки
4. **Release Health** — crash-free rate по версиям
5. **Alerting** — Telegram, Slack, email, webhooks
6. **Issue Grouping** — ML-группировка похожих ошибок
7. **Performance Monitoring** — traces, slow queries (опционально)

---

## Рынок

### Размер рынка разработки в России

| Метрика | Значение |
|---------|----------|
| IT-рынок России (2024) | 3.5T₽ |
| Рынок разработки ПО | 1.5T₽ (9 мес 2024) |
| Компаний в реестре РПО | 25,094 |
| IT-специалистов | ~1 млн человек |
| Разработчиков ПО | ~500k |
| Dev-команд (оценка) | 50-100k |

### Глобальный рынок APM/Error Monitoring

| Период | Объём |
|--------|-------|
| 2024 | $7-10B |
| 2030 | $20-30B |
| CAGR | 15-18% |

### TAM/SAM/SOM для России

| Сегмент | Компаний | Потенциал |
|---------|----------|-----------|
| **TAM** (все dev-команды) | 50-100k | 500M₽/год |
| **SAM** (платят за мониторинг) | 10-20k | 200M₽/год |
| **SOM** (захватим за 3 года) | 2-5k | 50-100M₽/год |

---

## Конкурентный анализ

### Sentry (ушедший лидер)

**Профиль:**
- Основан 2012, IPO планировался
- 100k+ клиентов до санкций
- Open source core + SaaS
- 70% revenue от self-serve

**Pricing:**

| Tier | Цена | Что включено |
|------|------|--------------|
| Developer | $0 | 5k errors/mo, 1 user |
| Team | $26/mo | 50k errors, unlimited users |
| Business | $80/mo | 100k errors, SSO |
| Enterprise | Custom | On-prem, SLA |

**Median annual:** $31,000 (500k errors/mo)

**Модель:** Event-based pricing — платишь за объём ошибок

### Hawk (Хоук) — главный российский конкурент

**Профиль:**
- Разработчик: CodeX (ИТМО)
- Open source + SaaS
- Серверы в России
- Молодой продукт (2022+)

**Pricing:**
- Free: 1,000 events/mo
- Paid: от 500k events/mo — custom pricing
- Дешевле Sentry по заявлениям

**Сильные стороны:**
- Российская локализация
- Серверы в РФ
- Open source
- Бесплатный tier щедрый

**Слабые стороны:**
- Маленькая команда
- Ограниченные SDK (no mobile)
- Нет enterprise features (SSO, audit log)
- Слабый marketing

### Другие альтернативы

| Решение | Тип | Проблема для России |
|---------|-----|---------------------|
| **GlitchTip** | OSS, self-hosted | Нет SaaS, сложно |
| **Rollbar** | SaaS | Может заблокировать |
| **Bugsnag** | SaaS | Может заблокировать |
| **Elastic APM** | OSS/SaaS | Слишком сложный |
| **SigNoz** | OSS | APM-focused, не error tracking |

### Конкурентное преимущество

| Фактор | Hawk | **Мы (цель)** |
|--------|------|---------------|
| Pricing | Непрозрачный | Прозрачный, Sentry-like |
| Free tier | 1k events | 10k events |
| SDK coverage | JS, Python, PHP, Go | + Mobile (iOS, Android, Flutter) |
| Enterprise | Нет | SSO, audit, SLA |
| UX | Basic | Sentry-level polish |
| Support | Email | Telegram + chat |

---

## Бизнес-модель

### Pricing Strategy

**Event-based pricing (как Sentry):**

| Tier | Цена | Events/mo | Users | Retention |
|------|------|-----------|-------|-----------|
| **Free** | 0₽ | 10k | 3 | 7 days |
| **Team** | 2,490₽/mo | 100k | 10 | 30 days |
| **Business** | 7,990₽/mo | 500k | Unlimited | 90 days |
| **Enterprise** | 24,990₽/mo | 2M+ | Unlimited | 1 year |

**Overage:** 0.5₽ за 1k events сверх лимита

### Сравнение с Sentry (конвертация)

| Sentry | Наша цена | Экономия |
|--------|-----------|----------|
| $26/mo (2,600₽) | 2,490₽ | 4% |
| $80/mo (8,000₽) | 7,990₽ | 0% |
| Custom ($300+) | 24,990₽ | 20-40% |

**Стратегия:** Паритет или чуть дешевле Sentry, но с локализацией

### Unit Economics

| Метрика | Значение |
|---------|----------|
| ARPU (avg) | 5,000₽/mo = 60,000₽/год |
| Gross margin | 80% (cloud hosting cheap) |
| CAC | 15,000₽ (dev marketing cheap) |
| LTV (3 years) | 180,000₽ × 80% = 144,000₽ |
| LTV:CAC | **9.6:1** ✅ |

**Отличная unit economics!** Dev tools = low CAC, high retention.

### Revenue Streams

1. **Subscriptions** — 85% revenue
2. **Overage** — pay-as-you-go сверх лимита
3. **On-premise** — для enterprise с требованиями к данным
4. **Support SLA** — premium support packages

---

## Финансовые проекции

### Консервативный сценарий

| Период | Команд | MRR | ARR | Net Profit |
|--------|--------|-----|-----|------------|
| Year 1 | 200 | 600k₽ | 7.2M₽ | -3M₽ (invest) |
| Year 2 | 800 | 3.2M₽ | 38M₽ | 10M₽ |
| Year 3 | 2,000 | 10M₽ | 120M₽ | 40M₽ |

**3-year profit: ~47M₽**
**Exit (5x ARR): 600M₽**

### Оптимистичный сценарий

| Период | Команд | ARR |
|--------|--------|-----|
| Year 3 | 5,000 | 300M₽ |

**Exit: 1.5B₽**

### Breakeven

- **Fixed costs:** 2M₽/mo (team of 5 + infra)
- **Breakeven:** 400 paying teams × 5,000₽ ARPU
- **Timeline:** Month 12-15

---

## Go-to-Market

### Target Customers

**Primary:** Российские dev-команды, бывшие клиенты Sentry

| Сегмент | Размер | Pain | WTP |
|---------|--------|------|-----|
| Стартапы | 10k+ | Sentry ушёл | Low |
| Продуктовые компании | 5k | Нужна стабильность | Medium |
| Enterprise | 1k | Compliance, SLA | High |
| Аутсорс/агентства | 3k | Multiple projects | Medium |

### Acquisition Channels

| Канал | CAC | Volume |
|-------|-----|--------|
| **Habr статьи** | 0₽ | High intent |
| **Dev communities** | Low | Telegram-каналы |
| **SEO** | Low | "Sentry альтернатива" |
| **Conferences** | Medium | HighLoad++, etc. |
| **GitHub** | 0₽ | Open source visibility |
| **Word of mouth** | 0₽ | Devs share tools |

**Key insight:** Developers don't respond to ads — нужен content marketing + community.

### Positioning

> "Sentry для России — локальные серверы, рублёвые цены, русская поддержка"

**Key messages:**
1. Данные в России (compliance)
2. Не заблокируют (санкции)
3. Цены в рублях (предсказуемо)
4. Поддержка на русском (Telegram)

---

## Техническая реализация

### Stack (предложение)

| Компонент | Технология |
|-----------|------------|
| Backend | Go / Rust (performance) |
| Storage | ClickHouse (events) + PostgreSQL (metadata) |
| Queue | Kafka / NATS |
| Frontend | React + TypeScript |
| SDKs | JS, Python, Go, PHP, Java, Swift, Kotlin |
| Infrastructure | Yandex Cloud / Selectel |

### Key Technical Challenges

1. **High-volume ingestion** — миллионы events/sec
2. **Issue grouping** — ML для группировки похожих ошибок
3. **Source maps** — JavaScript stack traces
4. **Data retention** — efficient storage at scale
5. **Real-time alerting** — low latency notifications

### MVP Scope (Month 1-3)

| Feature | Priority |
|---------|----------|
| JS/TS SDK | P0 |
| Python SDK | P0 |
| Error capture + storage | P0 |
| Basic dashboard | P0 |
| Telegram alerts | P0 |
| Issue grouping (basic) | P1 |
| User context | P1 |
| Release tracking | P2 |

**MVP бюджет:** 1-2M₽ (3 developers × 3 months)

---

## Риски и митигация

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| **Sentry вернётся** | Low | High | Фокус на compliance, локализация |
| **Hawk вырастет** | Medium | Medium | Двигаться быстрее, enterprise features |
| **Низкий WTP** | Medium | Medium | Freemium + enterprise upsell |
| **Technical issues** | Medium | High | Hire strong engineers |
| **Западные конкуренты** | Low | Medium | Локальные данные = moat |

### Почему Sentry не вернётся

1. Санкции расширяются, не сужаются
2. Compliance риски для американских компаний
3. Россия — маленький рынок для них (<1% revenue)

---

## Честная оценка

### Аргументы ЗА

1. **Timing идеальный** — Sentry ушёл 4 месяца назад
2. **Понятный рынок** — все знают что такое error tracking
3. **Низкий CAC** — devs share tools organically
4. **High retention** — switching cost высокий (SDK integration)
5. **Отличная unit economics** — LTV:CAC 9.6:1
6. **Scalable** — чистый SaaS, cloud infra
7. **Technical moat** — сложно сделать хорошо

### Аргументы ПРОТИВ

1. **Hawk exists** — уже есть российский аналог
2. **Dev tools = low WTP** — российские devs не любят платить
3. **Technical complexity** — high-volume infra не просто
4. **Open source competition** — GlitchTip, SigNoz бесплатны

### Вероятности успеха

| Сценарий | Вероятность | Результат |
|----------|-------------|-----------|
| Не взлетит | 30% | -5M₽ |
| Нишевой (#2 после Hawk) | 40% | 30M₽ за 3 года |
| Лидер рынка | 30% | 100M₽+ за 3 года |

**Expected value:** 0.3 × (-5) + 0.4 × 30 + 0.3 × 100 = -1.5 + 12 + 30 = **40.5M₽**

---

## Вердикт

### ★★★★☆ Сильная возможность

**Лучше чем:**
- TG Analytics (бесплатный монополист TGStat)
- Inventory SMB (МойСклад доминирует)
- TG Ads Marketplace (Telega.in 8 лет)

**Хуже чем:**
- Security Awareness (regulatory pressure сильнее)

**Почему делать:**
1. Timing — вакуум после Sentry
2. Technical moat — сложно скопировать
3. Excellent unit economics
4. Dev community = organic growth

**Когда НЕ делать:**
1. Нет сильных backend engineers
2. Не готовы к long game (dev tools = slow growth)
3. Хотите быстрые деньги

---

## Action Plan

### Phase 1: MVP (Month 1-3)

**Team:** 3 engineers

**Deliverables:**
1. JS SDK + Python SDK
2. Event ingestion pipeline
3. Basic web dashboard
4. Telegram notifications
5. Landing page + docs

**Budget:** 1.5M₽

### Phase 2: Product-Market Fit (Month 4-8)

**Deliverables:**
1. Go, PHP SDKs
2. Source maps support
3. Issue grouping (ML)
4. Release tracking
5. Integrations (Jira, GitHub)

**Target:** 100 paying teams

### Phase 3: Growth (Month 9-18)

**Deliverables:**
1. Mobile SDKs (iOS, Android, Flutter)
2. Performance monitoring
3. Enterprise features (SSO, audit)
4. On-premise option
5. 1,000 paying teams

---

## Sources

### Sentry & Market
- [Sentry Pricing](https://sentry.io/pricing/)
- [SigNoz: Sentry Pricing Guide](https://signoz.io/guides/sentry-pricing/)
- [Sacra: Sentry Revenue](https://sacra.com/c/sentry/)

### Russian Alternatives
- [Hawk (Хоук)](https://hawk-tracker.ru/)
- [Habr: Хоук обзор](https://habr.com/ru/articles/962700/)
- [vc.ru: Российский аналог Sentry](https://vc.ru/dev/1434659-kak-my-sdelali-rossiiskii-analog-sentry)
- [Habr: Hawk vs Sentry](https://habr.com/ru/companies/spbifmo/articles/868350/)

### Russian IT Market
- [TAdviser: IT-рынок России](https://www.tadviser.ru/index.php/Статья:ИТ-рынок_России)
- [CNews: Рынок IT итоги 2024](https://www.cnews.ru/reviews/rynok_it_itogi_2024)

*Last updated: January 2025*
