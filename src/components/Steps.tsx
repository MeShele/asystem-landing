/**
 * Шаги текстом: заголовок и строка пояснения на каждый. Стоит под 3D-сценой на телефоне (там
 * подписи на сцене не помещаются) и вместо сцены — когда она выключена (reduced-motion, нет WebGL).
 * columns — раскладка в колонки на широком экране; на узком всегда столбик вдоль лаймовой рейки.
 */
export type Step = { id: string; title: string; text?: string; accent?: boolean; muted?: boolean };

const Steps = ({ items, columns = false, className = "" }: { items: Step[]; columns?: boolean; className?: string }) => (
  <ul
    className={`flex flex-col gap-5 border-l-2 border-[hsl(var(--accent)/0.45)] pl-5 ${columns ? "md:grid md:gap-x-8 md:border-l-0 md:pl-0" : ""} ${className}`}
    style={columns ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
  >
    {items.map((s) => (
      <li key={s.id} className={columns ? "md:border-t md:border-[hsl(var(--line)/0.12)] md:pt-4" : ""}>
        <p className={`font-display text-[15px] font-medium leading-snug ${s.accent ? "text-[hsl(var(--accent-ink))]" : s.muted ? "muted" : ""}`}>{s.title}</p>
        {s.text && <p className="muted mt-1.5 text-[13.5px] leading-snug">{s.text}</p>}
      </li>
    ))}
  </ul>
);

export default Steps;
