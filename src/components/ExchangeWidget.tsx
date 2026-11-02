import { useEffect, useState } from "react";
import ExchangeModal from "@/components/ExchangeModal";
import { useLang } from "@/i18n";

type Mode = "buy" | "sell";

export const BASE_RATE = 88.3; // 1 USDT = 88.30 KGS, стартовое значение живого курса

/** Виджет обмена с витрины обменника: покупка и продажа, живой курс. Фрагмент продукта (data-ui). */
const ExchangeWidget = () => {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("buy");
  const [give, setGive] = useState("25 000");
  const [rate, setRate] = useState(BASE_RATE);
  const [trend, setTrend] = useState<"up" | "down">("up");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRate((r) => {
        const next = Math.max(87.6, Math.min(89.1, r + (Math.random() - 0.45) * 0.1));
        setTrend(next >= r ? "up" : "down");
        return Number(next.toFixed(2));
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const giveNum = Number(give.replace(/[^\d.]/g, "")) || 0;
  const get = mode === "buy" ? giveNum / rate : giveNum * rate;
  const giveCur = mode === "buy" ? "KGS" : "USDT";
  const getCur = mode === "buy" ? "USDT" : "KGS";
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: n < 10 ? 4 : 2 });

  return (
    <>
      <div data-ui className="ui-card w-full max-w-[400px] p-5">
        <div className="flex gap-1 rounded-full bg-[hsl(var(--surface))] p-1">
          {(["buy", "sell"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`ui-tab flex-1 ${mode === m ? "on" : ""}`}>
              {m === "buy" ? t("Купить", "Buy") : t("Продать", "Sell")}
            </button>
          ))}
        </div>

        <label className="ui-field mt-4 block">
          <span className="ui-k">{t("Вы отдаёте", "You send")}</span>
          <span className="ui-row mt-1">
            <input
              value={give}
              onChange={(e) => setGive(e.target.value)}
              inputMode="decimal"
              aria-label={t("Сумма к обмену", "Amount to exchange")}
              className="ui-num w-full min-w-0 bg-transparent text-[26px] font-semibold outline-none"
            />
            <span className="ui-chip">{giveCur}</span>
          </span>
        </label>

        <div className="ui-field mt-2">
          <span className="ui-k">{t("Вы получаете", "You receive")}</span>
          <span className="ui-row mt-1">
            <span className="ui-num text-[26px] font-semibold">{fmt(get)}</span>
            <span className="ui-chip">{getCur}</span>
          </span>
        </div>

        <div className="ui-row mt-3">
          <span className="ui-k inline-flex items-center gap-2"><i className="ui-dot" />{t("Курс обновляется", "Live rate")}</span>
          <span className="ui-num text-[13px] font-semibold" style={{ color: trend === "up" ? "hsl(var(--ok))" : "hsl(var(--destructive))", transition: "color 400ms ease" }}>
            1 USDT = {rate.toFixed(2)} KGS
          </span>
        </div>

        <button type="button" className="ui-btn ui-btn-accent mt-4 w-full" onClick={() => setModalOpen(true)}>
          {mode === "buy" ? t("Купить USDT", "Buy USDT") : t("Продать USDT", "Sell USDT")}
        </button>
      </div>
      <ExchangeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        giveAmount={giveNum}
        giveCur={giveCur}
        getAmount={get}
        getCur={getCur}
        rate={rate}
        fmt={fmt}
      />
    </>
  );
};

export default ExchangeWidget;
