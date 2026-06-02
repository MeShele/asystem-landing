import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { BrowserFrame } from "@/components/Hero";
import { ICONS } from "@/lib/icons";
import {
  STATS, PROBLEM, FEATURES, STEPS, MODULES, API_CORES, COMPLIANCE,
} from "@/content";

const SectionHead = ({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) => (
  <ScrollReveal className="mx-auto max-w-2xl text-center">
    {eyebrow && (
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
    )}
    <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
    {lead && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lead}</p>}
  </ScrollReveal>
);

export const Stats = () => (
  <section className="border-b border-border bg-secondary/40">
    <div className="container grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
      {STATS.map((s, i) => (
        <ScrollReveal key={s.label} delay={i * 80} className="px-6 py-8 text-center">
          <div className="font-mono text-3xl font-bold sm:text-4xl">{s.value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);

export const Problem = () => (
  <section className="container py-20">
    <SectionHead eyebrow="Проблема" title={PROBLEM.title} lead={PROBLEM.lead} />
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {PROBLEM.pains.map((p, i) => (
        <ScrollReveal key={p.title} delay={i * 80} className="glass-card p-6">
          <h3 className="font-display text-lg font-bold">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
        </ScrollReveal>
      ))}
    </div>
  </section>
);

export const Features = () => (
  <section id="features" className="border-y border-border bg-secondary/30 py-20">
    <div className="container">
      <SectionHead eyebrow="Возможности" title="Всё для запуска — в одной платформе" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => {
          const Icon = ICONS[f.icon];
          return (
            <ScrollReveal key={f.title} delay={(i % 4) * 70}>
              <div className="card-interactive h-full p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
                  {Icon && <Icon className="h-5 w-5 text-foreground" />}
                </div>
                <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  </section>
);

export const HowItWorks = () => (
  <section id="how" className="container py-20">
    <SectionHead eyebrow="Как это работает" title="От лицензии до запуска — четыре шага" />
    <div className="mt-12 grid gap-5 md:grid-cols-4">
      {STEPS.map((s, i) => (
        <ScrollReveal key={s.n} delay={i * 90}>
          <div className="relative h-full rounded-[var(--radius)] border border-border bg-card p-6">
            <div className="font-mono text-sm font-bold text-accent-foreground">
              <span className="rounded-md bg-accent px-2 py-1">{s.n}</span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);

export const Modules = () => (
  <section id="modules" className="border-y border-border bg-secondary/30 py-20">
    <div className="container">
      <SectionHead eyebrow="Маркетплейс модулей" title="Подключайте возможности по мере роста" lead="Пять ключевых категорий-ядер — и ещё 20+ модулей в маркетплейсе. Включаются тумблером в админке." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m, i) => {
          const Icon = ICONS[m.icon];
          return (
            <ScrollReveal key={m.title} delay={(i % 3) * 80}>
              <div className="card-interactive flex h-full items-start gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                  {Icon && <Icon className="h-5 w-5 text-foreground" />}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  </section>
);

export const ProductScreens = () => (
  <section className="container py-20">
    <SectionHead eyebrow="Под капотом" title="Зрелый продукт, а не прототип" lead="Админка управления заявками, маркетплейс модулей и отчётность — всё уже работает." />
    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      <ScrollReveal>
        <BrowserFrame src="/shots/modules.png" alt="Маркетплейс модулей" />
        <p className="mt-3 text-center text-sm text-muted-foreground">Маркетплейс модулей — KYC, платежи, custody, отчётность</p>
      </ScrollReveal>
      <ScrollReveal delay={120}>
        <BrowserFrame src="/shots/orders.png" alt="Управление заявками — канбан" />
        <p className="mt-3 text-center text-sm text-muted-foreground">Управление заявками — канбан со статусами и выплатами</p>
      </ScrollReveal>
    </div>
  </section>
);

export const ApiCores = () => (
  <section className="border-y border-border bg-primary py-20 text-primary-foreground">
    <div className="container grid items-center gap-12 lg:grid-cols-2">
      <ScrollReveal>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">API-ядра</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{API_CORES.title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-primary-foreground/70">{API_CORES.lead}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {API_CORES.cores.map((c) => (
            <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="font-display text-sm font-bold text-accent">{c.title}</h3>
              <p className="mt-1 text-sm text-primary-foreground/70">{c.text}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
      <ScrollReveal variant="left" delay={120}>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c12]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-accent/90">{API_CORES.snippet}</pre>
        </div>
        <a href="#demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
          Запросить API-доступ <ArrowRight className="h-4 w-4" />
        </a>
      </ScrollReveal>
    </div>
  </section>
);

export const Compliance = () => (
  <section id="compliance" className="container py-20">
    <SectionHead eyebrow="Комплайнс и безопасность" title={COMPLIANCE.title} lead={COMPLIANCE.lead} />
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {COMPLIANCE.points.map((p, i) => (
        <ScrollReveal key={p.title} delay={(i % 3) * 70}>
          <div className="h-full rounded-[var(--radius)] border border-border bg-card p-6">
            <div className="h-1 w-8 rounded-full bg-accent" />
            <h3 className="mt-4 font-display text-base font-bold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);
