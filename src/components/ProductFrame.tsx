import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/**
 * Настоящий экран продукта в рамке браузера. Живёт тремя способами, все на transform/opacity:
 * лёгкий 3D-наклон за курсором (spring), лаймовый блик, который следует за мышью, и бегущая
 * по кромке искра (CSS .beam). Под reduced-motion рамка статична.
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
  const rotateY = useTransform(sx, [0, 1], live ? [-5, 5] : [0, 0]);
  const rotateX = useTransform(sy, [0, 1], live ? [4, -4] : [0, 0]);
  const glow = useTransform([sx, sy], ([x, y]) => `radial-gradient(520px circle at ${(x as number) * 100}% ${(y as number) * 100}%, hsl(var(--accent) / 0.13), transparent 60%)`);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <div ref={ref} onMouseMove={live ? onMove : undefined} onMouseLeave={live ? onLeave : undefined} className={className} style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="frame beam relative will-change-transform">
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
      </motion.div>
    </div>
  );
};

export default ProductFrame;
