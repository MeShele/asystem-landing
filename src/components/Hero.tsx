import { motion, useReducedMotion } from "motion/react";
import Schema from "@/components/Schema";
import ReliefMap from "@/components/ReliefMap";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent, useLang } from "@/i18n";
import { usePlatformStats } from "@/lib/platformStats";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Заголовок построчно поднимается из-под маски; под reduced-motion только проявляется. */
const KineticLines = ({ lines, reduced }: { lines: string[]; reduced: boolean }) => (
  <h1 className="t-display">
    {lines.map((line, i) => (
      <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
        <motion.span
          className="block"
          initial={reduced ? { opacity: 0 } : { y: "108%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.1 + i * 0.09 }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </h1>
);

/**
 * Герой: короткий текст по центру и под ним схема пути заявки через закон — клиент, сайт,
 * оплата, оператор, Финнадзор; по схеме бежит импульс заявки. Это главная картинка сайта,
 * и дальше каждая секция показывает её участок крупнее.
 */
const Hero = () => {
  const { HERO } = useContent();
  const { lang } = useLang();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const reduced = !!useReducedMotion();

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-6">
          <div className="relative z-[1] text-center lg:col-span-7 lg:text-left">
            <KineticLines lines={HERO.h1Lines} reduced={reduced} />
            <motion.p {...fade(0.42)} className="t-lead muted mx-auto mt-7 max-w-[46ch] lg:mx-0 lg:max-w-[38ch]">{HERO.sub}</motion.p>
            <motion.div {...fade(0.52)} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button type="button" className="btn btn-signal" onClick={() => openLead({ source: "get.asystem.ai/hero" })}>{HERO.cta}</button>
              <a href={HERO.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{HERO.ctaSecondary}</a>
            </motion.div>
            <motion.ul {...fade(0.62)} className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label={lang === "ru" ? "Факты" : "Facts"}>
              <li className="chip"><i className="dot" />{HERO.fact(stats?.exchangers ?? null)}</li>
              {HERO.facts.map((f) => <li key={f} className="chip">{f}</li>)}
            </motion.ul>
          </div>
          <div className="lg:col-span-5">
            <ReliefMap
              className="hero-map aspect-[3/2] max-lg:mx-auto max-lg:w-full max-lg:max-w-[640px]"
              label={HERO.map.label}
              city={HERO.map.city}
              note={HERO.map.note}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.55 }}
          className="mt-10 sm:mt-12"
        >
          <Schema graph={HERO.schema} label={HERO.shotLabel} large />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
