import { useState } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { BrowserFrame } from "@/components/Hero";
import ArchitectureGraphic from "@/components/ArchitectureGraphic";
import InfoModal from "@/components/InfoModal";
import { ICONS } from "@/lib/icons";
import {
  STATS, PROBLEM, FEATURES, STEPS, API_CORES, COMPLIANCE,
} from "@/content";
import { CATALOG, type CatalogCategory } from "@/modulesCatalog";

const SectionHead = ({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) => (
  <ScrollReveal className="mx-auto max-w-2xl text-center">
    {eyebrow && (
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
    )}
    <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
    {lead && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{lead}</p>}
  </ScrollReveal>
);

// Браузер-фрейм с автоплей-видео демо (poster в /shots, видео в /demos)
const VideoDemo = ({ demo, url, plain, dark }: { demo: string; url?: string; plain?: boolean; dark?: boolean }) => {
  const video = (
    <video className="block w-full" poster={`/shots/${demo}.png`} autoPlay muted loop playsInline preload="metadata">
      <source src={`/demos/${demo}.webm`} type="video/webm" />
      <source src={`/demos/${demo}.mp4`} type="video/mp4" />
    </video>
  );
  // plain — клип уже содержит своё обрамление (3D-телефон / браузер), без внешней рамки
  if (plain) {
    return (
      <div className={`overflow-hidden rounded-2xl ${dark ? "" : "border border-border shadow-[0_30px_80px_-24px_hsl(240_10%_6%/0.4)]"}`}>
        {video}
      </div>
    );
  }
  return <BrowserFrame url={url}>{video}</BrowserFrame>;
};

// Двухколоночный демо-блок «текст + живое видео», размещается у своей темы
const Showcase = ({ eyebrow, title, points, demo, url, reverse, plain, dark }: {
  eyebrow: string; title: string; points: string[]; demo: string; url?: string; reverse?: boolean; plain?: boolean; dark?: boolean;
}) => (
  <div className="container grid items-center gap-10 lg:grid-cols-2">
    <ScrollReveal className={reverse ? "lg:order-2" : ""}>
      <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-accent" : "text-muted-foreground"}`}>{eyebrow}</span>
      <h2 className={`mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? "text-white" : ""}`}>{title}</h2>
      <ul className="mt-6 space-y-3">
        {points.map((p) => (
          <li key={p} className={`flex items-start gap-2.5 leading-relaxed ${dark ? "text-white/65" : "text-muted-foreground"}`}>
            <Check className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? "text-accent" : "text-foreground"}`} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </ScrollReveal>
    <ScrollReveal variant={reverse ? "right" : "left"} delay={120} className={reverse ? "lg:order-1" : ""}>
      <VideoDemo demo={demo} url={url} plain={plain} dark={dark} />
    </ScrollReveal>
  </div>
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
  <section className="container py-16 sm:py-20 lg:py-24">
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
  <section id="features" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
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
  <section id="how" className="container py-16 sm:py-20 lg:py-24">
    <SectionHead eyebrow="Как это работает" title="От лицензии до запуска — четыре шага" />
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

// Радиальная архитектура: ядро в центре → ядра вокруг → модули по краям
export const Architecture = () => (
  <section className="container py-16 sm:py-20 lg:py-24">
    <SectionHead
      eyebrow="Архитектура"
      title="Ядро в центре, ядра вокруг, модули по краям"
      lead="В центре — ядро платформы. Вокруг — функциональные ядра: KYC, платежи, AML, отчётность, custody, ликвидность. От каждого ядра расходятся конкретные модули и провайдеры. Берёте обменник целиком — или подключаете отдельные ядра по API."
    />
    <ScrollReveal variant="scale" className="mt-14">
      <ArchitectureGraphic />
    </ScrollReveal>
    <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
      Каждый модуль включается тумблером, не трогая ядро. Ядра можно использовать и без обменника — через публичный API.
    </p>
  </section>
);

// Интерактивный каталог: клик по категории → её модули
export const Modules = () => {
  const [active, setActive] = useState(CATALOG[0].key);
  const [info, setInfo] = useState<CatalogCategory | null>(null);
  const cat = CATALOG.find((c) => c.key === active) ?? CATALOG[0];
  return (
    <section id="modules" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <SectionHead eyebrow="Маркетплейс модулей" title="27 модулей в 8 категориях" lead="Выберите категорию — посмотрите, что входит. Модули включаются тумблером в админке." />

        <ScrollReveal variant="scale" className="mx-auto mt-10 max-w-2xl">
          <VideoDemo demo="modules" plain />
          <p className="mt-3 text-center text-sm text-muted-foreground">Активация модуля — в один клик, прямо из админки.</p>
        </ScrollReveal>

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
              <button
                key={m.name}
                type="button"
                onClick={() => setInfo(cat)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_10px_28px_-14px_hsl(240_10%_6%/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <span className="font-medium">{m.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {m.status === "available" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      <Check className="h-3 w-3" /> Доступно
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">Скоро</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <InfoModal category={info} onClose={() => setInfo(null)} />
    </section>
  );
};

// Демо клиентского обменника — у темы «клиент»
export const ClientShowcase = () => (
  <section className="border-y border-white/10 bg-[#0B0C0A] py-16 sm:py-20 lg:py-24">
    <Showcase
      eyebrow="Вашим клиентам"
      title="Обмен крипты — в пару кликов"
      url="exchange.your-exchange.kg"
      demo="exchange"
      dark
      plain
      points={[
        "Покупка и продажа крипты на фиат — без лишних шагов",
        "Курс в реальном времени и прозрачная комиссия",
        "Адаптив под мобильные — большинство клиентов с телефона",
      ]}
    />
  </section>
);

// Демо админки оператора — у темы «оператор»
export const OperatorShowcase = () => (
  <section className="border-y border-white/10 bg-[#0B0C0A] py-16 sm:py-20 lg:py-24">
    <Showcase
      eyebrow="Вам как оператору"
      title="Заявки, выплаты и аудит — в одной админке"
      url="admin.your-exchange.kg"
      demo="orders"
      dark
      plain
      reverse
      points={[
        "Канбан заявок: статусы, подтверждение выплат, фильтры",
        "Полный аудит-трейл по каждой транзакции",
        "Роли и права: администратор, оператор, комплайнс-офицер",
      ]}
    />
  </section>
);

export const ApiCores = () => (
  <section className="border-y border-border bg-primary py-16 sm:py-20 lg:py-24 text-primary-foreground">
    <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
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
          <pre className="overflow-x-auto p-5 font-mono text-[11px] leading-relaxed text-accent/90 sm:text-xs">{API_CORES.snippet}</pre>
        </div>
        <a href="#demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
          Запросить API-доступ <ArrowRight className="h-4 w-4" />
        </a>
      </ScrollReveal>
    </div>
  </section>
);

export const Compliance = () => (
  <section id="compliance" className="container py-16 sm:py-20 lg:py-24">
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
