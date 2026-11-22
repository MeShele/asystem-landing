import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Schema from "@/components/Schema";
import Reveal from "@/components/Reveal";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";
import type { LayersHandle } from "@/three/layers";

const EASE = [0.23, 1, 0.32, 1] as const;
const STEP_MS = 8000;

/**
 * Что внутри: четыре части платформы. Слева заголовок и пункты, справа взрыв-схема — платформа,
 * разобранная на четыре слоя (сцена — src/three/layers.ts); выбранный слой выдвигается, рядом с ним
 * список того, что в этой части есть. Пункты сменяются сами (полоса прогресса), на наведении пауза,
 * клик — вручную. Без сцены (reduced-motion, нет WebGL) справа плоская схема выбранной части.
 */
const ProductTour = () => {
  const { TOUR } = useContent();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [run, setRun] = useState(0);
  const items = TOUR.items;
  const cur = items[i];

  const api = useRef<LayersHandle | null>(null);
  const tag = useRef<HTMLDivElement>(null);
  const index = useRef(0);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/layers").then((m) => m.mountLayers({ canvas, tag: tag.current })).then((h) => {
      h.setActive(index.current);
      api.current = h;
      return () => { api.current = null; h.dispose(); };
    }),
    [],
  );
  const { canvas, on } = useScene(mount);
  useEffect(() => { index.current = i; api.current?.setActive(i); }, [i]);

  useEffect(() => {
    if (reduced || hold) return;
    const id = setTimeout(() => { setI((n) => (n + 1) % items.length); setRun((k) => k + 1); }, STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, run, items.length]);

  return (
    <section id="features" className="wrap py-14 sm:py-20">
      <div
        className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-10 lg:gap-y-10"
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
      >
        <Reveal className="order-1 lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{TOUR.eyebrow}</p>
          <h2 className="t-h2 mt-3">{TOUR.title}</h2>
          <p className="t-lead muted mt-4">{TOUR.lead}</p>
        </Reveal>

        <ol className="order-3 flex flex-col lg:col-span-4 lg:col-start-1 lg:row-start-2">
          {items.map((it, n) => {
            const active = n === i;
            return (
              <li key={it.key} className="relative">
                <button
                  type="button"
                  onClick={() => { setI(n); setRun((k) => k + 1); }}
                  aria-pressed={active}
                  className={`w-full border-l-2 py-4 pl-5 text-left transition-colors duration-300 ${active ? "border-[hsl(var(--accent))]" : "border-[hsl(var(--line)/0.1)] hover:border-[hsl(var(--line)/0.3)]"}`}
                >
                  <span className={`t-h3 block transition-colors duration-300 ${active ? "text-[hsl(var(--fg))]" : "muted"}`}>{it.title}</span>
                  <AnimatePresence initial={false}>
                    {active && (
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
                {active && !reduced && (
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

        <div className="order-2 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:self-center">
          {on ? (
            <div className="scene relative aspect-[4/3] lg:aspect-[7/5]" role="img" aria-label={`${TOUR.title}: ${cur.title}`}>
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
              <div ref={tag} className="scene-tag hidden md:block">
                <div className="scene-tag-side">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.ul key={cur.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-1.5">
                      {cur.schema.nodes.map((n) => (
                        <li key={n.id} className={`text-[13px] leading-snug ${n.kind === "accent" ? "font-display font-medium text-[hsl(var(--accent-ink))]" : n.kind === "ghost" || n.kind === "side" ? "muted" : ""}`}>{n.title}</li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={cur.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} transition={{ duration: 0.34, ease: EASE }}>
                <Schema graph={cur.schema} label={cur.title} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductTour;
