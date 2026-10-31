import type { L } from "@/i18n";

/**
 * Реальный каталог модулей платформы (публичная часть). Статус честный:
 * "available" = работает сейчас (stable/beta), "soon" = в разработке/планах.
 * `domain` — для подгрузки логотипа провайдера; `own` — продукт ASystem.
 * Текстовые поля — пары {ru, en}: разворачиваются хелпером l() из useLang.
 */
export type ModuleStatus = "available" | "soon";

export interface CatalogModule {
  name: string;
  nameEn?: string; // для модулей с русским названием
  status: ModuleStatus;
  domain?: string; // для логотипа (logo.clearbit.com/{domain})
  own?: boolean; // собственный продукт ASystem → лаймовая марка
}

export interface CatalogCategory {
  key: string;
  label: L;
  icon: string; // ключ в ICONS
  blurb: L;
  desc: L; // развёрнутое описание ядра (для модалки)
  modules: CatalogModule[];
}

export const CATALOG: CatalogCategory[] = [
  {
    key: "kyc",
    label: { ru: "KYC / Верификация", en: "KYC / Verification" },
    icon: "UserCheck",
    blurb: {
      ru: "Проверка личности клиента — один провайдер на выбор.",
      en: "Client identity verification — one provider of your choice.",
    },
    desc: {
      ru: "Проверка личности клиента по паспорту и селфи. ASystem KYC — проверку проводит ваш офицер в админке. Didit и BiometricVision — автоматическая проверка документа и лица. Обменнику включается один провайдер; после проверки клиент сверяется с перечнями ГСФР.",
      en: "Client identity verification by passport and selfie. ASystem KYC — your officer reviews it in the admin panel. Didit and BiometricVision — automated document and face checks. One provider per exchange; after verification the client is screened against the SFIS lists.",
    },
    modules: [
      { name: "ASystem KYC", status: "available", own: true },
      { name: "Didit", status: "available", domain: "didit.me" },
      { name: "BiometricVision", status: "available" },
    ],
  },
  {
    key: "payments",
    label: { ru: "Платежи / Эквайринг", en: "Payments / Acquiring" },
    icon: "CreditCard",
    blurb: { ru: "Приём оплаты по QR и выплаты сомов.", en: "QR payments and KGS payouts." },
    desc: {
      ru: "Приём оплаты по QR через лицензированного эквайера Finik и автоматическая выплата сомов после сделки — без ручных переводов. Комиссию эквайера обменник платит провайдеру напрямую.",
      en: "QR payments via the licensed acquirer Finik and automatic KGS payouts after the deal — no manual transfers. The acquirer fee is paid to the provider directly.",
    },
    modules: [
      { name: "Finik QR", status: "available", domain: "finik.kg" },
    ],
  },
  {
    key: "aml",
    label: { ru: "AML / Комплайнс", en: "AML / Compliance" },
    icon: "ShieldAlert",
    blurb: { ru: "Скрининг, санкции, коды подозрительности.", en: "Screening, sanctions, suspicious-activity codes." },
    desc: {
      ru: "Скрининг клиентов и транзакций: санкционные и PEP-списки, оценка риска, 156 кодов подозрительности ГСФР, автоматические стоп-факторы и аккумулятор лимитов.",
      en: "Client and transaction screening: sanctions and PEP lists, risk scoring, 156 SFIS suspicious-activity codes, automatic stop factors and a limit accumulator.",
    },
    modules: [
      { name: "Comply Core (ГСФР)", nameEn: "Comply Core (SFIS)", status: "available", own: true },
      { name: "Ranex KYT", nameEn: "Ranex KYT", status: "available", domain: "ranex.kg" },
    ],
  },
  {
    key: "reporting",
    label: { ru: "Отчётность", en: "Reporting" },
    icon: "FileSpreadsheet",
    blurb: { ru: "Отчёты регулятору и выгрузки данных.", en: "Regulator reports and data exports." },
    desc: {
      ru: "Автоматическое формирование обязательной отчётности для Финнадзора в нужных форматах: реестры сделок и клиентов считаются сами, финансовые показатели офицер вводит раз в месяц. Форма «Данные комплайнс» входит сюда же — отдельным модулем не продаётся.",
      en: "Automated mandatory reporting for FinSupervision in the required formats: deal and client registries are computed automatically, financial figures are entered monthly by the officer. The compliance data form is included — not sold separately.",
    },
    modules: [
      { name: "Отчёты Финнадзор", nameEn: "FinSupervision reports", status: "available", own: true },
    ],
  },
  {
    key: "wallets",
    label: { ru: "Кошельки / Custody", en: "Wallets / Custody" },
    icon: "Wallet",
    blurb: {
      ru: "Кошельки клиентов внутри платформы — по договорённости.",
      en: "Client wallets inside the platform — by arrangement.",
    },
    desc: {
      ru: "Кошельки клиентов на DFNS внутри платформы: клиент хранит крипту у обменника, пополняет и выводит её по заявке. Подключаем по договорённости.",
      en: "Client wallets on DFNS inside the platform: clients keep crypto with the exchange, deposit and withdraw it by request. Connected by arrangement.",
    },
    modules: [
      { name: "DFNS Custody", status: "soon", domain: "dfns.co" },
    ],
  },
  {
    key: "tools",
    label: { ru: "Инструменты", en: "Tools" },
    icon: "Wrench",
    blurb: { ru: "Анкеты, документы, вход и витрина.", en: "Questionnaires, documents, login and storefront." },
    desc: {
      ru: "Вспомогательные модули для онбординга и операций: анкеты и квизы клиента, серверная генерация документов с подписью и печатью, двухфакторный вход для сотрудников и клиентов.",
      en: "Helper modules for onboarding and operations: client quizzes and questionnaires, server-side document generation with signature and stamp, two-factor login for staff and clients.",
    },
    modules: [
      { name: "Квиз / Анкета", nameEn: "Quiz / Questionnaire", status: "available", own: true },
      { name: "Генерация документов", nameEn: "Document generation", status: "available", own: true },
      { name: "Двухфакторный вход", nameEn: "Two-factor login", status: "available", own: true },
    ],
  },
  {
    key: "client",
    label: { ru: "Связь с клиентом и витрина", en: "Client communication & storefront" },
    icon: "Bell",
    blurb: {
      ru: "Уведомления, чат, блог и установка сайта как приложения.",
      en: "Notifications, chat, blog and installable app.",
    },
    desc: {
      ru: "Всё, что обменник показывает клиенту и чем с ним связывается: письма, SMS и Telegram о статусе заявки, чат с оператором на сайте, блог со статьями, которые видят поисковики, и установка сайта на телефон как приложения — без отдельной разработки под сторы.",
      en: "Everything the exchange shows and sends to its clients: email, SMS and Telegram about order status, live chat with an operator on the site, a blog for search engines, and installing the site on a phone as an app — no separate store development needed.",
    },
    modules: [
      { name: "Email-уведомления", nameEn: "Email notifications", status: "available", own: true },
      { name: "SMS-уведомления", nameEn: "SMS notifications", status: "available", own: true },
      { name: "Блог", nameEn: "Blog", status: "available", own: true },
      { name: "Мобильное приложение (PWA)", nameEn: "Mobile app (PWA)", status: "available", own: true },
      { name: "Telegram-уведомления", nameEn: "Telegram notifications", status: "available", own: true },
      { name: "Онлайн-чат Jivo", nameEn: "Jivo live chat", status: "available", domain: "jivo.ru" },
    ],
  },
  {
    key: "rates",
    label: { ru: "Курсы", en: "Rates" },
    icon: "RefreshCw",
    blurb: {
      ru: "Курс сам идёт за рынком и уходит на мониторинги.",
      en: "Rates follow the market and go to rate monitors.",
    },
    desc: {
      ru: "Автокурс считает курс от рынка с наценкой обменника — отдельно на покупку и продажу, курс сома к доллару берётся у НБ КР; править курсы руками больше не нужно. Выгрузка курсов отдаёт rates.xml и rates.json на домене обменника для BestChange, Kurs.expert, Exnode и других мониторингов — оттуда приходят клиенты.",
      en: "Auto-rates price each pair from the market with the exchange's markup — separately for buy and sell, with the KGS/USD rate from the National Bank; no more manual rate updates. Rate export serves rates.xml and rates.json on the exchange's domain for BestChange, Kurs.expert, Exnode and other monitors — a source of new clients.",
    },
    modules: [
      { name: "Автокурс", nameEn: "Auto-rates", status: "available", own: true },
      { name: "Выгрузка курсов для мониторингов", nameEn: "Rate export for monitors", status: "available", own: true },
    ],
  },
];

/** Сколько модулей в каталоге — для заголовков, чтобы число не расходилось со списком. */
export const MODULE_COUNT = CATALOG.reduce((n, c) => n + c.modules.length, 0);

/** Название модуля на активном языке */
export const moduleName = (m: CatalogModule, lang: "ru" | "en") =>
  lang === "en" && m.nameEn ? m.nameEn : m.name;
