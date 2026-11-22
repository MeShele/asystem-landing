import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";
import type { SealHandle } from "@/three/seal";

const STEP_MS = 3400;

/**
 * Требования регулятора и что уже в платформе. Слева печать из секторов (сцена — src/three/seal.ts):
 * закрытые требования лаймовые, «ваша сторона» — тёмный контур. Справа те же требования списком:
 * что требуется, как сделано, статус. Строка и сектор выбираются вместе — сами по очереди, по
 * наведению или касанию. Статусы честные: строка вне платформы так и подписана.
 */
const Law = () => {
  const { LAW } = useContent();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const api = useRef<SealHandle | null>(null);
  const index = useRef(0);
  const done = useRef(LAW.rows.map((r) => r.status === "done"));
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/seal").then((m) => m.mountSeal({ canvas, done: done.current })).then((h) => {
      h.setActive(index.current);
      api.current = h;
      return () => { api.current = null; h.dispose(); };
    }),
    [],
  );
  const { canvas, on } = useScene(mount);
  useEffect(() => { index.current = i; api.current?.setActive(i); }, [i]);
  useEffect(() => {
    if (reduced || hold || !on) return;
    const id = setTimeout(() => setI((n) => (n + 1) % LAW.rows.length), STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, on, LAW.rows.length]);

  return (
    <section id="law" className="wrap relative py-14 sm:py-20">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{LAW.title}</h2>
        <p className="t-lead muted mt-4">{LAW.lead}</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-y-4 lg:grid-cols-12 lg:items-center lg:gap-x-10" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        {on && (
          <div className="lg:col-span-6">
            <div className="scene relative mx-auto aspect-[5/4] w-full max-w-[560px]" role="img" aria-label={LAW.lead}>
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        )}
        <ul className={`flex flex-col ${on ? "lg:col-span-6" : "lg:col-span-12"}`}>
          {LAW.rows.map((r, n) => {
            const ok = r.status === "done", active = on && n === i;
            return (
              <li
                key={r.req}
                onMouseEnter={() => setI(n)}
                onClick={() => setI(n)}
                className={`grid cursor-default grid-cols-[28px_1fr] gap-x-3 border-l-2 py-3.5 pl-4 pr-2 transition-colors duration-300 sm:grid-cols-[28px_1fr_auto] ${active ? "border-[hsl(var(--accent))] bg-[hsl(var(--line)/0.04)]" : "border-[hsl(var(--line)/0.1)]"}`}
              >
                <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${ok ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]" : "border border-dashed border-[hsl(var(--line)/0.4)]"}`}>
                  {ok && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                </span>
                <div>
                  <p className="text-[15.5px] font-medium leading-snug">{r.req}</p>
                  <p className="muted mt-1 text-[14px] leading-snug">{r.how}</p>
                </div>
                <span className={`col-start-2 mt-1.5 text-[13px] font-semibold sm:col-start-3 sm:mt-0.5 sm:whitespace-nowrap ${ok ? "text-[hsl(var(--ok))]" : "muted"}`}>{LAW.status[r.status as keyof typeof LAW.status]}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="t-small muted mt-6">{LAW.source}</p>
    </section>
  );
};

export default Law;
