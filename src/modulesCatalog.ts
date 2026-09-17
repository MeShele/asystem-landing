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
      ru: "Автоматическая верификация личности — выбираете одного провайдера.",
      en: "Automated identity verification — pick a single provider.",
    },
    desc: {
      ru: "Верификация личности клиентов: распознавание документов (OCR), сравнение лица и liveness, скоринг и проверка по санкционным спискам. Мульти-провайдер — выбираете одного, переключается тумблером без правки кода.",
      en: "Client identity verification: document OCR, face match and liveness, scoring and sanctions screening. Multi-provider — choose one and switch with a toggle, no code changes.",
    },
    modules: [
      { name: "ASystem KYC", status: "available", own: true },
      { name: "Didit", status: "available", domain: "didit.me" },
      { name: "BiometricVision", status: "available" },
      { name: "SumSub", status: "soon", domain: "sumsub.com" },
      { name: "Persona", status: "soon", domain: "withpersona.com" },
    ],
  },
  {
    key: "payments",
    label: { ru: "Платежи / Эквайринг", en: "Payments / Acquiring" },
    icon: "CreditCard",
    blurb: { ru: "Приём фиата, QR и эквайринг.", en: "Fiat acceptance, QR and card acquiring." },
    desc: {
      ru: "Приём фиатных платежей: QR (СБП и локальные системы), эквайринг карт и выплаты. Маршрутизация между провайдерами под вашу юрисдикцию и лимиты.",
      en: "Fiat payment acceptance: QR (instant payment systems), card acquiring and payouts. Provider routing tailored to your jurisdiction and limits.",
    },
    modules: [
      { name: "Finik QR", status: "available", domain: "finik.kg" },
      { name: "ElQR", status: "soon" },
      { name: "FreedomPay", status: "soon", domain: "freedompay.kg" },
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
      { name: "ComplyAdvantage", status: "soon", domain: "complyadvantage.com" },
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
      ru: "Хранение и выплаты через лицензированных провайдеров.",
      en: "Storage and payouts via licensed providers.",
    },
    desc: {
      ru: "Хранение и выплаты крипты через лицензированных custody-провайдеров: депозитные адреса, мульти-сеть, выплаты по заявкам — с разделением прав и аудитом.",
      en: "Crypto storage and payouts via licensed custody providers: deposit addresses, multi-network support, order-driven payouts — with role separation and audit.",
    },
    modules: [
      { name: "DFNS Custody", status: "soon", domain: "dfns.co" },
    ],
  },
  {
    key: "exchanges",
    label: { ru: "Биржи / Ликвидность", en: "Exchanges / Liquidity" },
    icon: "Repeat",
    blurb: { ru: "Подключение ликвидности с внешних бирж.", en: "Liquidity from external exchanges." },
    desc: {
      ru: "Подключение ликвидности с внешних бирж для покрытия объёмов и лучшего курса — по мере роста оборота обменника.",
      en: "Connect liquidity from external exchanges to cover volume and improve pricing — as your exchange turnover grows.",
    },
    modules: [
      { name: "Binance", status: "soon", domain: "binance.com" },
      { name: "ByBit", status: "soon", domain: "bybit.com" },
      { name: "Kraken", status: "soon", domain: "kraken.com" },
      { name: "WhiteBIT", status: "soon", domain: "whitebit.com" },
      { name: "Huobi (HTX)", status: "soon", domain: "htx.com" },
      { name: "Kagan Exchange", status: "soon" },
      { name: "TokenSpot", status: "soon" },
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
      ru: "Уведомления, блог и установка сайта как приложения.",
      en: "Notifications, blog and installable app.",
    },
    desc: {
      ru: "Всё, что обменник показывает клиенту и чем с ним связывается: письма и SMS о статусе заявки, блог для поисковиков и установка сайта на телефон как приложения — без отдельной разработки под сторы.",
      en: "Everything the exchange shows and sends to its clients: email and SMS about order status, a blog for search engines, and installing the site on a phone as an app — no separate store development needed.",
    },
    modules: [
      { name: "Email-уведомления", nameEn: "Email notifications", status: "available", own: true },
      { name: "SMS-уведомления", nameEn: "SMS notifications", status: "available", own: true },
      { name: "Блог", nameEn: "Blog", status: "available", own: true },
      { name: "Мобильное приложение (PWA)", nameEn: "Mobile app (PWA)", status: "available", own: true },
    ],
  },
];

/** Название модуля на активном языке */
export const moduleName = (m: CatalogModule, lang: "ru" | "en") =>
  lang === "en" && m.nameEn ? m.nameEn : m.name;
