import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { useContent } from "@/i18n";

const Footer = () => {
  const { FOOTER } = useContent();
  const home = useLocation().pathname === "/";
  return (
    <footer className="border-t border-line">
      <div className="wrap grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size="sm" />
          <p className="t-small muted mt-4 max-w-[36ch]">{FOOTER.about}</p>
        </div>
        <nav className="flex flex-col gap-2.5" aria-label={FOOTER.menuTitle}>
          <p className="t-small font-semibold">{FOOTER.menuTitle}</p>
          {FOOTER.menu.map((m) =>
            m.href.startsWith("/") || !home ? (
              <Link key={m.href} to={m.href.startsWith("/") ? m.href : `/${m.href}`} className="link text-[15px]">{m.label}</Link>
            ) : (
              <a key={m.href} href={m.href} className="link text-[15px]">{m.label}</a>
            ),
          )}
        </nav>
        <div className="flex flex-col gap-2.5">
          <p className="t-small font-semibold">{FOOTER.contactTitle}</p>
          <a className="link text-[15px]" href="mailto:asystem.teamwork@gmail.com">asystem.teamwork@gmail.com</a>
          <a className="link text-[15px]" href="https://t.me/Ruslyandi" target="_blank" rel="noopener noreferrer">Telegram</a>
          <a className="link text-[15px]" href="https://wa.me/996500115133" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small muted">{FOOTER.legal}</p>
        <p className="t-small muted">{FOOTER.disclaimer}</p>
      </div>
    </footer>
  );
};

export default Footer;
