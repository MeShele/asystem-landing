import { useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

// Продуктовый шоурил (30 сек, Remotion: ../asystem-promo). Автоплей только в зоне
// видимости — экономим батарею/трафик и гарантируем старт с начала при показе.
const Showreel = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="showreel" className="border-b border-border bg-[#0B0C0A]">
      <div className="container py-14 sm:py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-2 w-14 rounded-sm bg-accent" />
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-white/55">
                Платформа за 30 секунд
              </span>
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
              <video
                ref={ref}
                muted
                loop
                playsInline
                preload="metadata"
                poster="/video/showreel-poster.jpg"
                className="block w-full"
              >
                <source src="/video/showreel.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Showreel;
