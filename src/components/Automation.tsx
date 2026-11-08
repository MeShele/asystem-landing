import Reveal from "@/components/Reveal";
import Illus from "@/components/Illus";
import Schema from "@/components/Schema";
import { useContent } from "@/i18n";

/** Этап 2: сделка без сотрудника. Покупка и продажа — две схемы, узел «Сотрудник» пунктиром. */
const Automation = () => {
  const { AUTOMATION } = useContent();
  return (
    <section id="automation" className="wrap relative py-14 sm:py-20">
      <Illus bg name="gear" size={500} className="right-[-70px] top-[-20px] hidden lg:block" />
      <Reveal className="relative z-[1] max-w-[640px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{AUTOMATION.eyebrow}</p>
        <h2 className="t-h2 mt-3">{AUTOMATION.title}</h2>
        <p className="t-lead muted mt-4">{AUTOMATION.lead}</p>
      </Reveal>
      <div className="relative z-[1] mt-10 flex flex-col gap-10">
        {AUTOMATION.flows.map((f) => (
          <Reveal key={f.key} className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr] lg:gap-10">
            <h3 className="t-h3 lg:pt-4">{f.title}</h3>
            <Schema graph={f.schema} label={f.title} />
          </Reveal>
        ))}
      </div>
      <Reveal className="relative z-[1]"><p className="muted mt-8 max-w-[62ch] text-[15px]">{AUTOMATION.note}</p></Reveal>
    </section>
  );
};

export default Automation;
