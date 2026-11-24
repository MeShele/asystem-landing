import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useContent } from "@/i18n";

const STEP_MS = 7000;
/**
 * закрепление блока: нужен широкий и не слишком низкий экран с мышью. На сенсорном экране (и на
 * планшете в альбомной ориентации) экраны меняются только нажатием: смена картинки от прокрутки
 * пальцем выглядела как сбой
 */
const PIN = "(min-width: 1024px) and (min-height: 620px) and (hover: hover) and (pointer: fine)";
/** размеры снимков из public/shots: браузер резервирует место до загрузки */
const SIZE: Record<string, [number, number]> = { store: [1800, 1125], cabinet: [1205, 753], admin: [1800, 1125], reports: [1606, 1004] };
/** на телефоне целый экран нечитаем: снимок увеличен в z раз вокруг точки at (доли ширины и высоты снимка) */
const FOCUS: Record<string, { at: string; z: number }> = {
  store: { at: "100% 30%", z: 2.08 }, cabinet: { at: "50% 55%", z: 1.25 }, admin: { at: "40% 46%", z: 1.75 }, reports: { at: "36% 44%", z: 1.75 },
};

/** сенсорный экран: наведения нет, экраны меняет только сам посетитель */
const TOUCH = "(hover: none), (pointer: coarse)";

/**
 * Что внутри: четыре настоящих экрана платформы стопкой. На широком экране блок закрепляется,
 * и стопку листает прокрутка: верхний экран уходит на зрителя, следующий встаёт на его место,
 * пункт слева подсвечивается сам; клик по пункту прокручивает к его экрану.
 * На телефоне и планшете закрепления нет, части платформы — вкладки над экраном: экран меняется
 * только по нажатию вкладки, по нажатию на сам экран (следующий) и смахиванием в сторону.
 * Сам по таймеру он там не меняется: посетитель в это время листает страницу, и смена картинки
 * с пояснением под ней выглядела как сбой. Автосмена осталась только на незакреплённом экране с мышью.
 * Экраны стоят ровно, без наклона: наклон читается как «криво».
 */
const ProductTour = () => {
  const { TOUR } = useContent();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [run, setRun] = useState(0);
  const [pinned, setPinned] = useState(() => typeof window !== "undefined" && window.matchMedia(PIN).matches);
  const [touch, setTouch] = useState(() => typeof window !== "undefined" && window.matchMedia(TOUCH).matches);
  const track = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const items = TOUR.items, count = items.length;

  useEffect(() => {
    const mq = window.matchMedia(PIN), mt = window.matchMedia(TOUCH);
    const on = () => { setPinned(mq.matches); setTouch(mt.matches); };
    mq.addEventListener("change", on); mt.addEventListener("change", on);
    return () => { mq.removeEventListener("change", on); mt.removeEventListener("change", on); };
  }, []);

  // в закреплённом блоке экран выбирает доля прокрутки секции
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect(), total = r.height - window.innerHeight;
      if (total > 0) setI(Math.floor(Math.max(0, Math.min(0.9999, -r.top / total)) * count));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [pinned, count]);

  // без закрепления и с мышью экраны сменяются сами; на сенсорном экране — только по действию посетителя
  const auto = !reduced && !pinned && !touch;
  useEffect(() => {
    if (!auto || hold) return;
    const id = setTimeout(() => { setI((n) => (n + 1) % count); setRun((k) => k + 1); }, STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, auto, run, count]);

  const pick = (n: number) => {
    const el = track.current;
    if (pinned && el) {
      const top = el.getBoundingClientRect().top + window.scrollY, total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (total * (n + 0.5)) / count, behavior: reduced ? "auto" : "smooth" });
    } else { setI(n); setRun((k) => k + 1); }
  };
  // смахивание по стопке: влево — следующий экран, вправо — предыдущий; вертикальная прокрутка остаётся странице
  const onSwipeEnd = (x: number, y: number) => {
    const from = swipe.current;
    swipe.current = null;
    if (!from || pinned) return;
    const dx = x - from.x, dy = y - from.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) pick((i + (dx < 0 ? 1 : count - 1)) % count);
  };

  return (
    <section id="features" ref={track} className="relative" style={pinned ? { height: `${100 + count * 55}vh` } : undefined}>
      {/* закреплённый блок привязан к верху: пояснение под пунктом меняет высоту колонки, и по центру она бы прыгала */}
      <div className={pinned ? "sticky top-0 h-screen overflow-hidden" : ""}>
        <div className={`wrap w-full ${pinned ? "pt-[max(6.5rem,calc(50vh-17rem))]" : "py-14 sm:py-20"}`}>
          <div
            className={`grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-10 ${pinned ? "lg:items-start" : "lg:items-center"}`}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
          >
            <div className="order-1 lg:col-span-4">
              <Reveal>
                <h2 className="t-h2">{TOUR.title}</h2>
                <p className={`t-lead muted mt-4 ${pinned ? "[@media(max-height:719px)]:hidden" : ""}`}>{TOUR.lead}</p>
              </Reveal>
              <ol className="mt-8 hidden flex-col lg:flex">
                {items.map((it, n) => <Item key={it.key} title={it.title} text={it.text} active={n === i} onPick={() => pick(n)} bar={auto && n === i ? { run, hold } : null} />)}
              </ol>
              <div role="tablist" aria-label={TOUR.title} className="mt-6 flex flex-wrap gap-2 lg:hidden">
                {items.map((it, n) => (
                  <button
                    key={it.key}
                    type="button"
                    role="tab"
                    aria-selected={n === i}
                    onClick={() => pick(n)}
                    className={`min-h-[44px] rounded-full border px-4 text-[15px] font-medium transition-colors duration-200 ${n === i ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-ink))]" : "muted border-[hsl(var(--line)/0.16)]"}`}
                  >
                    {it.title}
                  </button>
                ))}
              </div>
              {pinned && (
                <p className="muted mt-6 flex items-center gap-2 text-[13px]">
                  <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--accent-ink))]" aria-hidden="true" />
                  {TOUR.hint}
                </p>
              )}
            </div>

            {/* стопка: сверху запас под экраны, которые выглядывают из-за переднего */}
            <div className="order-2 pt-[7%] max-lg:-mt-2 lg:col-span-8">
              <div
                className="relative aspect-[16/10] touch-pan-y"
                onTouchStart={(e) => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                onTouchEnd={(e) => onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
                onClick={touch && !pinned ? () => pick((i + 1) % count) : undefined}
              >
                {items.map((it, n) => {
                  const d = n - i, back = Math.min(d, 3);
                  const [w, h] = SIZE[it.key] ?? [1600, 1000];
                  return (
                    <figure
                      key={it.key}
                      aria-hidden={d !== 0}
                      className="shot absolute inset-0 overflow-hidden rounded-[14px] border border-[hsl(var(--line)/0.2)] bg-[hsl(var(--bg))] motion-reduce:transition-none"
                      style={{
                        zIndex: d === 0 ? count + 1 : d > 0 ? count - d : count + 2,
                        opacity: d === 0 ? 1 : d < 0 ? 0 : d === 1 ? 0.5 : d === 2 ? 0.24 : 0,
                        transform: d === 0 ? "none" : d < 0 ? "translateY(5%) scale(1.07)" : `translateY(${-4.6 * back}%) scale(${1 - 0.055 * back})`,
                        pointerEvents: d === 0 ? "auto" : "none",
                      }}
                    >
                      <img src={`/shots/${it.key}.webp`} width={w} height={h} alt={it.alt} loading="lazy" decoding="async" className="h-full w-full object-cover object-top max-sm:[transform:scale(var(--z))]" style={{ transformOrigin: FOCUS[it.key]?.at, "--z": FOCUS[it.key]?.z ?? 1 } as CSSProperties} />
                    </figure>
                  );
                })}
              </div>
            </div>

            {/* пояснение к выбранной вкладке; высота с запасом на две строки, чтобы страница под ним не прыгала */}
            <p className="muted order-3 -mt-3 min-h-[2.9em] text-[15px] leading-snug lg:hidden" aria-live="polite">{items[i].text}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/** пункт списка: название, под активным — пояснение; bar — полоса времени до автосмены */
const Item = ({ title, text, active, onPick, bar }: { title: string; text: string; active: boolean; onPick: () => void; bar: { run: number; hold: boolean } | null }) => (
  <li className="relative">
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`w-full border-l-2 py-3.5 pl-5 text-left transition-colors duration-300 ${active ? "border-[hsl(var(--accent))]" : "border-[hsl(var(--line)/0.1)] hover:border-[hsl(var(--line)/0.3)]"}`}
    >
      <span className={`t-h3 block transition-colors duration-300 ${active ? "text-[hsl(var(--fg))]" : "muted"}`}>{title}</span>
      {/* раскрытие через строки сетки, без замера высоты: motion при height: "auto" вызывает window.scrollTo и обрывает прокрутку, а пункт здесь меняется как раз на ходу */}
      <span aria-hidden={!active} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <span className="muted block overflow-hidden text-[15px]"><span className="block pt-2">{text}</span></span>
      </span>
    </button>
    {bar && (
      <motion.i
        key={bar.run}
        className="absolute left-[-2px] top-0 w-[2px] bg-[hsl(var(--accent))] opacity-40"
        initial={{ height: "0%" }}
        animate={{ height: bar.hold ? undefined : "100%" }}
        transition={{ duration: STEP_MS / 1000, ease: "linear" }}
      />
    )}
  </li>
);

export default ProductTour;
