import { CylinderGeometry, ExtrudeGeometry, Group, Mesh, PerspectiveCamera, Scene, Shape, Vector2, Vector3, type BufferGeometry, type Material, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, ease, engrave, frameCamera, HEX, INK, nap, outline, pointer, shadow, shared } from "@/three/kit";
import { drawIcon, ICON } from "@/three/icons";

/**
 * Требования ГСФР как щит: четыре пластины — KYC, проверки, данные, отчёты — на общей основе,
 * в центре янтарный замок. Выбранная строка списка выдвигает свою пластину вперёд.
 * Щит стоит лицом к зрителю и слегка поворачивается за курсором, чтобы была видна толщина.
 */
const W = 1.62, TOP = 1.9, BOT = -2.05, CY = 0.32, GAP = 0.065, BASE_T = 0.22, PLATE_T = 0.15, BOSS = 0.5;

/** контур щита: ровный верх со скруглёнными углами, бока сходятся к острию */
const contour = () => {
  const s = new Shape(), r = 0.24;
  s.moveTo(-W + r, TOP);
  s.lineTo(W - r, TOP);
  s.quadraticCurveTo(W, TOP, W, TOP - r);
  s.lineTo(W, 0.35);
  s.bezierCurveTo(W, -0.85, 0.8, -1.6, 0, BOT);
  s.bezierCurveTo(-0.8, -1.6, -W, -0.85, -W, 0.35);
  s.lineTo(-W, TOP - r);
  s.quadraticCurveTo(-W, TOP, -W + r, TOP);
  const pts = s.getPoints(22);
  if (pts[0].distanceTo(pts[pts.length - 1]) < 1e-4) pts.pop();
  return pts;
};

/** отсечь многоугольник полуплоскостью: keep(p) ≥ 0 — точка остаётся */
const clip = (poly: Vector2[], keep: (p: Vector2) => number) => {
  const out: Vector2[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length], da = keep(a), db = keep(b);
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push(new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)); }
  });
  return out;
};

const solid = (pts: Vector2[], depth: number, z: number) => new ExtrudeGeometry(new Shape(pts), { depth, bevelEnabled: false }).translate(0, 0, z);

/** значок пластины: тёмная обводка на залитой грани */
const plateIcon = (icon: Parameters<typeof drawIcon>[1]) => art(256, 256, (c) => drawIcon(c, icon, 30, 30, 196, 2.1));

export type ShieldOptions = { canvas: HTMLCanvasElement };
export type ShieldHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountShield = async ({ canvas }: ShieldOptions): Promise<ShieldHandle> => {
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 1.25, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  const edges: { line: ReturnType<typeof outline>; base: number }[] = [];
  const add = (geo: BufferGeometry, parent: Group, mat: Material, edge: number, color: string = HEX.lime) => {
    const line = outline(geo, 0, 30, color);
    edges.push({ line, base: edge });
    parent.add(new Mesh(keep(geo), mat), line);
    return line;
  };
  const ground = shadow(sh, 4.4, 2.2, BOT - 0.42, 0.75);
  group.add(ground);

  // основа: весь контур, тёмная, со штриховкой
  const rim = contour();
  add(solid(rim, BASE_T, 0), group, keep(engrave(sh, { face: "front", strata: 15, top: 30, ink: 0.9 })), 0.85);
  await nap();

  // четыре пластины: контур, сжатый к центру, режется крестом
  const c0 = new Vector2(0, 0.08), inner = rim.map((p) => new Vector2(c0.x + (p.x - c0.x) * 0.9, c0.y + (p.y - c0.y) * 0.9));
  const QUADS: { sx: number; sy: number; icon: Parameters<typeof drawIcon>[1]; at: [number, number]; size: number }[] = [
    { sx: -1, sy: 1, icon: ICON.userCheck, at: [-0.84, 1.1], size: 0.8 },
    { sx: 1, sy: 1, icon: ICON.searchCheck, at: [0.84, 1.1], size: 0.8 },
    { sx: -1, sy: -1, icon: ICON.server, at: [-0.66, -0.44], size: 0.68 },
    { sx: 1, sy: -1, icon: ICON.fileChart, at: [0.66, -0.44], size: 0.68 },
  ];
  const plates: { holder: Group; mat: ShaderMaterial; line: ReturnType<typeof outline>; on: number }[] = [];
  for (const q of QUADS) {
    const pts = clip(clip(inner, (p) => q.sx * p.x - GAP), (p) => q.sy * (p.y - CY) - GAP);
    const holder = new Group();
    const mat = keep(engrave(sh, { kind: 1, face: "front", art: keep(plateIcon(q.icon)), rect: [q.at[0] - q.size / 2, q.at[1] - q.size / 2, q.size, q.size], strata: 13, top: 34, hatch: 0.5 }));
    const line = add(solid(pts, PLATE_T, BASE_T), holder, mat, 0.95);
    group.add(holder);
    plates.push({ holder, mat, line, on: 0 });
    await nap();
  }

  // замок в центре: янтарный шестигранник
  const boss = new Group();
  const bossMat = keep(engrave(sh, { kind: 1, face: "front", tint: INK.amber, art: keep(art(256, 256, (c) => drawIcon(c, ICON.lock, 46, 40, 164, 2.3))), rect: [-0.4, CY - 0.4, 0.8, 0.8], strata: 26, top: 40 }));
  add(new CylinderGeometry(BOSS, BOSS + 0.05, 0.2, 6).rotateX(Math.PI / 2).translate(0, CY, BASE_T + PLATE_T + 0.1), boss, bossMat, 0.95, HEX.amber);
  group.add(boss);

  const ptr = pointer(canvas);
  const YAW = -0.36, target = new Vector3(0, -0.12, 0.15);
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = -1;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W - 0.45, W + 0.45]) for (const y of [BOT - 0.5, TOP + 0.12]) for (const z of [0, 0.7]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(0.1), Math.cos(0.1)), pts, [0.97, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    const k = 1 - Math.exp(-dt * 7);
    plates.forEach((p, i) => {
      // пластины встают на основу по одной; выбранная выдвигается и светлеет
      const land = ease((age - 0.35 - i * 0.14) / 0.7);
      p.on += ((i === active ? 1 : 0) - p.on) * k;
      p.holder.position.z = (1 - land) * 1.1 + p.on * 0.16;
      p.holder.visible = age > 0.35 + i * 0.14;
      p.mat.uniforms.uHot.value = p.on * 0.55;
      p.mat.uniforms.uAlpha.value = land;
      p.mat.uniforms.uReveal.value = ease((age - 0.8 - i * 0.14) / 0.6);
      p.line.material.opacity = (0.7 + p.on * 0.3) * land * sh.uShow.value;
    });
    const lock = ease((age - 1.1) / 0.6);
    boss.position.z = (1 - lock) * 0.9;
    boss.visible = age > 1.1;
    bossMat.uniforms.uAlpha.value = lock;
    bossMat.uniforms.uHot.value = 0.12 + 0.1 * Math.sin(age * 1.6);
    for (const e of edges) if (!plates.some((p) => p.line === e.line)) e.line.material.opacity = e.base * sh.uShow.value;
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.45) * 0.07 + ptr.p.nx * 0.2 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.1 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame });
  return {
    setActive: (i) => { active = i; },
    dispose: () => {
      unmount(); ptr.off();
      for (const k of kept) k.dispose();
      for (const e of edges) { e.line.geometry.dispose(); e.line.material.dispose(); }
      ground.geometry.dispose(); ground.material.dispose();
    },
  };
};
