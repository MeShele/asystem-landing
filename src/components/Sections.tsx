import { useState } from "react";
import { ArrowRight, Check, Boxes } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { BrowserFrame } from "@/components/Hero";
import { ICONS } from "@/lib/icons";
import {
  STATS, PROBLEM, FEATURES, STEPS, API_CORES, COMPLIANCE,
} from "@/content";
import { CATALOG } from "@/modulesCatalog";

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

// «Ядро + модули раздельно» — визуальная архитектура
export const Architecture = () => (
  <section className="container py-20">
    <SectionHead
      eyebrow="Архитектура"
      title="Ядро — отдельно, модули — отдельно"
      lead="ASystem Core — это ядро платформы. Возможности подключаются модулями из маркетплейса: берёте только то, что нужно."
    />
    <ScrollReveal variant="scale" className="mt-12">
      <div className="mx-auto max-w-3xl">
        {/* Ядро */}
        <div className="mx-auto flex max-w-md items-center gap-4 rounded-2xl border-2 border-accent bg-accent/5 p-6 ring-1 ring-accent/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
            <Boxes className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold">ASystem Core</h3>
            <p className="text-sm text-muted-foreground">Ядро: обменник, биллинг, мульти-тенант, безопасность</p>
          </div>
        </div>
        {/* Коннектор */}
        <div className="mx-auto my-4 h-8 w-px bg-gradient-to-b from-accent/60 to-border" />
        {/* Модули — отдельными блоками */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATALOG.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <div key={c.key} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card p-4 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                  {Icon && <Icon className="h-4 w-4 text-foreground" />}
                </div>
                <span className="text-xs font-medium leading-tight">{c.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Каждый модуль — отдельный «кубик»: включается тумблером, не трогая ядро.
        </p>
      </div>
    </ScrollReveal>
  </section>
);

// Интерактивный каталог: клик по категории → её модули
export const Modules = () => {
  const [active, setActive] = useState(CATALOG[0].key);
  const cat = CATALOG.find((c) => c.key === active) ?? CATALOG[0];
  return (
    <section id="modules" className="border-y border-border bg-secondary/30 py-20">
      <div className="container">
        <SectionHead eyebrow="Маркетплейс модулей" title="27 модулей в 8 категориях" lead="Выберите категорию — посмотрите, что входит. Модули включаются тумблером в админке." />

        {/* Табы категорий */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATALOG.map((c) => {
            const Icon = ICONS[c.icon];
            const on = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  on ? "border-accent bg-accent/15 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Модули выбранной категории */}
        <div className="mx-auto mt-8 max-w-4xl">
          <p className="mb-5 text-center text-sm text-muted-foreground">{cat.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cat.modules.map((m) => (
              <div key={m.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
                <span className="font-medium">{m.name}</span>
                {m.status === "available" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                    <Check className="h-3 w-3" /> Доступно
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Скоро</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SCREENS = [
  { src: "/shots/exchange.png", alt: "Клиентский обменник", caption: "Клиентский обменник — то, что видит ваш пользователь" },
  { src: "/shots/orders.png", alt: "Админка оператора", caption: "Админка оператора — заявки, статусы, выплаты" },
  { src: "/shots/modules.png", alt: "Маркетплейс модулей", caption: "Маркетплейс модулей — KYC, платежи, custody, отчётность" },
];

export const ProductScreens = () => (
  <section className="container py-20">
    <SectionHead eyebrow="Под капотом" title="Зрелый продукт, а не прототип" lead="Клиентский обменник, админка оператора и маркетплейс модулей — всё уже работает." />
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {SCREENS.map((s, i) => (
        <ScrollReveal key={s.src} delay={i * 100}>
          <BrowserFrame src={s.src} alt={s.alt} />
          <p className="mt-3 text-center text-sm text-muted-foreground">{s.caption}</p>
        </ScrollReveal>
      ))}
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
