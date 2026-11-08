import { useEffect, type ReactNode } from "react";
import GradientBackground from "@/components/GradientBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Обёртка внутренних страниц (/blueprint, /status): тот же фон, та же фиксированная шапка
 * и подвал, что на главной. Заголовок страницы живёт в сетке секций: подпись лаймом,
 * t-h2, одна строка lead.
 */
const PageShell = ({ title, children }: { title: string; children: ReactNode }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, [title]);

  return (
    <>
      <GradientBackground />
      <div className="relative z-[1] min-h-full">
        <Header />
        <main className="pt-28 sm:pt-36">{children}</main>
        <Footer />
      </div>
    </>
  );
};

/** Шапка страницы: подпись, заголовок, одна строка под ним. */
export const PageHead = ({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) => (
  <div className="max-w-[760px]">
    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{eyebrow}</p>
    <h1 className="t-h2 mt-4">{title}</h1>
    <p className="t-lead muted mt-4">{lead}</p>
  </div>
);

export default PageShell;
