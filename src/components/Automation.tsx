import { useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { useContent } from "@/i18n";

/**
 * Этап 2: сделка без сотрудника. Сцена — механизм (src/three/gears.ts): шестерни крутятся сами,
 * по ближней дорожке слева направо идёт покупка, по дальней справа налево — продажа. Под сценой
 * шаги обеих сделок текстом; узел «сотрудник не участвует» не рисуется — человека в механизме нет.
 */
const Automation = () => {
  const { AUTOMATION } = useContent();
  const mount = useCallback((canvas: HTMLCanvasElement) => import("@/three/gears").then((m) => m.mountGears({ canvas })), []);
  const { canvas, on } = useScene(mount);
  return (
    <section id="automation" className="wrap relative py-14 sm:py-20">
      <Reveal className="relative z-[1] max-w-[640px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{AUTOMATION.eyebrow}</p>
        <h2 className="t-h2 mt-3">{AUTOMATION.title}</h2>
        <p className="t-lead muted mt-4">{AUTOMATION.lead}</p>
      </Reveal>
      {on && (
        <div className="scene relative mt-4 aspect-[4/3] md:aspect-[12/5]" role="img" aria-label={AUTOMATION.title}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        </div>
      )}
      <div className={`grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 ${on ? "mt-2" : "mt-10"}`}>
        {AUTOMATION.flows.map((f, i) => {
          const steps = f.schema.nodes.filter((n) => n.kind !== "ghost");
          return (
            <Reveal key={f.key}>
              <h3 className="t-h3 flex items-center gap-2.5">
                {f.title}
                {i === 0 ? <ArrowRight className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden="true" />}
              </h3>
              <Steps className="mt-5" items={steps.map((n, k) => ({ id: n.id, title: n.title, text: n.text, accent: k === steps.length - 1 }))} />
            </Reveal>
          );
        })}
      </div>
      <Reveal className="relative z-[1]"><p className="muted mt-8 max-w-[62ch] text-[15px]">{AUTOMATION.note}</p></Reveal>
    </section>
  );
};

export default Automation;
