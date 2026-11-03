import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/**
 * Для кого платформа: две карточки «подходит», одна «не подходит».
 * Снимает главный вопрос первой встречи до того, как читатель дошёл до цен.
 */
const Who = () => {
  const { WHO } = useContent();
  return (
    <section id="who" className="wrap py-20 sm:py-28">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{WHO.title}</h2>
        <p className="t-lead muted mt-5">{WHO.lead}</p>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {WHO.cards.map((c) => (
          <Reveal key={c.title} className={`panel flex flex-col gap-4 p-7 ${c.no ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]" : ""}`}>
            <p className={`text-[13px] font-semibold uppercase tracking-[0.12em] ${c.no ? "" : "text-[hsl(var(--accent))]"}`}>{c.no ? WHO.labelNo : WHO.labelYes}</p>
            <h3 className="t-h3">{c.title}</h3>
            <p className={`text-[15px] leading-relaxed ${c.no ? "opacity-80" : "muted"}`}>{c.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Who;
