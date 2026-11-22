import { useCallback, useRef } from "react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";

/**
 * Запуск за четыре шага как восхождение: рельеф пика Победы, по леднику к вершине идёт маршрут
 * с четырьмя лагерями-шагами (сцена — src/three/peak.ts). У лагерей стоят только названия шагов,
 * чтобы не закрывать рельеф; пояснения — списком слева, на телефоне — под сценой.
 */
const HowItWorks = () => {
  const { STEPS } = useContent();
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/peak").then((m) => m.mountPeak({ canvas, labels: tags.current, url: "/relief/peak.webp" })),
    [],
  );
  const { canvas, on } = useScene(mount);
  const steps = STEPS.schema.nodes.map((n, i, all) => ({ id: n.id, title: n.title, text: n.text, accent: i === all.length - 1 }));

  return (
    <section id="how" className="wrap py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:items-center lg:gap-x-10">
        <Reveal className="lg:col-span-4">
          <h2 className="t-h2">{STEPS.title}</h2>
          <p className="t-lead muted mt-4">{STEPS.note}</p>
          {on && <Steps items={steps} className="mt-8 hidden lg:flex" />}
          {on && <p className="t-small muted mt-8 hidden max-w-[36ch] lg:block">{STEPS.peak}</p>}
        </Reveal>
        {on ? (
          <div className="lg:col-span-8">
            <div className="scene relative aspect-[4/3] lg:aspect-[3/2]" role="img" aria-label={`${STEPS.title}. ${STEPS.peak}`}>
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
              {steps.map((s, i) => (
                <div key={s.id} ref={(el) => { tags.current[i] = el; }} className="scene-tag hidden md:block">
                  <div className="scene-tag-side">
                    <p className={`font-display text-[13px] font-medium leading-none ${s.accent ? "text-[hsl(var(--accent-ink))]" : ""}`}>{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <Steps items={steps} className="mt-6 md:hidden" />
          </div>
        ) : (
          <Steps items={steps} className="lg:col-span-8" />
        )}
      </div>
    </section>
  );
};

export default HowItWorks;
