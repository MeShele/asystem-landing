import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ExchangeWidget from "@/components/ExchangeWidget";
import OrdersBoard from "@/components/scenes/OrdersBoard";
import { KycPanel, ReportPanel } from "@/components/fragments/Panels";
import { useLang } from "@/i18n";

/**
 * Экскурсия по платформе вместо 30-секундного ролика: четыре живых экрана сменяют друг
 * друга сами (полоса прогресса), по клику на вкладку — вручную; на наведении пауза.
 */
const EASE = [0.23, 1, 0.32, 1] as const;
const STEP_MS = 5200;

const ScreenTour = () => {
  const { t } = useLang();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [key, setKey] = useState(0);

  const scenes = [
    { title: t("Витрина", "Storefront"), hint: t("клиент меняет сомы на USDT", "a client swaps som for USDT"), node: <ExchangeWidget /> },
    { title: t("Кабинет клиента", "Client account"), hint: t("проверка личности пройдена", "identity check passed"), node: <KycPanel /> },
    { title: t("Админка", "Admin panel"), hint: t("заявки идут по статусам", "orders move through statuses"), node: <div className="w-full max-w-[860px]"><OrdersBoard compact /></div> },
    { title: t("Отчёты", "Reports"), hint: t("реестры для Финнадзора готовы", "FinSupervision registries ready"), node: <ReportPanel /> },
  ];

  useEffect(() => {
    if (reduced || hold) return;
    const id = setTimeout(() => { setI((n) => (n + 1) % scenes.length); setKey((k) => k + 1); }, STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, key, scenes.length]);

  return (
    <div className="panel overflow-hidden" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="flex flex-wrap gap-1 border-b border-[hsl(var(--line)/0.08)] p-2">
        {scenes.map((s, n) => (
          <button
            key={s.title}
            type="button"
            onClick={() => { setI(n); setKey((k) => k + 1); }}
            aria-pressed={n === i}
            className={`relative overflow-hidden rounded-[10px] px-4 py-2 text-[14px] font-semibold transition-colors ${n === i ? "bg-[hsl(var(--surface-2))] text-[hsl(var(--fg))]" : "muted hover:text-[hsl(var(--fg))]"}`}
          >
            {s.title}
            {n === i && !reduced && (
              <motion.i
                key={key}
                className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--accent))]"
                initial={{ width: "0%" }}
                animate={{ width: hold ? undefined : "100%" }}
                transition={{ duration: STEP_MS / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="relative flex min-h-[460px] items-center justify-center p-6 sm:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.32, ease: EASE }}
            className="flex w-full justify-center"
          >
            {scenes[i].node}
          </motion.div>
        </AnimatePresence>
        <p className="t-small muted absolute bottom-4 left-6 sm:left-10">{scenes[i].hint}</p>
      </div>
    </div>
  );
};

export default ScreenTour;
