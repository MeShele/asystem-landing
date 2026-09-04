import { useMemo, useState } from "react";
import { Check, Plus, FileText, Printer, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useLang, type L } from "@/i18n";

const RATE = 89; // ориентировочный курс сом/USD для показа
const SETUP = 300;

interface Mod {
  id: string;
  name: L;
  ds: L;
  price: number;
  req?: boolean;
}

const MODULES: Mod[] = [
  { id: "base", price: 300, req: true,
    name: { ru: "Базовый обменник", en: "Base exchange" },
    ds: { ru: "Витрина «купить / продать / обмен», заявки, админ-панель, курсы, комиссии, брендинг, размещение", en: "Buy / sell / exchange storefront, orders, admin panel, rates, fees, branding, hosting" } },
  { id: "kyc", price: 200,
    name: { ru: "KYC-верификация", en: "KYC verification" },
    ds: { ru: "Проверка личности клиентов: документы, селфи, очередь проверок", en: "Client identity checks: documents, selfie, review queue" } },
  { id: "compliance", price: 200,
    name: { ru: "Комплаенс", en: "Compliance" },
    ds: { ru: "Скрининг по санкц-спискам и ПДЛ, мониторинг, рабочее место офицера", en: "Sanctions/PEP screening, monitoring, officer workspace" } },
  { id: "reports", price: 300,
    name: { ru: "Отчётность ГСФР", en: "SFIS reporting" },
    ds: { ru: "Отчёты STR / CTR, генерация регуляторных документов", en: "STR / CTR reports, regulatory document generation" } },
  { id: "custody", price: 300,
    name: { ru: "Кастоди-кошельки", en: "Custody wallets" },
    ds: { ru: "Приём и вывод криптовалюты, кошельки, автовыплаты", en: "Crypto deposits/withdrawals, wallets, auto-payouts" } },
  { id: "payments", price: 150,
    name: { ru: "Платёжные интеграции", en: "Payment integrations" },
    ds: { ru: "Подключение СБП / Finik / эквайринга", en: "Instant pay / Finik / acquiring" } },
  { id: "api", price: 100,
    name: { ru: "API-ядра и кастомизация", en: "API cores & customization" },
    ds: { ru: "Отдельные ядра и доработки под задачи", en: "Standalone cores and custom work" } },
];

const fmt = (n: number) => n.toLocaleString("ru-RU");

export const Calculator = () => {
  const { t, l } = useLang();
  const [sel, setSel] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MODULES.map((m) => [m.id, !!m.req])),
  );
  const [docOpen, setDocOpen] = useState(false);

  const total = useMemo(
    () => MODULES.reduce((s, m) => (sel[m.id] ? s + m.price : s), 0),
    [sel],
  );
  const chosen = MODULES.filter((m) => sel[m.id]);

  return (
    <section id="pricing" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("Калькулятор тарифа", "Pricing calculator")}
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("Соберите свой обменник", "Build your exchange")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t(
              "Отметьте нужные модули — цена и документы соберутся сразу. Базовый обменник входит всегда.",
              "Tick the modules you need — the price and paperwork assemble instantly. The base exchange is always included.",
            )}
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* модули */}
          <div className="flex flex-col gap-3">
            {MODULES.map((m) => {
              const on = !!sel[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.req}
                  onClick={() => !m.req && setSel((s) => ({ ...s, [m.id]: !s[m.id] }))}
                  className={`group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left transition-all duration-300 ${
                    on ? "border-accent ring-1 ring-accent/40" : "border-border hover:border-accent/50"
                  } ${m.req ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5"}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      on ? "border-accent bg-accent text-accent-foreground" : "border-border text-transparent group-hover:border-accent/60"
                    }`}
                  >
                    {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{l(m.name)}</span>
                      {m.req && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {t("обязательно", "required")}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{l(m.ds)}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-display text-base font-bold tabular-nums">
                    ${m.price}
                    <span className="ml-0.5 text-xs font-medium text-muted-foreground">/{t("мес", "mo")}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* итог */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-accent bg-card p-6 shadow-[0_28px_80px_-28px_hsl(79_100%_45%/0.45)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t("Аренда в месяц", "Monthly rental")}
              </div>
              <div className="mt-1 font-display text-4xl font-extrabold tabular-nums">${fmt(total)}</div>
              <div className="mt-1 text-sm text-muted-foreground tabular-nums">≈ {fmt(total * RATE)} {t("сом", "KGS")}</div>

              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                {chosen.map((m) => (
                  <div key={m.id} className="flex justify-between gap-2 text-muted-foreground">
                    <span className="truncate">{l(m.name)}</span>
                    <span className="tabular-nums">${m.price}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-2 pt-1.5 text-xs text-muted-foreground">
                  <span>{t("Подключение (разово)", "Setup (one-time)")}</span>
                  <span className="tabular-nums">${SETUP}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button variant="signal" className="w-full" onClick={() => setDocOpen(true)}>
                  <FileText className="h-4 w-4" /> {t("Подготовить документы", "Prepare documents")}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#demo">{t("Обсудить на демо", "Discuss on a demo")} <ArrowRight className="h-4 w-4" /></a>
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("Оплата в сомах по курсу НБ КР", "Paid in KGS at the NBKR rate")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {docOpen && <DocModal chosen={chosen} total={total} onClose={() => setDocOpen(false)} />}
      </AnimatePresence>
    </section>
  );
};

function DocModal({ chosen, total, onClose }: { chosen: Mod[]; total: number; onClose: () => void }) {
  const { t, l } = useLang();
  const [name, setName] = useState("");
  const [inn, setInn] = useState("");
  const [domain, setDomain] = useState("");
  const dash = "__________";
  const date = new Date().toLocaleDateString("ru-RU");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:backdrop-blur-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 print:my-0 print:max-w-none print:border-0 print:p-0"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between print:hidden">
          <h3 className="font-display text-xl font-extrabold">{t("Спецификация к договору", "Contract specification")}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={t("Закрыть", "Close")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 print:hidden">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Наименование организации", "Company name")}
            className="sm:col-span-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
          <input value={inn} onChange={(e) => setInn(e.target.value)} placeholder={t("ИНН", "Tax ID")}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={t("Домен обменника", "Exchange domain")}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" />
        </div>

        {/* печатный документ */}
        <div id="spec-doc" className="rounded-xl border border-border p-5 text-sm print:border-0 print:p-0">
          <div className="text-center">
            <div className="font-display text-base font-extrabold">
              {t("Спецификация к договору аренды платформы ASystem Core", "Specification to the ASystem Core platform rental agreement")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t("Приложение № 1 (состав) и № 2 (стоимость)", "Annex No. 1 (composition) and No. 2 (price)")} · {date}
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div><b>{t("Заказчик", "Client")}:</b> {name || dash}</div>
            <div><b>{t("ИНН", "Tax ID")}:</b> {inn || dash} &nbsp; <b>{t("Домен", "Domain")}:</b> {domain || dash}</div>
          </div>

          <div className="mt-4 font-semibold">{t("Приложение № 1 — Состав", "Annex No. 1 — Composition")}</div>
          <table className="mt-1 w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 pr-2">{t("Модуль", "Module")}</th>
                <th className="w-24 py-1.5 text-center">{t("Включено", "Included")}</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="py-1.5 pr-2">{l(m.name)}</td>
                  <td className="py-1.5 text-center font-semibold">{chosen.some((c) => c.id === m.id) ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 font-semibold">{t("Приложение № 2 — Стоимость (в месяц)", "Annex No. 2 — Price (monthly)")}</div>
          <table className="mt-1 w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1.5 pr-2">{t("Модуль", "Module")}</th>
                <th className="py-1.5 text-right">USD</th>
                <th className="py-1.5 text-right">≈ {t("сом", "KGS")}</th>
              </tr>
            </thead>
            <tbody>
              {chosen.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="py-1.5 pr-2">{l(m.name)}</td>
                  <td className="py-1.5 text-right tabular-nums">${m.price}</td>
                  <td className="py-1.5 text-right tabular-nums">{fmt(m.price * RATE)}</td>
                </tr>
              ))}
              <tr className="border-b border-border font-bold">
                <td className="py-1.5 pr-2">{t("Итого в месяц", "Monthly total")}</td>
                <td className="py-1.5 text-right tabular-nums">${fmt(total)}</td>
                <td className="py-1.5 text-right tabular-nums">{fmt(total * RATE)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2">{t("Подключение (разово)", "Setup (one-time)")}</td>
                <td className="py-1.5 text-right tabular-nums">${SETUP}</td>
                <td className="py-1.5 text-right tabular-nums">{fmt(SETUP * RATE)}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-3 text-xs text-muted-foreground">
            {t(
              "Оплата в сомах по курсу НБ КР на дату платежа. Услуги третьих лиц (KYC-провайдер, эквайринг, кастодиан) — по их тарифам отдельно.",
              "Paid in KGS at the NBKR rate on the payment date. Third-party services (KYC provider, acquiring, custodian) are billed separately at their rates.",
            )}
          </p>
          <div className="mt-5 flex justify-between text-xs text-muted-foreground">
            <span>{t("Исполнитель", "Provider")}: ____________</span>
            <span>{t("Заказчик", "Client")}: ____________</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end print:hidden">
          <Button variant="signal" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> {t("Печать / Сохранить в PDF", "Print / Save as PDF")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
