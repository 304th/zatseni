# Vendor Risk Management SaaS: Deep Dive

Платформа оценки рисков поставщиков и контрагентов — российский SecurityScorecard/BitSight

---

## Почему сейчас?

### Конвергенция факторов

1. **Санкции** — нужно проверять контрагентов на санкционные списки
2. **ФЗ-152** — требует оценки обработчиков персональных данных
3. **115-ФЗ (AML)** — обязательная проверка контрагентов
4. **Supply chain attacks** — кибератаки через поставщиков растут
5. **ESG** — требования к устойчивости цепочки поставок

> "Киберриски третьих и четвёртых сторон входят в число главных системных угроз 2026 года"

---

## Суть продукта

### Проблема

**Для compliance/security команд:**
- Как оценить кибербезопасность поставщика?
- Как отслеживать изменения в рисках?
- Как автоматизировать опросники (questionnaires)?
- Как доказать due diligence регулятору?

**Текущие решения:**

| Решение | Проблема |
|---------|----------|
| **СПАРК** | Только финансы/юридика, не киберриски |
| **Ручные опросники** | Excel, долго, не масштабируется |
| **SecurityScorecard/BitSight** | Дорого ($22k+/год), фокус на запад |
| **Ничего** | Риски остаются неуправляемыми |

### Решение

```
Добавляете поставщика →
  Автоматический скоринг (публичные данные) →
    Отправка опросника поставщику →
      Мониторинг изменений →
        Алерты при ухудшении
```

### Ключевые функции

1. **Vendor Inventory** — реестр всех поставщиков
2. **Security Scoring** — автоматическая оценка по публичным данным
3. **Questionnaire Automation** — шаблоны опросников, автонапоминания
4. **Continuous Monitoring** — отслеживание изменений (санкции, утечки)
5. **Risk Tiering** — категоризация (critical/high/medium/low)
6. **Compliance Reports** — отчёты для 152-ФЗ, аудиторов
7. **Contract Tracking** — связь с договорами, SLA по безопасности

---

## Рынок

### Глобальный рынок TPRM (Third Party Risk Management)

| Источник | 2024 | 2030 | CAGR |
|----------|------|------|------|
| Grand View Research | $7.4B | $20.6B | 15.7% |
| Research Nester | $7.1B | $48.6B (2037) | 16% |
| SkyQuest | $8.6B | $27.6B (2032) | 15.7% |

**Средняя оценка:** $7-9B (2024) → $20-30B (2030)

### Российский контекст

| Фактор | Значение |
|--------|----------|
| Компаний с IT-бюджетом | ~50k |
| Enterprise (1000+ сотр.) | ~5k |
| Регулируемые отрасли | Банки, страхование, госсектор |
| Средний поставщиков на компанию | 50-500 |

### TAM/SAM/SOM для России

| Сегмент | Компаний | Потенциал |
|---------|----------|-----------|
| **TAM** (все с поставщиками) | 50k | 2B₽/год |
| **SAM** (нужен VRM) | 5k | 500M₽/год |
| **SOM** (захватим за 3 года) | 300-500 | 100-200M₽/год |

---

## Конкурентный анализ

### Глобальные лидеры (недоступны/дороги для РФ)

#### SecurityScorecard

**Профиль:**
- Лидер рынка security ratings
- Публичные данные для скоринга
- Enterprise фокус

**Pricing:**
- Custom quotes
- Отдельные лицензии на мониторинг и assessment
- $22k+ в год (по отзывам)

**Проблема для РФ:**
- Дорого
- Может заблокировать
- Фокус на западные компании

#### BitSight

**Профиль:**
- #2 в security ratings
- Более comprehensive analytics
- Enterprise only

**Pricing:**
- $22k+ за self + subsidiaries
- $1,500-2,000 за vendor/год
- "Expensive, oriented to large companies"

### Российские конкуренты

#### СПАРК-Интерфакс

**Профиль:**
- Лидер в проверке контрагентов
- Фокус: финансы, юридика, связи
- 20+ лет на рынке

**Pricing:**
- Полная версия: ~25k₽/мес (мин. 3 мес = 75k₽)
- 1СПАРК Риски: 3,600₽/год (базовый)
- 1СПАРК Риски+: 25,500₽/год (расширенный)

**Что делает:**
- Проверка по ЕГРЮЛ/ЕГРИП
- Финансовая отчётность
- Арбитражные дела
- Связи и аффилированность
- Санкционные списки

**Чего НЕ делает:**
- Security scoring (кибербезопасность)
- Questionnaire automation
- Continuous security monitoring
- Compliance с ФЗ-152 по обработчикам

#### Контур.Фокус

**Профиль:**
- Альтернатива СПАРК
- Дешевле, SMB-friendly
- Базовые проверки

**Чего НЕ делает:**
- То же что СПАРК — только финансы/юридика

### Конкурентный разрыв

| Функция | СПАРК | Контур | BitSight | **Мы (цель)** |
|---------|-------|--------|----------|---------------|
| Финансовые данные | ✅ | ✅ | ❌ | ⚠️ (интеграция) |
| Юридические данные | ✅ | ✅ | ❌ | ⚠️ (интеграция) |
| Security scoring | ❌ | ❌ | ✅ | ✅ |
| Questionnaires | ❌ | ❌ | ✅ | ✅ |
| Continuous monitoring | ❌ | ❌ | ✅ | ✅ |
| 152-ФЗ compliance | ❌ | ❌ | ❌ | ✅ |
| Российские данные | ✅ | ✅ | ❌ | ✅ |
| Цена SMB | ❌ | ✅ | ❌ | ✅ |

**Ниша:** Security-focused VRM с российской спецификой

---

## Бизнес-модель

### Pricing Strategy

**Vendor-based + platform fee:**

| Tier | Цена | Vendors | Функции |
|------|------|---------|---------|
| **Starter** | 14,990₽/mo | 25 | Inventory, basic scoring, questionnaires |
| **Professional** | 39,990₽/mo | 100 | + Continuous monitoring, integrations |
| **Enterprise** | 99,990₽/mo | 500 | + API, SSO, custom reports, SLA |
| **Unlimited** | Custom | Unlimited | + On-prem option |

**Add-ons:**
- Дополнительные vendors: 200₽/vendor/mo
- Deep assessment: 5,000₽/vendor (one-time)
- СПАРК интеграция: +5,000₽/mo

### Сравнение с конкурентами

| Решение | Годовая стоимость (100 vendors) |
|---------|-------------------------------|
| BitSight | $22k + 100×$1.5k = **$172k** (17M₽) |
| SecurityScorecard | ~**$50-100k** (5-10M₽) |
| СПАРК (полный) | ~**300k₽** (но нет security) |
| **Наше решение** | **480k₽** (39,990×12) |

**В 10-30x дешевле западных аналогов!**

### Unit Economics

| Метрика | Значение |
|---------|----------|
| ARPU | 40,000₽/mo = 480,000₽/год |
| Gross margin | 75% |
| CAC | 150,000₽ (enterprise sales) |
| LTV (3 years) | 1,440,000₽ × 75% = 1,080,000₽ |
| LTV:CAC | **7.2:1** ✅ |

### Revenue Streams

1. **Subscriptions** — 80% revenue
2. **Deep Assessments** — manual security audits
3. **Consulting** — implementation, training
4. **Data Services** — API access to scores

---

## Финансовые проекции

### Консервативный сценарий

| Период | Клиентов | MRR | ARR | Net Profit |
|--------|----------|-----|-----|------------|
| Year 1 | 15 | 600k₽ | 7.2M₽ | -8M₽ (invest) |
| Year 2 | 50 | 2.5M₽ | 30M₽ | 5M₽ |
| Year 3 | 120 | 6M₽ | 72M₽ | 25M₽ |

**3-year profit: ~22M₽**
**Exit (5x ARR): 360M₽**

### Оптимистичный сценарий

| Период | Клиентов | ARR |
|--------|----------|-----|
| Year 3 | 250 | 150M₽ |

**Exit: 750M₽**

### Breakeven

- **Fixed costs:** 3M₽/mo (team of 8 + data + infra)
- **Breakeven:** 75 clients × 40k ARPU
- **Timeline:** Month 18-24

---

## Источники данных для скоринга

### Публичные данные (автоматический скоринг)

| Источник | Что даёт | Доступность |
|----------|----------|-------------|
| DNS records | Конфигурация, SPF/DKIM | Бесплатно |
| SSL certificates | Шифрование, expiry | Бесплатно |
| Open ports (Shodan) | Уязвимые сервисы | API (платно) |
| Website headers | Security headers | Бесплатно |
| Breach databases | Утечки email | API (платно) |
| Санкционные списки | SDN, EU, UN | Бесплатно/API |
| ЕГРЮЛ/ЕГРИП | Юридические данные | API (ФНС) |

### Questionnaire данные (от поставщика)

| Категория | Вопросы |
|-----------|---------|
| Access Control | MFA, password policy |
| Data Protection | Encryption, backups |
| Incident Response | Plan, contacts |
| Compliance | ISO 27001, SOC 2, 152-ФЗ |
| Third Parties | Sub-processors |

### Scoring Model

```
Security Score =
  0.3 × Technical Score (DNS, SSL, ports) +
  0.3 × Questionnaire Score +
  0.2 × Compliance Score (certs, audits) +
  0.2 × Incident History (breaches, news)
```

---

## Go-to-Market

### Target Customers

**Primary:** CISO, Compliance, Procurement в enterprise

| Сегмент | Размер | Pain | WTP |
|---------|--------|------|-----|
| Банки | 500+ | ЦБ требует vendor assessment | Very High |
| Страховые | 200+ | Регуляторные требования | High |
| Госсектор | 1000+ | 152-ФЗ, закупки | High |
| Телеком | 50+ | Критическая инфра | High |
| Крупный retail | 200+ | PCI DSS, поставщики | Medium |
| IT-компании | 500+ | ISO 27001, клиенты требуют | Medium |

### Sales Motion

**Enterprise sales (длинный цикл):**

1. **Awareness** — Habr статьи, конференции (PHDays, SOC Forum)
2. **Interest** — Вебинары, white papers про 152-ФЗ
3. **Demo** — Персональная демонстрация
4. **POC** — Pilot на 10-20 vendors (бесплатно)
5. **Negotiate** — Procurement, legal
6. **Close** — 3-6 месяцев цикл

### Channels

| Канал | CAC | Volume | Notes |
|-------|-----|--------|-------|
| **Direct sales** | High | Low | Ключевые клиенты |
| **Conferences** | Medium | Medium | PHDays, ИБ-форумы |
| **Content** | Low | Medium | Habr, вебинары |
| **Partners** | Medium | High | ИБ-интеграторы |
| **СПАРК integration** | — | — | Co-sell opportunity |

### Partnerships

| Партнёр | Тип | Выгода |
|---------|-----|--------|
| **СПАРК** | Data integration | Финансовые данные |
| **ИБ-интеграторы** | Reseller | Доступ к enterprise |
| **Консалтинг (Big 4)** | Referral | Аудиторы рекомендуют |
| **GRC-платформы** | Integration | Cross-sell |

---

## Техническая реализация

### Stack (предложение)

| Компонент | Технология |
|-----------|------------|
| Backend | Python (Django/FastAPI) |
| Frontend | React + TypeScript |
| Database | PostgreSQL + Elasticsearch |
| Scoring Engine | Python + ML models |
| Scanning | Go (async, high-volume) |
| Infrastructure | Yandex Cloud |

### Key Technical Challenges

1. **Data collection** — scanning, APIs, scraping
2. **Scoring accuracy** — ML model training, false positives
3. **Questionnaire workflow** — email, reminders, portal
4. **Integrations** — СПАРК, GRC, SSO
5. **Compliance** — сами должны быть compliant (152-ФЗ)

### MVP Scope (Month 1-4)

| Feature | Priority |
|---------|----------|
| Vendor inventory | P0 |
| Basic scoring (DNS, SSL, headers) | P0 |
| Questionnaire templates | P0 |
| Dashboard | P0 |
| Email notifications | P0 |
| Risk tiering | P1 |
| СПАРК integration | P1 |
| Reports (PDF) | P1 |
| API | P2 |

**MVP бюджет:** 3-4M₽ (5 developers × 4 months + data costs)

---

## Риски и митигация

| Риск | Вероятность | Импакт | Митигация |
|------|-------------|--------|-----------|
| **Длинный sales cycle** | High | High | Freemium/trial, партнёры |
| **СПАРК добавит security** | Medium | High | Двигаться быстро, глубина |
| **Data access issues** | Medium | Medium | Multiple sources, partnerships |
| **Enterprise complexity** | High | Medium | Нанять enterprise sales |
| **Low WTP в России** | Medium | Medium | ROI калькулятор, case studies |

### Почему СПАРК не сделает это

1. **Разный фокус** — они про финансы, не про ИБ
2. **Разные клиенты** — у них юристы, у нас CISO
3. **Разная экспертиза** — cybersecurity ≠ financial analysis
4. **M&A opportunity** — могут купить нас

---

## Честная оценка

### Аргументы ЗА

1. **Нет конкурентов** — СПАРК не делает security, западные дороги
2. **Regulatory tailwind** — 152-ФЗ, санкции, ЦБ требования
3. **High WTP** — enterprise платит за risk management
4. **Отличная unit economics** — LTV:CAC 7.2:1
5. **Defensible** — данные + модели = moat
6. **M&A potential** — СПАРК, Positive Technologies, Kaspersky

### Аргументы ПРОТИВ

1. **Long sales cycle** — 3-6 месяцев, нужен capital
2. **Enterprise sales** — нужна команда, дорого
3. **Data challenges** — сбор данных непрост
4. **Education market** — многие не знают что им нужно VRM
5. **Complex product** — много функций, долго строить

### Вероятности успеха

| Сценарий | Вероятность | Результат |
|----------|-------------|-----------|
| Не взлетит | 35% | -10M₽ |
| Нишевой | 40% | 30M₽ за 3 года |
| Лидер | 25% | 150M₽+ за 3 года |

**Expected value:** 0.35 × (-10) + 0.4 × 30 + 0.25 × 150 = -3.5 + 12 + 37.5 = **46M₽**

---

## Вердикт

### ★★★★☆ Хорошая возможность

**Сильнее чем:**
- Compliance (более уникальная ниша)
- Background Checks (выше ARPU)
- Error Monitoring (выше WTP)

**Слабее чем:**
- Security Awareness (проще GTM)

**Почему делать:**
1. Пустая ниша в России
2. Regulatory pressure растёт
3. High enterprise WTP
4. M&A potential

**Когда НЕ делать:**
1. Нет capital на 18-24 мес runway
2. Нет enterprise sales experience
3. Нет доступа к enterprise buyers

---

## Action Plan

### Phase 1: MVP + First Clients (Month 1-6)

**Team:** 5-6 people (3 dev, 1 product, 1 sales, 1 data)

**Deliverables:**
1. Vendor inventory + dashboard
2. Basic security scoring
3. Questionnaire workflow
4. 3-5 pilot clients (free)

**Budget:** 5M₽

### Phase 2: Product-Market Fit (Month 7-12)

**Deliverables:**
1. СПАРК integration
2. Advanced scoring (ML)
3. Continuous monitoring
4. Compliance reports
5. 15-20 paying clients

**Target ARR:** 10M₽

### Phase 3: Scale (Month 13-24)

**Deliverables:**
1. API platform
2. Partner program
3. Enterprise features (SSO, audit)
4. 50-100 clients

**Target ARR:** 50M₽

---

## Comparison with Other Ideas

| Factor | VRM | Error Monitoring | Security Awareness |
|--------|-----|-----------------|-------------------|
| Market gap | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Competition | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| WTP | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Sales complexity | ★★☆☆☆ | ★★★★★ | ★★★☆☆ |
| Time to revenue | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ |
| Technical complexity | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| Exit potential | ★★★★☆ | ★★★★☆ | ★★★★★ |

**VRM = highest WTP, but longest sales cycle**

---

## Sources

### Global Market
- [Grand View Research: TPRM Market](https://www.grandviewresearch.com/industry-analysis/third-party-risk-management-market-report)
- [Research Nester: TPRM Market](https://www.researchnester.com/reports/third-party-risk-management-market/5758)
- [Globe Newswire: TPRM 2025](https://www.globenewswire.com/news-release/2025/02/12/3025210/28124/en/Third-Party-Risk-Management-Business-Research-Report-2025-Global-Market-to-Reach-18-7-Billion-by-2030-TPCRM-Can-No-Longer-Be-Ignored.html)

### Competitors
- [SecurityScorecard](https://securityscorecard.com/)
- [BitSight](https://www.bitsight.com/)
- [СПАРК-Интерфакс](https://spark-interfax.com/)
- [TAdviser: СПАРК](https://www.tadviser.ru/index.php/Продукт:СПАРК-Интерфакс)

### Pricing Research
- [BitSight vs SecurityScorecard](https://www.upguard.com/compare/bitsight-vs-securityscorecard)
- [Thomas Murray: Security Ratings Comparison](https://thomasmurray.com/bitsight-or-securityscorecard-2025-comparison)

*Last updated: January 2025*
