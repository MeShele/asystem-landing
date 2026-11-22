/**
 * Значки для рисунков на макетах. Контуры — из набора lucide (лицензия ISC), того же, что стоит
 * в вёрстке сайта: значки на сценах и в тексте получаются одной руки. Сетка 24×24, обводка 2.
 */
type Node = ["path", string] | ["circle", number, number, number] | ["rect", number, number, number, number, number] | ["ellipse", number, number, number, number];

export const ICON = {
  userCheck: [["path", "M2 21a8 8 0 0 1 13.292-6"], ["circle", 10, 8, 5], ["path", "m16 19 2 2 4-4"]],
  searchCheck: [["path", "m8 11 2 2 4-4"], ["circle", 11, 11, 8], ["path", "m21 21-4.3-4.3"]],
  server: [["rect", 2, 2, 20, 8, 2], ["rect", 2, 14, 20, 8, 2], ["path", "M6 6h.01"], ["path", "M6 18h.01"]],
  fileChart: [["path", "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"], ["path", "M14 2v5a1 1 0 0 0 1 1h5"], ["path", "M8 18v-1"], ["path", "M12 18v-6"], ["path", "M16 18v-3"]],
  fileText: [["path", "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"], ["path", "M14 2v5a1 1 0 0 0 1 1h5"], ["path", "M10 9H8"], ["path", "M16 13H8"], ["path", "M16 17H8"]],
  lock: [["circle", 12, 16, 1], ["rect", 3, 10, 18, 12, 2], ["path", "M7 10V7a5 5 0 0 1 10 0v3"]],
  handshake: [["path", "m11 17 2 2a1 1 0 1 0 3-3"], ["path", "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"], ["path", "m21 3 1 11h-2"], ["path", "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"], ["path", "M3 4h8"]],
  sliders: [["path", "M10 5H3"], ["path", "M12 19H3"], ["path", "M14 3v4"], ["path", "M16 17v4"], ["path", "M21 12h-9"], ["path", "M21 19h-5"], ["path", "M21 5h-7"], ["path", "M8 10v4"], ["path", "M8 12H3"]],
  bitcoin: [["path", "M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"]],
} satisfies Record<string, Node[]>;

/** значок в квадрате size со стороной от точки (x, y); толщина обводки — в единицах сетки 24 */
export const drawIcon = (c: CanvasRenderingContext2D, icon: Node[], x: number, y: number, size: number, width = 2) => {
  c.save();
  c.translate(x, y); c.scale(size / 24, size / 24);
  c.lineWidth = width; c.lineCap = "round"; c.lineJoin = "round";
  for (const n of icon) {
    if (n[0] === "path") c.stroke(new Path2D(n[1]));
    else if (n[0] === "circle") { c.beginPath(); c.arc(n[1], n[2], n[3], 0, Math.PI * 2); c.stroke(); }
    else if (n[0] === "ellipse") { c.beginPath(); c.ellipse(n[1], n[2], n[3], n[4], 0, 0, Math.PI * 2); c.stroke(); }
    else { c.beginPath(); c.roundRect(n[1], n[2], n[3], n[4], n[5]); c.stroke(); }
  }
  c.restore();
};
