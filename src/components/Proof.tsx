import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/**
 * Строка интеграций под героем: подпись и имена одним рядом между двумя тонкими линиями.
 * Логотипов партнёров нет, поэтому имена набраны текстом, ровно и приглушённо.
 */
const Proof = () => {
  const { PROOF } = useContent();
  return (
    <section className="wrap py-6 sm:py-8" aria-label={PROOF.lead}>
      <Reveal className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-[hsl(var(--line)/0.08)] py-5 sm:gap-x-10">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] muted w-full text-center sm:w-auto">{PROOF.lead}</p>
        {PROOF.names.map((n) => (
          <span key={n} className="text-[16px] font-semibold text-[hsl(var(--fg)/0.7)]">{n}</span>
        ))}
      </Reveal>
    </section>
  );
};

export default Proof;
