import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Graph } from "@/lib/schema";
import { layoutGraph, type Box, type Kind, type Laid } from "@/lib/schemaLayout";
import type { Towers } from "@/three/towers";

/**
 * Схема: узлы на CSS-сетке, геометрия измеряется после раскладки (ResizeObserver), поэтому
 * рёбра попадают в узлы при любой ширине. Основная отрисовка объёмная (src/three/towers.ts):
 * карточка — крыша столба, уходящего в глубину экрана, по мостам между крышами бежит импульс
 * заявки. Текст узлов при этом остаётся обычной вёрсткой. Под reduced-motion, без WebGL и пока
 * three.js не загрузился работает плоский вариант: карточки с линией, рёбра в SVG.
 * На телефоне узлы идут столбиком вдоль лаймовой рейки; импульс бежит по рейке вниз.
 */
const EASE = [0.23, 1, 0.32, 1] as const;

const KIND: Record<Kind, string> = {
  main: "bg-[hsl(var(--surface))] border-[hsl(var(--line)/0.1)]",
  accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] border-transparent",
  side: "bg-[hsl(var(--surface-2))] border-transparent",
  ghost: "bg-transparent border-dashed border-[hsl(var(--line)/0.25)]",
};

const Schema = ({ graph, className = "", label, large = false }: { graph: Graph; className?: string; label?: string; large?: boolean }) => {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const towers = useRef<Towers | null>(null);
  const laidRef = useRef<Laid | null>(null);
  const seenAt = useRef(0);
  const [laid, setLaid] = useState<Laid | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const solid = !reduced && !failed;        // объёмная отрисовка возможна
  const wide = laid?.wide ?? (typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches);
  const bleed = wide ? 56 : 20;

  useLayoutEffect(() => {
    const el = ref.current, grid = gridRef.current;
    if (!el || !grid) return;
    const measure = () => {
      const isWide = window.matchMedia("(min-width: 768px)").matches;
      // offset-координаты: их не сдвигают анимации входа (transform), в отличие от getBoundingClientRect
      const gx = grid.offsetLeft + grid.clientLeft, gy = grid.offsetTop + grid.clientTop;
      const boxes: Record<string, Box> = {};
      for (const n of graph.nodes) {
        const d = nodeRefs.current[n.id];
        if (d) boxes[n.id] = { x: gx + d.offsetLeft, y: gy + d.offsetTop, w: d.offsetWidth, h: d.offsetHeight };
      }
      const next = layoutGraph(graph, boxes, { w: el.offsetWidth, h: el.offsetHeight }, isWide, grid.offsetLeft + 1);
      laidRef.current = next;
      setLaid(next);
      towers.current?.update(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [graph]);

  // three.js подгружается, когда до схемы остаётся один экран
  useEffect(() => {
    const el = ref.current, canvas = canvasRef.current;
    if (!solid || !el || !canvas) return;
    let dead = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import("@/three/towers")
        .then((m) => {
          if (dead) return;
          const t = m.mountTowers(canvas, bleed);
          if (laidRef.current) t.update(laidRef.current);
          towers.current = t;
          // схема могла выйти на экран, пока грузилась сцена: крыши подхватывают то же время, что и текст
          if (seenAt.current) t.start((performance.now() - seenAt.current) / 1000);
          setReady(true);
        })
        .catch(() => { if (!dead) setFailed(true); });
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    return () => {
      dead = true; io.disconnect();
      towers.current?.dispose(); towers.current = null;
      setReady(false);
    };
  }, [solid, bleed]);

  useEffect(() => {
    if (!inView) return;
    seenAt.current = performance.now();
    towers.current?.start(0);
  }, [inView]);

  const rows = Math.max(...graph.nodes.map((n) => n.row));
  const live = solid && ready;              // крыши и рёбра рисует сцена

  return (
    <div ref={ref} className={`schema relative ${live ? "is-solid" : ""} ${className}`} role="img" aria-label={label}>
      {solid && <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute" style={{ left: -bleed, top: -bleed, width: `calc(100% + ${bleed * 2}px)`, height: `calc(100% + ${bleed * 2}px)` }} />}

      {!solid && laid?.wide && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {laid.edges.map((p, i) => (
            <motion.path
              key={p.d}
              d={p.d}
              fill="none"
              stroke={p.dashed ? "hsl(var(--line) / 0.3)" : "hsl(var(--accent) / 0.6)"}
              strokeWidth="1.5"
              strokeDasharray={p.dashed ? "4 5" : undefined}
              initial={p.dashed ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
              animate={inView ? (p.dashed ? { opacity: 1 } : { pathLength: 1, opacity: 1 }) : undefined}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 + i * 0.07 }}
            />
          ))}
          {!reduced && laid.routeD && (
            <g key={laid.routeD}>
              <circle r="5" fill="hsl(var(--accent))">
                <animateMotion dur={`${Math.max(4, (graph.route?.length ?? 2) * 1.6)}s`} repeatCount="indefinite" path={laid.routeD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
              <circle r="11" fill="hsl(var(--accent) / 0.18)">
                <animateMotion dur={`${Math.max(4, (graph.route?.length ?? 2) * 1.6)}s`} repeatCount="indefinite" path={laid.routeD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
            </g>
          )}
        </svg>
      )}

      <div
        ref={gridRef}
        className="schema-grid relative grid gap-5 md:gap-x-10 md:gap-y-14"
        style={{ "--cols": graph.cols, "--rows": rows } as React.CSSProperties}
      >
        {graph.nodes.map((n, i) => {
          const kind = n.kind ?? "main";
          return (
            <motion.div
              key={n.id}
              ref={(el) => { nodeRefs.current[n.id] = el; }}
              className={`schema-node relative z-[1] rounded-2xl border ${large ? "px-6 py-5" : "px-5 py-4"} ${KIND[kind]} ${kind === "ghost" ? "muted" : ""}`}
              style={{ "--c": n.col, "--r": n.row, "--s": n.span ?? 1 } as React.CSSProperties}
              // в объёмном режиме текст только проявляется: крыша стоит на месте, сдвиг разошёлся бы с ней
              initial={{ opacity: 0, y: reduced || solid ? 0 : 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
            >
              <p className={`font-display ${large ? "text-[17px]" : "text-[15px]"} font-medium leading-snug [text-wrap:balance] ${kind === "accent" ? "" : kind === "side" || kind === "ghost" ? "text-[hsl(var(--fg)/0.85)]" : ""}`}>{n.title}</p>
              {n.text && <p className={`mt-1.5 ${large ? "text-[14.5px]" : "text-[13.5px]"} leading-snug ${kind === "accent" ? "text-[hsl(var(--accent-fg)/0.75)]" : "muted"}`}>{n.text}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Schema;
