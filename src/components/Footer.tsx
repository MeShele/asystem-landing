import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Stripe } from "@/components/Hero";
import { useContent, useLang } from "@/i18n";

/**
 * «Photograph half, menu half»: слева продукт крупнее, чем где-либо выше,
 * настоящая запись канбана заявок, обрезанная левым и нижним краем экрана;
 * справа меню сайта крупно, контакты и юридическая строка.
 */
const Footer = () => {
  const { FOOTER } = useContent();
  const { lang } = useLang();
  const ref = useRef<HTMLVideoElement>(null);
  const sfx = lang === "en" ? "-en-light" : "-light";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [sfx]);

  return (
    <footer>
      <Stripe thin />
      <div className="grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-2">
        <div className="relative h-[50svh] overflow-hidden lg:h-auto">
          <video
            key={sfx}
            ref={ref}
            muted
            loop
            playsInline
            preload="metadata"
            poster={`/shots/orders${sfx}.png`}
            className="absolute inset-0 h-full w-full object-cover object-left-top"
            aria-label={lang === "ru" ? "Канбан заявок в админке оператора" : "Order kanban in the operator admin panel"}
          >
            <source src={`/demos/orders${sfx}.mp4`} type="video/mp4" />
          </video>
        </div>
        <div className="bg-surface flex flex-col px-6 pb-6 pt-10 sm:px-10 lg:px-[12%] lg:pt-20">
          <Logo size="sm" />
          <nav className="mt-12 flex flex-col gap-5 lg:mt-16" aria-label={lang === "ru" ? "Карта сайта" : "Site map"}>
            {FOOTER.menu.map((m) => {
              const cls = "block w-fit text-[8vw] font-bold leading-none tracking-tight transition-transform duration-200 ease-out hover:translate-x-3 lg:text-[2.6vw]";
              return m.href.startsWith("/") ? (
                <Link key={m.href} to={m.href} className={cls}>{m.label}</Link>
              ) : (
                <a key={m.href} href={m.href} className={cls}>{m.label}</a>
              );
            })}
          </nav>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <div className="t-small space-y-1.5">
              <p className="font-semibold">{FOOTER.contactTitle}</p>
              <a className="link block" href="mailto:asystem.teamwork@gmail.com">asystem.teamwork@gmail.com</a>
              <a className="link block" href="https://asystem.ai" target="_blank" rel="noopener noreferrer">asystem.ai</a>
            </div>
            <div className="t-small space-y-1.5">
              <p className="font-semibold">{FOOTER.socialTitle}</p>
              <a className="link block" href="https://t.me/Ruslyandi" target="_blank" rel="noopener noreferrer">Telegram</a>
              <a className="link block" href="https://wa.me/996500115133" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          <p className="t-small muted mt-auto pt-12">{FOOTER.legal}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
