import { motion, useReducedMotion } from "motion/react";

/**
 * Иллюстрации-гравюры одним цветом: контур плюс штриховка узором, цвет берётся из темы
 * (лайм на тёмном, олива на светлом через --accent-ink). Под рисунком мягкое пятно.
 * Рисунки векторные, ноль запросов в сеть; лёгкое покачивание выключается при reduced-motion.
 */
export type IllusName = "shield" | "stamp" | "gear" | "megaphone";

/** Путь шестерни: n зубьев между радиусами r1 (впадина) и r2 (вершина). */
const gearPath = (cx: number, cy: number, r1: number, r2: number, n: number) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    const seq: [number, number][] = [
      [a - step * 0.22, r1], [a - step * 0.14, r2], [a + step * 0.14, r2], [a + step * 0.22, r1],
    ];
    for (const [ang, r] of seq) pts.push(`${(cx + Math.cos(ang) * r).toFixed(1)} ${(cy + Math.sin(ang) * r).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
};

const Hatch = ({ id }: { id: string }) => (
  <defs>
    <pattern id={`${id}-h`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-35)">
      <path d="M0 3H6" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
    </pattern>
    <pattern id={`${id}-d`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(35)">
      <path d="M0 2H4" stroke="currentColor" strokeWidth="1" opacity="0.85" />
    </pattern>
  </defs>
);

const ART: Record<IllusName, (id: string) => React.ReactNode> = {
  shield: (id) => (
    <>
      <Hatch id={id} />
      {/* лавр слева и справа */}
      {[1, -1].map((s) => (
        <g key={s} transform={`translate(120 0) scale(${s} 1) translate(-120 0)`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M44 150c-8-28 2-60 24-80" />
          {[0, 1, 2, 3, 4].map((k) => (
            <ellipse key={k} cx={48 + k * 4} cy={140 - k * 18} rx="5" ry="12" transform={`rotate(${-50 + k * 8} ${48 + k * 4} ${140 - k * 18})`} fill={`url(#${id}-h)`} />
          ))}
        </g>
      ))}
      {/* щит */}
      <path d="M120 34l56 20v52c0 42-26 68-56 84-30-16-56-42-56-84V54z" fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M120 48l42 15v43c0 32-20 52-42 65-22-13-42-33-42-65V63z" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path d="M120 48l42 15v43c0 32-20 52-42 65z" fill={`url(#${id}-d)`} opacity="0.5" />
      {/* галка */}
      <path d="M94 112l18 18 36-40" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M94 112l18 18 36-40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" transform="translate(0 6)" />
    </>
  ),
  stamp: (id) => (
    <>
      <Hatch id={id} />
      {/* лист с печатью */}
      <path d="M58 150h96l8-8v70H58z" fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M154 150v12h8" fill="none" stroke="currentColor" strokeWidth="2" />
      {[170, 182, 194].map((y) => <path key={y} d={`M72 ${y}h${y === 194 ? 36 : 56}`} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />)}
      <circle cx="134" cy="188" r="14" fill={`url(#${id}-d)`} stroke="currentColor" strokeWidth="2.4" />
      <circle cx="134" cy="188" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {/* штамп */}
      <rect x="72" y="104" width="96" height="22" rx="4" fill={`url(#${id}-d)`} stroke="currentColor" strokeWidth="3" />
      <path d="M100 104V84c0-6 4-10 10-10h20c6 0 10 4 10 10v20" fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <rect x="112" y="40" width="16" height="36" rx="7" fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="3" />
      {/* линии движения */}
      {[0, 1, 2].map((k) => <path key={k} d={`M${52 - k * 6} ${112 + k * 10}h12`} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />)}
      {[0, 1, 2].map((k) => <path key={k} d={`M${176 + k * 6} ${112 + k * 10}h12`} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />)}
    </>
  ),
  gear: (id) => (
    <>
      <Hatch id={id} />
      <path d={gearPath(120, 124, 70, 86, 12)} fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="120" cy="124" r="52" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="120" cy="124" r="40" fill={`url(#${id}-d)`} opacity="0.5" />
      <circle cx="120" cy="124" r="40" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.8" />
      {/* молния */}
      <path d="M128 86l-26 44h18l-10 36 30-50h-18z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* искры */}
      <path d="M196 54l-8 12h7l-6 12M44 70l-7 10h6l-5 10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  megaphone: (id) => (
    <>
      <Hatch id={id} />
      <g transform="rotate(-22 120 130)">
        {/* раструб */}
        <path d="M84 100l78-30v120l-78-30z" fill={`url(#${id}-h)`} stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M100 106l56-22v92l-56-22z" fill={`url(#${id}-d)`} opacity="0.55" />
        <ellipse cx="162" cy="130" rx="14" ry="60" fill="none" stroke="currentColor" strokeWidth="3" />
        <ellipse cx="162" cy="130" rx="7" ry="44" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
        {/* корпус и ручка */}
        <rect x="52" y="104" width="34" height="52" rx="8" fill={`url(#${id}-d)`} stroke="currentColor" strokeWidth="3" />
        <path d="M66 156v34c0 6 4 10 10 10h4" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* молнии-искры */}
      <path d="M190 46l-10 16h9l-8 16M212 86l-12 12h9l-9 14M200 150l-10 10h8l-7 12" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

const Illus = ({ name, className = "", size = 320, float = true }: { name: IllusName; className?: string; size?: number; float?: boolean }) => {
  const reduced = !!useReducedMotion();
  const id = `il-${name}`;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {/* мягкое пятно под рисунком */}
      <div
        className="absolute inset-[6%] rounded-[46%_54%_52%_48%/58%_44%_56%_42%]"
        style={{ background: "hsl(var(--accent) / 0.13)", filter: "blur(14px)" }}
      />
      <motion.svg
        viewBox="0 0 240 240"
        className="relative h-full w-full text-[hsl(var(--accent-ink))]"
        animate={reduced || !float ? undefined : { y: [0, -8, 0], rotate: [0, 1.2, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      >
        {ART[name](id)}
      </motion.svg>
    </div>
  );
};

export default Illus;
