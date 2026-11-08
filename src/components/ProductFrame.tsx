import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/**
 * Настоящий экран продукта в рамке браузера, всегда ровной (наклон убрали 08.11: читался как
 * «криво»). Живёт двумя способами: лаймовый блик следует за курсором (spring), по кромке бежит
 * искра (CSS .beam). Под reduced-motion рамка статична.
 */
const ProductFrame = ({ src, alt, url = "your-exchange.kg", eager = false, tilt = true, className = "" }: {
  src: string; alt: string; url?: string; eager?: boolean; tilt?: boolean; className?: string;
}) => {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.4 });
  const live = tilt && !reduced;
  const glow = useTransform([sx, sy], ([x, y]) => `radial-gradient(520px circle at ${(x as number) * 100}% ${(y as number) * 100}%, hsl(var(--accent) / 0.13), transparent 60%)`);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div ref={ref} onMouseMove={live ? onMove : undefined} onMouseLeave={live ? onLeave : undefined} className={className}>
      <div className="frame beam relative">
        <div className="flex items-center gap-2 border-b border-[hsl(var(--line)/0.08)] px-4 py-2.5">
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(0 72% 62%)" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(38 92% 62%)" }} />
          <i className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--ok))" }} />
          <span className="muted ml-3 text-[12.5px] tabular-nums">{url}</span>
        </div>
        <img
          src={src}
          alt={alt}
          width={1800}
          height={1125}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="block w-full select-none"
        />
        {live && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glow }} />
        )}
      </div>
    </div>
  );
};

export default ProductFrame;
