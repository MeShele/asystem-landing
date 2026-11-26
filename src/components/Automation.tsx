import { useCallback, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import Steps from "@/components/Steps";
import { useScene } from "@/components/useScene";
import { DEALS } from "@/content";
import { useContent, useLang } from "@/i18n";

const CYCLE = DEALS.reduce((s, d) => s + d.profit, 0);
/** доход обменника после n сделок: сделки идут по кругу */
const income = (n: number) => Math.floor(n / DEALS.length) * CYCLE + DEALS.slice(0, n % DEALS.length).reduce((s, d) => s + d.profit, 0);

/**
 * Модуль «Автообмен»: сделка без сотрудника. Сцена — конвейер (src/three/gears.ts): слева клиент отдаёт,
 * справа получает, пары меняются — фиат и крипта в обе стороны. С каждой сделки машина выбрасывает
 * монету дохода в кассу обменника, и счётчик дохода растёт; рядом всплывает доход с этой сделки.
 * На широком экране подписи стоят на самой сцене, на узком — строкой под ней.
 * Под сценой — что получает каждая сторона: обменник и клиент.
 */
const Automation = () => {
  const { AUTOMATION: A } = useContent();
  const { lang } = useLang();
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState(0);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/gears").then((m) => m.mountGears({ canvas, labels: labels.current, deals: DEALS, onDeal: setLanded })),
    [],
  );
  const { canvas, on } = useScene(mount);
  const num = new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US");
  const total = `${landed > 0 ? "+" : ""}${num.format(income(landed))} ${A.scene.currency}`;
  const last = landed > 0 ? `+${num.format(DEALS[(landed - 1) % DEALS.length].profit)}` : "";

  return (
    <section id="automation" className="wrap relative py-14 sm:py-20">
      <Reveal className="relative z-[1] max-w-[640px]">
        <h2 className="t-h2">{A.title}</h2>
        <p className="t-lead muted mt-4">{A.lead}</p>
      </Reveal>
      {on && (
        <>
          {/* на телефоне сцена от края до края экрана: конвейер широкий, в полях страницы он мелкий */}
          <div className="scene relative mt-4 aspect-[4/3] max-md:mx-[calc(clamp(20px,4vw,32px)*-1)] md:aspect-[3/1]" role="img" aria-label={A.scene.label}>
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            <div ref={(el) => { labels.current[0] = el; }} className="scene-tag hidden lg:block">
              <div className="scene-tag-up"><p className="font-display text-[14px] font-medium">{A.scene.give}</p></div>
            </div>
            <div ref={(el) => { labels.current[1] = el; }} className="scene-tag hidden lg:block">
              <div className="scene-tag-up">
                <p className="font-display text-[14px] font-medium text-[hsl(var(--accent-ink))]">{A.scene.get} ✓</p>
                <p className="muted mt-1 text-[12.5px]">{A.scene.getNote}</p>
              </div>
            </div>
            <div ref={(el) => { labels.current[2] = el; }} className="scene-tag hidden lg:block">
              <div className="scene-tag-side">
                <p className="muted text-[12.5px]">{A.scene.cash}</p>
                <p className="font-display text-[19px] font-semibold tabular-nums text-[hsl(var(--accent-ink))]">{total}</p>
              </div>
            </div>
            <div ref={(el) => { labels.current[3] = el; }} className="scene-tag hidden lg:block" aria-hidden="true">
              {last && <span key={landed} className="cash-pop font-display font-semibold">{last}</span>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 lg:hidden" aria-live="off">
            <p className="text-[15px]">
              <span className="muted">{A.scene.cash} </span>
              <span className="font-display font-semibold tabular-nums text-[hsl(var(--accent-ink))]">{total}</span>
            </p>
            <p className="text-[15px]">
              <span className="text-[hsl(var(--accent-ink))]">✓</span> {A.scene.get} <span className="muted">· {A.scene.getNote}</span>
            </p>
          </div>
          <p className="muted mt-2 text-[13px]">{A.scene.caption}</p>
        </>
      )}
      <div className={`grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 ${on ? "mt-8" : "mt-10"}`}>
        {A.sides.map((side) => (
          <Reveal key={side.key}>
            <h3 className="t-h3">{side.title}</h3>
            <Steps className="mt-5" items={side.steps.map((n, k) => ({ id: n.id, title: n.title, text: n.text, accent: k === side.steps.length - 1 }))} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Automation;
