import { useCallback, useRef } from "react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";

/**
 * Запуск за четыре шага: четыре остановки на одной площадке — рукопожатие над договором,
 * серверная стойка, пульт настройки, здание обменника (сцена — src/three/launch.ts).
 * На широком экране название и пояснение шага стоят над его остановкой; на узком подписи
 * не помещаются, шаги идут списком под сценой. Без сцены — только список.
 */
const HowItWorks = () => {
  const { STEPS } = useContent();
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/launch").then((m) => m.mountLaunch({ canvas, labels: tags.current })),
    [],
  );
  const { canvas, on } = useScene(mount);
  const steps = STEPS.steps.map((s, i, all) => ({ ...s, accent: i === all.length - 1 }));

  return (
    <section id="how" className="wrap py-14 sm:py-20">
      <Reveal>
        <h2 className="t-h2">{STEPS.title}</h2>
        <p className="t-lead muted mt-4">{STEPS.note}</p>
      </Reveal>
      {on ? (
        <>
          <div className="scene relative mt-6 aspect-[4/3] md:aspect-[2/1] lg:mt-0 lg:aspect-[5/2]" role="img" aria-label={STEPS.label}>
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            {steps.map((s, i) => (
              <div key={s.id} ref={(el) => { tags.current[i] = el; }} className="scene-tag hidden lg:block">
                <div className="scene-tag-up">
                  <p className={`font-display text-[14px] font-medium leading-tight ${s.accent ? "text-[hsl(var(--accent-ink))]" : ""}`}>{s.title}</p>
                  <p className="muted mt-1 text-[12.5px] leading-snug">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Steps items={steps} columns className="mt-6 lg:hidden" />
        </>
      ) : (
        <Steps items={steps} columns className="mt-10" />
      )}
    </section>
  );
};

export default HowItWorks;
