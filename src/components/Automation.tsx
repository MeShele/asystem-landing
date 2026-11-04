import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useContent, useLang } from "@/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Сделка без сотрудника: слева два сценария словами, справа лента событий
 * заявки в натуральную величину (data-ui) — строки появляются одна за другой,
 * как в журнале заявки в админке. Два прогона по кругу: покупка и продажа.
 * При reduced motion лента показана целиком, без анимации.
 */
const Automation = () => {
  const { AUTOMATION } = useContent();
  const { t } = useLang();
  const reduced = !!useReducedMotion();
  const [run, setRun] = useState(0);        // 0 — покупка, 1 — продажа
  const [shown, setShown] = useState(reduced ? 99 : 1);
  const flow = AUTOMATION.flows[run];

  useEffect(() => {
    if (reduced) return;
    const total = flow.log.length;
    const id = window.setTimeout(() => {
      if (shown < total) setShown((n) => n + 1);
      else { setRun((r) => (r === 0 ? 1 : 0)); setShown(1); }
    }, shown < total ? 1500 : 3200);
    return () => window.clearTimeout(id);
  }, [shown, run, flow.log.length, reduced]);

  return (
    <section id="automation" className="wrap py-20 sm:py-28">
      <Reveal className="max-w-[640px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{AUTOMATION.eyebrow}</p>
        <h2 className="t-h2 mt-3">{AUTOMATION.title}</h2>
        <p className="t-lead muted mt-5">{AUTOMATION.lead}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <Reveal className="flex flex-col gap-4 lg:col-span-5">
          {AUTOMATION.flows.map((f, i) => (
            <button
              key={f.key}
              type="button"
              onClick={() => { setRun(i); setShown(reduced ? 99 : 1); }}
              className={`panel p-6 text-left transition-colors ${run === i ? "ring-1 ring-[hsl(var(--accent)/0.6)]" : "hover:bg-[hsl(var(--surface-2))]"}`}
              aria-pressed={run === i}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="t-h3">{f.title}</h3>
                <span className="chip">{t("автомат", "automatic")}</span>
              </div>
              <ol className="muted mt-3 space-y-1.5 text-[15px]">
                {f.steps.map((s, j) => (
                  <li key={j} className="flex gap-3"><span className="ui-num shrink-0 tabular-nums opacity-60">{j + 1}</span><span>{s}</span></li>
                ))}
              </ol>
            </button>
          ))}
          <p className="muted text-[15px]">{AUTOMATION.note}</p>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <div className="panel flex min-h-[420px] flex-col p-6 sm:p-8">
            <div data-ui className="ui-card w-full p-5">
              <div className="ui-row">
                <span className="font-semibold">{flow.order.title} · <span className="ui-code ui-k">{flow.order.id}</span></span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`${run}-${Math.min(shown, flow.log.length)}`}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className={`ui-chip ${shown >= flow.log.length ? "ui-chip-ok" : "ui-chip-accent"}`}
                  >
                    {shown >= flow.log.length ? flow.order.done : flow.order.live}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="ui-k mt-1">{flow.order.summary}</div>

              <ol className="ui-line mt-4 pt-4">
                <AnimatePresence initial={false}>
                  {flow.log.slice(0, shown).map((e, i) => (
                    <motion.li
                      key={`${run}-${i}`}
                      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="flex gap-4 py-2"
                    >
                      <span className="ui-k ui-num w-12 shrink-0">{e.time}</span>
                      <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full" style={{ background: e.actor === "system" ? "hsl(var(--accent))" : e.actor === "network" ? "hsl(var(--ok))" : "hsl(var(--muted))" }} />
                      <div className="min-w-0">
                        <div className="font-medium">{e.text}</div>
                        {e.meta && <div className="ui-k ui-code mt-0.5 break-all">{e.meta}</div>}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-[13px]">
              {AUTOMATION.legend.map((l, i) => (
                <span key={i} className="muted inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: i === 0 ? "hsl(var(--muted))" : i === 1 ? "hsl(var(--accent))" : "hsl(var(--ok))" }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Automation;
