import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Живой мок маркетплейса: при входе в вьюпорт тумблеры модулей включаются
// каскадом, бейджи «Подключено» попают, счётчик «Мои модули» тикает.
// Тема-зависимый: светлое «окно админки» в светлой теме, тёмное — в тёмной.

const ITEMS = [
  { name: "ASystem KYC", desc: "верификация + скоринг" },
  { name: "Didit", desc: "KYC-провайдер" },
  { name: "Finik QR", desc: "приём оплат" },
  { name: "Comply Core", desc: "комплайнс ГСФР" },
  { name: "ORGON Custody", desc: "кошельки и выплаты" },
  { name: "Отчёты Финнадзор", desc: "автоотчётность" },
];

const spring = { type: "spring", stiffness: 320, damping: 26 } as const;

const Toggle = ({ on }: { on: boolean }) => (
  <span
    className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${
      on ? "bg-accent" : "bg-foreground/15"
    }`}
  >
    <motion.span
      className={`h-5 w-5 rounded-full shadow-sm transition-colors duration-300 ${on ? "bg-[#0B0C0A]" : "bg-background"}`}
      animate={{ x: on ? 20 : 0 }}
      transition={spring}
    />
  </span>
);

const MarketplaceLive = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0); // сколько модулей уже включено

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(ITEMS.length);
      return;
    }
    let i = 0;
    let id: number | undefined;
    const start = setTimeout(() => {
      setN(++i);
      id = window.setInterval(() => {
        setN(++i);
        if (i >= ITEMS.length) clearInterval(id);
      }, 420);
    }, 450);
    return () => {
      clearTimeout(start);
      if (id !== undefined) clearInterval(id);
    };
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-32px_hsl(240_10%_6%/0.35)] dark:shadow-none"
    >
      {/* шапка окна */}
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="ml-3 hidden rounded-md bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">
          админка · модули
        </span>
        <span className="ml-auto rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-foreground dark:text-accent">
          Мои модули · {n}
        </span>
      </div>

      {/* грид модулей */}
      <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        {ITEMS.map((m, i) => {
          const on = i < n;
          return (
            <div
              key={m.name}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors duration-300 ${
                on ? "border-accent/40 bg-accent/[0.07] dark:border-accent/25 dark:bg-accent/[0.05]" : "border-border bg-secondary/40 dark:bg-background/40"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">{m.name}</div>
                <div className="relative mt-1 h-[18px]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {on ? (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={spring}
                        className="inline-flex rounded-full border border-accent/40 bg-accent/15 px-2 py-px text-[10px] font-semibold leading-4 text-foreground dark:bg-accent/10 dark:text-accent"
                      >
                        Подключено
                      </motion.span>
                    ) : (
                      <motion.span key="desc" exit={{ opacity: 0 }} className="block truncate text-xs text-muted-foreground">
                        {m.desc}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <Toggle on={on} />
            </div>
          );
        })}
      </div>

      {/* нижняя строка */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 sm:px-5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="text-xs text-muted-foreground">Включаются тумблером — без правки кода и передеплоя</span>
      </div>
    </div>
  );
};

export default MarketplaceLive;
