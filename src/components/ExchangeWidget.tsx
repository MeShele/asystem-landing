import { useEffect, useState } from "react";
import { ArrowRight, ArrowDownUp, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "buy" | "sell";

const BASE_RATE = 89.5; // 1 USDT = 89.50 KGS

const CurrencyPill = ({ code }: { code: string }) => (
  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold">
    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-foreground">
      {code[0]}
    </span>
    {code}
  </span>
);

/** Live, self-contained exchange field for the hero banner — buy/sell toggle,
 *  give/receive amounts, a real-time ticking rate. Presentational only. */
const ExchangeWidget = () => {
  const [mode, setMode] = useState<Mode>("buy");
  const [give, setGive] = useState("1000");
  const [rate, setRate] = useState(BASE_RATE);
  const [trend, setTrend] = useState<"up" | "down">("up");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRate((r) => {
        const next = Math.max(88.9, Math.min(90.4, r + (Math.random() - 0.45) * 0.12));
        setTrend(next >= r ? "up" : "down");
        return Number(next.toFixed(2));
      });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 450);
      return () => clearTimeout(t);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const giveNum = Number(give.replace(/[^\d.]/g, "")) || 0;
  const get = mode === "buy" ? giveNum / rate : giveNum * rate;
  const giveCur = mode === "buy" ? "KGS" : "USDT";
  const getCur = mode === "buy" ? "USDT" : "KGS";
  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: n < 10 ? 4 : 2 });

  return (
    <div className="bg-gradient-to-b from-secondary/50 to-background p-5 sm:p-7">
      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-5 shadow-[0_20px_50px_-24px_hsl(240_10%_6%/0.35)]">
        {/* mode toggle */}
        <div className="flex gap-1.5 rounded-full bg-secondary p-1">
          {(["buy", "sell"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                mode === m ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "buy" ? "Купить" : "Продать"}
            </button>
          ))}
        </div>

        {/* give */}
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <div className="text-xs font-medium text-muted-foreground">Вы отдаёте</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <input
              value={give}
              onChange={(e) => setGive(e.target.value)}
              inputMode="decimal"
              aria-label="Сумма к обмену"
              className="w-full min-w-0 bg-transparent font-mono text-2xl font-semibold sm:text-[1.7rem] text-foreground outline-none"
            />
            <CurrencyPill code={giveCur} />
          </div>
        </div>

        {/* swap */}
        <div className="relative flex justify-center">
          <button
            onClick={() => setMode((m) => (m === "buy" ? "sell" : "buy"))}
            aria-label="Поменять направление"
            className="-my-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-transform duration-300 hover:rotate-180 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* get */}
        <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <div className="text-xs font-medium text-muted-foreground">Вы получаете</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className={`font-mono text-2xl font-semibold sm:text-[1.7rem] tabular-nums transition-colors duration-300 ${flash ? "text-accent" : "text-foreground"}`}>
              {fmt(get)}
            </span>
            <CurrencyPill code={getCur} />
          </div>
        </div>

        {/* live rate */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Курс в реальном времени
          </span>
          <span className="flex items-center gap-1 font-mono text-foreground">
            1 USDT = {rate.toFixed(2)} KGS
            <TrendingUp className={`h-3.5 w-3.5 ${trend === "up" ? "text-emerald-500" : "rotate-180 text-rose-500"}`} />
          </span>
        </div>

        <Button variant="signal" size="lg" className="mt-4 w-full">
          {mode === "buy" ? "Купить USDT" : "Продать USDT"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ExchangeWidget;
