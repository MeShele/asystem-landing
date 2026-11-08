import { motion, useReducedMotion } from "motion/react";

/**
 * Иллюстрации-гравюры одним цветом: лаймовые штрихи на прозрачном фоне (public/illus/*.webp,
 * сгенерированы 04.11 и вырезаны из чёрного по яркости). Живут фоном секции (bg): крупно,
 * приглушённо, края растворяются, контент ложится поверх. Покачивание выключается при reduced-motion.
 */
export type IllusName = "shield" | "stamp" | "gear" | "megaphone";

const Illus = ({ name, className = "", size = 320, float = true, bg = false }: { name: IllusName; className?: string; size?: number; float?: boolean; bg?: boolean }) => {
  const reduced = !!useReducedMotion();
  const fade = "radial-gradient(closest-side, #000 55%, transparent 100%)";
  return (
    <div
      className={`${bg ? "pointer-events-none absolute" : "relative"} ${className}`}
      style={{ width: size, height: size, opacity: bg ? 0.42 : 1, WebkitMaskImage: bg ? fade : undefined, maskImage: bg ? fade : undefined }}
      aria-hidden="true"
    >
      {/* мягкое пятно под рисунком */}
      {!bg && (
        <div
          className="absolute inset-[8%] rounded-[46%_54%_52%_48%/58%_44%_56%_42%]"
          style={{ background: "hsl(var(--accent) / 0.12)", filter: "blur(18px)" }}
        />
      )}
      <motion.img
        src={`/illus/${name}.webp`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="relative h-full w-full select-none object-contain"
        style={{ filter: bg ? "drop-shadow(0 0 30px hsl(var(--accent) / 0.22))" : "drop-shadow(0 0 22px hsl(var(--accent) / 0.28))" }}
        animate={reduced || !float ? undefined : { y: [0, -8, 0], rotate: [0, 1.2, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
};

export default Illus;
