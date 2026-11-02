import Reveal from "@/components/Reveal";
import { useLeadDialog } from "@/components/LeadDialog";
import { useContent } from "@/i18n";
import { usePlatformStats } from "@/lib/platformStats";

const fmt = (n: number) => n.toLocaleString("ru-RU");

type Row = { name: string; desc?: string; price: string };

/* Группа меню цен: название, что входит, строки «название — цена», валюта один раз в шапке */
const Group = ({ title, desc, rows, som }: { title: string; desc: string; rows: Row[]; som: string }) => (
  <div className="min-w-0">
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="t-lead font-semibold">{title}</h3>
      <span className="t-small muted">{som}</span>
    </div>
    {desc && <p className="t-body muted mt-2 max-w-[38ch] [overflow-wrap:anywhere]">{desc}</p>}
    <ul className="mt-5 space-y-4">
      {rows.map((r) => (
        <li key={r.name} className="flex items-baseline justify-between gap-6">
          <span className="min-w-0">
            <span className="t-body block font-medium">{r.name}</span>
            {r.desc && <span className="t-small muted block">{r.desc}</span>}
          </span>
          <span className="t-body shrink-0 tabular font-medium">{r.price}</span>
        </li>
      ))}
    </ul>
  </div>
);


/**
 * «Prices like a menu»: заголовок в колонках 1–3, цены в 5–12 двумя текстовыми
 * колонками. Цены НЕ заданы здесь: их считает core из прайса (edge platform-stats),
 * только в сомах по курсу НБ КР (закон № 91). Нет курса — нет цены.
 * Состав тарифов — копия supabase/functions/_shared/pricingTiers.ts в репо core.
 */
const Tariffs = () => {
  const { PRICING } = useContent();
  const openLead = useLeadDialog();
  const stats = usePlatformStats();
  const prepay = stats?.prepayMonths ?? 3;
  const kgs = stats?.kgs ?? null;
  const tier = (id: "start" | "business") => kgs?.tiers.find((x) => x.id === id) ?? null;
  const som = "сом";

  const price = (n: number | undefined) => (n == null ? PRICING.groups.addons.price : fmt(n));
  const start = tier("start");
  const business = tier("business");

  return (
    <section id="pricing" className="page-x py-24 lg:py-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-3">
          <h2 className="t-head">{PRICING.title}</h2>
          <p className="t-body mt-5 max-w-[30ch]">{PRICING.lead(prepay)}</p>
          <p className="t-small muted mt-4 max-w-[30ch]">{kgs ? PRICING.rateNote(kgs.date) : PRICING.noRate}</p>
          <button type="button" className="btn btn-signal mt-8" onClick={() => openLead({ source: "get.asystem.ai/pricing", title: PRICING.cta })}>
            {PRICING.cta}
          </button>
        </Reveal>

        <Reveal className="grid gap-12 md:grid-cols-2 md:gap-x-16 lg:col-span-8 lg:col-start-5 [&>*]:min-w-0">
          <Group
            som={som}
            title={PRICING.groups.start.title}
            desc={PRICING.groups.start.desc}
            rows={[
              { name: PRICING.perMonth, price: price(start?.monthly) },
              { name: PRICING.setup, price: price(start?.setup) },
            ]}
          />
          <Group
            som={som}
            title={PRICING.groups.business.title}
            desc={PRICING.groups.business.desc}
            rows={[
              { name: PRICING.perMonth, price: price(business?.monthly) },
              { name: PRICING.setup, price: price(business?.setup) },
            ]}
          />
          <Group
            som={som}
            title={PRICING.groups.buyout.title}
            desc={PRICING.groups.buyout.desc}
            rows={[
              {
                name: PRICING.groups.buyout.unit,
                price: kgs?.buyout ? `${kgs.buyout.from ? `${PRICING.groups.buyout.from} ` : ""}${fmt(kgs.buyout.price)}` : PRICING.groups.addons.price,
              },
            ]}
          />
          <Group
            som={som}
            title={PRICING.groups.addons.title}
            desc=""
            rows={PRICING.groups.addons.items.map((a) => ({ name: a.name, desc: a.desc, price: PRICING.groups.addons.price }))}
          />
        </Reveal>
      </div>
    </section>
  );
};

export default Tariffs;
