import { useState } from "react";
import { Check, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { PRICING, FAQ, FINAL_CTA, NAV } from "@/content";

export const Pricing = () => (
  <section id="pricing" className="border-y border-border bg-secondary/30 py-20">
    <div className="container">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Тарифы</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Выберите модель запуска</h2>
        <p className="mt-4 text-lg text-muted-foreground">{PRICING.note}</p>
      </ScrollReveal>

      <div className="mx-auto mt-12 grid max-w-5xl items-start gap-6 lg:grid-cols-3">
        {PRICING.plans.map((p, i) => (
          <ScrollReveal key={p.name} delay={i * 90}>
            <div className={`flex h-full flex-col rounded-2xl border bg-card p-7 ${p.featured ? "border-accent ring-1 ring-accent/40 shadow-[0_20px_60px_-20px_hsl(240_10%_6%/0.15)]" : "border-border"}`}>
              {p.featured && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Популярный</span>
              )}
              <h3 className="font-display text-xl font-extrabold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.forWho}</p>

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
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container py-20">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Частые вопросы</h2>
      </ScrollReveal>
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
        {FAQ.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-base font-semibold">{f.q}</span>
              {open === i ? <Minus className="h-5 w-5 shrink-0 text-muted-foreground" /> : <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />}
            </button>
            {open === i && <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export const FinalCta = () => {
  const [sent, setSent] = useState(false);
  return (
    <section id="demo" className="border-t border-border bg-primary py-20 text-primary-foreground">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{FINAL_CTA.title}</h2>
          <p className="mt-4 text-lg text-primary-foreground/70">{FINAL_CTA.sub}</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Check className="h-4 w-4 text-accent" /> Ответим в течение рабочего дня
          </div>
        </ScrollReveal>

        <ScrollReveal variant="left" delay={120}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Check className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="mt-4 font-display text-lg font-bold">Заявка отправлена</p>
                <p className="mt-1 text-sm text-primary-foreground/60">Свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              >
                <input required placeholder="Имя" className="h-11 w-full rounded-[var(--radius)] border border-white/10 bg-white/[0.06] px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none" />
                <input required placeholder="Компания" className="h-11 w-full rounded-[var(--radius)] border border-white/10 bg-white/[0.06] px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none" />
                <input required type="text" placeholder="Telegram / email / телефон" className="h-11 w-full rounded-[var(--radius)] border border-white/10 bg-white/[0.06] px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none" />
                <Button type="submit" variant="signal" className="w-full">
                  {FINAL_CTA.cta} <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-center text-xs text-primary-foreground/40">Нажимая, вы соглашаетесь на обработку контактных данных</p>
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
      <div className="flex items-center gap-2.5">
        <img src="/logo-light.svg" alt="ASystem Core" className="h-7 w-auto" />
        <span className="font-display text-sm font-extrabold">ASystem Core</span>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="text-sm text-muted-foreground hover:text-foreground">{n.label}</a>
        ))}
      </nav>
      <p className="text-xs text-muted-foreground">© 2026 ASystem Core. Все права защищены.</p>
    </div>
  </footer>
);
