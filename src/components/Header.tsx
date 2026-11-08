import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLeadDialog } from "@/components/LeadDialog";
import Logo from "@/components/Logo";
import LangToggle from "@/components/LangToggle";
import { useContent, useLang } from "@/i18n";

/** Фиксированная строка: прозрачная над героем, с тоном и линией после прокрутки. */
const Header = () => {
  const { NAV } = useContent();
  const { t } = useLang();
  const openLead = useLeadDialog();
  const [solid, setSolid] = useState(false);
  // С внутренних страниц якоря ведут на главную: App докручивает до секции после маунта.
  const home = useLocation().pathname === "/";

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300"
      style={{
        background: solid ? "hsl(var(--bg) / 0.78)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        WebkitBackdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: `1px solid ${solid ? "hsl(var(--line) / 0.08)" : "transparent"}`,
      }}
    >
      <div className="wrap flex h-16 items-center justify-between gap-6">
        {home ? (
          <a href="#top" aria-label="asystem.ai" className="shrink-0"><Logo size="sm" /></a>
        ) : (
          <Link to="/" aria-label="asystem.ai" className="shrink-0"><Logo size="sm" /></Link>
        )}
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t("Разделы", "Sections")}>
          {NAV.map((n) =>
            n.href.startsWith("/") || !home ? (
              <Link key={n.href} to={n.href.startsWith("/") ? n.href : `/${n.href}`} className="link text-[15px] font-medium">{n.label}</Link>
            ) : (
              <a key={n.href} href={n.href} className="link text-[15px] font-medium">{n.label}</a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button type="button" className="btn btn-signal btn-sm hidden sm:inline-flex" onClick={() => openLead({ source: "get.asystem.ai/header" })}>
            {t("Запросить демо", "Request a demo")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
