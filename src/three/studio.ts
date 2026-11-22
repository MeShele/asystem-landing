import {
  BufferGeometry, CanvasTexture, CapsuleGeometry, CatmullRomCurve3, DirectionalLight, HemisphereLight, LinearFilter, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, PlaneGeometry, PointLight, ShadowMaterial, SphereGeometry, SRGBColorSpace, TubeGeometry, Vector3,
  type Group, type Material, type Object3D, type Scene,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { studioEnv } from "@/three/live";
import type { IconNode } from "@/three/icons";

/**
 * Студия для объёмных макетов (щит, запуск, механизм): настоящие материалы со светом и
 * отражениями вместо гравировки линиями. Общие краски, свет с мягкой тенью, «пол», который
 * показывает только тень, скруглённые тела, значки объёмными штрихами и экраны-текстуры.
 */
export const HUE = { lime: 0xb6ff1a, amber: 0xffb21f, ice: 0xe9efea, graphite: 0x1d2226, dark: 0x0d1012, ink: 0x0a0d0b, skin: 0xe6d3bf } as const;

/** набор материалов одной сцены; dispose снимает их все */
export const materials = () => {
  const m = {
    /** корпус: тёмный металл с лаком */
    graphite: new MeshPhysicalMaterial({ color: HUE.graphite, roughness: 0.46, metalness: 0.45, clearcoat: 0.55, clearcoatRoughness: 0.3 }),
    /** глубокие детали: пазы, стекло, резина */
    dark: new MeshPhysicalMaterial({ color: HUE.dark, roughness: 0.6, metalness: 0.25 }),
    /** фирменная эмаль: лайм светится сам, чтобы не гаснуть на тёмном фоне */
    lime: new MeshPhysicalMaterial({ color: HUE.lime, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: HUE.lime, emissiveIntensity: 0.13 }),
    gold: new MeshPhysicalMaterial({ color: HUE.amber, roughness: 0.3, metalness: 0.72, emissive: HUE.amber, emissiveIntensity: 0.14 }),
    ice: new MeshPhysicalMaterial({ color: HUE.ice, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3 }),
    skin: new MeshPhysicalMaterial({ color: HUE.skin, roughness: 0.55, clearcoat: 0.2 }),
    steel: new MeshPhysicalMaterial({ color: 0x9aa4ab, roughness: 0.28, metalness: 0.92 }),
    /** рельефный рисунок на светлой эмали */
    ink: new MeshPhysicalMaterial({ color: HUE.ink, roughness: 0.38, metalness: 0.4, clearcoat: 0.4 }),
    /** огоньки и светящиеся детали: не зависят от света сцены */
    glowLime: new MeshBasicMaterial({ color: HUE.lime, toneMapped: false }),
    glowAmber: new MeshBasicMaterial({ color: 0xffc233, toneMapped: false }),
  };
  return { ...m, dispose: () => { for (const x of Object.values(m)) x.dispose(); } };
};
export type Mats = ReturnType<typeof materials>;

/**
 * Свет студии: ключевой с мягкой тенью, заполняющий и лаймовый контровой сзади. Крепится к самому
 * макету (group), а не к сцене: макет покачивается за курсором вместе со светом, тень на нём
 * не меняется — и её можно не пересчитывать каждый кадр. Пересчёт заказывает сцена: refresh().
 */
export const rig = (scene: Scene, group: Group, o: { target: Vector3; span: number; rim?: Vector3; from?: Vector3 }) => {
  scene.environment = studioEnv();
  scene.environmentIntensity = 0.62;
  const key = new DirectionalLight(0xffffff, 1.7);
  // from — направление на ключевой свет в долях span; чем он выше и ближе к оси, тем короче и ровнее тень
  key.position.copy(o.target).add((o.from ?? new Vector3(-0.4, 1.5, 0.7)).clone().multiplyScalar(o.span));
  key.target.position.copy(o.target);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const c = key.shadow.camera;
  const reach = o.span * 1.25;
  c.left = -reach; c.right = reach; c.top = reach; c.bottom = -reach; c.near = 0.1; c.far = o.span * 6;
  key.shadow.bias = -0.0008; key.shadow.normalBias = 0.06; key.shadow.radius = 7; key.shadow.blurSamples = 16;
  const fill = new HemisphereLight(0xd6ecdc, 0x0a100c, 0.3);
  const rim = new PointLight(HUE.lime, o.span * o.span * 0.55, o.span * 6, 1.6);
  rim.position.copy(o.rim ?? o.target.clone().add(new Vector3(o.span * 0.6, o.span * 0.5, -o.span * 0.9)));
  key.shadow.autoUpdate = false; key.shadow.needsUpdate = true;
  group.add(key, key.target, fill, rim);
  return { key, rim, refresh: () => { key.shadow.needsUpdate = true; }, dispose: () => { key.shadow.map?.dispose(); key.dispose(); fill.dispose(); rim.dispose(); } };
};

/** пол-невидимка: видна только упавшая на него тень */
export const catcher = (w: number, d: number, y = 0, opacity = 0.42) => {
  const m = new Mesh(new PlaneGeometry(w, d).rotateX(-Math.PI / 2), new ShadowMaterial({ opacity }));
  m.position.y = y; m.receiveShadow = true;
  return m;
};

/** отметить все тела ветки как отбрасывающие и принимающие тень */
export const solid = <T extends Object3D>(root: T): T => {
  // только освещаемые тела: светящиеся детали, лучи и «пол» тени не отбрасывают
  root.traverse((o) => { if (o instanceof Mesh && o.material instanceof MeshPhysicalMaterial) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
};

export const box = (w: number, h: number, d: number, r = 0.04, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));

/** много одинаковых неподвижных деталей одним телом: одна отрисовка вместо десятков */
export const many = (geo: BufferGeometry, at: [number, number, number][]) => {
  const parts = at.map(([x, y, z]) => geo.clone().translate(x, y, z)), g = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  geo.dispose();
  return g;
};

/** «кость» между двумя точками: капсула со скруглёнными концами */
const UP = new Vector3(0, 1, 0);
export const limb = (a: Vector3, b: Vector3, r: number, m: Material) => {
  const mesh = new Mesh(new CapsuleGeometry(r, a.distanceTo(b), 8, 20), m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  return mesh;
};

/**
 * Значок из набора lucide объёмными штрихами: каждый контур — трубка со скруглёнными концами
 * и стыками. Лежит в плоскости XY лицом к +Z, центр в нуле; size — сторона квадрата значка,
 * r — радиус штриха. Геометрия, а не текстура: не рассыпается на пиксели при любом увеличении.
 */
export const iconSolid = (nodes: IconNode[], size: number, r: number): BufferGeometry => {
  const body = nodes.map((n) =>
    n[0] === "path" ? `<path d="${n[1]}"/>`
      : n[0] === "circle" ? `<circle cx="${n[1]}" cy="${n[2]}" r="${n[3]}"/>`
        : n[0] === "ellipse" ? `<ellipse cx="${n[1]}" cy="${n[2]}" rx="${n[3]}" ry="${n[4]}"/>`
          : `<rect x="${n[1]}" y="${n[2]}" width="${n[3]}" height="${n[4]}" rx="${n[5]}"/>`).join("");
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000">${body}</svg>`);
  const k = size / 24, parts: BufferGeometry[] = [];
  const ball = (p: Vector3) => parts.push(new SphereGeometry(r, 12, 8).translate(p.x, p.y, p.z));
  for (const path of data.paths) for (const sub of path.subPaths) {
    const pts: Vector3[] = [];
    for (const v of sub.getPoints(14)) {
      const p = new Vector3((v.x - 12) * k, (12 - v.y) * k, 0);
      if (!pts.length || pts[pts.length - 1].distanceTo(p) > 1e-4) pts.push(p);
    }
    if (pts.length < 2) { if (pts.length) ball(pts[0]); continue; }
    if (pts[0].distanceTo(pts[pts.length - 1]) < r * 0.6 && pts.length < 3) { ball(pts[0]); continue; }     // «точка»: отрезок короче штриха
    const closed = pts[0].distanceTo(pts[pts.length - 1]) < 1e-3;
    if (closed) pts.pop();
    parts.push(new TubeGeometry(new CatmullRomCurve3(pts, closed, "catmullrom", 0), Math.max(12, pts.length * 3), r, 10, closed));
    // скруглённые концы и стыки на изломах
    if (!closed) { ball(pts[0]); ball(pts[pts.length - 1]); }
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i].clone().sub(pts[i - 1]).normalize(), b = pts[i + 1].clone().sub(pts[i]).normalize();
      if (a.dot(b) < 0.86) ball(pts[i]);
    }
  }
  const merged = mergeGeometries(parts);
  for (const g of parts) g.dispose();
  return merged;
};

/** экран или табло: рисунок с холста светится сам; w, h — размер холста в точках */
export const screen = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d context unavailable");
  c.lineCap = "round"; c.lineJoin = "round";
  draw(c, w, h);
  const map = new CanvasTexture(cv);
  map.colorSpace = SRGBColorSpace; map.minFilter = LinearFilter; map.magFilter = LinearFilter; map.generateMipmaps = false; map.anisotropy = 4;
  const material = new MeshBasicMaterial({ map, transparent: true, toneMapped: false });
  return { material, dispose: () => { map.dispose(); material.dispose(); } };
};
