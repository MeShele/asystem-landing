import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Schema from "@/components/Schema";
import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;
const STEP_MS = 8000;

/**
 * Что внутри: четыре части платформы, каждая — участок общей схемы крупным планом
 * (витрина, кабинет, админка, отчёты). Слева пункты, справа схема; пункты сменяются
 * сами (полоса прогресса), на наведении пауза, клик — вручную.
 */
const ProductTour = () => {
  const { TOUR } = useContent();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [run, setRun] = useState(0);
  const items = TOUR.items;
  const cur = items[i];

  useEffect(() => {
    if (reduced || hold) return;
    const id = setTimeout(() => { setI((n) => (n + 1) % items.length); setRun((k) => k + 1); }, STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, run, items.length]);

  return (
    <section id="features" className="wrap py-14 sm:py-20">
      <Reveal className="max-w-[640px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{TOUR.eyebrow}</p>
        <h2 className="t-h2 mt-3">{TOUR.title}</h2>
        <p className="t-lead muted mt-4">{TOUR.lead}</p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        <ol className="order-2 flex flex-col lg:order-1 lg:col-span-4">
          {items.map((it, n) => {
            const on = n === i;
            return (
              <li key={it.key} className="relative">
                <button
                  type="button"
                  onClick={() => { setI(n); setRun((k) => k + 1); }}
                  aria-pressed={on}
                  className={`w-full border-l-2 py-4 pl-5 text-left transition-colors duration-300 ${on ? "border-[hsl(var(--accent))]" : "border-[hsl(var(--line)/0.1)] hover:border-[hsl(var(--line)/0.3)]"}`}
                >
                  <span className={`t-h3 block transition-colors duration-300 ${on ? "text-[hsl(var(--fg))]" : "muted"}`}>{it.title}</span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="muted block overflow-hidden text-[15px]"
                      >
                        <span className="block pt-2">{it.text}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                {on && !reduced && (
                  <motion.i
                    key={run}
                    className="absolute left-[-2px] top-0 w-[2px] bg-[hsl(var(--accent))] opacity-40"
                    initial={{ height: "0%" }}
                    animate={{ height: hold ? undefined : "100%" }}
                    transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="order-1 lg:order-2 lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cur.key}
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={{ duration: 0.34, ease: EASE }}
              className="panel p-5 sm:p-8"
            >
              <Schema graph={cur.schema} label={cur.title} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ProductTour;
