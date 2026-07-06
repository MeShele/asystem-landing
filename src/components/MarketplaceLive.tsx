import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

// Живой мок маркетплейса (язык шоурила, тёмная вставка): при входе в вьюпорт
// тумблеры модулей включаются каскадом, бейджи «Подключено» попают,
// счётчик «Мои модули» тикает. Вместо пререндеренного видео — работающий UI.

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
  <motion.span
    className="flex h-6 w-11 shrink-0 items-center rounded-full p-0.5"
    animate={{ backgroundColor: on ? "#B6FF1A" : "rgba(255,255,255,0.14)" }}
    transition={{ duration: 0.25 }}
  >
    <motion.span
      className="h-5 w-5 rounded-full"
      animate={{ x: on ? 20 : 0, backgroundColor: on ? "#0B0C0A" : "rgba(255,255,255,0.6)" }}
      transition={spring}
    />
  </motion.span>
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
    <div ref={ref} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E100D] shadow-[0_36px_90px_-30px_rgba(0,0,0,0.75)]">
      {/* шапка окна */}
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#141613] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 hidden rounded-md bg-[#0B0C0A] px-3 py-0.5 font-mono text-[11px] text-white/50 sm:block">
          админка · модули
        </span>
        <span className="ml-auto rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-accent tabular-nums">
          Мои модули · {n}
        </span>
      </div>

      {/* грид модулей */}
      <div className="grid gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
        {ITEMS.map((m, i) => {
          const on = i < n;
          return (
            <motion.div
              key={m.name}
              className="flex items-center justify-between gap-3 rounded-xl border p-3.5"
              animate={{
                borderColor: on ? "rgba(182,255,26,0.24)" : "rgba(255,255,255,0.09)",
                backgroundColor: on ? "rgba(182,255,26,0.04)" : "rgba(255,255,255,0.03)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[#F4F6F0]">{m.name}</div>
                <div className="relative mt-1 h-[18px]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {on ? (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={spring}
                        className="inline-flex rounded-full border border-accent/35 bg-accent/10 px-2 py-px text-[10px] font-semibold leading-4 text-accent"
                      >
                        Подключено
                      </motion.span>
                    ) : (
                      <motion.span key="desc" exit={{ opacity: 0 }} className="block truncate text-xs text-white/45">
                        {m.desc}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <Toggle on={on} />
            </motion.div>
          );
        })}
      </div>

      {/* нижняя строка */}
      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 sm:px-5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="text-xs text-white/45">Включаются тумблером — без правки кода и передеплоя</span>
      </div>
    </div>
  );
};

export default MarketplaceLive;
