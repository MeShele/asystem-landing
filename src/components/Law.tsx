import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

/**
 * Требования регулятора и что уже в платформе: таблица со статусом по каждой строке,
 * ниже — кто за что отвечает. Статусы честные: строка вне платформы так и подписана.
 */
const TONE: Record<string, string> = {
  done: "text-[hsl(var(--ok))]",
  you: "muted",
};

const Law = () => {
  const { LAW } = useContent();
  return (
    <section id="law" className="wrap py-20 sm:py-28">
      <Reveal className="max-w-[640px]">
        <h2 className="t-h2">{LAW.title}</h2>
        <p className="t-lead muted mt-5">{LAW.lead}</p>
      </Reveal>

      {/* Телефон: строки таблицы карточками, чтобы ничего не обрезалось */}
      <div className="mt-12 flex flex-col gap-3 lg:hidden">
        {LAW.rows.map((r) => (
          <Reveal key={r.req} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-[15px]">{r.req}</p>
              <span className={`shrink-0 text-[13px] font-semibold ${TONE[r.status] ?? ""}`}>{LAW.status[r.status as keyof typeof LAW.status]}</span>
            </div>
            <p className="muted mt-2 text-[14px] leading-relaxed">{r.how}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="panel mt-12 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="muted text-[13px] uppercase tracking-[0.1em]">
              <th className="px-6 py-4 font-semibold">{LAW.head[0]}</th>
              <th className="px-6 py-4 font-semibold">{LAW.head[1]}</th>
              <th className="px-6 py-4 font-semibold">{LAW.head[2]}</th>
            </tr>
          </thead>
          <tbody>
            {LAW.rows.map((r) => (
              <tr key={r.req} className="border-t border-[hsl(var(--line)/0.08)] align-top">
                <td className="px-6 py-4 w-[38%]">{r.req}</td>
                <td className="px-6 py-4 muted">{r.how}</td>
                <td className={`px-6 py-4 whitespace-nowrap font-semibold ${TONE[r.status] ?? ""}`}>{LAW.status[r.status as keyof typeof LAW.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal className="panel p-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent))]">{LAW.we.title}</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {LAW.we.items.map((i) => <li key={i} className="flex gap-3"><span className="dot mt-[9px] shrink-0" />{i}</li>)}
          </ul>
        </Reveal>
        <Reveal className="panel p-7">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] muted">{LAW.you.title}</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {LAW.you.items.map((i) => <li key={i} className="flex gap-3 muted"><span className="mt-[9px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[hsl(var(--muted))]" />{i}</li>)}
          </ul>
        </Reveal>
      </div>
      <p className="t-small muted mt-4">{LAW.source}</p>
    </section>
  );
};

export default Law;
