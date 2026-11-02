import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Вопросы: аккордеон, высота и прозрачность, 240ms ease-out; первый открыт. */
const Faq = () => {
  const { FAQ } = useContent();
  const reduced = !!useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="wrap py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal>
          <h2 className="t-h2">{FAQ.title}</h2>
          <p className="t-lead muted mt-5 max-w-[30ch]">{FAQ.lead}</p>
        </Reveal>
        <Reveal className="panel divide-y divide-line">
          {FAQ.items.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left transition-colors duration-200 hover:bg-[hsl(var(--line)/0.03)]"
                >
                  <span className="font-medium">{f.q}</span>
                  <Plus className={`h-5 w-5 shrink-0 muted transition-transform duration-200 ${on ? "rotate-45" : ""}`} style={{ transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }} />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="muted px-6 pb-6 max-w-[62ch]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
