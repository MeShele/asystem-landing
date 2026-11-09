/**
 * Копирайт лендинга (RU — канон, EN — зеркало в content.en.ts).
 * Коротко: одна мысль на фразу. Только то, что платформа делает сейчас; перед правкой
 * сверить с репо core: docs/modules/README.md, supabase/functions/_shared/pricingTiers.ts.
 * Без имён клиентов, без цен в валюте (закон № 91: на витрине только сомы).
 */

import type { Graph } from "@/lib/schema";

export const NAV = [
  { label: "Что внутри", href: "#features" },
  { label: "Требования", href: "#law" },
  { label: "Запуск", href: "#how" },
  { label: "Тарифы", href: "#pricing" },
  { label: "Чек-лист", href: "/blueprint" },
];

export const DEMO_URL = "https://demo.asystem.ai";

export const HERO = {
  h1Lines: ["Платформа для обменников", "по закону Кыргызстана"],
  sub: "Готовый софт для лицензированного обменника: сайт, кабинет клиента, админка и отчётность для ГСФР.",
  cta: "Запросить демо",
  ctaSecondary: "Открыть демо-стенд",
  demoUrl: DEMO_URL,
  fact: (n: number | null) => (n ? `${n} обменников уже работают` : "Обменники уже работают"),
  facts: ["Сервер в Бишкеке", "Запуск до 14 дней"],
  shotLabel: "Путь заявки: клиент, сайт обменника, оплата, оператор, Финнадзор",
  /** Главная схема сайта: путь одной заявки через закон. Дальше секции показывают её участки. */
  schema: {
    cols: 5,
    nodes: [
      { id: "client", col: 1, row: 1, title: "Клиент", text: "Регистрация и KYC до первой сделки" },
      { id: "site", col: 2, row: 1, title: "Сайт обменника", text: "Ваш домен, курс фиксируется в заявке" },
      { id: "pay", col: 3, row: 1, title: "Оплата", text: "Перевод или QR Finik, подтверждение автоматом" },
      { id: "operator", col: 4, row: 1, title: "Оператор", text: "Сверка с перечнями ГСФР, выдача" },
      { id: "fin", col: 5, row: 1, kind: "accent", title: "Финнадзор", text: "Реестры собираются из заявок" },
      { id: "server", col: 1, row: 2, span: 5, kind: "ghost", title: "Сервер в Бишкеке", text: "Данные хранятся пять лет, бэкап каждый день, домен и бренд ваши" },
    ],
    edges: [
      { from: "client", to: "site" }, { from: "site", to: "pay" }, { from: "pay", to: "operator" }, { from: "operator", to: "fin" },
    ],
    route: ["client", "site", "pay", "operator", "fin"],
  } as Graph,
};

export const PROOF = {
  lead: "Работает вместе с",
  names: ["Didit", "BiometricVision", "Finik", "Ranex KYT", "Jivo", "Telegram"],
};

/** Экскурсия по продукту: четыре участка общей схемы крупным планом. */
export const TOUR = {
  eyebrow: "Этап 1 · работает сейчас",
  title: "Что внутри",
  lead: "Четыре части платформы. Вживую всё это открыто на демо-стенде.",
  items: [
    {
      key: "store", title: "Витрина", text: "Ваш домен и курсы. Купить, продать, обменять.",
      schema: {
        cols: 3,
        nodes: [
          { id: "domain", col: 1, row: 1, kind: "ghost", title: "Ваш домен", text: "your-exchange.kg, ваш бренд" },
          { id: "choose", col: 2, row: 1, title: "Купить, продать, обменять", text: "Клиент выбирает направление и сумму" },
          { id: "order", col: 3, row: 1, kind: "accent", title: "Заявка создана", text: "Курс зафиксирован, реквизиты выданы" },
          { id: "kyc", col: 2, row: 2, kind: "side", title: "Вход и KYC", text: "До первой сделки: 18+, резидентство" },
        ],
        edges: [{ from: "domain", to: "choose" }, { from: "choose", to: "order" }, { from: "kyc", to: "choose", dashed: true }],
        route: ["domain", "choose", "order"],
      } as Graph,
    },
    {
      key: "cabinet", title: "Кабинет клиента", text: "KYC, заявки, оплата по QR, документы.",
      schema: {
        cols: 4,
        nodes: [
          { id: "created", col: 1, row: 1, title: "Заявка создана", text: "Курс и реквизиты внутри" },
          { id: "paid", col: 2, row: 1, title: "Оплачена", text: "QR Finik или перевод" },
          { id: "issued", col: 3, row: 1, title: "Выдана", text: "Хэш транзакции в заявке" },
          { id: "done", col: 4, row: 1, kind: "accent", title: "Завершена", text: "Чек и история в кабинете" },
          { id: "kyc", col: 1, row: 2, kind: "side", title: "KYC", text: "Один раз до первой сделки: 18+, резидентство" },
          { id: "docs", col: 4, row: 2, kind: "side", title: "Оферта и согласия", text: "Сохраняются с временем и IP" },
        ],
        edges: [
          { from: "created", to: "paid" }, { from: "paid", to: "issued" }, { from: "issued", to: "done" },
          { from: "kyc", to: "created", dashed: true }, { from: "docs", to: "done", dashed: true },
        ],
        route: ["created", "paid", "issued", "done"],
      } as Graph,
    },
    {
      key: "admin", title: "Админка", text: "Заявки, сотрудники, сверка с перечнями ГСФР.",
      schema: {
        cols: 3,
        nodes: [
          { id: "waitpay", col: 1, row: 1, title: "Ожидает оплаты", text: "Заявка видна сотруднику" },
          { id: "waitissue", col: 2, row: 1, title: "Ожидает выдачи", text: "Сотрудник подтверждает и отправляет" },
          { id: "done", col: 3, row: 1, kind: "accent", title: "Завершено", text: "С хэшем транзакции" },
          { id: "compliance", col: 1, row: 2, title: "Проверка комплаенс", text: "Совпадение с перечнями ГСФР: заявка ждёт решения офицера" },
          { id: "staff", col: 2, row: 2, kind: "side", title: "Сотрудники", text: "Роли и права" },
          { id: "ready", col: 3, row: 2, kind: "side", title: "Чек-лист готовности", text: "Что заполнить до запуска" },
        ],
        edges: [
          { from: "waitpay", to: "waitissue" }, { from: "waitissue", to: "done" },
          { from: "waitpay", to: "compliance", dashed: true }, { from: "compliance", to: "waitissue", dashed: true },
        ],
        route: ["waitpay", "waitissue", "done"],
      } as Graph,
    },
    {
      key: "reports", title: "Отчёты в Финнадзор", text: "Реестры собираются из заявок сами.",
      schema: {
        cols: 3,
        nodes: [
          { id: "orders", col: 1, row: 2, title: "Заявки за месяц", text: "Каждая со временем, курсом и клиентом" },
          { id: "r4", col: 2, row: 1, title: "Продажа ВА", text: "Приложение 4/о" },
          { id: "r5", col: 2, row: 2, title: "Покупка ВА", text: "Приложение 5/о" },
          { id: "r6", col: 2, row: 3, title: "Обмен ВА", text: "Приложение 6/о" },
          { id: "fin", col: 3, row: 2, kind: "accent", title: "Финнадзор", text: "Файл отчёта и сопроводительное письмо" },
        ],
        edges: [
          { from: "orders", to: "r4" }, { from: "orders", to: "r5" }, { from: "orders", to: "r6" },
          { from: "r4", to: "fin" }, { from: "r5", to: "fin" }, { from: "r6", to: "fin" },
        ],
        route: ["orders", "r5", "fin"],
      } as Graph,
    },
  ],
};

export const WHO = {
  title: "Для кого",
  labelYes: "Подходит",
  labelNo: "Не подходит",
  cards: [
    { text: "Есть или оформляете лицензию оператора обмена виртуальных активов." },
    { text: "Обменник есть, но не проходит проверку ГСФР." },
    { text: "Анонимный обмен, биржа, работа без лицензии.", no: true },
  ],
};

export const LAW = {
  title: "Требования ГСФР и что уже в платформе",
  lead: "Семь из восьми требований закрывает платформа. Запись переговоров остаётся у обменника.",
  head: ["Что требует ГСФР", "Как сделано", "Статус"],
  status: { done: "Готово", you: "Ваша сторона" },
  rows: [
    { req: "KYC до первой сделки, 18+, резидентство", how: "Свой KYC, Didit или BiometricVision", status: "done" },
    { req: "Сверка с перечнями ГСФР и санкциями", how: "Совпадение останавливает заявку до решения офицера", status: "done" },
    { req: "Один клиент — один кабинет, согласие, оферта", how: "Дубли по ИНН блокируются, согласия с временем и IP", status: "done" },
    { req: "Время заявки, документы пять лет, бэкап", how: "История каждой заявки, бэкап каждый день", status: "done" },
    { req: "Серверы в Кыргызстане", how: "Свой сервер в дата-центре в Бишкеке", status: "done" },
    { req: "Безнал и отчёты в Финнадзор", how: "Перевод или QR, реестры из заявок", status: "done" },
    { req: "Проверка кошельков Ranex", how: "Встроен, ключ выдаёт Ranex обменнику", status: "done" },
    { req: "Запись переговоров, пять лет", how: "Телефония и мессенджеры обменника", status: "you" },
  ],
  source: "Источник: требования ГСФР к платформам обмена виртуальных активов, июнь 2026.",
};

export const AUTOMATION = {
  eyebrow: "Этап 2 · модуль «Автообмен»",
  title: "Сделка без сотрудника",
  lead: "Покупка и продажа проходят без участия сотрудника: оплату подтверждает Finik, крипту отправляет платформа.",
  note: "Заявки выше порога комплаенса остаются на ручной проверке офицера.",
  flows: [
    {
      key: "buy", title: "Покупка",
      schema: {
        cols: 3,
        nodes: [
          { id: "pay", col: 1, row: 1, title: "Клиент платит по QR Finik", text: "Finik подтверждает оплату" },
          { id: "send", col: 2, row: 1, title: "Платформа отправляет крипту", text: "С горячего кошелька обменника" },
          { id: "done", col: 3, row: 1, kind: "accent", title: "Заявка закрыта", text: "Сеть подтвердила, хэш в заявке" },
          { id: "staff", col: 2, row: 2, kind: "ghost", title: "Сотрудник", text: "Не участвует" },
        ],
        edges: [{ from: "pay", to: "send" }, { from: "send", to: "done" }, { from: "send", to: "staff", dashed: true }],
        route: ["pay", "send", "done"],
      } as Graph,
    },
    {
      key: "sell", title: "Продажа",
      schema: {
        cols: 3,
        nodes: [
          { id: "transfer", col: 1, row: 1, title: "Клиент переводит сумму из заявки", text: "На адрес обменника" },
          { id: "detect", col: 2, row: 1, title: "Платформа узнаёт приход", text: "По уникальной сумме заявки" },
          { id: "payout", col: 3, row: 1, kind: "accent", title: "Finik выплачивает сомы", text: "Заявка закрыта" },
          { id: "staff", col: 2, row: 2, kind: "ghost", title: "Сотрудник", text: "Не участвует" },
        ],
        edges: [{ from: "transfer", to: "detect" }, { from: "detect", to: "payout" }, { from: "detect", to: "staff", dashed: true }],
        route: ["transfer", "detect", "payout"],
      } as Graph,
    },
  ],
};

export const STEPS = {
  title: "Запуск за четыре шага",
  note: "До 14 дней после оплаты.",
  schema: {
    cols: 4,
    nodes: [
      { id: "contract", col: 1, row: 1, title: "Договор", text: "Тариф, договор на три месяца" },
      { id: "server", col: 2, row: 1, title: "Сервер", text: "Сервер в Бишкеке, домен, SSL" },
      { id: "setup", col: 3, row: 1, title: "Настройка", text: "Бренд, валюты, курсы, реквизиты" },
      { id: "open", col: 4, row: 1, kind: "accent", title: "Открытие", text: "Обменник открыт, клиенты регистрируются" },
    ],
    edges: [{ from: "contract", to: "server" }, { from: "server", to: "setup" }, { from: "setup", to: "open" }],
    route: ["contract", "server", "setup", "open"],
  } as Graph,
};

export const PRICING = {
  title: "Тарифы",
  lead: (prepay: number) => `Сервер и комплаенс в каждом тарифе. Оплата за ${prepay} месяца вперёд.`,
  rateNote: (date: string) => `Цены в сомах по курсу НБ КР на ${date}, фиксируются в договоре.`,
  providersNote: "KYC, эквайринг и SMS — напрямую провайдерам.",
  noRate: "Цены пришлём в коммерческом предложении.",
  perMonth: "в месяц",
  setup: "подключение, разово",
  popular: "популярный",
  groups: {
    start: {
      title: "Старт",
      desc: "Всё, чтобы работать по лицензии.",
      points: ["Обменник на вашем домене", "Свой сервер в Кыргызстане", "Комплаенс под ГСФР", "ASystem KYC и Ranex KYT", "Письма, двухфакторный вход"],
    },
    business: {
      title: "Бизнес",
      desc: "Приём денег, отчёты и внешний KYC.",
      points: ["Всё, что в «Старте»", "Finik: приём по QR", "Отчёты Финнадзор", "Didit или BiometricVision", "SMS-уведомления"],
    },
    buyout: {
      title: "Выкуп",
      desc: "Платформа остаётся у вас насовсем.",
      points: ["Без ежемесячной платы", "Модули как в тарифах", "Сервер в Кыргызстане"],
      from: "от",
      unit: "разово, вместо подписки",
    },
    addons: {
      title: "Докупается к любому тарифу",
      price: "Цены в предложении.",
      items: [
        { name: "Telegram", desc: "бот клиентам и сотрудникам" },
        { name: "Онлайн-чат Jivo", desc: "окно чата на витрине" },
        { name: "Выгрузка курсов", desc: "BestChange и другие мониторинги" },
        { name: "Автокурс", desc: "пара от рынка с вашей наценкой" },
        { name: "Блог", desc: "статьи для поисковиков" },
        { name: "Приложение", desc: "сайт как приложение на телефоне" },
      ],
    },
  },
  cta: "Получить предложение",
};

export const FAQ = {
  title: "Вопросы",
  items: [
    { q: "Помогаете с лицензией?", a: "Лицензию получает обменник, мы делаем софт. Чек-лист требований бесплатный." },
    { q: "Кому принадлежат данные клиентов?", a: "Обменнику. Свой сервер и база в Кыргызстане." },
    { q: "Сколько занимает запуск?", a: "До 14 дней. Сервер за день, остальное — ваши реквизиты и договоры." },
    { q: "Можно выкупить платформу?", a: "Да, условия в договоре." },
    { q: "Почему цены в сомах?", a: "Так требует закон КР о рекламе. Сумма фиксируется в договоре." },
  ],
};

export const CTA = {
  title: "Показать платформу",
  sentence: "Созвон на 30 минут и коммерческое предложение в течение рабочего дня.",
  link: "Или откройте демо-стенд сами",
};

export const FOOTER = {
  about: "Платформа для лицензированных криптообменников Кыргызстана.",
  menuTitle: "Разделы",
  menu: [
    { label: "Что внутри", href: "#features" },
    { label: "Требования", href: "#law" },
    { label: "Запуск", href: "#how" },
    { label: "Тарифы", href: "#pricing" },
    { label: "Вопросы", href: "#faq" },
    { label: "Чек-лист запуска", href: "/blueprint" },
    { label: "Статус платформы", href: "/status" },
  ],
  contactTitle: "Связь",
  legal: "© 2026 ASystem Core, ОсОО «Асистем», Бишкек",
  disclaimer: "Лицензию оператора обмена виртуальных активов получает обменник. Мы поставляем программное обеспечение.",
};

export const LEAD = {
  title: "Покажем платформу вживую",
  sub: "Ответим в течение рабочего дня.",
  topics: [
    { key: "turnkey", label: "Обменник под ключ" },
    { key: "api", label: "Только ядра по API" },
    { key: "license", label: "Вопрос по лицензии" },
  ],
  name: "Имя",
  company: "Компания",
  contact: "Telegram, почта или телефон",
  send: "Отправить заявку",
  sending: "Отправляем…",
  sentTitle: "Заявка отправлена",
  sentText: "Свяжемся с вами в ближайшее время.",
  error: "Не удалось отправить. Напишите нам в Telegram или на почту.",
  consent: "Нажимая, вы соглашаетесь на обработку контактных данных.",
  attached: "К заявке приложено",
};
