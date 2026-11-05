import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/** Запуск за четыре шага: заголовок и срок слева, четыре карточки на всю ширину. */
const HowItWorks = () => {
  const { STEPS } = useContent();
  return (
    <section id="how" className="wrap py-20 sm:py-24">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{STEPS.title}</h2>
        <p className="t-lead muted mt-4">{STEPS.note}</p>
      </Reveal>
      <Reveal as="ol" className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.stages.map((s) => (
          <li key={s.short} className="panel p-6">
            <span className="font-display text-[13px] font-semibold tabular-nums text-[hsl(var(--accent-ink))]">{s.short}</span>
            <h3 className="t-h3 mt-5">{s.clause}</h3>
            <p className="muted mt-2 text-[15px]">{s.text}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
};

export default HowItWorks;
