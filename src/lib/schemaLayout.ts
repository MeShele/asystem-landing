import type { Graph, SchemaNode } from "@/lib/schema";

/**
 * Геометрия плоской схемы после раскладки: где стоят узлы и как идут рёбра между ними.
 * Считается из измеренных прямоугольников узлов; рёбра рисуются только на широкой раскладке.
 */
export type Box = { x: number; y: number; w: number; h: number };
export type Kind = NonNullable<SchemaNode["kind"]>;
export type Laid = { wide: boolean; edges: { d: string; dashed: boolean }[] };

/** Ребро между двумя узлами: в строке — от края к краю, в колонке — снизу вверх, иначе мягкое колено. */
const anchor = (a: Box, b: Box): string => {
  const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
  const dx = bx - ax, dy = by - ay;
  if (Math.abs(dy) < 6) return dx > 0 ? `M${a.x + a.w},${ay} L${b.x},${by}` : `M${a.x},${ay} L${b.x + b.w},${by}`;
  if (Math.abs(dx) < 6) return dy > 0 ? `M${ax},${a.y + a.h} L${bx},${b.y}` : `M${ax},${a.y} L${bx},${b.y + b.h}`;
  const x1 = dx > 0 ? a.x + a.w : a.x, x2 = dx > 0 ? b.x : b.x + b.w, mx = (x1 + x2) / 2;
  return `M${x1},${ay} C${mx},${ay} ${mx},${by} ${x2},${by}`;
};

/** boxes — прямоугольники узлов в координатах корня схемы; wide — узлы стоят на сетке, а не столбиком */
export const layoutGraph = (graph: Graph, boxes: Record<string, Box>, wide: boolean): Laid => {
  const edges: Laid["edges"] = [];
  if (wide) for (const e of graph.edges) {
    const a = boxes[e.from], b = boxes[e.to];
    if (a && b) edges.push({ d: anchor(a, b), dashed: !!e.dashed });
  }
  return { wide, edges };
};
