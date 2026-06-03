/**
 * Реальный каталог модулей платформы (публичная часть). Статус честный:
 * "available" = работает сейчас (stable/beta), "soon" = в разработке/планах.
 * `domain` — для подгрузки логотипа провайдера; `own` — продукт ASystem.
 */
export type ModuleStatus = "available" | "soon";

export interface CatalogModule {
  name: string;
  status: ModuleStatus;
  domain?: string; // для логотипа (logo.clearbit.com/{domain})
  own?: boolean; // собственный продукт ASystem → лаймовая марка
}

export interface CatalogCategory {
  key: string;
  label: string;
  icon: string; // ключ в ICONS
  blurb: string;
  desc: string; // развёрнутое описание ядра (для модалки)
  modules: CatalogModule[];
}

export const CATALOG: CatalogCategory[] = [
  {
    key: "kyc",
    label: "KYC / Верификация",
    icon: "UserCheck",
    blurb: "Автоматическая верификация личности — выбираете одного провайдера.",
    desc: "Верификация личности клиентов: распознавание документов (OCR), сравнение лица и liveness, скоринг и проверка по санкционным спискам. Мульти-провайдер — выбираете одного, переключается тумблером без правки кода.",
    modules: [
      { name: "ASystem KYC", status: "available", own: true },
      { name: "Didit", status: "available", domain: "didit.me" },
      { name: "BiometricVision", status: "available" },
      { name: "SumSub", status: "available", domain: "sumsub.com" },
      { name: "Persona", status: "soon", domain: "withpersona.com" },
    ],
  },
  {
    key: "payments",
    label: "Платежи / Эквайринг",
    icon: "CreditCard",
    blurb: "Приём фиата, QR и эквайринг.",
    desc: "Приём фиатных платежей: QR (СБП и локальные системы), эквайринг карт и выплаты. Маршрутизация между провайдерами под вашу юрисдикцию и лимиты.",
    modules: [
      { name: "Finik QR", status: "available", domain: "finik.kg" },
      { name: "CoreX Acquiring", status: "available" },
      { name: "ElQR", status: "soon" },
      { name: "FreedomPay", status: "soon", domain: "freedompay.kg" },
    ],
  },
  {
    key: "aml",
    label: "AML / Комплайнс",
    icon: "ShieldAlert",
    blurb: "Скрининг, санкции, коды подозрительности.",
    desc: "Скрининг клиентов и транзакций: санкционные и PEP-списки, оценка риска, 156 кодов подозрительности ГСФР, автоматические стоп-факторы и аккумулятор лимитов.",
    modules: [
      { name: "Comply Core (ГСФР)", status: "available", own: true },
      { name: "ComplyAdvantage", status: "soon", domain: "complyadvantage.com" },
    ],
  },
  {
    key: "reporting",
    label: "Отчётность",
    icon: "FileSpreadsheet",
    blurb: "Отчёты регулятору и выгрузки данных.",
    desc: "Автоматическое формирование обязательной отчётности для Финнадзора в нужных форматах и выгрузка данных комплайнс — без ручной сборки в Excel.",
    modules: [
      { name: "Отчёты Финнадзор", status: "soon", own: true },
      { name: "Данные комплайнс", status: "soon", own: true },
    ],
  },
  {
    key: "wallets",
    label: "Кошельки / Custody",
    icon: "Wallet",
    blurb: "Хранение и выплаты через лицензированных провайдеров.",
    desc: "Хранение и выплаты крипты через лицензированных custody-провайдеров: депозитные адреса, мульти-сеть, выплаты по заявкам — с разделением прав и аудитом.",
    modules: [
      { name: "ORGON Custody", status: "available" },
      { name: "DFNS Custody", status: "soon", domain: "dfns.co" },
      { name: "Argon", status: "soon" },
      { name: "SofinaPro", status: "soon" },
    ],
  },
  {
    key: "exchanges",
    label: "Биржи / Ликвидность",
    icon: "Repeat",
    blurb: "Подключение ликвидности с внешних бирж.",
    desc: "Подключение ликвидности с внешних бирж для покрытия объёмов и лучшего курса — по мере роста оборота обменника.",
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
    label: "Инструменты",
    icon: "Wrench",
    blurb: "Анкеты, документы и вспомогательные модули.",
    desc: "Вспомогательные модули для онбординга и операций: анкеты/квизы клиента и генерация документов.",
    modules: [
      { name: "Квиз / Анкета", status: "soon", own: true },
      { name: "Генерация документов", status: "soon", own: true },
    ],
  },
];
