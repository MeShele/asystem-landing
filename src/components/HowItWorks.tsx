import { useCallback, useRef } from "react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";

/**
 * Запуск за четыре шага как сборка обменника: четыре модуля встают друг на друга — основание,
 * этаж со стойками, этаж с окном выдачи, крыша с вывеской (сцена — src/three/build.ts). У модулей
 * стоят только названия шагов; пояснения — списком слева, на телефоне — под сценой.
 */
const HowItWorks = () => {
  const { STEPS } = useContent();
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/build").then((m) => m.mountBuild({ canvas, labels: tags.current })),
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
        </Reveal>
        {on ? (
          <div className="lg:col-span-8">
            <div className="scene relative aspect-[4/3] lg:aspect-[3/2]" role="img" aria-label={STEPS.title}>
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
              {steps.map((s, i) => (
                <div key={s.id} ref={(el) => { tags.current[i] = el; }} className="scene-tag hidden md:block">
                  <div className="scene-tag-side">
                    <p className={`font-display text-[13px] font-medium leading-none ${s.accent ? "text-[hsl(var(--accent-ink))]" : ""}`}>{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
            <Steps items={steps} columns className="mt-6 lg:hidden" />
          </div>
        ) : (
          <Steps items={steps} className="lg:col-span-8" />
        )}
      </div>
    </section>
  );
};

export default HowItWorks;
