import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, ClipboardCheck } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { BrowserFrame } from "@/components/Hero";
import ArchitectureGraphic from "@/components/ArchitectureGraphic";
import InfoModal from "@/components/InfoModal";
import CountUp from "@/components/CountUp";
import MarketplaceLive from "@/components/MarketplaceLive";
import ApiTerminal from "@/components/ApiTerminal";
import ProviderLogo from "@/components/ProviderLogo";
import { ICONS } from "@/lib/icons";
import {
  STATS, PROBLEM, FEATURES, STEPS, API_CORES, COMPLIANCE, DEMO_URL, INTEGRATIONS,
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

// Мягкий скролл-параллакс: блок «плывёт» относительно скорости скролла
const Parallax = ({ children, className, amount = 26 }: { children: React.ReactNode; className?: string; amount?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [amount, -amount]), { stiffness: 90, damping: 24 });
  return (
    <motion.div ref={ref} style={reduced ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
};

// Реактивная тема: следим за классом dark на <html> (тогл в хедере)
const useIsDark = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains("dark")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
};

// Браузер-фрейм с автоплей-видео демо (poster в /shots, видео в /demos).
// Клипы отрендерены в двух темах — светлая сцена для светлой темы.
const VideoDemo = ({ demo, url, plain }: { demo: string; url?: string; plain?: boolean }) => {
  const dark = useIsDark();
  const sfx = dark ? "" : "-light";
  const video = (
    <video key={sfx} className="block w-full" poster={`/shots/${demo}${sfx}.png`} autoPlay muted loop playsInline preload="metadata">
      {/* только h264/mp4: vp9-webm с рендера ловил MEDIA_ERR_DECODE */}
      <source src={`/demos/${demo}${sfx}.mp4`} type="video/mp4" />
    </video>
  );
  // plain — клип сам тёмный (кино-кадр): на светлой теме — карточка с тенью,
  // в тёмной — бесшовно сливается с фоном
  if (plain) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-[0_36px_90px_-36px_hsl(240_10%_6%/0.5)] dark:border-white/10 dark:shadow-none">
        {video}
      </div>
    );
  }
  return <BrowserFrame url={url}>{video}</BrowserFrame>;
};

// Стаггер-варианты текстовой колонки showcase-блоков
const textStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};
const riseItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 22 } },
} as const;

// Двухколоночный демо-блок «текст + живое видео», размещается у своей темы
const Showcase = ({ eyebrow, title, points, demo, url, reverse, plain, demoLink }: {
  eyebrow: string; title: string; points: string[]; demo: string; url?: string; reverse?: boolean; plain?: boolean;
  demoLink?: { label: string; href: string };
}) => (
  <div className="container grid items-center gap-10 lg:grid-cols-2">
    <motion.div
      variants={textStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
      className={reverse ? "lg:order-2" : ""}
    >
      <motion.div variants={riseItem} className="flex items-center gap-3">
        <span className="h-2 w-10 rounded-sm bg-accent" />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
      </motion.div>
      <motion.h2 variants={riseItem} className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </motion.h2>
      <ul className="mt-6 space-y-3">
        {points.map((p) => (
          <motion.li key={p} variants={riseItem} className="flex items-start gap-2.5 leading-relaxed text-muted-foreground">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-foreground dark:text-accent" />
            <span>{p}</span>
          </motion.li>
        ))}
      </ul>
      {demoLink && (
        <motion.a
          variants={riseItem}
          href={demoLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline dark:text-accent"
        >
          {demoLink.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </motion.a>
      )}
    </motion.div>
    <ScrollReveal variant={reverse ? "right" : "left"} delay={120} className={reverse ? "lg:order-1" : ""}>
      <Parallax>
        <VideoDemo demo={demo} url={url} plain={plain} />
      </Parallax>
    </ScrollReveal>
  </div>
);

// Логобар доверия: интеграции из коробки (KYC, платежи, custody, комплайнс)
export const IntegrationsBar = () => (
  <section className="border-b border-border bg-background">
    <ScrollReveal className="container flex flex-col items-center gap-4 py-8 lg:flex-row lg:justify-between">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Интеграции из коробки
      </span>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {INTEGRATIONS.map((p) => (
          <span key={p.name} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            <ProviderLogo name={p.name} domain={p.domain} own={p.own} size="h-7 w-7" />
            {p.name}
          </span>
        ))}
      </div>
    </ScrollReveal>
  </section>
);

export const Stats = () => (
  <section className="border-b border-border bg-secondary/40">
    <div className="container grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
      {STATS.map((s, i) => (
        <ScrollReveal key={s.label} delay={i * 80} className="px-6 py-8 text-center transition-colors duration-300 hover:bg-secondary/70">
          <div className="font-mono text-3xl font-bold sm:text-4xl">
            {/^\d+$/.test(s.value) ? <CountUp to={Number(s.value)} /> : s.value}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);

export const Problem = () => (
  <section className="container py-16 sm:py-20 lg:py-24">
    <SectionHead eyebrow="Проблема" title={PROBLEM.title} lead={PROBLEM.lead} />
    <motion.div
      variants={textStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-12 grid gap-5 md:grid-cols-3"
    >
      {PROBLEM.pains.map((p, i) => (
        <motion.div key={p.title} variants={riseItem} className="card-interactive p-6">
          <span className="font-mono text-xs font-semibold text-muted-foreground/70">0{i + 1}</span>
          <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export const Features = () => (
  <section id="features" className="border-y border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
    <div className="container">
      <SectionHead eyebrow="Возможности" title="Всё для запуска — в одной платформе" />
      <motion.div
        variants={textStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-70px" }}
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <motion.div key={f.title} variants={riseItem} className="group card-interactive h-full p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 transition-colors duration-300 group-hover:bg-accent">
                {Icon && <Icon className="h-5 w-5 text-foreground transition-colors duration-300 group-hover:text-accent-foreground" />}
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export const HowItWorks = () => (
  <section id="how" className="container py-16 sm:py-20 lg:py-24">
    <SectionHead eyebrow="Как это работает" title="От лицензии до запуска — четыре шага" />
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
      className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {STEPS.map((s) => (
        <motion.div
          key={s.n}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 22 } },
          }}
          className="relative h-full overflow-hidden rounded-[var(--radius)] border border-border bg-card p-6"
        >
          {/* прогресс-сегмент рисуется по мере входа шага */}
          <motion.span
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-accent"
          />
          <div className="font-mono text-sm font-bold text-accent-foreground">
            <span className="rounded-md bg-accent px-2 py-1">{s.n}</span>
          </div>
          <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
        </motion.div>
      ))}
    </motion.div>
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

// Бегущая строка модулей каталога (две встречные, пауза на hover)
const ALL_MODULES = CATALOG.flatMap((c) => c.modules.map((m) => ({ ...m, cat: c.label })));
const MarqueeRow = ({ items, reverse }: { items: typeof ALL_MODULES; reverse?: boolean }) => (
  <div className="marquee-mask marquee-hover overflow-hidden">
    <div className={`flex w-max gap-2.5 ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
      {[...items, ...items].map((m, i) => (
        <span
          key={`${m.name}-${i}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${m.status === "available" ? "bg-accent" : "bg-muted-foreground/40"}`} />
          {m.name}
          <span className="text-[11px] text-muted-foreground">{m.cat}</span>
        </span>
      ))}
    </div>
  </div>
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

        {/* бегущий каталог */}
        <ScrollReveal className="mt-10 space-y-2.5">
          <MarqueeRow items={ALL_MODULES} />
          <MarqueeRow items={[...ALL_MODULES].reverse()} reverse />
        </ScrollReveal>

        {/* живой мок маркетплейса — тумблеры включаются каскадом */}
        <ScrollReveal variant="scale" className="mx-auto mt-10 max-w-3xl">
          <MarketplaceLive />
          <p className="mt-3 text-center text-sm text-muted-foreground">Активация модуля — в один клик, прямо из админки.</p>
        </ScrollReveal>

        {/* Табы категорий (морфящаяся пилюля) */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATALOG.map((c) => {
            const Icon = ICONS[c.icon];
            const on = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  on ? "border-transparent text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full border border-accent bg-accent/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Модули выбранной категории */}
        <div className="mx-auto mt-8 max-w-4xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={cat.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mb-5 text-center text-sm text-muted-foreground"
            >
              {cat.blurb}
            </motion.p>
          </AnimatePresence>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {cat.modules.map((m, i) => (
                <motion.button
                  key={`${cat.key}-${m.name}`}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.05, type: "spring", stiffness: 280, damping: 25 } }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
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
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <InfoModal category={info} onClose={() => setInfo(null)} />
    </section>
  );
};

// Демо клиентского обменника — у темы «клиент»
export const ClientShowcase = () => (
  <section className="border-y border-border bg-background py-16 sm:py-20 lg:py-24">
    <Showcase
      eyebrow="Вашим клиентам"
      title="Обмен крипты — в пару кликов"
      url="exchange.your-exchange.kg"
      demo="exchange"
      plain
      points={[
        "Покупка и продажа крипты на фиат — без лишних шагов",
        "Курс в реальном времени и прозрачная комиссия",
        "Адаптив под мобильные — большинство клиентов с телефона",
      ]}
      demoLink={{ label: "Потрогать вживую на демо-стенде", href: DEMO_URL }}
    />
  </section>
);

// Демо админки оператора — у темы «оператор»
export const OperatorShowcase = () => (
  <section className="border-y border-border bg-background py-16 sm:py-20 lg:py-24">
    <Showcase
      eyebrow="Вам как оператору"
      title="Заявки, выплаты и аудит — в одной админке"
      url="admin.your-exchange.kg"
      demo="orders"
      plain
      reverse
      points={[
        "Канбан заявок: статусы, подтверждение выплат, фильтры",
        "Полный аудит-трейл по каждой транзакции",
        "Роли и права: администратор, оператор, комплайнс-офицер",
      ]}
      demoLink={{ label: "Открыть демо-админку", href: `${DEMO_URL}/admin/login` }}
    />
  </section>
);

export const ApiCores = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="border-y border-border bg-background py-16 sm:py-20 lg:py-24">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <span className="h-2 w-10 rounded-sm bg-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">API-ядра</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{API_CORES.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{API_CORES.lead}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {API_CORES.cores.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`rounded-xl border p-4 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    on
                      ? "border-accent/60 bg-accent/[0.08] dark:border-accent/50 dark:bg-accent/[0.06]"
                      : "border-border bg-secondary/40 hover:border-accent/40 dark:bg-card"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground dark:text-accent">{c.title}</h3>
                    <motion.span
                      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
                      className="relative flex h-2 w-2 shrink-0"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </motion.span>
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                </button>
              );
            })}
          </div>
        </ScrollReveal>
        <ScrollReveal variant="left" delay={120}>
          <div className="overflow-hidden rounded-xl shadow-[0_30px_70px_-30px_hsl(240_10%_6%/0.4)] dark:shadow-none">
            <ApiTerminal active={active} onAdvance={setActive} />
          </div>
          <a
            href="#demo"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline dark:text-accent"
          >
            Запросить API-доступ <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Лид-магнит: моушн-подводка к /blueprint — мини-чек-лист сам себя прощёлкивает
const BP_ITEMS = [
  "Юрлицо и лицензия оператора обмена ВА",
  "KYC: верификация, 18+, резидентство, PEP",
  "AML: санкции, 156 кодов, лимиты",
  "Отчётность ГСФР и хранение 5 лет",
  "Серверы в КР, бэкапы, аудит-трейл",
];

export const BlueprintCta = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const inView = useInView(widgetRef, { once: true, margin: "-90px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(BP_ITEMS.length);
      return;
    }
    let i = 0;
    let id: number | undefined;
    const start = setTimeout(() => {
      setN(++i);
      id = window.setInterval(() => {
        setN(++i);
        if (i >= BP_ITEMS.length) clearInterval(id);
      }, 520);
    }, 500);
    return () => {
      clearTimeout(start);
      if (id !== undefined) clearInterval(id);
    };
  }, [inView, reduced]);

  const progress = n / BP_ITEMS.length;

  return (
    <section className="border-y border-border bg-secondary/30 py-16 sm:py-20">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* подводка */}
        <motion.div
          variants={textStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
        >
          <motion.div variants={riseItem} className="flex items-center gap-3">
            <span className="h-2 w-10 rounded-sm bg-accent" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              С чего начать
            </span>
          </motion.div>
          <motion.h2 variants={riseItem} className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Не знаете, с чего начать запуск обменника?
          </motion.h2>
          <motion.p variants={riseItem} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Мы прошли этот путь и собрали его в один чек-лист: лицензия, KYC/AML, отчётность ГСФР,
            хранение данных — и грабли, на которых теряют месяцы.
          </motion.p>
          <motion.div variants={riseItem} className="mt-7">
            <Button variant="signal" size="lg" className="group" asChild>
              <Link to="/blueprint">
                Открыть чек-лист <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* живой мини-чек-лист */}
        <ScrollReveal variant="left" delay={100}>
          <div ref={widgetRef} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-32px_hsl(240_10%_6%/0.35)] dark:shadow-none">
            <div className="flex items-center gap-2.5 border-b border-border bg-secondary/60 px-4 py-3">
              <ClipboardCheck className="h-4 w-4 text-foreground" />
              <span className="text-sm font-bold">Чек-лист запуска · Кыргызстан</span>
              <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                {n}/{BP_ITEMS.length}
              </span>
            </div>
            {/* прогресс */}
            <div className="h-1 w-full bg-secondary">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 26 }}
              />
            </div>
            <div className="space-y-1 p-3 sm:p-4">
              {BP_ITEMS.map((item, i) => {
                const done = i < n;
                return (
                  <div
                    key={item}
                    className={`flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-300 ${
                      done ? "bg-accent/[0.07]" : ""
                    }`}
                  >
                    <motion.span
                      animate={{
                        backgroundColor: done ? "#B6FF1A" : "rgba(0,0,0,0)",
                        borderColor: done ? "#B6FF1A" : "hsl(var(--border))",
                        scale: done ? 1 : 0.96,
                      }}
                      transition={{ type: "spring", stiffness: 340, damping: 22 }}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-md border-2"
                    >
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.4 }}
                        transition={{ type: "spring", stiffness: 380, damping: 20 }}
                      >
                        <path d="M4 12.5 9.5 18 20 6.5" stroke="#0B0C0A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </motion.span>
                    <span className={`text-sm transition-colors duration-300 ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
              <Link
                to="/blueprint"
                className="group mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                …и ещё 25+ пунктов в полном чек-листе
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export const Compliance = () => (
  <section id="compliance" className="container py-16 sm:py-20 lg:py-24">
    <SectionHead eyebrow="Комплайнс и безопасность" title={COMPLIANCE.title} lead={COMPLIANCE.lead} />
    <motion.div
      variants={textStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {COMPLIANCE.points.map((p) => (
        <motion.div key={p.title} variants={riseItem} className="card-interactive h-full p-6">
          <motion.div
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
            className="h-1 w-8 origin-left rounded-full bg-accent"
          />
          <h3 className="mt-4 font-display text-base font-bold">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
