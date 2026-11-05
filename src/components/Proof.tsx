import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/** Строка интеграций под героем: один ряд по центру, ровные промежутки. */
const Proof = () => {
  const { PROOF } = useContent();
  return (
    <section className="wrap py-12 sm:py-16" aria-label={PROOF.lead}>
      <Reveal className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
        <p className="t-small muted w-full text-center sm:w-auto">{PROOF.lead}</p>
        {PROOF.names.map((n) => (
          <span key={n} className="font-display text-[17px] font-semibold text-[hsl(var(--fg)/0.75)]">{n}</span>
        ))}
      </Reveal>
    </section>
  );
};

export default Proof;
