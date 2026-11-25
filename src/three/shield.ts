import {
  AdditiveBlending, CanvasTexture, Color, Group, LinearFilter, Mesh, MeshBasicMaterial, MeshStandardMaterial, NoColorSpace, PerspectiveCamera,
  PlaneGeometry, PointLight, Scene, TextureLoader, Vector3, Vector4, type Material, type Object3D, type Texture,
} from "three";
import { isStill } from "@/three/gpu";
import { mountLive, redraw, type LiveSize } from "@/three/live";
import { ease, frameCamera, pointer } from "@/three/kit";
import { loadModel } from "@/three/models";
import { HUE, rig } from "@/three/studio";

/**
 * Требования ГСФР как щит-сейф: воронёный корпус, четыре окна со значками (KYC, проверки, данные,
 * отчёты) и кодовый диск в центре. Модель сгенерирована в Higgsfield (эскиз GPT Image 2.6 → 3D Tripo H3.1),
 * ужата и размечена в Blender (scripts/blender/optimize.py, rig_shield.py): металл, рельеф и надписи —
 * в её текстурах. Разметка даёт сцене три вещи: рифлёное кольцо диска отдельным узлом n_dial,
 * центры окон n_well_0..3 и маску значков (public/models/shield-glow.png: R — значок, G — номер окна).
 * Выбранная строка списка зажигает свой значок и приглушает остальные, кольцо диска доворачивает
 * лаймовую метку к выбранному окну — с коротким «дожимом», как у механизма.
 */
const W = 1.62, TOP = 1.9, BOT = -2.05, FRONT = 0.52;

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

/**
 * Свечение значков поверх материала модели: по маске значок окна i гаснет (uDim[i]) или горит лаймом
 * (uGlow[i]). Значки в текстуре и так светло-лаймовые; так выбранный выделяется без резки сетки и без швов.
 */
const iconGlow = (m: MeshStandardMaterial, mask: Texture) => {
  const u = { uMask: { value: mask }, uGlow: { value: new Vector4() }, uDim: { value: new Vector4() }, uLime: { value: new Color(HUE.lime) } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uMask; uniform vec4 uGlow; uniform vec4 uDim; uniform vec3 uLime;\nfloat gIcon; vec4 gSel;")
      .replace("#include <map_fragment>", `#include <map_fragment>
  vec4 gm = texture2D(uMask, vMapUv);
  float wid = gm.g * 4.0 - 0.5;
  gSel = vec4(step(abs(wid), 0.3), step(abs(wid - 1.0), 0.3), step(abs(wid - 2.0), 0.3), step(abs(wid - 3.0), 0.3)) * step(0.05, gm.g);
  gIcon = gm.r;
  diffuseColor.rgb *= 1.0 - gIcon * dot(gSel, uDim);`)
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n  totalEmissiveRadiance += uLime * gIcon * dot(gSel, uGlow);");
  };
  m.customProgramCacheKey = () => "iconGlow";
  return u;
};

export type ShieldOptions = { canvas: HTMLCanvasElement };
export type ShieldHandle = { setActive: (i: number) => void; dispose: () => void };

export const mountShield = async ({ canvas }: ShieldOptions): Promise<ShieldHandle> => {
  // на телефоне и слабом видеочипе — версия с текстурами вдвое меньше: в кадре щит всё равно невелик
  const small = isStill() || window.matchMedia("(max-width: 820px)").matches;
  const [model, mask] = await Promise.all([
    loadModel(small ? "/models/shield-sd.glb" : "/models/shield.glb"),
    new TextureLoader().loadAsync("/models/shield-glow.png"),
  ]);
  mask.flipY = false; mask.colorSpace = NoColorSpace; mask.generateMipmaps = false; mask.minFilter = LinearFilter; mask.magFilter = LinearFilter;

  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 1.25, 0.1, 80);
  const target = new Vector3(0, -0.08, 0.2);
  const light = rig(scene, group, { target, span: 3.4, rim: new Vector3(2.9, 1.4, -1.6), from: new Vector3(-0.9, 1.2, 0.8) });
  scene.environmentIntensity = 1.1;
  light.key.shadow.normalBias = 0.02;
  // холодный контровой слева: отделяет тёмный борт от фона
  const kicker = new PointLight(0xcfe4ff, 16, 16, 1.6);
  kicker.position.set(-4.6, 1.9, 2.0);
  group.add(kicker);
  group.add(model);

  // материал модели: один на корпус и кольцо; к нему — свечение значков
  const nodes: Record<string, Object3D> = {};
  const mats = new Set<MeshStandardMaterial>();
  model.traverse((o) => {
    if (o.name.startsWith("n_")) nodes[o.name] = o;
    if (o instanceof Mesh) {
      o.castShadow = true; o.receiveShadow = true;
      if (o.material instanceof MeshStandardMaterial) mats.add(o.material);
    }
  });
  const glows = [...mats].map((m) => iconGlow(m, mask));
  const dial = nodes.n_dial;
  const POINTER = Number(dial.userData.pointer ?? Math.PI / 4);
  const wells = [0, 1, 2, 3].map((i) => nodes[`n_well_${i}`].position.clone());

  const spot = glowMap();
  const halos = wells.map((w) => {
    const m = new Mesh(new PlaneGeometry(1.15, 1.15), new MeshBasicMaterial({ map: spot, color: HUE.lime, transparent: true, opacity: 0, blending: AdditiveBlending, premultipliedAlpha: true, depthWrite: false, toneMapped: false }));
    m.position.set(w.x, w.y, w.z + 0.08);
    group.add(m);
    return m;
  });
  // лаймовый отсвет от зажжённого значка на соседнем металле
  const lamp = new PointLight(HUE.lime, 0, 2.6, 1.8);
  lamp.position.set(wells[0].x, wells[0].y, 0.95);
  group.add(lamp);

  // метка кольца при нулевом повороте смотрит под углом POINTER; повернуть к окну i — разница углов
  const aimAt = (i: number) => Math.atan2(wells[i].y - dial.position.y, wells[i].x - dial.position.x) - POINTER;
  const on = [0, 0, 0, 0], dim = [0, 0, 0, 0];

  const ptr = pointer(canvas);
  const YAW = -0.5, ELEV = 0.12;
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0, active = -1, ang = -2.6, spin = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-W - 0.3, W + 0.3]) for (const y of [BOT - 0.22, TOP + 0.16]) for (const z of [-FRONT, FRONT + 0.05]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(ELEV), Math.cos(ELEV)), pts, [0.97, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0, step = Math.min(dt, 0.05);
    const k = 1 - Math.exp(-step * 7);
    // вход: щит поднимается и проявляется, значки по очереди вспыхивают, кольцо докручивается на место
    const rise = ease(age / 0.9);
    group.position.y = (1 - rise) * -0.35;
    group.scale.setScalar(0.9 + 0.1 * rise);
    let best = 0;
    for (let i = 0; i < 4; i++) {
      const sel = i === active && age > 1.1;
      const flash = Math.exp(-(((age - 0.55 - i * 0.16) / 0.16) ** 2)) * 0.9;
      on[i] += ((sel ? 1 : 0) - on[i]) * k;
      dim[i] += ((active >= 0 && !sel && age > 1.1 ? 0.74 : 0) - dim[i]) * k;
      if (on[i] > on[best]) best = i;
      (halos[i].material as MeshBasicMaterial).opacity = on[i] * 0.3;
      for (const g of glows) { g.uGlow.value.setComponent(i, on[i] * 1.15 + flash); g.uDim.value.setComponent(i, dim[i]); }
    }
    // кольцо диска: пружина с небольшим перелётом — доворот читается как работа механизма
    if (age > 0.4) {
      const goal = active >= 0 ? aimAt(active) : 0;
      let gap = goal - ang;
      gap -= Math.round(gap / (Math.PI * 2)) * Math.PI * 2;
      spin += (gap * 70 - spin * 10.5) * step;
      ang += spin * step;
    }
    dial.rotation.z = ang;
    lamp.position.lerp(new Vector3(wells[best].x, wells[best].y, 0.95), k);
    lamp.intensity = on[best] * 1.4;
    // тень пересчитывается, пока щит входит и пока поворачивается кольцо (оно отбрасывает тень на панели)
    if (age < 1.4 || Math.abs(spin) > 0.02) light.refresh();
    const kk = 1 - Math.exp(-step * 3);
    yaw += (Math.sin(age * 0.45) * 0.1 + ptr.p.nx * 0.12 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.11 - pitch) * kk;
    group.rotation.set(pitch, YAW + yaw, 0);
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame });
  return {
    setActive: (i) => { active = i; redraw(canvas); },
    dispose: () => {
      unmount(); ptr.off();
      model.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
      for (const m of mats) { for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap, m.emissiveMap]) t?.dispose(); m.dispose(); }
      for (const h of halos) { h.geometry.dispose(); (h.material as Material).dispose(); }
      spot.dispose(); mask.dispose();
      lamp.dispose(); kicker.dispose(); light.dispose();
    },
  };
};
