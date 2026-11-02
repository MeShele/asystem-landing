import { Link } from "react-router-dom";
import { useLeadDialog } from "@/components/LeadDialog";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useContent, useLang } from "@/i18n";

/** Плоская строка на фоне страницы: знак, четыре ссылки, одно действие. Не прилипает. */
const Header = () => {
  const { NAV } = useContent();
  const { t } = useLang();
  const openLead = useLeadDialog();
  return (
    <header className="page-x flex h-[72px] items-center justify-between gap-6">
      <a href="#top" aria-label="asystem.ai" className="shrink-0">
        <Logo size="sm" />
      </a>
      <nav className="hidden items-center gap-7 lg:flex" aria-label={t("Разделы", "Sections")}>
        {NAV.map((n) =>
          n.href.startsWith("/") ? (
            <Link key={n.href} to={n.href} className="link t-body font-medium">{n.label}</Link>
          ) : (
            <a key={n.href} href={n.href} className="link t-body font-medium">{n.label}</a>
          ),
        )}
      </nav>
      <div className="flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
        <button type="button" className="btn btn-ink btn-sm hidden sm:inline-flex" onClick={() => openLead({ source: "get.asystem.ai/header" })}>
          {t("Запросить демо", "Request a demo")}
        </button>
      </div>
    </header>
  );
};

export default Header;
