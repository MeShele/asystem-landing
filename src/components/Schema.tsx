import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Graph, SchemaNode } from "@/lib/schema";

/**
 * Схема: узлы на CSS-сетке, рёбра — SVG поверх, геометрия измеряется после раскладки
 * (ResizeObserver), поэтому линии всегда попадают в узлы при любой ширине. По маршруту
 * бежит импульс заявки (SMIL animateMotion), под reduced-motion его нет. На телефоне узлы
 * идут столбиком вдоль лаймовой рейки, рёбра не рисуются.
 */
type Box = { x: number; y: number; w: number; h: number };
type EdgePath = { d: string; dashed?: boolean };

const EASE = [0.23, 1, 0.32, 1] as const;

const anchorPath = (a: Box, b: Box): string => {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const dx = bc.x - ac.x, dy = bc.y - ac.y;
  if (Math.abs(dy) < 6) {
    // одна строка: правый край → левый край
    return dx > 0 ? `M${a.x + a.w},${ac.y} L${b.x},${bc.y}` : `M${a.x},${ac.y} L${b.x + b.w},${bc.y}`;
  }
  if (Math.abs(dx) < 6) {
    // одна колонка: низ → верх
    return dy > 0 ? `M${ac.x},${a.y + a.h} L${bc.x},${b.y}` : `M${ac.x},${a.y} L${bc.x},${b.y + b.h}`;
  }
  // разные строка и колонка: мягкое колено от правого края к левому
  const x1 = dx > 0 ? a.x + a.w : a.x, x2 = dx > 0 ? b.x : b.x + b.w;
  const mx = (x1 + x2) / 2;
  return `M${x1},${ac.y} C${mx},${ac.y} ${mx},${bc.y} ${x2},${bc.y}`;
};

const KIND: Record<NonNullable<SchemaNode["kind"]>, string> = {
  main: "bg-[hsl(var(--surface))] border-[hsl(var(--line)/0.1)]",
  accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] border-transparent",
  side: "bg-[hsl(var(--surface-2))] border-transparent",
  ghost: "bg-transparent border-dashed border-[hsl(var(--line)/0.25)]",
};

const Schema = ({ graph, className = "", label, large = false }: { graph: Graph; className?: string; label?: string; large?: boolean }) => {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<EdgePath[]>([]);
  const [route, setRoute] = useState("");
  const [desktop, setDesktop] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      setDesktop(wide);
      if (!wide) { setPaths([]); setRoute(""); return; }
      const base = el.getBoundingClientRect();
      const box = (id: string): Box | null => {
        const n = nodeRefs.current[id];
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
      };
      const next: EdgePath[] = [];
      for (const e of graph.edges) {
        const a = box(e.from), b = box(e.to);
        if (a && b) next.push({ d: anchorPath(a, b), dashed: e.dashed });
      }
      setPaths(next);
      if (graph.route && graph.route.length > 1) {
        const parts: string[] = [];
        for (let i = 0; i < graph.route.length - 1; i++) {
          const a = box(graph.route[i]), b = box(graph.route[i + 1]);
          if (!a || !b) continue;
          // импульс идёт сквозь узел: от центра к центру через точки входа и выхода
          const seg = anchorPath(a, b);
          parts.push(i === 0 ? seg : seg.replace(/^M[^LC]+/, (m) => "L" + m.slice(1)));
        }
        setRoute(parts.join(" "));
      } else setRoute("");
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
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden="true">
        {paths.map((p, i) => (
          <motion.path
            key={p.d}
            d={p.d}
            fill="none"
            stroke={p.dashed ? "hsl(var(--line) / 0.3)" : "hsl(var(--accent) / 0.6)"}
            strokeWidth="1.5"
            strokeDasharray={p.dashed ? "4 5" : undefined}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 + i * 0.07 }}
          />
        ))}
        {!reduced && route && (
          <g key={route}>
            <circle r="5" fill="hsl(var(--accent))">
              <animateMotion dur={`${Math.max(4, (graph.route?.length ?? 2) * 1.6)}s`} repeatCount="indefinite" path={route} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
            <circle r="11" fill="hsl(var(--accent) / 0.18)">
              <animateMotion dur={`${Math.max(4, (graph.route?.length ?? 2) * 1.6)}s`} repeatCount="indefinite" path={route} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
          </g>
        )}
      </svg>

      <div
        className="schema-grid relative grid gap-3 md:gap-x-10 md:gap-y-8"
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
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, ease: EASE, delay: desktop ? i * 0.07 : 0 }}
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
