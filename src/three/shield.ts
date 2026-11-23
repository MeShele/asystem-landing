import {
  AdditiveBlending, CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, Vector3,
  type Material,
} from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, frameCamera, pointer } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { HUE, rig, solid } from "@/three/studio";

/**
 * Требования ГСФР как точёный щит: тёмный корпус со ступенчатой рамой, четыре вставки с окнами,
 * в которых подсвечена гравировка — те же значки, что у строк списка, — и кодовый диск сейфа в центре.
 * Модель сделана в Blender (scripts/blender/shield.py); здесь — металл, свет и движение.
 * Выбранная строка списка зажигает гравировку своей вставки, слегка выдвигает её, а рифлёное кольцо
 * диска доворачивает лаймовую метку к этой вставке — с коротким «дожимом», как у механизма.
 */
const W = 1.62, TOP = 1.9, BOT = -2.05, LIFT = 0.055;
const DIM = new Color(0x55625a), LIT = new Color(HUE.lime);

/** мягкое пятно света над выбранным окном */
const glowMap = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2d context unavailable");
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,0.42)"); g.addColorStop(0.62, "rgba(255,255,255,0.1)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return new CanvasTexture(cv);
};
const glow = (map: CanvasTexture, size: number, opacity: number) => new Mesh(
  new PlaneGeometry(size, size),
  new MeshBasicMaterial({ map, color: HUE.lime, transparent: true, opacity, blending: AdditiveBlending, premultipliedAlpha: true, depthWrite: false, toneMapped: false }),
);

/**
 * Плоская грань отражает одну точку окружения и выглядит ровной заливкой. Здесь нормали лицевых граней
 * чуть разведены от центра — как у едва выпуклой «подушки»: по металлу идёт плавный перелив света.
 */
const dome = (m: MeshPhysicalMaterial, k: number) => {
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `#include <beginnormal_vertex>\n if (objectNormal.z > 0.9) objectNormal = normalize(objectNormal + vec3(position.x, position.y, 0.0) * ${k.toFixed(3)});`,
    );
  };
  m.customProgramCacheKey = () => `dome${k.toFixed(3)}`;
};

export type ShieldOptions = { canvas: HTMLCanvasElement };
export type ShieldHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountShield = async ({ canvas }: ShieldOptions): Promise<ShieldHandle> => {
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 1.25, 0.1, 80);
  // металл изделия: воронёный корпус, сатиновые вставки, полированная сталь кромок и кольца, чёрный лак шляпки
  const metal = {
    shell: new MeshPhysicalMaterial({ color: 0x1c2125, roughness: 0.36, metalness: 0.94, clearcoat: 0.3, clearcoatRoughness: 0.3 }),
    plate: new MeshPhysicalMaterial({ color: 0x3b4347, roughness: 0.4, metalness: 0.9 }),
    trim: new MeshPhysicalMaterial({ color: 0x9da8ad, roughness: 0.28, metalness: 1 }),
    knurl: new MeshPhysicalMaterial({ color: 0x8b969b, roughness: 0.38, metalness: 1 }),
    gloss: new MeshPhysicalMaterial({ color: 0x050707, roughness: 0.16, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 }),
    gold: new MeshPhysicalMaterial({ color: 0xe2a336, roughness: 0.27, metalness: 1 }),
    pit: new MeshPhysicalMaterial({ color: 0x06080a, roughness: 0.78, metalness: 0.2 }),
    mark: new MeshPhysicalMaterial({ color: HUE.ice, roughness: 0.6 }),
    hole: new MeshBasicMaterial({ color: 0x020303 }),
    glyph: new MeshBasicMaterial({ color: DIM, toneMapped: false }),
    pointer: new MeshBasicMaterial({ color: HUE.lime, toneMapped: false }),
  };
  dome(metal.plate, 0.2);
  dome(metal.shell, 0.12);
  dome(metal.knurl, 0.55);          // торец кольца — пологий конус: блик идёт «бабочкой», как на безеле часов
  const target = new Vector3(0, -0.08, 0.2);
  const light = rig(scene, group, { target, span: 3.4, rim: new Vector3(2.9, 1.4, -1.6), from: new Vector3(-0.9, 1.2, 0.8) });
  scene.environmentIntensity = 1.05;
  // холодный контровой слева: отделяет тёмный борт от фона
  const kicker = new PointLight(0xcfe4ff, 16, 16, 1.6);
  kicker.position.set(-4.6, 1.9, 2.0);
  group.add(kicker);

  const model = await loadModel("/models/shield.glb");
  const { nodes, dispose: free } = adopt(model, metal as unknown as Record<string, Material>);
  group.add(model);

  const spot = glowMap();
  // у каждой вставки своя краска гравировки и своё свечение над окном
  const dial = nodes.n_dial;
  const plates = [0, 1, 2, 3].map((i) => {
    const holder = nodes[`n_plate_${i}`], well = nodes[`n_well_${i}`], ink = metal.glyph.clone();
    holder.traverse((o) => { if (o instanceof Mesh && o.material === metal.glyph) o.material = ink; });
    const halo = glow(spot, 1.25, 0);
    halo.position.copy(well.position).setZ(well.position.z + 0.05);
    holder.add(halo);
    // метка диска смотрит вверх: угол поворота кольца — направление на окно минус четверть оборота
    const aim = Math.atan2(well.position.y - dial.position.y, well.position.x - dial.position.x) - Math.PI / 2;
    return { holder, well: well.position, ink, halo, aim, on: 0 };
  });
  // лаймовый отсвет от зажжённой гравировки на соседнем металле
  const lamp = new PointLight(HUE.lime, 0, 2.6, 1.8);
  lamp.position.copy(plates[0].well).setZ(0.9);
  group.add(lamp);
  solid(group);

  const ptr = pointer(canvas);
  const YAW = -0.5, ELEV = 0.12;
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = -1, ang = -2.4, spin = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W - 0.3, W + 0.3]) for (const y of [BOT - 0.22, TOP + 0.16]) for (const z of [-0.14, 0.62]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(ELEV), Math.cos(ELEV)), pts, [0.97, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0, step = Math.min(dt, 0.05);
    const k = 1 - Math.exp(-step * 7);
    let moving = age < 2.6;
    let best = 0;
    plates.forEach((p, i) => {
      // вставки встают в раму по одной; выбранная выдвигается, её гравировка загорается
      const land = ease((age - 0.2 - i * 0.12) / 0.6), goal = i === active && age > 1.1 ? 1 : 0;
      if (Math.abs(goal - p.on) > 0.004) moving = true;
      p.on += (goal - p.on) * k;
      p.holder.position.z = (1 - land) * 0.38 + p.on * LIFT;
      p.holder.visible = age > 0.2 + i * 0.12;
      p.ink.color.lerpColors(DIM, LIT, p.on);
      (p.halo.material as MeshBasicMaterial).opacity = p.on * 0.3;
      if (p.on > plates[best].on) best = i;
    });
    // кольцо диска: пружина с небольшим перелётом — доворот читается как работа механизма
    if (active >= 0 && age > 0.9) {
      let gap = plates[active].aim - ang;
      gap -= Math.round(gap / (Math.PI * 2)) * Math.PI * 2;
      spin += (gap * 70 - spin * 10.5) * step;
      ang += spin * step;
    }
    dial.rotation.z = ang;
    lamp.position.lerp(new Vector3(plates[best].well.x, plates[best].well.y, 0.9), k);
    lamp.intensity = plates[best].on * 1.6;
    // тень пересчитывается, только пока движутся вставки: поворот кольца её не меняет
    if (moving) light.refresh();
    const kk = 1 - Math.exp(-step * 3);
    yaw += (Math.sin(age * 0.45) * 0.1 + ptr.p.nx * 0.12 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.11 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
    group.scale.setScalar(0.92 + 0.08 * ease(age / 0.9));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return {
    setActive: (i) => { active = i; },
    dispose: () => {
      unmount(); ptr.off();
      free();
      for (const p of plates) { p.ink.dispose(); p.halo.geometry.dispose(); (p.halo.material as Material).dispose(); }
      spot.dispose();
      for (const m of Object.values(metal)) m.dispose();
      lamp.dispose(); kicker.dispose(); light.dispose();
    },
  };
};
