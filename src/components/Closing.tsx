import { useState } from "react";
import { Link } from "react-router-dom";
import {Check, Plus} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { LeadForm } from "@/components/LeadForm";
import ScrollReveal from "@/components/ScrollReveal";
import Logo from "@/components/Logo";
import { useContent, useLang } from "@/i18n";


export const Faq = () => {
  const { FAQ } = useContent();
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container py-16 sm:py-20 lg:py-24">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Частые вопросы", "Frequently asked questions")}</h2>
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
  const { FINAL_CTA } = useContent();
  const { t } = useLang();
  return (
    <section id="demo" className="relative overflow-hidden border-t border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      {/* лаймовое дыхание за формой */}
      <div className="absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-accent/15 blur-[120px] dark:bg-accent/10" />
      <div className="container relative grid items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-10 rounded-sm bg-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Демо", "Demo")}</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{FINAL_CTA.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{FINAL_CTA.sub}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-foreground dark:text-accent" /> {t("Ответим в течение рабочего дня", "We reply within one business day")}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="left" delay={120}>
          <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_24px_70px_-28px_hsl(240_10%_6%/0.3)] dark:shadow-none">
            {/* Та же форма, что в модалке: одна реализация, одна точка правки. */}
            <LeadForm submitLabel={FINAL_CTA.cta} prefill={{ source: "get.asystem.ai/section" }} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { NAV } = useContent();
  const { t } = useLang();
  return (
  <footer className="border-t border-border bg-background">
    <div className="container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
      <Logo mark="h-7 w-7" icon="h-4 w-4" text="text-sm" />
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6">
        {NAV.map((n) =>
          n.href.startsWith("/") ? (
            <Link
              key={n.href}
              to={n.href}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {n.label}
            </Link>
          ) : (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {n.label}
            </a>
          ),
        )}
      </nav>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <a
          href="https://t.me/Ruslyandi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Telegram
        </a>
        <a
          href="https://wa.me/996500115133"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          WhatsApp
        </a>
        <a
          href="mailto:asystem.teamwork@gmail.com"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          asystem.teamwork@gmail.com
        </a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 ASystem Core. {t("Все права защищены.", "All rights reserved.")}</p>
    </div>
  </footer>
  );
};
