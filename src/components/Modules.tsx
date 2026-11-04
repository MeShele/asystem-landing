import Reveal from "@/components/Reveal";
import ModulesScene from "@/components/scenes/ModulesScene";
import { useContent, useLang } from "@/i18n";
import { BILLING_LABEL, CATALOG, moduleName, type Billing } from "@/modulesCatalog";

const TONE: Record<Billing, string> = {
  start: "bg-[hsl(var(--accent)/0.14)] text-accent",
  business: "bg-[hsl(var(--accent)/0.14)] text-accent",
  addon: "bg-[hsl(var(--line)/0.08)] text-fg",
  deal: "bg-[hsl(var(--line)/0.08)] muted",
  soon: "bg-transparent muted ring-line",
};

/** Каталог: шесть категорий панелями, у каждого модуля признак, как он достаётся; ниже запись маркетплейса. */
const Modules = () => {
  const { MODULES } = useContent();
  const { lang, l } = useLang();
  return (
    <section id="modules" className="wrap py-20 sm:py-28">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{MODULES.title}</h2>
        <p className="t-lead muted mt-5">{MODULES.note}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((c) => (
          <Reveal key={c.key} className="panel p-6">
            <h3 className="t-h3">{l(c.label)}</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {c.modules.map((m) => (
                <li key={m.name} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium">{moduleName(m, lang)}</span>
                    <span className="t-small muted block">{l(m.desc)}</span>
                  </span>
                  <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold ${TONE[m.billing]}`}>{l(BILLING_LABEL[m.billing])}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <div className="frame p-0" aria-label={MODULES.videoLabel}><ModulesScene /></div>
        <p className="t-small muted mt-4">{MODULES.foot}</p>
      </Reveal>
    </section>
  );
};

export default Modules;
