import { useEffect, useRef } from "react";
import { useLang } from "@/i18n";

/**
 * Настоящая запись витрины обменника на платформе (Remotion-рендер из
 * реального интерфейса, две темы и два языка). compact — кроп для панели
 * в списке возможностей; полный — кадр сцены.
 */
const useIsDark = () => document.documentElement.classList.contains("dark");

const StorefrontClip = ({ compact }: { compact?: boolean }) => {
  const { lang } = useLang();
  const ref = useRef<HTMLVideoElement>(null);
  const sfx = `${lang === "en" ? "-en" : ""}${useIsDark() ? "" : "-light"}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [sfx]);

  return (
    <video
      key={sfx}
      ref={ref}
      muted
      loop
      playsInline
      preload="metadata"
      poster={`/shots/exchange${sfx}.png`}
      className={compact ? "absolute inset-0 h-full w-full object-cover object-left-top" : "w-full max-w-[640px]"}
      aria-label={lang === "ru" ? "Витрина обменника на платформе" : "Exchange storefront on the platform"}
    >
      <source src={`/demos/exchange${sfx}.mp4`} type="video/mp4" />
    </video>
  );
};

export default StorefrontClip;
