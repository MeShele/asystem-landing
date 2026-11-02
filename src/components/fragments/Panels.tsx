import { useLang } from "@/i18n";

/**
 * Фрагменты интерфейса продукта в натуральную величину (data-ui): карточка
 * заявки, панель KYC, комплаенс, отчёт, сервер, бренд, API. Содержимое
 * правдоподобное и сходится: суммы считаются из курса, порог холда 500 000 сом
 * (реальный у одного из обменников), формат номера заявки как в продукте.
 * compact — одна строка для панели-доказательства в списке возможностей.
 */

const fmt = (n: number, d = 2) => n.toLocaleString("ru-RU", { maximumFractionDigits: d });

export const HOLD_THRESHOLD = 500_000;

/* Карточка заявки в админке оператора */
export const OrderCard = ({ amount, wallet, rate, compact }: { amount: number; wallet: string; rate: number; compact?: boolean }) => {
  const { t } = useLang();
  const usdt = amount / rate;
  const hold = amount >= HOLD_THRESHOLD;
  const shortWallet = wallet.length > 12 ? `${wallet.slice(0, 5)}…${wallet.slice(-4)}` : wallet || "—";
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[480px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">№7 · <span className="ui-code ui-k">#f097e928</span></span>
        <span className={`ui-chip ${hold ? "ui-chip-warn" : "ui-chip-accent"}`}>
          {hold ? t("комплаенс-холд", "compliance hold") : t("ждёт оплаты", "awaiting payment")}
        </span>
      </div>
      <div className="ui-k mt-1">{t("Покупка USDT · создана сегодня, 14:02", "Buy USDT · created today, 14:02")}</div>

      <div className="ui-line mt-3 pt-3">
        <div className="ui-row"><span className="ui-k">{t("Клиент отдаёт", "Client sends")}</span><span className="ui-v">{fmt(amount, 0)} сом</span></div>
        <div className="ui-row mt-1"><span className="ui-k">{t("Клиент получает", "Client receives")}</span><span className="ui-v">{fmt(usdt)} USDT</span></div>
        <div className="ui-row mt-1"><span className="ui-k">{t("Курс", "Rate")}</span><span className="ui-v">{rate.toFixed(2)}</span></div>
        <div className="ui-row mt-1"><span className="ui-k">{t("Кошелёк", "Wallet")}</span><span className="ui-v ui-code">{shortWallet} · TRC20</span></div>
      </div>

      {!compact && (
        <>
          <div className="ui-line mt-3 pt-3">
            <div className="ui-row"><span className="ui-k">KYC</span><span className="ui-chip ui-chip-ok">{t("пройден 12.10", "passed 12.10")}</span></div>
            <div className="ui-row mt-1.5">
              <span className="ui-k">{t("Комплаенс", "Compliance")}</span>
              <span className={`ui-chip ${hold ? "ui-chip-warn" : "ui-chip-ok"}`}>
                {hold ? t(`выше ${fmt(HOLD_THRESHOLD, 0)} сом: решает офицер`, `above ${fmt(HOLD_THRESHOLD, 0)} KGS: officer decides`) : t("перечни ГСФР: совпадений нет", "SFIS lists: no matches")}
              </span>
            </div>
            <div className="ui-row mt-1.5"><span className="ui-k">{t("Реквизиты", "Payment details")}</span><span className="ui-v">{t("выданы 14:04", "issued 14:04")}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="ui-btn ui-btn-accent flex-1">{t("Оплата получена", "Payment received")}</span>
            <span className="ui-btn flex-1 bg-[hsl(var(--surface))]">{t("Отменить", "Cancel")}</span>
          </div>
        </>
      )}
    </div>
  );
};

/* Панель проверки личности */
export const KycPanel = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  const rows = [
    [t("Документ", "Document"), t("паспорт КР, подлинность подтверждена", "KR passport, authenticity confirmed")],
    [t("Лицо", "Face"), t("совпадает с документом", "matches the document")],
    [t("Возраст", "Age"), t("27 лет, допуск 18+", "27, 18+ passed")],
    [t("Резидентство", "Residency"), t("резидент КР, из паспорта", "KR resident, from the passport")],
    [t("Перечни ГСФР", "SFIS lists"), t("совпадений нет", "no matches")],
  ];
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[440px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">{t("Проверка личности", "Identity check")}</span>
        <span className="ui-chip ui-chip-ok">{t("одобрено", "approved")}</span>
      </div>
      <div className="ui-k mt-1">{t("Клиент #112 · ASystem KYC · офицер: Н. Абдыкадырова", "Client #112 · ASystem KYC · officer: N. Abdykadyrova")}</div>
      <div className="ui-line mt-3 pt-3 space-y-2">
        {(compact ? rows.slice(0, 2) : rows).map(([k, v]) => (
          <div key={k} className="ui-row">
            <span className="ui-k">{k}</span>
            <span className="inline-flex items-center gap-2 text-right"><i className="ui-dot" />{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Комплаенс: порог, код, решение */
export const CompliancePanel = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[440px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">{t("Заявка №9 ждёт офицера", "Order №9 awaits the officer")}</span>
        <span className="ui-chip ui-chip-warn">{t("холд", "hold")}</span>
      </div>
      <div className="ui-k mt-1">{t("920 000 сом выше порога 500 000 сом", "920 000 KGS above the 500 000 KGS threshold")}</div>
      {!compact && (
        <>
          <div className="ui-line mt-3 pt-3 space-y-2">
            <div className="ui-row"><span className="ui-k">{t("Накопитель за 30 дней", "30-day accumulator")}</span><span className="ui-v">1 640 000 сом</span></div>
            <div className="ui-row"><span className="ui-k">{t("Перечни ГСФР", "SFIS lists")}</span><span className="inline-flex items-center gap-2"><i className="ui-dot" />{t("чисто", "clear")}</span></div>
            <div className="ui-row"><span className="ui-k">{t("Адрес, Ranex KYT", "Address, Ranex KYT")}</span><span className="inline-flex items-center gap-2"><i className="ui-dot" />{t("низкий риск", "low risk")}</span></div>
            <div className="ui-row"><span className="ui-k">{t("Код подозрительности", "Suspicion code")}</span><span className="ui-v">{t("не присвоен", "not assigned")}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="ui-btn ui-btn-accent flex-1">{t("Снять холд", "Release hold")}</span>
            <span className="ui-btn flex-1 bg-[hsl(var(--surface))]">{t("Запросить документы", "Request documents")}</span>
          </div>
        </>
      )}
    </div>
  );
};

/* Отчёт в Финнадзор */
export const ReportPanel = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  const rows = [
    [t("Реестр сделок", "Deal registry"), "48", t("готов", "ready")],
    [t("Реестр клиентов", "Client registry"), "31", t("готов", "ready")],
    [t("Финансовые показатели", "Financial figures"), "—", t("вносит офицер", "officer enters")],
  ];
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[440px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">{t("Отчёт за октябрь 2026", "Report for October 2026")}</span>
        <span className="ui-chip">{t("Финнадзор", "FinSupervision")}</span>
      </div>
      <div className="ui-k mt-1">{t("Сформирован 01.11, 09:00 · Excel", "Generated 01.11, 09:00 · Excel")}</div>
      <div className="ui-line mt-3 pt-3 space-y-2">
        {(compact ? rows.slice(0, 1) : rows).map(([k, n, s]) => (
          <div key={k} className="ui-row">
            <span className="ui-k">{k}</span>
            <span className="inline-flex items-center gap-3"><span className="ui-v">{n}</span><span className="ui-chip">{s}</span></span>
          </div>
        ))}
      </div>
      {!compact && <span className="ui-btn ui-btn-accent mt-4 w-full">{t("Скачать отчёт", "Download report")}</span>}
    </div>
  );
};

/* Сервер и база обменника */
export const ServerPanel = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  const rows = [
    [t("Сервер", "Server"), t("Бишкек, дата-центр", "Bishkek, data centre")],
    [t("База данных", "Database"), t("отдельная, только этот обменник", "separate, this exchange only")],
    [t("Бэкап", "Backup"), t("ежедневно 03:00, хранение 30 дней", "daily 03:00, kept 30 days")],
    [t("Ключи провайдеров", "Provider keys"), t("зашифрованы", "encrypted")],
    [t("Домен и сертификат", "Domain and certificate"), t("ваш домен, продлевается сам", "your domain, auto-renewed")],
  ];
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[440px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">{t("Стек обменника", "Exchange stack")}</span>
        <span className="inline-flex items-center gap-2 text-[13px]"><i className="ui-dot" />{t("работает", "running")}</span>
      </div>
      <div className="ui-k mt-1">{t("Версия платформы обновлена 01.11", "Platform updated 01.11")}</div>
      <div className="ui-line mt-3 pt-3 space-y-2">
        {(compact ? rows.slice(0, 2) : rows).map(([k, v]) => (
          <div key={k} className="ui-row"><span className="ui-k">{k}</span><span className="text-right">{v}</span></div>
        ))}
      </div>
    </div>
  );
};

/* Бренд обменника в админке */
export const BrandPanel = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  return (
    <div data-ui className={`ui-card w-full ${compact ? "w-full p-4" : "max-w-[440px] p-5"}`}>
      <div className="ui-row">
        <span className="font-semibold">{t("Бренд и витрина", "Brand and storefront")}</span>
        <span className="ui-chip">{t("опубликовано", "published")}</span>
      </div>
      <div className="ui-line mt-3 pt-3 space-y-3">
        <div className="ui-row">
          <span className="ui-k">{t("Фирменный цвет", "Brand colour")}</span>
          <span className="inline-flex items-center gap-2">
            <i className="inline-block h-5 w-5 rounded-md" style={{ background: "hsl(214 80% 48%)" }} />
            <span className="ui-code">#1F6FD6</span>
          </span>
        </div>
        <div className="ui-row"><span className="ui-k">{t("Домен", "Domain")}</span><span className="ui-v">exchange.kg</span></div>
        {!compact && (
          <>
            <div className="ui-row"><span className="ui-k">{t("Шаблон витрины", "Storefront template")}</span><span className="ui-v">{t("Обменник", "Exchanger")}</span></div>
            <div className="ui-row"><span className="ui-k">{t("Тёмная тема", "Dark theme")}</span><span className="ui-toggle on"><i /></span></div>
            <div className="ui-row"><span className="ui-k">{t("Бот в Telegram", "Telegram bot")}</span><span className="ui-v">@exchange_kg_bot</span></div>
          </>
        )}
      </div>
    </div>
  );
};

/* Ядро по API: запрос и ответ, настоящий код в <pre> */
export const ApiSnippet = ({ compact }: { compact?: boolean }) => (
  <div data-ui className={`ui-card w-full overflow-hidden ${compact ? "w-full" : "max-w-[460px]"}`}>
    <div className="ui-row px-4 py-2.5">
      <span className="ui-k">api.asystem.ai</span>
      <span className="ui-chip ui-chip-ok">200 · 142 ms</span>
    </div>
    <pre className="ui-line m-0 px-4 py-3 text-[13px]">
      <code>{compact
        ? `POST /kyc-core/verify\n→ { "decision": "auto_approve", "score": 82 }`
        : `POST /kyc-core/verify
Authorization: Bearer ask_••••

{ "full_name": "…", "document": { "type": "passport", "country": "KG" } }

→ { "decision": "auto_approve", "score": 82, "lists": "clear" }`}
      </code>
    </pre>
  </div>
);

/* Четыре стадии запуска в одном фрагменте */
export const SetupFragment = ({ stage }: { stage: 0 | 1 | 2 | 3 }) => {
  const { t } = useLang();
  if (stage === 0) {
    const rows = [
      [t("Компания", "Company"), t("ОсОО, лицензия оператора обмена ВА", "LLC, VA exchange operator licence")],
      [t("Домен", "Domain"), "exchange.kg"],
      [t("Валюты", "Currencies"), "USDT, BTC, KGS"],
      [t("Реквизиты", "Bank details"), t("2 счёта в сомах", "2 KGS accounts")],
    ];
    return (
      <div data-ui className="ui-card w-full max-w-[440px] p-5">
        <div className="ui-row"><span className="font-semibold">{t("Анкета запуска", "Launch brief")}</span><span className="ui-chip">4 / 4</span></div>
        <div className="ui-line mt-3 pt-3 space-y-2">
          {rows.map(([k, v]) => <div key={k} className="ui-row"><span className="ui-k">{k}</span><span className="inline-flex items-center gap-2 text-right"><i className="ui-dot" />{v}</span></div>)}
        </div>
      </div>
    );
  }
  if (stage === 1) {
    const steps = [
      [t("Сервер в Бишкеке", "Server in Bishkek"), true],
      [t("База данных", "Database"), true],
      [t("Домен привязан", "Domain attached"), true],
      [t("Сертификат выпущен", "Certificate issued"), true],
      [t("Почта с домена", "Email from the domain"), false],
    ] as const;
    return (
      <div data-ui className="ui-card w-full max-w-[440px] p-5">
        <div className="ui-row"><span className="font-semibold">{t("Разворачиваем стек", "Deploying the stack")}</span><span className="ui-v">4 / 5</span></div>
        <div className="ui-progress mt-3"><i style={{ width: "80%" }} /></div>
        <div className="mt-3 space-y-2">
          {steps.map(([k, done]) => (
            <div key={k} className="ui-row">
              <span>{k}</span>
              <span className={`ui-chip ${done ? "ui-chip-ok" : ""}`}>{done ? t("готово", "done") : t("в работе", "in progress")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (stage === 2) {
    const mods = [
      ["Comply Core", true], ["ASystem KYC", true], ["Ranex KYT", true],
      [t("Письма", "Email"), true], [t("Finik: приём по QR", "Finik: QR payments"), false], [t("Автокурс", "Auto rates"), false],
    ] as const;
    return (
      <div data-ui className="ui-card w-full max-w-[440px] p-5">
        <div className="ui-row"><span className="font-semibold">{t("Модули", "Modules")}</span><span className="ui-k">{t("включено 4", "4 enabled")}</span></div>
        <div className="ui-line mt-3 pt-3 space-y-2.5">
          {mods.map(([k, on]) => (
            <div key={k} className="ui-row"><span>{k}</span><span className={`ui-toggle ${on ? "on" : ""}`}><i /></span></div>
          ))}
        </div>
      </div>
    );
  }
  const orders = [
    ["№1", t("Покупка USDT", "Buy USDT"), "25 000 сом", t("выплачена", "paid out"), "ok"],
    ["№2", t("Продажа USDT", "Sell USDT"), "1 200 USDT", t("ждёт реквизиты", "awaiting details"), ""],
    ["№3", t("Покупка USDT", "Buy USDT"), "640 000 сом", t("комплаенс-холд", "compliance hold"), "warn"],
  ];
  return (
    <div data-ui className="ui-card w-full max-w-[440px] p-5">
      <div className="ui-row"><span className="font-semibold">{t("Заявки сегодня", "Orders today")}</span><span className="ui-v">3</span></div>
      <div className="ui-line mt-3 pt-3 space-y-2.5">
        {orders.map(([n, op, sum, st, tone]) => (
          <div key={n} className="ui-row">
            <span className="inline-flex items-center gap-3"><span className="ui-k">{n}</span><span>{op}</span></span>
            <span className="inline-flex items-center gap-3"><span className="ui-v">{sum}</span><span className={`ui-chip ${tone === "ok" ? "ui-chip-ok" : tone === "warn" ? "ui-chip-warn" : ""}`}>{st}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};
