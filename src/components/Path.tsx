import { useCallback, useRef } from "react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";

/**
 * Путь заявки: плата с пятью микросхемами-шагами на общей шине (сцена — src/three/board.ts).
 * Подписи шагов стоят над микросхемами на лучах; место им каждый кадр сообщает сцена. На телефоне
 * и без сцены шаги идут текстом под ней.
 */
const Path = () => {
  const { PATH } = useContent();
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const base = useRef<HTMLDivElement>(null);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/board").then((m) => m.mountBoard({ canvas, labels: tags.current, base: base.current })),
    [],
  );
  const { canvas, on } = useScene(mount);
  const list = [...PATH.steps.map((s, i) => ({ ...s, accent: i === PATH.steps.length - 1 })), { ...PATH.base, muted: true }];

  return (
    <section id="path" className="wrap py-14 sm:py-20">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{PATH.title}</h2>
        <p className="t-lead muted mt-4">{PATH.lead}</p>
      </Reveal>
      {on ? (
        <>
          <div className="scene relative mt-6 aspect-[4/3] md:mt-2 md:aspect-[12/5]" role="img" aria-label={PATH.label}>
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            {PATH.steps.map((s, i) => (
              <div key={s.id} ref={(el) => { tags.current[i] = el; }} className="scene-tag hidden md:block">
                <div className="scene-tag-up">
                  <p className={`font-display text-[14px] font-medium leading-tight ${i === PATH.steps.length - 1 ? "text-[hsl(var(--accent-ink))]" : ""}`}>{s.title}</p>
                  <p className="muted mt-1 text-[12.5px] leading-snug">{s.text}</p>
                </div>
              </div>
            ))}
            <div ref={base} className="scene-tag hidden md:block">
              <div className="scene-tag-down">
                <p className="font-display text-[14px] font-medium leading-tight">{PATH.base.title}</p>
                <p className="muted mt-1 text-[12.5px] leading-snug">{PATH.base.text}</p>
              </div>
            </div>
          </div>
          <Steps items={list} className="mt-6 md:hidden" />
        </>
      ) : (
        <Steps items={list} columns className="mt-10" />
      )}
    </section>
  );
};

export default Path;
