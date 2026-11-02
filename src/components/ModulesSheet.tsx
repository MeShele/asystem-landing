import Reveal from "@/components/Reveal";
import { useContent, useLang } from "@/i18n";
import { BILLING_LABEL, CATALOG, moduleName } from "@/modulesCatalog";

/**
 * «The printed menu sheet»: один высокий лист бумаги с зубчатыми краями на
 * тёмном поле. Группы — категории, строка — модуль слева и как он достаётся
 * справа, под названием одна строка описания. Связывает только выравнивание.
 */
const ModulesSheet = () => {
  const { MODULES } = useContent();
  const { lang, l } = useLang();
  return (
    <section id="modules" className="bg-ink px-[10px] py-20 sm:px-6 lg:py-32">
      <Reveal className="sheet bg-page mx-auto max-w-[640px] px-7 py-14 text-[hsl(var(--foreground))] sm:px-16 sm:py-16">
        <h2 className="t-head text-center">{MODULES.title}</h2>
        <p className="t-small muted mx-auto mt-3 max-w-[40ch] text-center">{MODULES.note}</p>
        <div className="mt-12 space-y-12">
          {CATALOG.map((c) => (
            <div key={c.key}>
              <h3 className="t-lead text-center font-semibold">{l(c.label)}</h3>
              <ul className="mt-5 space-y-4">
                {c.modules.map((m) => (
                  <li key={m.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="t-body font-medium">{moduleName(m, lang)}</span>
                      <span className={`t-small shrink-0 tabular ${m.billing === "soon" ? "muted" : ""}`}>{l(BILLING_LABEL[m.billing])}</span>
                    </div>
                    <p className="t-small muted mt-0.5 max-w-[46ch]">{l(m.desc)}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="t-small muted mt-14 text-center">
          {MODULES.foot[0]}<br />{MODULES.foot[1]}
        </p>
      </Reveal>
    </section>
  );
};

export default ModulesSheet;
