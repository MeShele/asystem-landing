import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, Path, PerspectiveCamera, Scene, Shape, Vector3, type BufferGeometry, type Material, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, ease, engrave, fonts, FONT, frameCamera, HEX, INK, nap, outline, pointer, shadow, shared } from "@/three/kit";
import { drawIcon, ICON } from "@/three/icons";

/**
 * «Сделка без сотрудника» как механизм: корпус платформы с шестернями, которые крутятся сами,
 * и две ленты. По ближней дорожке слева направо идёт покупка: сомы заезжают в корпус, с другой
 * стороны выезжает крипта. По дальней дорожке справа налево — продажа. Человека в сцене нет.
 * Сомы янтарные, крипта лаймовая: по цвету монет видно, что во что превращается.
 * Шестерни собраны как настоящие: зубчатый венец, спицы, ступица с болтами, круговая гравировка.
 */
const HOUSE = { w: 4.9, h: 0.6, d: 2.8 }, BELT = { x0: 2.45, x1: 5.35, y: 0.22, d: 1.5 }, LANE = 0.36;
const R1 = 1.08, N1 = 24, N2 = 14, R2 = (R1 * N2) / N1, GAP = (R1 + R2) * 1.004, THICK = 0.24, LIFT = 0.1;

/** зубчатое колесо: венец с зубьями, окна между спицами, отверстие под ось; толщина вдоль Y */
const gear = (r: number, teeth: number, spokes: number) => {
  const s = new Shape(), tip = r + 0.075, root = r - 0.075, step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pt = (ang: number, rad: number, first = false) => { const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad; if (first) s.moveTo(x, y); else s.lineTo(x, y); };
    pt(a - step * 0.31, root, i === 0); pt(a - step * 0.19, tip - 0.02); pt(a - step * 0.13, tip); pt(a + step * 0.13, tip); pt(a + step * 0.19, tip - 0.02); pt(a + step * 0.31, root);
  }
  s.closePath();
  const axle = new Path();
  axle.absarc(0, 0, r * 0.1, 0, Math.PI * 2, true);
  s.holes.push(axle);
  // окна между спицами
  const ri = r * 0.34, ro = r * 0.7, pad = 0.2;
  for (let i = 0; i < spokes; i++) {
    const a0 = (i / spokes) * Math.PI * 2 + pad, a1 = ((i + 1) / spokes) * Math.PI * 2 - pad;
    const h = new Path();
    h.moveTo(Math.cos(a0) * ro, Math.sin(a0) * ro);
    h.absarc(0, 0, ro, a0, a1, false);
    h.lineTo(Math.cos(a1) * ri, Math.sin(a1) * ri);
    h.absarc(0, 0, ri, a1, a0, true);
    h.closePath();
    s.holes.push(h);
  }
  return new ExtrudeGeometry(s, { depth: THICK, bevelEnabled: false, curveSegments: 14 }).rotateX(-Math.PI / 2);
};

/** гравировка на торце колеса: кольца, риски по венцу, болты ступицы */
const gearArt = () => art(512, 512, (c, w) => {
  const R = w / 2 - 22, cx = w / 2, ring = (k: number, lw: number, alpha = 1) => { c.globalAlpha = alpha; c.lineWidth = lw; c.beginPath(); c.arc(cx, cx, R * k, 0, Math.PI * 2); c.stroke(); };
  ring(0.8, 7); ring(0.75, 3, 0.7); ring(0.3, 6); ring(0.24, 3, 0.7);
  c.globalAlpha = 0.8; c.lineWidth = 4;
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, k = i % 6 ? 0.86 : 0.9; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.82, cx + Math.sin(a) * R * 0.82); c.lineTo(cx + Math.cos(a) * R * k, cx + Math.sin(a) * R * k); c.stroke(); }
  c.globalAlpha = 1;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.185, cx + Math.sin(a) * R * 0.185, 6, 0, Math.PI * 2); c.fill(); }
});

/** верх корпуса: рамка панели, болты, посадочные кольца под колёса, решётка */
const houseTop = () => art(1024, 585, (c, w, h) => {
  const u = w / HOUSE.w, X = (x: number) => (x + HOUSE.w / 2) * u, Y = (z: number) => (z + HOUSE.d / 2) * u;
  c.lineWidth = 4; c.globalAlpha = 0.55;
  c.beginPath(); c.roundRect(16, 16, w - 32, h - 32, 18); c.stroke();
  for (const [x, r] of [[0, R1], [GAP, R2], [-GAP, R2]]) for (const k of [1.16, 1.22]) { c.globalAlpha = k > 1.2 ? 0.3 : 0.6; c.beginPath(); c.arc(X(x), Y(0), (r + 0.075) * k * u, 0, Math.PI * 2); c.stroke(); }
  c.globalAlpha = 0.85;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { c.beginPath(); c.arc(X(sx * (HOUSE.w / 2 - 0.22)), Y(sz * (HOUSE.d / 2 - 0.22)), 9, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 0.5; c.lineWidth = 5;
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const x = sx * (HOUSE.w / 2 - 0.5 - i * 0.07); c.beginPath(); c.moveTo(X(x), Y(HOUSE.d / 2 - 0.2)); c.lineTo(X(x), Y(HOUSE.d / 2 - 0.55)); c.stroke(); }
});

/** фасад корпуса: табло с парой валют, жалюзи, болты */
const houseFront = () => art(1024, 126, (c, w, h) => {
  c.strokeStyle = HEX.lime; c.fillStyle = HEX.lime;
  c.lineWidth = 4; c.globalAlpha = 0.5;
  c.strokeRect(10, 10, w - 20, h - 20);
  c.globalAlpha = 0.9; c.strokeStyle = HEX.ice;
  c.beginPath(); c.roundRect(w / 2 - 190, 26, 380, h - 52, 12); c.stroke();
  // табло: пара, как на монетах — сомы и биткоин
  c.globalAlpha = 1; c.font = FONT(38); c.textBaseline = "middle";
  c.textAlign = "right"; c.fillStyle = HEX.amber; c.fillText("KGS", w / 2 - 44, h / 2 + 2);
  c.textAlign = "left"; c.fillStyle = HEX.lime; c.fillText("BTC", w / 2 + 44, h / 2 + 2);
  c.strokeStyle = HEX.ice; c.lineWidth = 5;
  for (const [y, dir] of [[h / 2 - 9, 1], [h / 2 + 9, -1]]) {
    c.beginPath(); c.moveTo(w / 2 - 24, y); c.lineTo(w / 2 + 24, y); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + dir * 24 - dir * 10, y - 8); c.lineTo(w / 2 + dir * 24, y); c.lineTo(w / 2 + dir * 24 - dir * 10, y + 8); c.stroke();
  }
  c.strokeStyle = HEX.lime; c.fillStyle = HEX.lime; c.globalAlpha = 0.55; c.lineWidth = 5;
  for (const sx of [-1, 1]) for (let i = 0; i < 13; i++) { const x = w / 2 + sx * (252 + i * 17); c.beginPath(); c.moveTo(x, 36); c.lineTo(x, h - 36); c.stroke(); }
  c.globalAlpha = 0.9;
  for (const x of [34, w - 34]) for (const y of [34, h - 34]) { c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill(); }
});

/** монета сверху (рисунок тёмный на залитой грани): 0 — сом, буква «с» с чертой; 1 — крипта, знак биткоина */
const coinArt = (kind: number) => art(160, 160, (c) => {
  c.lineWidth = 7;
  c.beginPath(); c.arc(80, 80, 66, 0, Math.PI * 2); c.stroke();
  if (kind === 0) {
    c.font = FONT(92); c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.fillText("с", 80, 104);
    c.lineWidth = 9; c.beginPath(); c.moveTo(54, 124); c.lineTo(106, 124); c.stroke();
  } else drawIcon(c, ICON.bitcoin, 24, 24, 112, 2.6);
});

export const mountGears = async ({ canvas }: { canvas: HTMLCanvasElement }): Promise<() => void> => {
  await fonts();
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  const edges: { line: ReturnType<typeof outline>; base: number }[] = [];
  const add = (geo: BufferGeometry, parent: Group, mat: Material | Material[], edge = 0.5, angle = 30, color: string = HEX.lime) => {
    const mesh = new Mesh(keep(geo), mat), line = outline(geo, 0, angle, color);
    edges.push({ line, base: edge });
    parent.add(mesh, line);
  };
  const body = (o: Parameters<typeof engrave>[1]) => keep(engrave(sh, o));

  const ground = shadow(sh, 13.5, 5.2, -0.02, 0.6);
  group.add(ground);

  // корпус платформы: верх и фасад со своим рисунком
  const house = new Group();
  house.position.y = HOUSE.h / 2;
  const plain = body({ strata: 22, top: 16, ink: 0.5 });
  const top = body({ art: keep(houseTop()), rect: [-HOUSE.w / 2, -HOUSE.d / 2, HOUSE.w, HOUSE.d], strata: 22, top: 22, hatch: 0.22, gain: 0.85 });
  const front = body({ art: keep(houseFront()), rect: [-HOUSE.w / 2, -HOUSE.h / 2, HOUSE.w, HOUSE.h], face: "front", rgb: true, strata: 22, gain: 0.9 });
  add(new BoxGeometry(HOUSE.w, HOUSE.h, HOUSE.d), house, [plain, plain, top, plain, front, plain], 0.65);
  group.add(house);
  await nap();

  // колёса: большое лаймовое в центре, два тёмных по бокам — в зацеплении; у каждого ступица с крышкой
  const face = keep(gearArt());
  const wheels: { holder: Group; mat: ShaderMaterial; dir: number; phase: number; kind: 0 | 1 }[] = [];
  for (const w of [
    { x: 0, r: R1, n: N1, spokes: 6, dir: 1, phase: 0, kind: 1 as const },
    { x: GAP, r: R2, n: N2, spokes: 4, dir: -N1 / N2, phase: Math.PI / N2, kind: 0 as const },
    { x: -GAP, r: R2, n: N2, spokes: 4, dir: -N1 / N2, phase: Math.PI / N2, kind: 0 as const },
  ]) {
    const holder = new Group(), size = w.r + 0.1;
    holder.position.set(w.x, HOUSE.h + LIFT, 0);
    const mat = body({ kind: w.kind, art: face, rect: [-size, -size, size * 2, size * 2], rings: true, top: w.kind ? 15 : 13, strata: w.kind ? 30 : 22, hatch: w.kind ? 0.45 : 0.22, ink: 1.2 });
    add(gear(w.r, w.n, w.spokes), holder, mat, 0.95, 18);
    // ступица поверх колеса и крышка оси
    add(new CylinderGeometry(w.r * 0.24, w.r * 0.26, 0.1, 28).translate(0, THICK + 0.05, 0), holder, body({ kind: w.kind, rings: true, top: w.kind ? 40 : 28, strata: 50, ink: 1.2 }), 0.9);
    add(new CylinderGeometry(w.r * 0.1, w.r * 0.1, 0.12, 18).translate(0, THICK + 0.16, 0), holder, body({ kind: 1, fill: true, tint: INK.amber, strata: 60, top: 60 }), 0.9, 30, HEX.amber);
    // стойка оси под колесом
    const post = new Group();
    post.position.set(w.x, HOUSE.h, 0);
    add(new CylinderGeometry(w.r * 0.16, w.r * 0.2, LIFT, 20).translate(0, LIFT / 2, 0), post, plain, 0.5);
    group.add(holder, post);
    wheels.push({ holder, mat, dir: w.dir, phase: w.phase, kind: w.kind });
    await nap();
  }

  // ленты слева и справа от корпуса: полотно, борта, валик на краю, опоры
  for (const side of [-1, 1]) {
    const belt = new Group(), len = BELT.x1 - BELT.x0;
    belt.position.set(side * (BELT.x0 + BELT.x1) / 2, BELT.y, 0);
    add(new BoxGeometry(len, 0.1, BELT.d), belt, body({ strata: 60, top: 20, ink: 0.55 }), 0.5);
    for (const z of [-1, 1]) add(new BoxGeometry(len, 0.16, 0.06).translate(0, 0.03, z * (BELT.d / 2 + 0.03)), belt, plain, 0.6);
    for (const x of [-0.35, 0.35]) add(new BoxGeometry(0.12, BELT.y, BELT.d * 0.8).translate(x * len, -BELT.y / 2 - 0.05, 0), belt, plain, 0.35);
    add(new CylinderGeometry(0.12, 0.12, BELT.d + 0.12, 18).rotateX(Math.PI / 2).translate(side * len / 2, 0, 0), belt, body({ strata: 40 }), 0.5);
    group.add(belt);
  }
  await nap();

  // монеты: по три на каждый отрезок каждой дорожки
  const coinGeo = keep(new CylinderGeometry(0.3, 0.3, 0.1, 30));
  const arts = [keep(coinArt(0)), keep(coinArt(1))];
  const SPAN = BELT.x1 - BELT.x0 - 0.25;
  const coins: { holder: Group; lane: number; side: number; slot: number }[] = [];
  for (const lane of [1, -1]) for (const side of [-1, 1]) for (let slot = 0; slot < 3; slot++) {
    // слева всегда сомы, справа всегда крипта: ближняя дорожка везёт их вправо (покупка), дальняя — влево (продажа)
    const som = side === -1;
    const mat = body({ kind: 1, tint: som ? INK.amber : INK.lime, art: arts[som ? 0 : 1], rect: [-0.3, -0.3, 0.6, 0.6], strata: 70, rings: true, top: 30, hatch: 0.25 });
    const holder = new Group(), line = outline(coinGeo, 0, 40, som ? HEX.amber : HEX.lime);
    edges.push({ line, base: 0.8 });
    holder.add(new Mesh(coinGeo, mat), line);
    group.add(holder);
    coins.push({ holder, lane, side, slot });
  }

  const ptr = pointer(canvas);
  const target = new Vector3(0, 0.4, 0);
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.12;
      const pts: Vector3[] = [];
      for (const x of [-BELT.x1 - 0.2, BELT.x1 + 0.2]) for (const z of [-HOUSE.d / 2, HOUSE.d / 2]) for (const y of [0, HOUSE.h + 0.6]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(narrow ? 0.62 : 0.74), Math.cos(narrow ? 0.62 : 0.74)), pts, [0.97, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.7);
    for (const e of edges) e.line.material.opacity = e.base * sh.uShow.value;
    top.uniforms.uReveal.value = front.uniforms.uReveal.value = ease((age - 0.2) / 1.2);
    // колёса раскручиваются и дальше идут ровно
    const run = Math.max(0, age - 0.4), turn = (run - 1.2 * (1 - Math.exp(-run / 1.2))) * 0.5;
    for (const w of wheels) { w.holder.rotation.y = turn * w.dir + w.phase; w.mat.uniforms.uHot.value = w.kind ? 0.1 + 0.08 * Math.sin(age * 2) : 0.15; }
    // монеты едут по дорожкам: ближняя вправо, дальняя влево; у корпуса уходят в прорезь
    for (const c of coins) {
      const p = (((age * 0.11 + c.slot / 3) % 1) + 1) % 1;
      const along = c.lane > 0 ? p : 1 - p;
      const x = c.side < 0 ? -BELT.x1 + 0.12 + along * SPAN : BELT.x0 + 0.13 + along * SPAN;
      c.holder.position.set(x, BELT.y + 0.1, c.lane * LANE);
      c.holder.scale.setScalar(Math.max(0.001, ease(Math.min(1, p * 7, (1 - p) * 7))));
    }
    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.04 + ptr.p.nx * 0.07 - yaw) * k;
    pitch += (-ptr.p.ny * 0.03 - pitch) * k;
    group.rotation.set(pitch, yaw0 + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame });
  return () => {
    unmount(); ptr.off();
    for (const k of kept) k.dispose();
    for (const e of edges) { e.line.geometry.dispose(); e.line.material.dispose(); }
    ground.geometry.dispose(); ground.material.dispose();
  };
};
