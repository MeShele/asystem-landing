import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/** Строка интеграций под героем: имена текстом, логотипов партнёры не передавали. */
const Proof = () => {
  const { PROOF } = useContent();
  return (
    <section className="wrap py-14 sm:py-20" aria-label={PROOF.lead}>
      <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <p className="t-small muted shrink-0">{PROOF.lead}</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 lg:flex-1 lg:justify-between">
          {PROOF.names.map((n) => (
            <li key={n} className="t-h3 font-display font-semibold text-[hsl(var(--fg)/0.8)]">{n}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
};

export default Proof;
