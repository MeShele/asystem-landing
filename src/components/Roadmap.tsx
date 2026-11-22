import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

const DAY = 86_400_000;
/** доля оси под зону «дальше» — планы без дат */
const LATER = 0.15;
const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Роадмап: шкала времени по месяцам, у каждого пункта своя полоса от начала до срока.
 * Лаймовая вертикаль «сегодня» ставится по часам посетителя, полоса текущего пункта залита
 * до неё. Статус «сделано» берётся только из content (done), а не из календаря: срок может
 * пройти, а работа — нет, и тогда пункт честно остаётся «в работе».
 * На узком экране шкалы нет: пункты идут столбиком со сроком над названием.
 */
const Roadmap = () => {
  const { ROADMAP } = useContent();
  const reduced = !!useReducedMotion();
  const [now] = useState(() => Date.now());
  const a = ms(ROADMAP.range[0]), b = ms(ROADMAP.range[1]) + DAY;
  /** место на шкале в процентах её ширины */
  const pos = (t: number) => (Math.max(0, Math.min(1, (t - a) / (b - a))) * (1 - LATER)) * 100;
  const today = now >= a && now <= b ? pos(now) : null;

  const rows = ROADMAP.items.map((it) => {
    const from = ms(it.from), to = ms(it.to) + DAY;
    const state: "done" | "now" | "next" = it.done ? "done" : now < from ? "next" : "now";
    const left = pos(from), width = pos(to) - left;
    const fill = state === "done" ? 1 : state === "now" ? Math.max(0.04, Math.min(1, (now - from) / (to - from))) : 0;
    return { ...it, state, left, width, fill };
  });
  const laterLeft = (1 - LATER) * 100;

  const bar = (i: number) => reduced ? {} : {
    initial: { scaleX: 0, opacity: 0 }, whileInView: { scaleX: 1, opacity: 1 }, viewport: { once: true, margin: "0px 0px -12% 0px" },
    transition: { duration: 0.7, delay: 0.1 + i * 0.07, ease: EASE },
  };

  return (
    <section id="roadmap" className="wrap py-14 sm:py-20">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{ROADMAP.title}</h2>
        <p className="t-lead muted mt-4">{ROADMAP.lead}</p>
      </Reveal>

      {/* широкий экран: шкала */}
      <div className="relative mt-10 hidden lg:block" style={{ "--lab": "clamp(270px, 29vw, 400px)" } as CSSProperties}>
        {/* сетка месяцев, зона «дальше» и линия «сегодня» — под строками, на всю высоту */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0" style={{ left: "calc(var(--lab) + 2.5rem)" }}>
          {ROADMAP.months.map((m) => (
            <div key={m.at} className="absolute inset-y-0 border-l border-[hsl(var(--line)/0.08)]" style={{ left: `${pos(ms(m.at))}%` }}>
              <span className="muted absolute left-2.5 top-0 whitespace-nowrap text-[13px]">{m.label}</span>
            </div>
          ))}
          <div
            className="absolute inset-y-0 right-0 border-l border-dashed border-[hsl(var(--line)/0.2)]"
            style={{ left: `${laterLeft}%`, background: "repeating-linear-gradient(135deg, hsl(var(--line) / 0.045) 0 1px, transparent 1px 9px)" }}
          >
            <span className="muted absolute left-2.5 top-0 whitespace-nowrap text-[13px]">{ROADMAP.later}</span>
          </div>
          {today !== null && (
            // линия начинается под строкой месяцев, чтобы не перечёркивать их названия
            <div className="absolute bottom-0 top-[27px] w-px bg-[hsl(var(--accent))] shadow-[0_0_14px_hsl(var(--accent)/0.7)]" style={{ left: `${today}%` }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--accent))] px-2 py-[3px] text-[11px] font-semibold leading-none text-[hsl(var(--accent-fg))]">{ROADMAP.today}</span>
            </div>
          )}
        </div>

        <ol className="relative pt-[62px]">
          {rows.map((r, i) => {
            const before = r.left + r.width > 70;      // подпись срока слева от полосы, если справа ей не хватит места
            return (
              <li key={r.id} className="grid grid-cols-[var(--lab)_1fr] items-center gap-x-10 border-t border-[hsl(var(--line)/0.08)] py-3.5">
                <div>
                  <p className={`font-display text-[16px] font-medium leading-snug ${r.state === "now" ? "text-[hsl(var(--accent-ink))]" : ""}`}>{r.title}</p>
                  <p className="muted mt-1 text-[14px] leading-snug">{r.text}</p>
                </div>
                <div className="relative h-9">
                  {/* место полосы задаёт обёртка: motion пишет свой transform и снял бы вертикальное центрирование */}
                  <div className="absolute top-1/2 h-[10px] min-w-[10px] -translate-y-1/2" style={{ left: `${r.left}%`, width: `${r.width}%` }}>
                    <motion.div
                      {...bar(i)}
                      className={`relative h-full w-full overflow-hidden rounded-full ${r.state === "done" ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--accent)/0.13)] ring-1 ring-inset ring-[hsl(var(--accent)/0.5)]"}`}
                      style={{ transformOrigin: "0 50%" }}
                    >
                      {r.state === "now" && <span className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--accent))]" style={{ width: `${r.fill * 100}%` }} />}
                    </motion.div>
                  </div>
                  {/* у пункта в работе на конце залитой части бьётся точка */}
                  {r.state === "now" && r.fill < 1 && (
                    <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.left + r.width * r.fill}%` }}>
                      <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--accent))] opacity-60 motion-reduce:hidden" />
                      <span className="absolute inset-0 rounded-full bg-[hsl(var(--accent))]" />
                    </span>
                  )}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] ${r.state === "next" ? "muted" : ""}`}
                    style={before ? { right: `calc(${100 - r.left}% + 12px)` } : { left: `calc(${r.left + r.width}% + 12px)` }}
                  >
                    {r.when}{r.state !== "next" && <span className="muted"> · {ROADMAP.status[r.state]}</span>}
                  </span>
                </div>
              </li>
            );
          })}
          {/* планы без точных дат: пунктирная полоса в зоне «дальше» */}
          {ROADMAP.beyond.map((r, i) => (
            <li key={r.id} className="grid grid-cols-[var(--lab)_1fr] items-center gap-x-10 border-t border-[hsl(var(--line)/0.08)] py-3.5">
              <div>
                <p className="font-display text-[16px] font-medium leading-snug">{r.title}</p>
                <p className="muted mt-1 text-[14px] leading-snug">{r.text}</p>
              </div>
              <div className="relative h-9">
                <div className="absolute right-0 top-1/2 h-[10px] -translate-y-1/2" style={{ left: `${laterLeft + 1.5}%` }}>
                  <motion.div {...bar(rows.length + i)} className="h-full w-full rounded-full border border-dashed border-[hsl(var(--accent)/0.6)]" style={{ transformOrigin: "0 50%" }} />
                </div>
                <span className="muted absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[13px]" style={{ right: `calc(${100 - laterLeft}% + 12px)` }}>{r.when}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* узкий экран: столбик со сроком над названием */}
      <ol className="mt-8 flex flex-col gap-6 border-l-2 border-[hsl(var(--accent)/0.45)] pl-5 lg:hidden">
        {[...rows.map((r) => ({ id: r.id, when: r.when, title: r.title, text: r.text, state: r.state as string })), ...ROADMAP.beyond.map((r) => ({ ...r, state: "next" }))].map((r) => (
          <li key={r.id}>
            <p className={`text-[13px] ${r.state === "now" ? "text-[hsl(var(--accent-ink))]" : "muted"}`}>
              {r.when}{r.state === "now" || r.state === "done" ? ` · ${ROADMAP.status[r.state as "now" | "done"]}` : ""}
            </p>
            <p className="mt-1 font-display text-[16px] font-medium leading-snug">{r.title}</p>
            <p className="muted mt-1 text-[14px] leading-snug">{r.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Roadmap;
