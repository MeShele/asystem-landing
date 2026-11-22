import { useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Graph } from "@/lib/schema";
import { layoutGraph, type Box, type Kind, type Laid } from "@/lib/schemaLayout";

/**
 * Плоская схема: узлы на CSS-сетке, рёбра — SVG поверх, геометрия измеряется после раскладки
 * (ResizeObserver), поэтому линии попадают в узлы при любой ширине. Это запасной вид блока
 * «Что внутри» — там, где 3D-сцена выключена (reduced-motion, нет WebGL). На телефоне узлы идут
 * столбиком вдоль лаймовой рейки, рёбра не рисуются.
 */
const EASE = [0.23, 1, 0.32, 1] as const;

const KIND: Record<Kind, string> = {
  main: "bg-[hsl(var(--surface))] border-[hsl(var(--line)/0.1)]",
  accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] border-transparent",
  side: "bg-[hsl(var(--surface-2))] border-transparent",
  ghost: "bg-transparent border-dashed border-[hsl(var(--line)/0.25)]",
};

const Schema = ({ graph, className = "", label }: { graph: Graph; className?: string; label?: string }) => {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [laid, setLaid] = useState<Laid | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });

  useLayoutEffect(() => {
    const el = ref.current, grid = gridRef.current;
    if (!el || !grid) return;
    const measure = () => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      // offset-координаты: их не сдвигают анимации входа (transform), в отличие от getBoundingClientRect
      const gx = grid.offsetLeft + grid.clientLeft, gy = grid.offsetTop + grid.clientTop;
      const boxes: Record<string, Box> = {};
      for (const n of graph.nodes) {
        const d = nodeRefs.current[n.id];
        if (d) boxes[n.id] = { x: gx + d.offsetLeft, y: gy + d.offsetTop, w: d.offsetWidth, h: d.offsetHeight };
      }
      setLaid(layoutGraph(graph, boxes, wide));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [graph]);

  const rows = Math.max(...graph.nodes.map((n) => n.row));

  return (
    <div ref={ref} className={`schema relative ${className}`} role="img" aria-label={label}>
      {laid?.wide && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {laid.edges.map((p, i) => (
            <motion.path
              key={p.d}
              d={p.d}
              fill="none"
              stroke={p.dashed ? "hsl(var(--line) / 0.3)" : "hsl(var(--accent) / 0.6)"}
              strokeWidth="1.5"
              strokeDasharray={p.dashed ? "4 5" : undefined}
              // pathLength рисует линию через stroke-dasharray и стирает пунктир: пунктирные рёбра только проявляются
              initial={p.dashed ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
              animate={inView ? (p.dashed ? { opacity: 1 } : { pathLength: 1, opacity: 1 }) : undefined}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 + i * 0.07 }}
            />
          ))}
        </svg>
      )}
      <div ref={gridRef} className="schema-grid relative grid gap-3 md:gap-x-10 md:gap-y-8" style={{ "--cols": graph.cols, "--rows": rows } as React.CSSProperties}>
        {graph.nodes.map((n, i) => {
          const kind = n.kind ?? "main";
          return (
            <motion.div
              key={n.id}
              ref={(el) => { nodeRefs.current[n.id] = el; }}
              className={`schema-node relative z-[1] rounded-2xl border px-5 py-4 ${KIND[kind]} ${kind === "ghost" ? "muted" : ""}`}
              style={{ "--c": n.col, "--r": n.row, "--s": n.span ?? 1 } as React.CSSProperties}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
            >
              <p className={`font-display text-[15px] font-medium leading-snug [text-wrap:balance] ${kind === "side" || kind === "ghost" ? "text-[hsl(var(--fg)/0.85)]" : ""}`}>{n.title}</p>
              {n.text && <p className={`mt-1.5 text-[13.5px] leading-snug ${kind === "accent" ? "text-[hsl(var(--accent-fg)/0.75)]" : "muted"}`}>{n.text}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Schema;
