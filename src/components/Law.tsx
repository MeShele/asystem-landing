import { useCallback, useEffect, useRef, useState } from "react";
import { FileChartColumn, SearchCheck, Server, UserRoundCheck } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useScene } from "@/components/useScene";
import { useStill } from "@/components/useStill";
import { useContent } from "@/i18n";
import type { ShieldHandle } from "@/three/shield";

const STEP_MS = 3200;
/** значки групп — те же, что выгравированы в окнах щита, в том же порядке */
const ICONS = [UserRoundCheck, SearchCheck, Server, FileChartColumn];

/**
 * Требования ГСФР, закрытые платформой: четыре группы по два-три слова. Слева точёный щит
 * с кодовым диском сейфа (сцена — src/three/shield.ts), справа группы списком. Строка и вставка щита
 * выбираются вместе — сами по очереди, по наведению или касанию; метка диска поворачивается к выбранной.
 */
const Law = () => {
  const { LAW } = useContent();
  const reduced = !!useReducedMotion();
  const still = useStill();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const api = useRef<ShieldHandle | null>(null);
  const index = useRef(0);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/shield").then((m) => m.mountShield({ canvas })).then((h) => {
      h.setActive(index.current);
      api.current = h;
      return () => { api.current = null; h.dispose(); };
    }),
    [],
  );
  const { canvas, on } = useScene(mount);
  useEffect(() => { index.current = i; api.current?.setActive(i); }, [i]);
  useEffect(() => {
    // на слабом видеочипе строки сами не листаются: каждая смена — отдельная отрисовка щита
    if (reduced || hold || !on || still) return;
    const id = setTimeout(() => setI((n) => (n + 1) % LAW.groups.length), STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, on, still, LAW.groups.length]);

  return (
    <section id="law" className="wrap relative py-14 sm:py-20">
      <Reveal><h2 className="t-h2">{LAW.title}</h2></Reveal>

      <div className="mt-6 grid grid-cols-1 gap-y-2 lg:grid-cols-12 lg:items-center lg:gap-x-10" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        {on && (
          <div className="lg:col-span-5">
            <div className="scene relative mx-auto aspect-[10/11] w-full max-w-[310px] sm:max-w-[380px] lg:max-w-[460px]" role="img" aria-label={LAW.label}>
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            </div>
          </div>
        )}
        <ul className={`flex flex-col ${on ? "lg:col-span-7" : "lg:col-span-12"}`}>
          {LAW.groups.map((g, n) => {
            const Icon = ICONS[n], active = on && n === i;
            return (
              <li
                key={g.key}
                onMouseEnter={() => setI(n)}
                onClick={() => setI(n)}
                className={`grid cursor-default grid-cols-[28px_1fr] items-start gap-x-4 border-l-2 py-4 pl-5 pr-3 transition-colors duration-300 ${active ? "border-[hsl(var(--accent))] bg-[hsl(var(--line)/0.04)]" : "border-[hsl(var(--line)/0.1)]"}`}
              >
                <Icon className="mt-0.5 h-6 w-6 text-[hsl(var(--accent-ink))]" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="font-display text-[17px] font-medium leading-tight">{g.title}</p>
                  <p className="muted mt-1.5 text-[15px] leading-snug">{g.points.join(" · ")}</p>
                </div>
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
