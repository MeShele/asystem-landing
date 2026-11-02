import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SetupFragment } from "@/components/fragments/Panels";
import { useContent } from "@/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Запуск за четыре стадии: слева закреплённый фрагмент продукта в состоянии
 * стадии, справа стадии идут друг за другом; активная определяется по
 * положению в экране. На телефоне фрагмент показывается под каждой стадией.
 */
const StageView = ({ i, reduced }: { i: 0 | 1 | 2 | 3; reduced: boolean }) => (
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={i}
      initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.28, ease: EASE }}
      className="w-full"
    >
      <SetupFragment stage={i} />
    </motion.div>
  </AnimatePresence>
);

const HowItWorks = () => {
  const { STEPS } = useContent();
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState<0 | 1 | 2 | 3>(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLLIElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i) as 0 | 1 | 2 | 3);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="how" className="wrap py-20 sm:py-28">
      <div className="max-w-[640px]">
        <h2 className="t-h2">{STEPS.title}</h2>
        <p className="t-lead muted mt-5">{STEPS.note}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="hidden lg:block">
          <div className="panel sticky top-24 flex min-h-[520px] items-center p-8">
            <StageView i={active} reduced={reduced} />
          </div>
        </div>

        <ol className="flex flex-col gap-6 lg:gap-0">
          {STEPS.stages.map((s, k) => {
            const on = k === active;
            return (
              <li
                key={s.short}
                ref={(el) => { refs.current[k] = el; }}
                data-i={k}
                className="lg:flex lg:min-h-[60vh] lg:flex-col lg:justify-center"
              >
                <div className={`transition-opacity duration-300 ${on ? "opacity-100" : "lg:opacity-40"}`}>
                  <p className="t-small font-semibold text-accent">{s.short}</p>
                  <h3 className="t-h2 mt-2 max-w-[14ch]">{s.clause}</h3>
                  <p className="muted mt-4 max-w-[44ch]">{s.text}</p>
                </div>
                <div className="panel mt-6 p-5 lg:hidden">
                  <SetupFragment stage={k as 0 | 1 | 2 | 3} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
