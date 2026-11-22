import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Подключение 3D-сцены к холсту: three.js и сама сцена грузятся заранее, когда до блока остаётся
 * два с половиной экрана, и собираются в простое браузера — сборка (материалы, тела, шейдеры)
 * занимает десятки миллисекунд и посреди прокрутки была бы заметным рывком.
 * Под reduced-motion сцена не включается вовсе; если WebGL нет или кусок не загрузился — failed,
 * и блок показывает запасной вид (те же шаги текстом).
 * mount должен быть стабильной функцией: он вызывается один раз и возвращает функцию отключения.
 */
export const useScene = (mount: (canvas: HTMLCanvasElement) => Promise<() => void>) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = !!useReducedMotion();
  const [failed, setFailed] = useState(false);
  const on = !reduced && !failed;

  useEffect(() => {
    const el = canvas.current;
    if (!on || !el) return;
    let off: (() => void) | undefined, dead = false;
    const idle = (f: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (ric) ric(f, { timeout: 1200 }); else setTimeout(f, 60);
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      idle(() => { if (!dead) mount(el).then((dispose) => { if (dead) dispose(); else off = dispose; }).catch(() => { if (!dead) setFailed(true); }); });
    }, { rootMargin: "250% 0px" });
    io.observe(el);
    return () => { dead = true; io.disconnect(); off?.(); };
  }, [on, mount]);

  return { canvas, on };
};
