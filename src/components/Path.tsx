import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/**
 * Путь заявки: пять шагов в строку на одной линии, последний — лаймовый. Графики здесь нет
 * намеренно: блок короткий, смысл — порядок шагов, объёмная плата его не усиливала.
 * На узком экране шаги идут столбиком вдоль лаймовой рейки.
 */
const Path = () => {
  const { PATH } = useContent();
  const last = PATH.steps.length - 1;
  return (
    <section id="path" className="wrap pb-6 pt-14 sm:pt-20">
      <Reveal><h2 className="t-h2">{PATH.title}</h2></Reveal>
      <Reveal as="ol" className="mt-8 flex flex-col gap-5 border-l-2 border-[hsl(var(--accent)/0.45)] pl-5 lg:grid lg:grid-cols-5 lg:gap-x-6 lg:border-l-0 lg:pl-0">
        {PATH.steps.map((s, i) => (
          <li key={s.id} className="relative lg:border-t lg:border-[hsl(var(--line)/0.14)] lg:pt-5">
            <span aria-hidden="true" className={`absolute left-0 top-[-4.5px] hidden h-2 w-2 rounded-full lg:block ${i === last ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--line)/0.5)]"}`} />
            <p className={`font-display text-[16px] font-medium leading-snug ${i === last ? "text-[hsl(var(--accent-ink))]" : ""}`}>{s.title}</p>
            <p className="muted mt-1.5 text-[14px] leading-snug">{s.text}</p>
          </li>
        ))}
      </Reveal>
      <p className="muted mt-7 text-[14px]">{PATH.base}</p>
    </section>
  );
};

export default Path;
