import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import ShaderBackground from "@/components/ShaderBackground";
import ProductVideo from "@/components/ProductVideo";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent, useLang } from "@/i18n";
import { usePlatformStats } from "@/lib/platformStats";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Заголовок построчно поднимается из-под маски; под reduced-motion только проявляется. */
const KineticLines = ({ lines, reduced }: { lines: string[]; reduced: boolean }) => (
  <h1 className="t-display max-w-[14ch]">
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

const Hero = () => {
  const { HERO } = useContent();
  const { lang } = useLang();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const reduced = !!useReducedMotion();

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -80]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-32 sm:pt-40">
      <ShaderBackground className="absolute inset-0 -z-10 h-[120%]" />

      <div className="wrap">
        <div className="max-w-[760px]">
          <KineticLines lines={HERO.h1Lines} reduced={reduced} />
          <motion.p {...fade(0.42)} className="t-lead muted mt-7 max-w-[46ch]">{HERO.sub}</motion.p>
          <motion.div {...fade(0.52)} className="mt-9 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-signal" onClick={() => openLead({ source: "get.asystem.ai/hero" })}>{HERO.cta}</button>
            <a href={HERO.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{HERO.ctaSecondary}</a>
          </motion.div>
          <motion.ul {...fade(0.62)} className="mt-8 flex flex-wrap gap-2" aria-label={lang === "ru" ? "Факты" : "Facts"}>
            <li className="chip"><i className="dot" />{HERO.fact(stats?.exchangers ?? null)}</li>
            {HERO.facts.map((f) => <li key={f} className="chip">{f}</li>)}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.55 }}
          className="mt-16 sm:mt-20"
        >
          <motion.div style={{ y }}>
            <ProductVideo src="/demos/orders.mp4" poster="/shots/orders-dark.jpg" ratio={1600 / 1000} label={HERO.videoLabel} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
