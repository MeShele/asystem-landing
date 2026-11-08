import Reveal from "@/components/Reveal";
import Schema from "@/components/Schema";
import { useContent } from "@/i18n";

/** Запуск за четыре шага: заголовок и срок слева, четыре узла одной линией на всю ширину. */
const HowItWorks = () => {
  const { STEPS } = useContent();
  return (
    <section id="how" className="wrap py-14 sm:py-20">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{STEPS.title}</h2>
        <p className="t-lead muted mt-4">{STEPS.note}</p>
      </Reveal>
      <Reveal className="mt-10">
        <Schema graph={STEPS.schema} label={STEPS.title} />
      </Reveal>
    </section>
  );
};

export default HowItWorks;
