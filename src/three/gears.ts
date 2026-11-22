import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, Path, PerspectiveCamera, Scene, Shape, Vector3, type BufferGeometry, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, ease, engrave, frameCamera, nap, outline, pointer, shared } from "@/three/kit";

/**
 * «Сделка без сотрудника» как механизм: корпус платформы с тремя шестернями, которые крутятся
 * сами, и две ленты. По ближней дорожке слева направо идёт покупка: сомы заезжают в корпус,
 * с другой стороны выезжает крипта. По дальней дорожке справа налево — продажа: крипта заезжает,
 * выезжают сомы. Человека в сцене нет: механизм работает сам.
 */
const HOUSE = { w: 4.7, h: 0.55, d: 2.7 }, BELT = { x0: 2.35, x1: 5.25, y: 0.2, d: 1.5 }, LANE = 0.36;
const R1 = 1.05, N1 = 20, N2 = 12, R2 = (R1 * N2) / N1, GAP = (R1 + R2) * 1.005, THICK = 0.22;

/** зубчатое колесо: контур с зубьями, отверстие под ось и облегчающие окна; толщина вдоль Y */
const gear = (r: number, teeth: number, holes: number) => {
  const s = new Shape(), tip = r + 0.085, root = r - 0.085, step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pt = (ang: number, rad: number, first = false) => { const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad; if (first) s.moveTo(x, y); else s.lineTo(x, y); };
    pt(a - step * 0.3, root, i === 0); pt(a - step * 0.16, tip); pt(a + step * 0.16, tip); pt(a + step * 0.3, root);
  }
  s.closePath();
  const hole = (x: number, y: number, rad: number) => { const p = new Path(); p.absarc(x, y, rad, 0, Math.PI * 2, true); s.holes.push(p); };
  hole(0, 0, r * 0.13);
  for (let i = 0; i < holes; i++) { const a = (i / holes) * Math.PI * 2 + 0.3; hole(Math.cos(a) * r * 0.56, Math.sin(a) * r * 0.56, r * 0.17); }
  return new ExtrudeGeometry(s, { depth: THICK, bevelEnabled: false, curveSegments: 20 }).rotateX(-Math.PI / 2);
};

/** монета сверху: 0 — сом (буква «с» с чертой), 1 — крипта (шестиугольник) */
const coinArt = (kind: number) => art(128, 128, (c) => {
  c.lineWidth = 9;
  c.beginPath(); c.arc(64, 64, 52, 0, Math.PI * 2); c.stroke();
  if (kind === 0) {
    c.beginPath(); c.arc(64, 58, 22, Math.PI * 0.3, Math.PI * 1.7); c.stroke();
    c.beginPath(); c.moveTo(40, 96); c.lineTo(88, 96); c.stroke();
  } else {
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; if (i) c.lineTo(64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30); else c.moveTo(64 + Math.cos(a) * 30, 64 + Math.sin(a) * 30); }
    c.closePath(); c.stroke();
    c.beginPath(); c.arc(64, 64, 8, 0, Math.PI * 2); c.fill();
  }
});

export const mountGears = async ({ canvas }: { canvas: HTMLCanvasElement }): Promise<() => void> => {
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  const edges: { line: ReturnType<typeof outline>; base: number }[] = [];
  const add = (geo: BufferGeometry, parent: Group, opt: Parameters<typeof engrave>[1], edge = 0.5, angle = 30) => {
    const mat = keep(engrave(sh, opt)), mesh = new Mesh(keep(geo), mat), line = outline(geo, 0, angle);
    edges.push({ line, base: edge });
    parent.add(mesh, line);
    return mat;
  };

  // корпус платформы и прорези, в которые уходят ленты
  const house = new Group();
  house.position.y = HOUSE.h / 2;
  add(new BoxGeometry(HOUSE.w, HOUSE.h, HOUSE.d), house, { strata: 20, top: 16, ink: 0.55 }, 0.6);
  group.add(house);

  await nap();
  // шестерни: большая в центре, две малые по бокам — в зацеплении
  const wheels: { holder: Group; mat: ShaderMaterial; dir: number; phase: number; kind: 0 | 1 }[] = [];
  for (const w of [
    { x: 0, r: R1, n: N1, holes: 6, dir: 1, phase: 0, kind: 1 as const },
    { x: GAP, r: R2, n: N2, holes: 4, dir: -N1 / N2, phase: Math.PI / N2, kind: 0 as const },
    { x: -GAP, r: R2, n: N2, holes: 4, dir: -N1 / N2, phase: Math.PI / N2, kind: 0 as const },
  ]) {
    const holder = new Group();
    holder.position.set(w.x, HOUSE.h + 0.02, 0);
    const mat = add(gear(w.r, w.n, w.holes), holder, { kind: w.kind, strata: 26, top: 9, ink: 1.5 }, 0.95, 20);
    const axle = new Group();
    axle.position.set(w.x, HOUSE.h + 0.02, 0);
    add(new CylinderGeometry(w.r * 0.11, w.r * 0.11, THICK + 0.12, 20).translate(0, (THICK + 0.12) / 2, 0), axle, { strata: 40 }, 0.5);
    group.add(holder, axle);
    wheels.push({ holder, mat, ...w });
    await nap();
  }

  // ленты слева и справа от корпуса, по валику на краях
  for (const side of [-1, 1]) {
    const belt = new Group();
    belt.position.set(side * (BELT.x0 + BELT.x1) / 2, BELT.y, 0);
    add(new BoxGeometry(BELT.x1 - BELT.x0, 0.1, BELT.d), belt, { strata: 60, top: 18, ink: 0.6 }, 0.5);
    group.add(belt);
    const roller = new Group();
    roller.position.set(side * BELT.x1, BELT.y, 0);
    add(new CylinderGeometry(0.11, 0.11, BELT.d + 0.1, 18).rotateX(Math.PI / 2), roller, { strata: 40 }, 0.4);
    group.add(roller);
  }

  await nap();
  // монеты: по три на каждый отрезок каждой дорожки
  const coinGeo = keep(new CylinderGeometry(0.3, 0.3, 0.08, 28));
  const arts = [keep(coinArt(0)), keep(coinArt(1))];
  const SPAN = BELT.x1 - BELT.x0 - 0.25;
  const coins: { holder: Group; lane: number; side: number; slot: number }[] = [];
  for (const lane of [1, -1]) for (const side of [-1, 1]) for (let slot = 0; slot < 3; slot++) {
    // ближняя дорожка (покупка): слева сомы, справа крипта; дальняя (продажа): справа крипта, слева сомы
    const som = side === -1;
    const mat = keep(engrave(sh, { kind: som ? 0 : 1, art: arts[som ? 0 : 1], rect: [-0.3, -0.3, 0.6, 0.6], strata: 60 }));
    const holder = new Group(), line = outline(coinGeo, 0, 40);
    edges.push({ line, base: 0.7 });
    holder.add(new Mesh(coinGeo, mat), line);
    group.add(holder);
    coins.push({ holder, lane, side, slot });
  }

  const ptr = pointer(canvas);
  const target = new Vector3(0, 0.35, 0);
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.1;
      const pts: Vector3[] = [];
      for (const x of [-BELT.x1 - 0.2, BELT.x1 + 0.2]) for (const z of [-HOUSE.d / 2, HOUSE.d / 2]) for (const y of [0, HOUSE.h + 0.35]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(narrow ? 0.6 : 0.78), Math.cos(narrow ? 0.6 : 0.78)), pts, [0.96, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.7);
    for (const e of edges) e.line.material.opacity = e.base * sh.uShow.value;
    // шестерни раскручиваются и дальше идут ровно
    const turn = (Math.max(0, age - 0.4) - 1.2 * (1 - Math.exp(-Math.max(0, age - 0.4) / 1.2))) * 0.55;
    for (const w of wheels) { w.holder.rotation.y = turn * w.dir + w.phase; w.mat.uniforms.uHot.value = w.kind ? 0.12 + 0.1 * Math.sin(age * 2) : 0; }
    // монеты едут по дорожкам: ближняя вправо, дальняя влево; у корпуса уходят в прорезь
    for (const c of coins) {
      const p = (((age * 0.11 + c.slot / 3) % 1) + 1) % 1;            // доля пути по своему отрезку
      const along = c.lane > 0 ? p : 1 - p;                           // 0 — левый край отрезка, 1 — правый
      const x = c.side < 0 ? -BELT.x1 + 0.12 + along * SPAN : BELT.x0 + 0.13 + along * SPAN;
      const fade = Math.min(1, p * 7, (1 - p) * 7);
      c.holder.position.set(x, BELT.y + 0.05 + 0.045, c.lane * LANE);
      c.holder.scale.setScalar(Math.max(0.001, ease(fade)));
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
  };
};
