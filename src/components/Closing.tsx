import { useState } from "react";
import { Check, Plus, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import Logo from "@/components/Logo";
import { PRICING, FAQ, FINAL_CTA, NAV } from "@/content";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
} as const;

export const Pricing = () => (
  <section id="pricing" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
    <div className="container">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Тарифы</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Выберите модель запуска</h2>
        <p className="mt-4 text-lg text-muted-foreground">{PRICING.note}</p>
      </ScrollReveal>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto mt-12 grid max-w-md items-start gap-6 lg:max-w-5xl lg:grid-cols-3"
      >
        {PRICING.plans.map((p) => (
          <motion.div
            key={p.name}
            variants={rise}
            className={`flex h-full flex-col rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 ${
              p.featured
                ? "border-accent ring-1 ring-accent/40 shadow-[0_28px_80px_-28px_hsl(79_100%_45%/0.45)] hover:shadow-[0_34px_90px_-26px_hsl(79_100%_45%/0.55)]"
                : "border-border hover:border-accent/40 hover:shadow-[0_18px_50px_-24px_hsl(240_10%_6%/0.25)]"
            }`}
          >
            {p.featured && (
              <span className="mb-4 inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Популярный</span>
            )}
            <h3 className="font-display text-xl font-extrabold">{p.name}</h3>
            <p className="mt-1 text-sm font-semibold text-foreground">{p.tagline}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{p.forWho}</p>

            <div className="mt-5 border-t border-border pt-5">
              <div className="font-display text-lg font-bold">{p.priceLabel}</div>
              <div className="text-sm text-muted-foreground">условия — на демо</div>
            </div>

            <ul className="mt-5 flex-1 space-y-2.5">
              {p.includes.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                  <span className="text-muted-foreground">{it}</span>
                </li>
              ))}
            </ul>

            <Button variant={p.featured ? "signal" : "outline"} className="mt-6 w-full" asChild>
              <a href="#demo">{p.cta}</a>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container py-16 sm:py-20 lg:py-24">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Частые вопросы</h2>
      </ScrollReveal>
      <ScrollReveal className="mx-auto mt-10 max-w-3xl">
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50 sm:px-6"
                >
                  <span className="font-display text-base font-semibold">{f.q}</span>
                  <motion.span
                    animate={{ rotate: on ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="shrink-0"
                  >
                    <Plus className={`h-5 w-5 transition-colors ${on ? "text-foreground" : "text-muted-foreground"}`} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 32 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
};

export const FinalCta = () => {
  const [sent, setSent] = useState(false);
  const input =
    "h-11 w-full rounded-[var(--radius)] border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  return (
    <section id="demo" className="relative overflow-hidden border-t border-white/10 bg-[#0B0C0A] py-16 text-white sm:py-20 lg:py-24">
      {/* лаймовое дыхание за формой */}
      <div className="absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-10 rounded-sm bg-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Демо</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{FINAL_CTA.title}</h2>
          <p className="mt-4 text-lg text-white/65">{FINAL_CTA.sub}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/55">
            <Check className="h-4 w-4 text-accent" /> Ответим в течение рабочего дня
          </div>
        </ScrollReveal>

        <ScrollReveal variant="left" delay={120}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.08 }}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"
                >
                  <Check className="h-6 w-6 text-accent-foreground" />
                </motion.div>
                <p className="mt-4 font-display text-lg font-bold">Заявка отправлена</p>
                <p className="mt-1 text-sm text-white/55">Свяжемся с вами в ближайшее время.</p>
              </motion.div>
            ) : (
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <input required placeholder="Имя" className={input} />
                <input required placeholder="Компания" className={input} />
                <input required type="text" placeholder="Telegram / email / телефон" className={input} />
                <Button type="submit" variant="signal" className="group w-full">
                  {FINAL_CTA.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <p className="text-center text-xs text-white/40">Нажимая, вы соглашаетесь на обработку контактных данных</p>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
      <Logo mark="h-7 w-7" icon="h-4 w-4" text="text-sm" />
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {n.label}
          </a>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">© 2026 ASystem Core. Все права защищены.</p>
    </div>
  </footer>
);
