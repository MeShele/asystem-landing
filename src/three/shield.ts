import { ExtrudeGeometry, Group, Mesh, PerspectiveCamera, Scene, Shape, Vector2, Vector3, type MeshPhysicalMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, frameCamera, nap, pointer } from "@/three/kit";
import { ICON, type IconNode } from "@/three/icons";
import { catcher, iconSolid, materials, rig, solid } from "@/three/studio";

/**
 * Требования ГСФР как щит: четыре эмалевые пластины — KYC, проверки, данные, отчёты — на тёмной
 * основе, в центре золотой замок. Настоящие объёмные тела со светом и тенью; значки — рельефом.
 * Выбранная строка списка выдвигает свою пластину вперёд и добавляет ей свечения.
 */
const W = 1.62, TOP = 1.9, BOT = -2.05, CY = 0.32, GAP = 0.07, BASE_T = 0.2, PLATE_T = 0.13;

/** контур щита: ровный верх со скруглёнными углами, бока сходятся к острию */
const contour = () => {
  const s = new Shape(), r = 0.26;
  s.moveTo(-W + r, TOP);
  s.lineTo(W - r, TOP);
  s.quadraticCurveTo(W, TOP, W, TOP - r);
  s.lineTo(W, 0.35);
  s.bezierCurveTo(W, -0.85, 0.8, -1.6, 0, BOT);
  s.bezierCurveTo(-0.8, -1.6, -W, -0.85, -W, 0.35);
  s.lineTo(-W, TOP - r);
  s.quadraticCurveTo(-W, TOP, -W + r, TOP);
  const pts = s.getPoints(28);
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

/** тело по контуру со скруглённой кромкой; z — задняя плоскость */
const slab = (pts: Vector2[], depth: number, z: number, bevel: number) =>
  new ExtrudeGeometry(new Shape(pts), { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 5, curveSegments: 20 }).translate(0, 0, z + bevel);

export type ShieldOptions = { canvas: HTMLCanvasElement };
export type ShieldHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountShield = async ({ canvas }: ShieldOptions): Promise<ShieldHandle> => {
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 1.25, 0.1, 80);
  const mat = materials();
  const geos: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { geos.push(g); return g; };
  const target = new Vector3(0, -0.12, 0.15);
  // щит висит над «полом»: свет почти сверху, иначе тень уезжает вбок и режется краем холста
  const light = rig(scene, group, { target, span: 3.4, rim: new Vector3(2.4, 1.2, -2.6), from: new Vector3(-0.1, 1.6, 0.5) });
  const floor = catcher(9, 7, BOT - 0.4, 0.5);
  group.add(floor);

  // основа: весь контур, тёмный металл
  const rim = contour();
  group.add(new Mesh(keep(slab(rim, BASE_T, 0, 0.05)), mat.graphite));
  await nap();

  // четыре пластины: контур, сжатый к центру, режется крестом; на каждой — рельефный значок
  const c0 = new Vector2(0, 0.08), inner = rim.map((p) => new Vector2(c0.x + (p.x - c0.x) * 0.9, c0.y + (p.y - c0.y) * 0.9));
  const QUADS: { sx: number; sy: number; icon: IconNode[]; at: [number, number]; size: number }[] = [
    { sx: -1, sy: 1, icon: ICON.userCheck, at: [-0.84, 1.1], size: 0.74 },
    { sx: 1, sy: 1, icon: ICON.searchCheck, at: [0.84, 1.1], size: 0.74 },
    { sx: -1, sy: -1, icon: ICON.server, at: [-0.66, -0.44], size: 0.62 },
    { sx: 1, sy: -1, icon: ICON.fileChart, at: [0.66, -0.44], size: 0.62 },
  ];
  const plates: { holder: Group; enamel: MeshPhysicalMaterial; on: number }[] = [];
  for (const q of QUADS) {
    const pts = clip(clip(inner, (p) => q.sx * p.x - GAP), (p) => q.sy * (p.y - CY) - GAP);
    const holder = new Group(), enamel = mat.lime.clone();
    holder.add(new Mesh(keep(slab(pts, PLATE_T, BASE_T, 0.035)), enamel));
    holder.add(new Mesh(keep(iconSolid(q.icon, q.size, q.size * 0.043).translate(q.at[0], q.at[1], BASE_T + PLATE_T)), mat.ink));
    group.add(holder);
    plates.push({ holder, enamel, on: 0 });
    await nap();
  }

  // замок в центре: золотой шестигранник с рельефным замком
  const boss = new Group(), hex: Vector2[] = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; hex.push(new Vector2(Math.cos(a) * 0.54, CY + Math.sin(a) * 0.54)); }
  const Z = BASE_T + PLATE_T;
  boss.add(new Mesh(keep(slab(hex, 0.2, Z - 0.03, 0.045)), mat.gold));
  boss.add(new Mesh(keep(iconSolid(ICON.lock, 0.6, 0.03).translate(0, CY + 0.01, Z + 0.17)), mat.ink));
  group.add(boss);
  solid(group);

  const ptr = pointer(canvas);
  const YAW = -0.34;
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = -1;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W - 0.4, W + 0.4]) for (const y of [BOT - 0.5, TOP + 0.12]) for (const z of [0, 0.7]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(0.1), Math.cos(0.1)), pts, [0.97, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    const k = 1 - Math.exp(-dt * 7);
    // тень пересчитывается, только пока что-то движется: вход и выдвижение пластины
    if (age < 2.4 || plates.some((p, i) => Math.abs((i === active ? 1 : 0) - p.on) > 0.004)) light.refresh();
    plates.forEach((p, i) => {
      // пластины встают на основу по одной; выбранная выдвигается и светится ярче
      const land = ease((age - 0.25 - i * 0.14) / 0.75);
      p.on += ((i === active ? 1 : 0) - p.on) * k;
      p.holder.position.z = (1 - land) * 1.2 + p.on * 0.17;
      p.holder.scale.setScalar(0.6 + 0.4 * land);
      p.holder.visible = age > 0.25 + i * 0.14;
      p.enamel.emissiveIntensity = 0.12 + p.on * 0.32;
    });
    const lock = ease((age - 1.0) / 0.7);
    boss.position.z = (1 - lock) * 1.0;
    boss.scale.setScalar(0.5 + 0.5 * lock);
    boss.visible = age > 1.0;
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.45) * 0.09 + ptr.p.nx * 0.22 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.1 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return {
    setActive: (i) => { active = i; },
    dispose: () => {
      unmount(); ptr.off();
      for (const g of geos) g.dispose();
      for (const p of plates) p.enamel.dispose();
      floor.geometry.dispose(); (floor.material as { dispose: () => void }).dispose();
      light.dispose(); mat.dispose();
    },
  };
};
