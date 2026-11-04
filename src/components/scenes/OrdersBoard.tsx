import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLang } from "@/i18n";

/**
 * Живая доска заявок из админки оператора: три колонки, карточки раз в несколько секунд
 * переходят «ждёт оплаты → к выдаче → завершена», новые появляются слева. Настоящая
 * вёрстка (data-ui), не видео: подстраивается под тему и язык, весит ноль байт.
 */
type Col = "await" | "paid" | "done";
interface Order { id: number; no: number; usdt: number; kgs: number; col: Col; buy: boolean }

const RATE = 88.3;
const SEED: Order[] = [
  { id: 1, no: 14, usdt: 120, kgs: 10_600, col: "done", buy: true },
  { id: 2, no: 15, usdt: 57.47, kgs: 5_000, col: "done", buy: true },
  { id: 3, no: 16, usdt: 300, kgs: 26_490, col: "paid", buy: false },
  { id: 4, no: 17, usdt: 38.2, kgs: 3_373, col: "paid", buy: true },
  { id: 5, no: 18, usdt: 500, kgs: 44_150, col: "await", buy: true },
  { id: 6, no: 19, usdt: 85, kgs: 7_506, col: "await", buy: false },
];
const fmt = (n: number, d = 2) => n.toLocaleString("ru-RU", { maximumFractionDigits: d });

const OrdersBoard = ({ compact }: { compact?: boolean }) => {
  const { t } = useLang();
  const reduced = !!useReducedMotion();
  const [orders, setOrders] = useState<Order[]>(SEED);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((n) => n + 1), 2800);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (tick === 0) return;
    setOrders((prev) => {
      const next = prev.map((o) => ({ ...o }));
      // одна карточка продвигается: сначала из «к выдаче» в «завершена», иначе из «ждёт» в «к выдаче»
      const paid = next.find((o) => o.col === "paid");
      const await_ = next.find((o) => o.col === "await");
      if (tick % 2 === 1 && paid) paid.col = "done";
      else if (await_) await_.col = "paid";
      // новая заявка слева, старые завершённые уходят
      if (tick % 2 === 0) {
        const no = Math.max(...next.map((o) => o.no)) + 1;
        const usdt = [25, 60, 150, 42.5, 210, 95][no % 6];
        next.unshift({ id: Date.now(), no, usdt, kgs: Math.round(usdt * RATE), col: "await", buy: no % 3 !== 0 });
      }
      const done = next.filter((o) => o.col === "done");
      if (done.length > 2) { const victim = done[done.length - 1]; return next.filter((o) => o !== victim); }
      return next;
    });
  }, [tick]);

  const cols: { key: Col; title: string; chip: string }[] = [
    { key: "await", title: t("Ждут оплаты", "Awaiting payment"), chip: "" },
    { key: "paid", title: t("К выдаче", "To pay out"), chip: "ui-chip-accent" },
    { key: "done", title: t("Завершены", "Completed"), chip: "ui-chip-ok" },
  ];

  return (
    <div data-ui className="ui-card w-full overflow-hidden">
      <div className="ui-row px-4 py-2.5">
        <span className="inline-flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(0 72% 62%)" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(38 92% 62%)" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--ok))" }} />
          <span className="ui-code ui-k ml-2">admin · your-exchange.kg</span>
        </span>
        <span className="ui-k inline-flex items-center gap-2"><i className="ui-dot" />{t("заявки обновляются", "orders live")}</span>
      </div>
      <div className="ui-line overflow-x-auto">
      <div className={`grid min-w-[620px] grid-cols-3 gap-3 p-3 ${compact ? "sm:p-4" : "sm:gap-4 sm:p-5"}`}>
        {cols.map((c) => (
          <div key={c.key} className="min-w-0">
            <div className="ui-row mb-2 px-1">
              <span className="ui-k font-semibold">{c.title}</span>
              <span className="ui-k ui-num">{orders.filter((o) => o.col === c.key).length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {orders.filter((o) => o.col === c.key).map((o) => (
                  <motion.div
                    key={o.id}
                    layoutId={`order-${o.id}`}
                    initial={{ opacity: 0, y: reduced ? 0 : -10, scale: reduced ? 1 : 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="rounded-[10px] border border-[hsl(var(--line)/0.1)] bg-[hsl(var(--surface-2))] p-3"
                  >
                    <div className="ui-row">
                      <span className="text-[13px] font-semibold">№ {o.no}</span>
                      <span className={`ui-chip ${c.chip}`} style={{ height: 20, fontSize: 11, paddingInline: 8 }}>{o.buy ? t("покупка", "buy") : t("продажа", "sell")}</span>
                    </div>
                    <div className="ui-v ui-num mt-1.5 text-[15px]">{fmt(o.usdt)} USDT</div>
                    <div className="ui-k ui-num">{fmt(o.kgs, 0)} {t("сом", "KGS")}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default OrdersBoard;
