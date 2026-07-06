import type { ReactNode } from "react";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import ExchangeWidget from "@/components/ExchangeWidget";
import { DEMO_URL, HERO } from "@/content";

const checks = ["Лицензия оператора обмена ВА", "Деплой в 1 клик", "KYC/AML внутри"];

const BrowserFrame = ({
  children,
  url = "admin.your-exchange.kg",
  src,
  alt,
}: {
  children?: ReactNode;
  url?: string;
  src?: string;
  alt?: string;
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_80px_-20px_hsl(240_10%_6%/0.25)]">
    <div className="flex items-center gap-1.5 border-b border-border bg-secondary/60 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="h-2.5 w-2.5 rounded-full bg-border" />
      <span className="ml-3 hidden rounded-md bg-background px-3 py-0.5 text-[11px] text-muted-foreground sm:block">
        {url}
      </span>
    </div>
    {children ?? <img src={src} alt={alt} className="block w-full" loading="eager" />}
  </div>
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 120, damping: 20 } },
} as const;

const Hero = () => (
  <section id="top" className="relative overflow-hidden border-b border-border">
    {/* сетка с радиальным растворением к краям */}
    <div
      className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:48px_48px] opacity-[0.5]"
      style={{
        maskImage: "radial-gradient(ellipse 90% 80% at 50% 0%, #000 55%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 0%, #000 55%, transparent 100%)",
      }}
    />
    {/* лаймовое дыхание за виджетом + мягкий блоб слева */}
    <div className="absolute -right-32 top-8 -z-10 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[110px] dark:bg-accent/10" />
    <div className="absolute -left-40 bottom-0 -z-10 h-80 w-80 rounded-full bg-secondary blur-[90px] dark:bg-accent/5" />
    <div className="absolute inset-x-0 top-0 -z-10 h-px hairline" />

    <div className="container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.span
          variants={rise}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          {HERO.badge}
        </motion.span>

        <motion.h1
          variants={rise}
          className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
        >
          {HERO.h1a}{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">{HERO.h1accent}</span>
            {/* марк рисуется слева направо после появления заголовка */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-1 -z-0 h-3 origin-left bg-accent/70 dark:bg-accent/30"
            />
          </span>{" "}
          {HERO.h1b}
        </motion.h1>

        <motion.p variants={rise} className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {HERO.sub}
        </motion.p>

        <motion.div variants={rise} className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button variant="signal" size="lg" className="group w-full sm:w-auto" asChild>
            <a href="#demo">
              {HERO.ctaPrimary} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
          <Button variant="outline" size="lg" className="group w-full sm:w-auto" asChild>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              {HERO.ctaSecondary}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
            </a>
          </Button>
        </motion.div>

        <motion.div variants={rise} className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {checks.map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Check className="h-4 w-4 text-foreground" /> {c}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 28, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.25 }}
        className="relative"
      >
        <div className="absolute -inset-8 -z-10 rounded-[2rem] bg-accent/10 blur-3xl dark:bg-accent/[0.07]" />
        <BrowserFrame url="exchange.your-exchange.kg">
          <ExchangeWidget />
        </BrowserFrame>
      </motion.div>
    </div>
  </section>
);

export default Hero;
export { BrowserFrame };
