import Reveal from "@/components/Reveal";
import Illus from "@/components/Illus";
import { useContent } from "@/i18n";

/** Этап 2: сделка без сотрудника. Две карточки по три шага, без журнала событий. */
const Automation = () => {
  const { AUTOMATION } = useContent();
  return (
    <section id="automation" className="wrap py-20 sm:py-24">
      <div className="flex items-end justify-between gap-8">
        <Reveal className="max-w-[640px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{AUTOMATION.eyebrow}</p>
          <h2 className="t-h2 mt-3">{AUTOMATION.title}</h2>
          <p className="t-lead muted mt-4">{AUTOMATION.lead}</p>
        </Reveal>
        <Illus name="gear" size={240} className="hidden shrink-0 lg:block" />
      </div>
      <Reveal className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {AUTOMATION.flows.map((f) => (
          <div key={f.key} className="panel p-6 sm:p-7">
            <h3 className="t-h3">{f.title}</h3>
            <ol className="mt-5 flex flex-col gap-3">
              {f.steps.map((s, j) => (
                <li key={j} className="flex gap-4">
                  <span className="mt-[3px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.14)] text-[12px] font-semibold tabular-nums text-[hsl(var(--accent-ink))]">{j + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Reveal>
      <Reveal><p className="muted mt-6 max-w-[62ch] text-[15px]">{AUTOMATION.note}</p></Reveal>
    </section>
  );
};

export default Automation;
