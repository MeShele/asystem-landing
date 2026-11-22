import { CylinderGeometry, ExtrudeGeometry, Group, Mesh, Path, PerspectiveCamera, PlaneGeometry, Scene, Shape, SphereGeometry, TorusGeometry, Vector3, type BufferGeometry, type Material } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, fonts, FONT, frameCamera, HEX, nap, pointer } from "@/three/kit";
import { ICON } from "@/three/icons";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { box, catcher, iconSolid, many, materials, rig, screen, solid } from "@/three/studio";

/**
 * «Сделка без сотрудника» как механизм: корпус платформы с шестернями, которые крутятся сами,
 * и две ленты. По ближней дорожке слева направо идёт покупка: сомы заезжают в корпус, с другой
 * стороны выезжает крипта. По дальней дорожке справа налево — продажа. Человека в сцене нет.
 * Объёмные тела со светом и тенью: лаймовая эмаль, сталь, золото. Сомы золотые с «с»,
 * крипта лаймовая со знаком биткоина.
 */
const HOUSE = { w: 4.9, h: 0.6, d: 2.8 }, BELT = { x0: 2.45, x1: 5.35, y: 0.22, d: 1.5 }, LANE = 0.36;
const R1 = 1.08, N1 = 24, N2 = 14, R2 = (R1 * N2) / N1, GAP = (R1 + R2) * 1.004, THICK = 0.24, LIFT = 0.1, BEVEL = 0.022;

/** зубчатое колесо: венец с зубьями, окна между спицами, отверстие под ось, скруглённые кромки; толщина вдоль Y */
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
  const ri = r * 0.36, ro = r * 0.7, pad = 0.22;
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
  return new ExtrudeGeometry(s, { depth: THICK - BEVEL * 2, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelOffset: -BEVEL, bevelSegments: 3, curveSegments: 16 })
    .rotateX(-Math.PI / 2).translate(0, BEVEL, 0);
};

/** табло на фасаде корпуса: пара валют, как на монетах */
const display = () => screen(1100, 200, (c, w, h) => {
  c.fillStyle = "#06100a"; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill();
  c.font = FONT(92); c.textBaseline = "middle";
  c.textAlign = "right"; c.fillStyle = HEX.amber; c.fillText("KGS", w / 2 - 100, h / 2 + 6);
  c.textAlign = "left"; c.fillStyle = HEX.lime; c.fillText("BTC", w / 2 + 100, h / 2 + 6);
  c.strokeStyle = HEX.ice; c.lineWidth = 12; c.lineCap = "round"; c.lineJoin = "round";
  for (const [y, dir] of [[h / 2 - 22, 1], [h / 2 + 22, -1]]) {
    c.beginPath(); c.moveTo(w / 2 - 56, y); c.lineTo(w / 2 + 56, y); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + dir * 56 - dir * 22, y - 18); c.lineTo(w / 2 + dir * 56, y); c.lineTo(w / 2 + dir * 56 - dir * 22, y + 18); c.stroke();
  }
});

export const mountGears = async ({ canvas }: { canvas: HTMLCanvasElement }): Promise<() => void> => {
  await fonts();
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const mat = materials();
  const panel = mat.graphite.clone(); panel.color.set(0x272d32);
  const owned: { dispose: () => void }[] = [panel];
  const keep = <G extends { dispose: () => void }>(g: G) => { owned.push(g); return g; };
  const put = (parent: Group, geo: BufferGeometry, m: Material, x = 0, y = 0, z = 0) => { const mesh = new Mesh(keep(geo), m); mesh.position.set(x, y, z); parent.add(mesh); return mesh; };

  const target = new Vector3(0, 0.4, 0);
  const light = rig(scene, group, { target, span: 6.6, rim: new Vector3(4.5, 3, -5) });
  const floor = catcher(16, 9, -0.01, 0.5);
  group.add(floor);

  // корпус платформы: крышка-вставка, болты, решётки, табло на фасаде
  const { w, h, d } = HOUSE;
  put(group, box(w, h, d, 0.08), mat.graphite, 0, h / 2, 0);
  put(group, box(w - 0.34, 0.03, d - 0.34, 0.012), panel, 0, h + 0.01, 0);
  const corners: [number, number, number][] = [], vents: [number, number, number][] = [], louvers: [number, number, number][] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) corners.push([sx * (w / 2 - 0.36), h + 0.04, sz * (d / 2 - 0.36)]);
    for (let i = 0; i < 6; i++) vents.push([sx * (w / 2 - 0.75 - i * 0.085), h + 0.028, d / 2 - 0.55]);
    for (let i = 0; i < 11; i++) louvers.push([sx * (1.2 + i * 0.085), h / 2, d / 2 + 0.004]);
  }
  put(group, many(new CylinderGeometry(0.06, 0.06, 0.04, 6), corners), mat.steel);
  put(group, many(box(0.035, 0.012, 0.34, 0.005), vents), mat.dark);
  put(group, many(box(0.03, 0.3, 0.012, 0.005), louvers), mat.dark);
  const FZ = d / 2;
  put(group, box(1.9, 0.38, 0.03, 0.03), mat.dark, 0, h / 2, FZ + 0.004);
  const board = keep(display());
  put(group, new PlaneGeometry(1.76, 0.32), board.material, 0, h / 2, FZ + 0.021);
  await nap();

  // колёса: большое лаймовое в центре, два стальных по бокам — в зацеплении; у каждого ступица с золотой крышкой
  const wheels: { holder: Group; dir: number; phase: number }[] = [];
  for (const g of [
    { x: 0, r: R1, n: N1, spokes: 6, dir: 1, phase: 0, big: true },
    { x: GAP, r: R2, n: N2, spokes: 4, dir: -N1 / N2, phase: Math.PI / N2, big: false },
    { x: -GAP, r: R2, n: N2, spokes: 4, dir: -N1 / N2, phase: Math.PI / N2, big: false },
  ]) {
    const holder = new Group();
    holder.position.set(g.x, h + LIFT, 0);
    put(holder, gear(g.r, g.n, g.spokes), g.big ? mat.lime : mat.steel);
    put(holder, new CylinderGeometry(g.r * 0.25, g.r * 0.28, 0.1, 36), g.big ? mat.graphite : mat.graphite, 0, THICK + 0.05, 0);
    put(holder, new SphereGeometry(g.r * 0.13, 24, 14).scale(1, 0.62, 1), mat.gold, 0, THICK + 0.1, 0);
    if (g.big) put(holder, many(new CylinderGeometry(0.028, 0.028, 0.03, 6), Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return [Math.cos(a) * g.r * 0.2, THICK + 0.105, Math.sin(a) * g.r * 0.2] as [number, number, number]; })), mat.steel);
    put(group, new CylinderGeometry(g.r * 0.16, g.r * 0.2, LIFT, 24), mat.steel, g.x, h + LIFT / 2, 0);
    group.add(holder);
    wheels.push({ holder, dir: g.dir, phase: g.phase });
    await nap();
  }

  // ленты слева и справа от корпуса: полотно, борта, опоры, валик на краю
  const len = BELT.x1 - BELT.x0;
  for (const side of [-1, 1]) {
    const cx = side * (BELT.x0 + BELT.x1) / 2;
    put(group, box(len, 0.1, BELT.d, 0.04), mat.dark, cx, BELT.y, 0);
    for (const z of [-1, 1]) put(group, box(len, 0.16, 0.06, 0.02), mat.steel, cx, BELT.y + 0.03, z * (BELT.d / 2 + 0.03));
    for (const x of [-0.35, 0.35]) put(group, box(0.12, BELT.y, BELT.d * 0.8, 0.03), mat.graphite, cx + x * len, BELT.y / 2 - 0.05, 0);
    put(group, new CylinderGeometry(0.12, 0.12, BELT.d + 0.12, 28).rotateX(Math.PI / 2), mat.steel, cx + side * len / 2, BELT.y, 0);
  }
  await nap();

  // монеты: по три на каждый отрезок каждой дорожки; слева сомы, справа крипта
  // тело монеты и буртик — одно тело: одна отрисовка на монету вместо двух
  const coinGeo = keep(mergeGeometries([new CylinderGeometry(0.3, 0.3, 0.07, 44), new TorusGeometry(0.285, 0.018, 10, 48).rotateX(Math.PI / 2).translate(0, 0.035, 0)]));
  const marks = [keep(iconSolid(ICON.som, 0.4, 0.024).rotateX(-Math.PI / 2)), keep(iconSolid(ICON.bitcoin, 0.4, 0.022).rotateX(-Math.PI / 2))];
  const SPAN = len - 0.25;
  const coins: { holder: Group; lane: number; side: number; slot: number }[] = [];
  for (const lane of [1, -1]) for (const side of [-1, 1]) for (let slot = 0; slot < 3; slot++) {
    const som = side === -1, holder = new Group(), body = som ? mat.gold : mat.lime;
    holder.add(new Mesh(coinGeo, body));
    const mark = new Mesh(marks[som ? 0 : 1], mat.ink); mark.position.y = 0.036; holder.add(mark);
    group.add(holder);
    coins.push({ holder, lane, side, slot });
  }
  solid(group);

  const ptr = pointer(canvas);
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.12;
      const pts: Vector3[] = [];
      for (const x of [-BELT.x1 - 0.2, BELT.x1 + 0.2]) for (const z of [-d / 2, d / 2]) for (const y of [0, h + 0.6]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(narrow ? 0.62 : 0.74), Math.cos(narrow ? 0.62 : 0.74)), pts, [0.97, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    // сцена вырастает из точки; колёса раскручиваются и дальше идут ровно
    group.scale.setScalar(0.86 + 0.14 * ease(age / 0.8));
    const run = Math.max(0, age - 0.3), turn = (run - 1.2 * (1 - Math.exp(-run / 1.2))) * 0.5;
    for (const g of wheels) g.holder.rotation.y = turn * g.dir + g.phase;
    // монеты едут по дорожкам: ближняя вправо, дальняя влево; у корпуса уходят в прорезь
    for (const c of coins) {
      const p = (((age * 0.11 + c.slot / 3) % 1) + 1) % 1, along = c.lane > 0 ? p : 1 - p;
      c.holder.position.set(c.side < 0 ? -BELT.x1 + 0.12 + along * SPAN : BELT.x0 + 0.13 + along * SPAN, BELT.y + 0.087, c.lane * LANE);
      c.holder.scale.setScalar(Math.max(0.001, ease(Math.min(1, p * 7, (1 - p) * 7))));
    }
    // движется всё время, но тени хватает пересчёта через кадр
    if (++ticks % 2 === 0) light.refresh();
    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.04 + ptr.p.nx * 0.07 - yaw) * k;
    pitch += (-ptr.p.ny * 0.03 - pitch) * k;
    group.rotation.set(pitch, yaw0 + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return () => {
    unmount(); ptr.off();
    for (const k of owned) k.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    light.dispose(); mat.dispose();
  };
};
