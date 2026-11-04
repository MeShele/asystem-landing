import Reveal from "@/components/Reveal";
import Illus from "@/components/Illus";
import { useContent } from "@/i18n";

/** Для кого: три строки, не три абзаца. Снимает главный вопрос первой встречи. */
const Who = () => {
  const { WHO } = useContent();
  return (
    <section id="who" className="wrap py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <h2 className="t-h2">{WHO.title}</h2>
          <Illus name="shield" size={260} className="mt-8 hidden lg:block" />
        </Reveal>
        <Reveal as="ul" className="flex flex-col divide-y divide-[hsl(var(--line)/0.08)] lg:col-span-8">
          {WHO.cards.map((c) => (
            <li key={c.text} className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[140px_1fr] sm:gap-6">
              <span className={`text-[13px] font-semibold uppercase tracking-[0.12em] ${c.no ? "muted" : "text-[hsl(var(--accent-ink))]"}`}>{c.no ? WHO.labelNo : WHO.labelYes}</span>
              <p className={`t-h3 font-medium ${c.no ? "muted" : ""}`}>{c.text}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Who;
