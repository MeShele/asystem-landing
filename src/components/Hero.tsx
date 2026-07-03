import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import ExchangeWidget from "@/components/ExchangeWidget";
import { HERO } from "@/content";

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

const Hero = () => (
  <section id="top" className="relative overflow-hidden border-b border-border">
    <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:48px_48px] opacity-[0.5]" />
    <div className="absolute inset-x-0 top-0 -z-10 h-px hairline" />

    <div className="container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">
      <ScrollReveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {HERO.badge}
        </span>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          {HERO.h1a}{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">{HERO.h1accent}</span>
            <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent/70" />
          </span>{" "}
          {HERO.h1b}
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{HERO.sub}</p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button variant="signal" size="lg" className="w-full sm:w-auto" asChild>
            <a href="#demo">{HERO.ctaPrimary} <ArrowRight className="h-4 w-4" /></a>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
            <a href="#how">{HERO.ctaSecondary}</a>
          </Button>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {checks.map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Check className="h-4 w-4 text-foreground" /> {c}
            </span>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal variant="left" delay={120}>
        <BrowserFrame url="exchange.your-exchange.kg">
          <ExchangeWidget />
        </BrowserFrame>
      </ScrollReveal>
    </div>
  </section>
);

export default Hero;
export { BrowserFrame };
