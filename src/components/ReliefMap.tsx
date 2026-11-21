import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Карта героя: рельеф Кыргызстана и маяк сервера в Бишкеке (сцена — src/three/relief.ts).
 * three.js и данные рельефа грузятся отдельным куском после первого кадра текста, поэтому
 * заголовок и кнопки появляются сразу. Под reduced-motion, без WebGL или если кусок
 * не загрузился, вместо сцены стоит её снимок (public/relief/kg-poster.webp) с той же подписью.
 */
/** где маяк на снимке, в процентах кадра 3:2 (снято вместе со снимком) */
const POSTER_TAG = { left: "50.83%", top: "33.13%" };

const ReliefMap = ({ className = "", label, city, note }: { className?: string; label: string; city: string; note: string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const [failed, setFailed] = useState(false);
  const still = reduced || failed;

  useEffect(() => {
    const el = canvas.current;
    if (still || !el) return;
    let off: (() => void) | undefined;
    let dead = false;
    const start = () => {
      import("@/three/relief")
        .then((m) => m.mountRelief({ canvas: el, label: tag.current, url: "/relief/kg-relief.webp" }))
        .then((dispose) => { if (dead) dispose(); else off = dispose; })
        .catch(() => { if (!dead) setFailed(true); });
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 900 }) : window.setTimeout(start, 120);
    return () => {
      dead = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else window.clearTimeout(idle);
      off?.();
    };
  }, [still]);

  return (
    <div className={`relative ${className}`} role="img" aria-label={label}>
      {still ? (
        <img src="/relief/kg-poster.webp" alt="" width={1320} height={880} decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
      ) : (
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      )}
      {/* key: при смене режима подпись создаётся заново, без следов покадрового transform */}
      <div
        key={still ? "still" : "live"}
        ref={tag}
        className={`pointer-events-none absolute ${still ? "" : "left-0 top-0 opacity-0"}`}
        style={still ? POSTER_TAG : { willChange: "transform" }}
      >
        <div className="relief-tag">
          <p className="whitespace-nowrap font-display text-[13px] font-medium leading-none">{city}</p>
          <p className="muted mt-1.5 text-[12.5px] leading-[1.15] max-sm:max-w-[16ch] sm:whitespace-nowrap">{note}</p>
        </div>
      </div>
    </div>
  );
};

export default ReliefMap;
