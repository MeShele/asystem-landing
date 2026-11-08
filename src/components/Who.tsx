import Reveal from "@/components/Reveal";
import Illus from "@/components/Illus";
import { useContent } from "@/i18n";

/** Для кого: три строки на всю ширину, щит гравюрой в фоне справа. */
const Who = () => {
  const { WHO } = useContent();
  return (
    <section id="who" className="wrap relative py-20 sm:py-24">
      <Illus bg name="shield" size={440} className="right-[-90px] top-[-80px] hidden lg:block" />
      <Reveal className="relative z-[1]"><h2 className="t-h2">{WHO.title}</h2></Reveal>
      <Reveal as="ul" className="relative z-[1] mt-8 flex flex-col divide-y divide-[hsl(var(--line)/0.08)] border-t border-[hsl(var(--line)/0.08)]">
        {WHO.cards.map((c) => (
          <li key={c.text} className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-6">
            <span className={`text-[13px] font-semibold uppercase tracking-[0.12em] ${c.no ? "muted" : "text-[hsl(var(--accent-ink))]"}`}>{c.no ? WHO.labelNo : WHO.labelYes}</span>
            <p className={`t-h3 font-medium ${c.no ? "muted" : ""}`}>{c.text}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
};

export default Who;
