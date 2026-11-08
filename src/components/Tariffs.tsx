import Reveal from "@/components/Reveal";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent } from "@/i18n";
import { usePlatformStats } from "@/lib/platformStats";

const fmt = (n: number) => n.toLocaleString("ru-RU");

/**
 * Тарифы: три карточки. Цены НЕ заданы здесь — их считает core из прайса
 * (edge platform-stats), на витрину только сомы по курсу НБ КР. Нет курса — нет цены.
 * Состав тарифов повторяет supabase/functions/_shared/pricingTiers.ts в репо core.
 */
const Tariffs = () => {
  const { PRICING } = useContent();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const prepay = stats?.prepayMonths ?? 3;
  const kgs = stats?.kgs ?? null;
  const tier = (id: "start" | "business") => kgs?.tiers.find((x) => x.id === id) ?? null;

  type Card = { key: string; title: string; desc: string; points: string[]; popular?: boolean; monthly?: number; setup?: number; buyout?: { price: number; from: boolean } | null };
  const cards: Card[] = [
    { key: "start", ...PRICING.groups.start, monthly: tier("start")?.monthly, setup: tier("start")?.setup },
    { key: "business", ...PRICING.groups.business, monthly: tier("business")?.monthly, setup: tier("business")?.setup, popular: true },
    { key: "buyout", title: PRICING.groups.buyout.title, desc: PRICING.groups.buyout.desc, points: PRICING.groups.buyout.points, buyout: kgs?.buyout ?? null },
  ];

  const Price = ({ c }: { c: Card }) => {
    if (c.key === "buyout") {
      if (!c.buyout) return <div className="muted font-medium">{PRICING.noRate}</div>;
      return (
        <>
          <div className="font-display text-[2rem] font-bold tabular tracking-tight">
            {c.buyout.from ? `${PRICING.groups.buyout.from} ` : ""}{fmt(c.buyout.price)} <span className="t-small muted font-sans font-medium">сом</span>
          </div>
          <div className="t-small muted mt-1">{PRICING.groups.buyout.unit}</div>
        </>
      );
    }
    if (c.monthly == null) return <div className="muted font-medium">{PRICING.noRate}</div>;
    return (
      <>
        <div className="font-display text-[2rem] font-bold tabular tracking-tight">
          {fmt(c.monthly)} <span className="t-small muted font-sans font-medium">сом · {PRICING.perMonth}</span>
        </div>
        <div className="t-small muted mt-1">+ {fmt(c.setup ?? 0)} сом {PRICING.setup}</div>
      </>
    );
  };

  return (
    <section id="pricing" className="wrap py-14 sm:py-20">
      <Reveal className="max-w-[760px]">
        <h2 className="t-h2">{PRICING.title}</h2>
        <p className="t-lead muted mt-4">{PRICING.lead(prepay)}</p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <Reveal key={c.key} className={`panel relative flex flex-col p-7 ${c.popular ? "ring-1 ring-accent" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="t-h3">{c.title}</h3>
              {c.popular && <span className="rounded-full bg-accent px-2.5 py-1 text-[13px] font-bold text-accent-foreground">{PRICING.popular}</span>}
            </div>
            <p className="muted mt-2 text-[15px]">{c.desc}</p>
            <div className="mt-7 min-h-[4.5rem]"><Price c={c} /></div>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-line pt-6">
              {c.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px]"><i className="dot mt-[9px] shrink-0" />{p}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`btn mt-7 w-full ${c.popular ? "btn-signal" : "btn-ghost"}`}
              onClick={() => openLead({ source: "get.asystem.ai/pricing", title: PRICING.cta, message: `${PRICING.title}: ${c.title}` })}
            >
              {PRICING.cta}
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6 flex flex-col gap-1.5">
        <p className="t-small muted"><span className="text-fg">{PRICING.groups.addons.title}:</span> {PRICING.groups.addons.items.map((a) => a.name).join(" · ")}. {PRICING.groups.addons.price}</p>
        <p className="t-small muted">{kgs ? PRICING.rateNote(kgs.date) : PRICING.noRate} {PRICING.providersNote}</p>
      </Reveal>
    </section>
  );
};

export default Tariffs;
