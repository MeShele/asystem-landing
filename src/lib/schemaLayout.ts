import type { Graph, SchemaNode } from "@/lib/schema";

/**
 * Геометрия схемы после раскладки: где стоят узлы, как идут рёбра и каким путём бежит импульс
 * заявки. Считается из измеренных прямоугольников узлов и одинаково кормит обе отрисовки —
 * объёмную (src/three/towers.ts) и запасную плоскую (SVG в Schema.tsx).
 */
export type Box = { x: number; y: number; w: number; h: number };
export type Pt = [number, number];
export type Kind = NonNullable<SchemaNode["kind"]>;

export type LaidNode = {
  id: string; box: Box; kind: Kind; index: number;
  /** пройденный импульсом путь (px) в момент входа в узел; -1 — узел вне маршрута */
  hit: number;
  /** точки, в которых импульс входит в узел и выходит из него: между ними свет бежит по кромке плиты */
  from: Pt;
  to: Pt;
};
export type LaidEdge = {
  d: string; pts: Pt[]; dashed: boolean;
  /** путь импульса (px) в начале ребра; -1 — импульс по ребру не идёт */
  s0: number;
  /** индекс узла, из которого выходит ребро: ребро появляется после него */
  after: number;
};
export type Laid = { w: number; h: number; wide: boolean; nodes: LaidNode[]; edges: LaidEdge[]; routeD: string; routeLen: number };

const center = (b: Box): Pt => [b.x + b.w / 2, b.y + b.h / 2];
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lineD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Ребро между двумя узлами: в строке — от края к краю, в колонке — снизу вверх, иначе мягкое колено. */
const anchor = (a: Box, b: Box): { d: string; pts: Pt[] } => {
  const ac = center(a), bc = center(b);
  const dx = bc[0] - ac[0], dy = bc[1] - ac[1];
  if (Math.abs(dy) < 6) {
    const pts: Pt[] = dx > 0 ? [[a.x + a.w, ac[1]], [b.x, bc[1]]] : [[a.x, ac[1]], [b.x + b.w, bc[1]]];
    return { d: lineD(pts), pts };
  }
  if (Math.abs(dx) < 6) {
    const pts: Pt[] = dy > 0 ? [[ac[0], a.y + a.h], [bc[0], b.y]] : [[ac[0], a.y], [bc[0], b.y + b.h]];
    return { d: lineD(pts), pts };
  }
  const x1 = dx > 0 ? a.x + a.w : a.x, x2 = dx > 0 ? b.x : b.x + b.w, mx = (x1 + x2) / 2;
  const pts: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, u = 1 - t;
    pts.push([
      u * u * u * x1 + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * x2,
      u * u * u * ac[1] + 3 * u * u * t * ac[1] + 3 * u * t * t * bc[1] + t * t * t * bc[1],
    ]);
  }
  return { d: `M${x1},${ac[1]} C${mx},${ac[1]} ${mx},${bc[1]} ${x2},${bc[1]}`, pts };
};

/**
 * @param boxes прямоугольники узлов в координатах корня схемы
 * @param wide  широкая раскладка (узлы на сетке); иначе столбик вдоль рейки
 * @param railX x лаймовой рейки в узкой раскладке
 */
export const layoutGraph = (graph: Graph, boxes: Record<string, Box>, size: { w: number; h: number }, wide: boolean, railX = 0): Laid => {
  const nodes: LaidNode[] = [];
  graph.nodes.forEach((n, index) => {
    const box = boxes[n.id];
    if (box) nodes.push({ id: n.id, box, kind: n.kind ?? "main", index, hit: -1, from: center(box), to: center(box) });
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: LaidEdge[] = [];
  let routeD = "", routeLen = 0;

  if (!wide) {
    // столбик: импульс идёт вниз по рейке, от неё к каждому узлу короткий отвод
    const onRoute = (graph.route ?? []).map((id) => byId.get(id)).filter((n): n is LaidNode => !!n).sort((a, b) => a.box.y - b.box.y);
    for (const n of nodes) {
      const y = n.box.y + n.box.h / 2;
      edges.push({ d: "", pts: [[railX, y], [n.box.x, y]], dashed: !onRoute.includes(n), s0: -1, after: n.index });
    }
    if (onRoute.length > 1) {
      const y0 = onRoute[0].box.y + onRoute[0].box.h / 2, y1 = onRoute[onRoute.length - 1].box.y + onRoute[onRoute.length - 1].box.h / 2;
      edges.push({ d: "", pts: [[railX, y0], [railX, y1]], dashed: false, s0: 0, after: onRoute[0].index });
      routeLen = y1 - y0;
      for (const n of onRoute) { n.hit = n.box.y + n.box.h / 2 - y0; n.from = [n.box.x, n.box.y + n.box.h / 2]; n.to = [n.box.x + n.box.w, n.box.y + n.box.h / 2]; }
    }
    return { ...size, wide, nodes, edges, routeD, routeLen };
  }

  // маршрут: через первый узел от дальнего края, по рёбрам, сквозь узлы от входа к выходу, до дальнего края последнего
  const startOf = new Map<string, number>();
  const route = (graph.route ?? []).map((id) => byId.get(id)).filter((n): n is LaidNode => !!n);
  if (route.length > 1) {
    const mirror = (p: Pt, b: Box): Pt => { const c = center(b); return [2 * c[0] - p[0], 2 * c[1] - p[1]]; };
    const segs = route.slice(0, -1).map((n, i) => anchor(n.box, route[i + 1].box));
    const parts: string[] = [];
    let at: Pt = mirror(segs[0].pts[0], route[0].box);
    route[0].hit = 0; route[0].from = at;
    segs.forEach((seg, i) => {
      route[i].to = seg.pts[0];
      routeLen += dist(at, seg.pts[0]);
      startOf.set(`${route[i].id}>${route[i + 1].id}`, routeLen);
      for (let k = 1; k < seg.pts.length; k++) routeLen += dist(seg.pts[k - 1], seg.pts[k]);
      at = seg.pts[seg.pts.length - 1];
      route[i + 1].hit = routeLen;
      route[i + 1].from = at;
      parts.push(i === 0 ? seg.d : seg.d.replace(/^M[^LC]+/, (m) => "L" + m.slice(1)));
    });
    const last = route[route.length - 1];
    last.to = mirror(at, last.box);
    routeLen += dist(at, last.to);
    routeD = parts.join(" ");
  }
  for (const e of graph.edges) {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a || !b) continue;
    const seg = anchor(a.box, b.box);
    edges.push({ ...seg, dashed: !!e.dashed, s0: e.dashed ? -1 : startOf.get(`${e.from}>${e.to}`) ?? -1, after: Math.max(a.index, b.index) });
  }
  return { ...size, wide, nodes, edges, routeD, routeLen };
};
