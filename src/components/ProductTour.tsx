import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import Schema from "@/components/Schema";
import Reveal from "@/components/Reveal";
import { useScene } from "@/components/useScene";
import { useContent, useLang } from "@/i18n";
import type { LayersHandle } from "@/three/layers";

const EASE = [0.23, 1, 0.32, 1] as const;
const STEP_MS = 8000;
/** закрепление блока: нужен широкий и не слишком низкий экран, иначе колонка не помещается в его высоту */
const PIN = "(min-width: 1024px) and (min-height: 620px)";
/** та же шкала, что DECK в src/three/layers.ts: доля прокрутки блока, на которой карточка n стоит впереди */
const stop = (n: number, count: number) => (n + 0.3 - 0.12) / (count - 0.5);

/**
 * Что внутри: четыре части платформы колодой экранов (сцена — src/three/layers.ts). На широком
 * экране блок закрепляется, и колоду листает прокрутка: карточка улетает на зрителя, следующая
 * выходит вперёд, пункт слева подсвечивается сам. Клик по пункту прокручивает к его карточке.
 * На телефоне закрепления нет: карточки сменяются сами и по касанию пункта.
 * Без сцены (reduced-motion, нет WebGL) справа плоская схема выбранной части.
 */
const ProductTour = () => {
  const { TOUR } = useContent();
  const { t } = useLang();
  const reduced = !!useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [run, setRun] = useState(0);
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(PIN).matches);
  const items = TOUR.items;
  const cur = items[i];

  useEffect(() => {
    const mq = window.matchMedia(PIN);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const track = useRef<HTMLElement>(null);
  const api = useRef<LayersHandle | null>(null);
  const tag = useRef<HTMLDivElement>(null);
  const index = useRef(0);
  const mount = useCallback(
    (canvas: HTMLCanvasElement) => import("@/three/layers")
      .then((m) => m.mountLayers({ canvas, tag: tag.current, track: wide ? track.current : null, onActive: wide ? setI : undefined }))
      .then((h) => {
        h.setActive(index.current);
        api.current = h;
        return () => { api.current = null; h.dispose(); };
      }),
    [wide],
  );
  const { canvas, on } = useScene(mount);
  const pinned = on && wide;
  useEffect(() => { index.current = i; api.current?.setActive(i); }, [i]);

  // без закрепления пункты сменяются сами
  useEffect(() => {
    if (reduced || hold || pinned) return;
    const id = setTimeout(() => { setI((n) => (n + 1) % items.length); setRun((k) => k + 1); }, STEP_MS);
    return () => clearTimeout(id);
  }, [i, hold, reduced, pinned, run, items.length]);

  const pick = (n: number) => {
    const el = track.current;
    if (pinned && el) {
      const top = el.getBoundingClientRect().top + window.scrollY, total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + total * stop(n, items.length), behavior: "smooth" });
    } else { setI(n); setRun((k) => k + 1); }
  };

  return (
    <section id="features" ref={track} className="relative" style={pinned ? { height: `${100 + items.length * 62}vh` } : undefined}>
      {/* закреплённый блок привязан к верху: пояснение под пунктом меняет высоту колонки, и по центру она бы прыгала */}
      <div className={pinned ? "sticky top-0 h-screen overflow-hidden" : ""}>
        <div className={`wrap w-full ${pinned ? "pt-[max(6.5rem,calc(50vh-16.5rem))]" : "py-14 sm:py-20"}`}>
          <div
            className={`grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-10 ${pinned ? "lg:items-start" : "lg:items-center"}`}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
          >
            <div className="order-1 lg:col-span-4">
              <Reveal>
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent-ink))]">{TOUR.eyebrow}</p>
                <h2 className="t-h2 mt-3">{TOUR.title}</h2>
                <p className={`t-lead muted mt-4 ${pinned ? "[@media(max-height:719px)]:hidden" : ""}`}>{TOUR.lead}</p>
              </Reveal>
              <ol className="mt-8 hidden flex-col lg:flex">
                {items.map((it, n) => <Item key={it.key} title={it.title} text={it.text} active={n === i} onPick={() => pick(n)} bar={!pinned && !reduced && n === i ? { run, hold } : null} />)}
              </ol>
              {pinned && (
                <p className="muted mt-6 flex items-center gap-2 text-[13px]">
                  <ArrowDown className="h-3.5 w-3.5 text-[hsl(var(--accent-ink))]" aria-hidden="true" />
                  {t("Листайте вниз: части сменяются по ходу прокрутки", "Scroll down: the parts change as you go")}
                </p>
              )}
            </div>

            <div className="order-2 lg:col-span-8">
              {on ? (
                <div className="scene relative aspect-[4/3] lg:aspect-[7/5]" role="img" aria-label={`${TOUR.title}: ${cur.title}`}>
                  {/* в закреплённом блоке холст шире своей ячейки: улетающей карточке нужно место, края гаснут маской */}
                  <div className={pinned ? "scene-bleed pointer-events-none absolute -inset-y-[24%] -left-10 right-0" : "absolute inset-0"}>
                    <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
                    <div ref={tag} className="scene-tag hidden md:block">
                      <div className="scene-tag-side">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.ul key={cur.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-1.5">
                            {cur.schema.nodes.map((n) => (
                              <li key={n.id} className={`text-[13px] leading-snug ${n.kind === "accent" ? "font-display font-medium text-[hsl(var(--accent-ink))]" : n.kind === "ghost" || n.kind === "side" ? "muted" : ""}`}>{n.title}</li>
                            ))}
                          </motion.ul>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={cur.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} transition={{ duration: 0.34, ease: EASE }}>
                    <Schema graph={cur.schema} label={cur.title} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <ol className="order-3 flex flex-col lg:hidden">
              {items.map((it, n) => <Item key={it.key} title={it.title} text={it.text} active={n === i} onPick={() => pick(n)} bar={!reduced && n === i ? { run, hold } : null} />)}
            </ol>
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
