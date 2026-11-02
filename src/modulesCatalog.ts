import type { L } from "@/i18n";

/**
 * Каталог модулей платформы — публичная часть. Сверен с docs/modules/README.md
 * и supabase/functions/_shared/pricingTiers.ts в репо core (02.11.2026):
 * состав тарифов, докупаемые модули и статусы — оттуда. Цен модулей здесь нет:
 * тарифы считает core (edge platform-stats), остальное — в коммерческом предложении.
 *
 * billing: как модуль попадает к обменнику.
 *   start    — входит в тариф «Старт» (и в «Бизнес»)
 *   business — входит в тариф «Бизнес»
 *   addon    — докупается к любому тарифу
 *   deal     — по договорённости (нет публичной цены)
 *   soon     — в разработке
 */
export type Billing = "start" | "business" | "addon" | "deal" | "soon";

export interface CatalogModule {
  name: string;
  nameEn?: string;
  billing: Billing;
  desc: L;
}

export interface CatalogCategory {
  key: string;
  label: L;
  modules: CatalogModule[];
}

export const CATALOG: CatalogCategory[] = [
  {
    key: "kyc",
    label: { ru: "Проверка личности", en: "Identity verification" },
    modules: [
      {
        name: "ASystem KYC",
        billing: "start",
        desc: { ru: "Паспорт и селфи проверяет ваш офицер в админке", en: "Your officer reviews passport and selfie in the admin panel" },
      },
      {
        name: "Didit",
        billing: "business",
        desc: { ru: "Автоматическая проверка документа и лица", en: "Automated document and face check" },
      },
      {
        name: "BiometricVision",
        billing: "business",
        desc: { ru: "Второй автоматический провайдер на выбор", en: "Second automated provider of your choice" },
      },
    ],
  },
  {
    key: "aml",
    label: { ru: "Комплаенс", en: "Compliance" },
    modules: [
      {
        name: "Comply Core",
        billing: "start",
        desc: { ru: "Перечни ГСФР, 156 кодов, лимиты, холд спорных заявок", en: "SFIS lists, 156 codes, limits, hold on disputed orders" },
      },
      {
        name: "Ranex KYT",
        billing: "start",
        desc: { ru: "Проверка крипто-адреса до выплаты", en: "Crypto address screening before payout" },
      },
      {
        name: "Отчёты Финнадзор",
        nameEn: "FinSupervision reports",
        billing: "business",
        desc: { ru: "Реестры сделок и клиентов собираются сами", en: "Deal and client registries build themselves" },
      },
    ],
  },
  {
    key: "payments",
    label: { ru: "Деньги", en: "Money" },
    modules: [
      {
        name: "Finik: приём по QR",
        nameEn: "Finik: QR payments",
        billing: "business",
        desc: { ru: "Клиент платит по QR лицензированному эквайеру", en: "The client pays by QR to a licensed acquirer" },
      },
      {
        name: "Finik: выплаты",
        nameEn: "Finik: payouts",
        billing: "soon",
        desc: { ru: "Автоматическая выплата сомов после сделки", en: "Automatic KGS payout after the deal" },
      },
      {
        name: "Автообмен",
        nameEn: "Auto-exchange",
        billing: "soon",
        desc: { ru: "Покупка и продажа без сотрудника: горячий кошелёк, распознавание прихода, авто-выплата", en: "Buy and sell with no staff: hot wallet, deposit recognition, automatic payout" },
      },
      {
        name: "Кошельки DFNS",
        nameEn: "DFNS wallets",
        billing: "deal",
        desc: { ru: "Клиент хранит крипту у обменника", en: "Clients keep crypto with the exchange" },
      },
    ],
  },
  {
    key: "rates",
    label: { ru: "Курсы и мониторинги", en: "Rates and monitors" },
    modules: [
      {
        name: "Автокурс",
        nameEn: "Auto rates",
        billing: "addon",
        desc: { ru: "Пара от рынка с вашей наценкой, фиат по НБ КР", en: "Market pair with your margin, fiat at the NBKR rate" },
      },
      {
        name: "Выгрузка курсов",
        nameEn: "Rates export",
        billing: "addon",
        desc: { ru: "rates.xml и rates.json для BestChange и других мониторингов", en: "rates.xml and rates.json for BestChange and other monitors" },
      },
    ],
  },
  {
    key: "client",
    label: { ru: "Связь с клиентом", en: "Client communication" },
    modules: [
      {
        name: "Письма",
        nameEn: "Email",
        billing: "start",
        desc: { ru: "Статусы заявки и вход с вашего домена", en: "Order statuses and login from your domain" },
      },
      {
        name: "SMS",
        billing: "business",
        desc: { ru: "Те же статусы по SMS, аккаунт оператора у Nikita", en: "Same statuses by SMS from your Nikita account" },
      },
      {
        name: "Telegram",
        billing: "addon",
        desc: { ru: "Бот обменника: клиентам статусы, сотрудникам каждая смена", en: "The exchange's bot: statuses to clients, every change to staff" },
      },
      {
        name: "Онлайн-чат Jivo",
        nameEn: "Jivo live chat",
        billing: "addon",
        desc: { ru: "Окно чата на витрине, аккаунт Jivo ваш", en: "Chat window on the storefront, your Jivo account" },
      },
      {
        name: "Блог",
        nameEn: "Blog",
        billing: "addon",
        desc: { ru: "Статьи, которые видят поисковики", en: "Articles search engines can see" },
      },
      {
        name: "Приложение на телефон",
        nameEn: "Phone app",
        billing: "addon",
        desc: { ru: "Сайт ставится на телефон как приложение", en: "The site installs on a phone as an app" },
      },
    ],
  },
  {
    key: "tools",
    label: { ru: "Вход и документы", en: "Login and documents" },
    modules: [
      {
        name: "Двухфакторный вход",
        nameEn: "Two-factor login",
        billing: "start",
        desc: { ru: "Для сотрудников и клиентов", en: "For staff and clients" },
      },
      {
        name: "Проверка знаний",
        nameEn: "Knowledge check",
        billing: "start",
        desc: { ru: "Квиз клиента перед первой сделкой", en: "Client quiz before the first deal" },
      },
      {
        name: "Генерация документов",
        nameEn: "Document generation",
        billing: "soon",
        desc: { ru: "Договор и акт с подписью и печатью", en: "Contract and act with signature and stamp" },
      },
    ],
  },
];

export const MODULE_COUNT = CATALOG.reduce((n, c) => n + c.modules.length, 0);

export const moduleName = (m: CatalogModule, lang: "ru" | "en") =>
  lang === "en" && m.nameEn ? m.nameEn : m.name;

export const BILLING_LABEL: Record<Billing, L> = {
  start: { ru: "в «Старте»", en: "in Start" },
  business: { ru: "в «Бизнесе»", en: "in Business" },
  addon: { ru: "докупается", en: "add-on" },
  deal: { ru: "по договорённости", en: "by arrangement" },
  soon: { ru: "скоро", en: "soon" },
};
