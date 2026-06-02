/**
 * Реальный каталог модулей платформы (публичная часть). Статус честный:
 * "available" = работает сейчас (stable/beta), "soon" = в разработке/планах.
 * Внутренние/скрытые модули не публикуем.
 */
export type ModuleStatus = "available" | "soon";

export interface CatalogModule {
  name: string;
  status: ModuleStatus;
}

export interface CatalogCategory {
  key: string;
  label: string;
  icon: string; // ключ в ICONS
  blurb: string;
  modules: CatalogModule[];
}

export const CATALOG: CatalogCategory[] = [
  {
    key: "kyc",
    label: "KYC / Верификация",
    icon: "UserCheck",
    blurb: "Автоматическая верификация личности — выбираете одного провайдера.",
    modules: [
      { name: "ASystem KYC", status: "available" },
      { name: "Didit", status: "available" },
      { name: "BiometricVision", status: "available" },
      { name: "SumSub", status: "available" },
      { name: "Persona", status: "soon" },
    ],
  },
  {
    key: "payments",
    label: "Платежи / Эквайринг",
    icon: "CreditCard",
    blurb: "Приём фиата, QR и эквайринг.",
    modules: [
      { name: "Finik QR", status: "available" },
      { name: "CoreX Acquiring", status: "available" },
      { name: "ElQR", status: "soon" },
      { name: "FreedomPay", status: "soon" },
    ],
  },
  {
    key: "aml",
    label: "AML / Комплайнс",
    icon: "ShieldAlert",
    blurb: "Скрининг, санкции, коды подозрительности.",
    modules: [
      { name: "Comply Core (ГСФР)", status: "available" },
      { name: "ComplyAdvantage", status: "soon" },
    ],
  },
  {
    key: "reporting",
    label: "Отчётность",
    icon: "FileSpreadsheet",
    blurb: "Отчёты регулятору и выгрузки данных.",
    modules: [
      { name: "Отчёты Финнадзор", status: "soon" },
      { name: "Данные комплайнс", status: "soon" },
    ],
  },
  {
    key: "wallets",
    label: "Кошельки / Custody",
    icon: "Wallet",
    blurb: "Хранение и выплаты через лицензированных провайдеров.",
    modules: [
      { name: "ORGON Custody", status: "available" },
      { name: "DFNS Custody", status: "soon" },
      { name: "Argon", status: "soon" },
      { name: "SofinaPro", status: "soon" },
    ],
  },
  {
    key: "exchanges",
    label: "Биржи / Ликвидность",
    icon: "Repeat",
    blurb: "Подключение ликвидности с внешних бирж.",
    modules: [
      { name: "Binance", status: "soon" },
      { name: "ByBit", status: "soon" },
      { name: "Kraken", status: "soon" },
      { name: "WhiteBIT", status: "soon" },
      { name: "Huobi (HTX)", status: "soon" },
      { name: "Kagan Exchange", status: "soon" },
      { name: "TokenSpot", status: "soon" },
    ],
  },
  {
    key: "tools",
    label: "Инструменты",
    icon: "Wrench",
    blurb: "Анкеты, документы и вспомогательные модули.",
    modules: [
      { name: "Квиз / Анкета", status: "soon" },
      { name: "Генерация документов", status: "soon" },
    ],
  },
];
