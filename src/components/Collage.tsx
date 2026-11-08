import { motion, useReducedMotion } from "motion/react";

/**
 * Коллаж из настоящих фрагментов продукта: вырезки экранов стенда (public/art/*.webp)
 * лежат слоями в одном поле, а тонкие выноски подписывают, что именно на них видно.
 * Поле задаётся пропорцией, слои — в процентах от поля, высота слоя из пропорции вырезки.
 * Вход: слои поднимаются по очереди, затем прорисовываются линии и подписи.
 */
export type Shard = {
  /** имя файла в public/art без расширения */
  src: string;
  /** размер вырезки в пикселях — задаёт пропорцию слоя */
  w: number;
  h: number;
  /** положение и ширина в процентах поля */
  left: number;
  top: number;
  width: number;
  z?: number;
};

export type Callout = {
  text: string;
  /** точка на фрагменте, % поля */
  x: number;
  y: number;
  /** центр подписи, % поля */
  lx: number;
  ly: number;
};

const EASE = [0.23, 1, 0.32, 1] as const;

const Collage = ({ aspect, shards, callouts = [], className = "", alt = "" }: {
  aspect: string;
  shards: Shard[];
  callouts?: Callout[];
  className?: string;
  alt?: string;
}) => {
  const reduced = !!useReducedMotion();
  const base = callouts.length ? 0.1 + shards.length * 0.08 : 0;

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: aspect }} role="img" aria-label={alt}>
      {shards.map((s, i) => (
        <motion.div
          key={s.src}
          className="absolute overflow-hidden rounded-[12px] border border-[hsl(var(--line)/0.1)] bg-[hsl(var(--surface))] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] sm:rounded-[14px]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, aspectRatio: `${s.w} / ${s.h}`, zIndex: s.z ?? i + 1 }}
          initial={{ opacity: 0, y: reduced ? 0 : 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
        >
          <img src={`/art/${s.src}.webp`} alt="" width={s.w} height={s.h} loading="lazy" decoding="async" draggable={false} className="block h-full w-full select-none" />
        </motion.div>
      ))}

      {callouts.length > 0 && (
        <>
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" style={{ zIndex: 40 }} aria-hidden="true">
            {callouts.map((c, i) => (
              <g key={c.text}>
                <motion.line
                  x1={`${c.lx}%`} y1={`${c.ly}%`} x2={`${c.x}%`} y2={`${c.y}%`}
                  stroke="hsl(var(--accent) / 0.55)" strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE, delay: base + i * 0.1 }}
                />
                <motion.circle
                  cx={`${c.x}%`} cy={`${c.y}%`} r="3.5"
                  fill="hsl(var(--bg))" stroke="hsl(var(--accent))" strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: EASE, delay: base + 0.4 + i * 0.1 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              </g>
            ))}
          </svg>
          {callouts.map((c, i) => (
            <motion.span
              key={c.text}
              className="absolute hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[hsl(var(--line)/0.14)] bg-[hsl(var(--bg)/0.88)] px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md sm:inline-flex"
              style={{ left: `${c.lx}%`, top: `${c.ly}%`, zIndex: 41 }}
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: base + 0.1 + i * 0.1 }}
            >
              <i className="dot" />{c.text}
            </motion.span>
          ))}
          {/* на телефоне подписи идут списком под коллажем */}
          <ul className="absolute left-0 top-full mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] sm:hidden">
            {callouts.map((c) => <li key={c.text} className="muted inline-flex items-center gap-2"><i className="dot" />{c.text}</li>)}
          </ul>
        </>
      )}
    </div>
  );
};

export default Collage;
