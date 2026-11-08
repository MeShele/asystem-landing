import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Collage from "@/components/Collage";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent, useLang } from "@/i18n";
import { HERO_COLLAGE } from "@/lib/collages";
import { usePlatformStats } from "@/lib/platformStats";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Заголовок построчно поднимается из-под маски; под reduced-motion только проявляется. */
const KineticLines = ({ lines, reduced }: { lines: string[]; reduced: boolean }) => (
  <h1 className="t-display max-w-[16ch] lg:max-w-[12ch]">
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
 * Герой: текст слева, справа коллаж из настоящих экранов продукта — заявки в админке
 * оператора и виджет обмена с сайта клиента. Коллаж уходит за правый край экрана
 * и чуть подъезжает при скролле.
 */
const Hero = () => {
  const { HERO } = useContent();
  const { lang } = useLang();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const reduced = !!useReducedMotion();

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -30]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-40">
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:text-left">
            <KineticLines lines={HERO.h1Lines} reduced={reduced} />
            <motion.p {...fade(0.42)} className="t-lead muted mx-auto mt-7 max-w-[44ch] lg:mx-0">{HERO.sub}</motion.p>
            <motion.div {...fade(0.52)} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button type="button" className="btn btn-signal" onClick={() => openLead({ source: "get.asystem.ai/hero" })}>{HERO.cta}</button>
              <a href={HERO.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{HERO.ctaSecondary}</a>
            </motion.div>
            <motion.ul {...fade(0.62)} className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label={lang === "ru" ? "Факты" : "Facts"}>
              <li className="chip"><i className="dot" />{HERO.fact(stats?.exchangers ?? null)}</li>
              {HERO.facts.map((f) => <li key={f} className="chip">{f}</li>)}
            </motion.ul>
          </div>

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: reduced ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.5 }}
            className="relative"
          >
            <motion.div style={{ y }}>
              <Collage
                aspect={HERO_COLLAGE.aspect}
                shards={HERO_COLLAGE.shards}
                alt={HERO.shotLabel}
                className="w-full lg:w-[122%]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
