import { Link } from "react-router-dom";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent } from "@/i18n";
import { usePlatformStats } from "@/lib/platformStats";

const Stripe = ({ thin = false }: { thin?: boolean }) => (
  <div className={`stripe ${thin ? "stripe--thin" : ""}`} aria-hidden="true">
    {Array.from({ length: 40 }, (_, i) => <span key={i} />)}
  </div>
);

/**
 * Карточка героя («Striped card beside the room»): бумажная панель с полосой
 * сверху, заголовок в две строки, одна фраза, одна кнопка, три ссылки у низа.
 * Сцена справа — в Layout; здесь только левая карточка.
 */
const Hero = () => {
  const { HERO } = useContent();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  return (
    <section id="top" data-stage="exchange" className="bg-surface flex flex-col">
      <Stripe />
      <div className="flex flex-col px-6 pb-9 pt-10 sm:px-10 sm:pb-12 sm:pt-14">
        <h1 className="t-hero max-w-[16ch]">{HERO.h1}</h1>
        <p className="t-body mt-6 max-w-[40ch]">{HERO.sub}</p>
        <div className="mt-8">
          <button type="button" className="btn btn-signal" onClick={() => openLead({ source: "get.asystem.ai/hero" })}>
            {HERO.cta}
          </button>
        </div>
        <p className="t-small muted mt-4">{HERO.fact(stats?.exchangers ?? null)}</p>

        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 t-small" aria-label="Полезные ссылки">
          {HERO.links.map((l) =>
            l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link font-medium">{l.label}</a>
            ) : (
              <Link key={l.href} to={l.href} className="link font-medium">{l.label}</Link>
            ),
          )}
        </nav>
      </div>
    </section>
  );
};

export { Stripe };
export default Hero;
