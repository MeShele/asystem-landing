import { Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, Vector3, type Material, type Object3D } from "three";
import { isStill } from "@/three/gpu";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, fonts, FONT, frameCamera, HEX, pointer } from "@/three/kit";
import { loadModel } from "@/three/models";
import { catcher, metals, rig, screen } from "@/three/studio";

/**
 * «Сделка без сотрудника» как механизм: корпус с шестернями, которые крутятся сами, и две ленты.
 * По ближней дорожке слева направо идёт покупка: сомы заезжают к корпусу, с другой стороны выезжает
 * крипта. По дальней дорожке справа налево — продажа. Человека в сцене нет.
 * Корпус, шестерни и ленты сгенерированы в Higgsfield (эскизы GPT Image 2.6 → 3D Tripo H3.1) и собраны
 * в Blender (scripts/blender/rig_gears.py): шестерни стоят в зацеплении — у малых подогнан шаг зубьев,
 * в точке касания зуб большой входит во впадину малой. Монеты точёные: сом — серебро со знаком «с»,
 * биткоин — золото. Числа раскладки (зубья, высота лент) — в extras узла n_rig.
 */
const LANE = 0.24;

/** табло на фасаде корпуса: пара валют, как на монетах */
const display = () => screen(1100, 260, (c, w, h) => {
  c.fillStyle = "#040806"; c.fillRect(0, 0, w, h);
  c.font = FONT(96); c.textBaseline = "middle";
  c.textAlign = "right"; c.fillStyle = HEX.ice; c.fillText("KGS", w / 2 - 100, h / 2 + 6);
  c.textAlign = "left"; c.fillStyle = HEX.amber; c.fillText("BTC", w / 2 + 100, h / 2 + 6);
  c.strokeStyle = HEX.lime; c.lineWidth = 12; c.lineCap = "round"; c.lineJoin = "round";
  for (const [y, dir] of [[h / 2 - 22, 1], [h / 2 + 22, -1]]) {
    c.beginPath(); c.moveTo(w / 2 - 56, y); c.lineTo(w / 2 + 56, y); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + dir * 56 - dir * 22, y - 18); c.lineTo(w / 2 + dir * 56, y); c.lineTo(w / 2 + dir * 56 - dir * 22, y + 18); c.stroke();
  }
}, false);

export const mountGears = async ({ canvas }: { canvas: HTMLCanvasElement }): Promise<() => void> => {
  // на телефоне и слабом видеочипе — текстуры вдвое меньше
  const small = isStill() || window.matchMedia("(max-width: 820px)").matches;
  const [model] = await Promise.all([loadModel(small ? "/models/gears-sd.glb" : "/models/gears.glb"), fonts()]);
  const scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 2.4, 0.1, 80);
  const metal = metals();
  const board = display();
  const target = new Vector3(0, 0.75, 0);
  const light = rig(scene, group, { target, span: 7, rim: new Vector3(4.5, 3, -5) });
  scene.environmentIntensity = 1.15;
  light.rim.intensity *= 0.5;
  light.key.shadow.normalBias = 0.03;
  const floor = catcher(16, 9, -0.01, 0.5);
  group.add(floor);
  group.add(model);

  // узлы и материалы: детали Higgsfield — со своими текстурами, монеты и табло — из набора сайта
  const nodes: Record<string, Object3D> = {};
  const owned = new Set<MeshStandardMaterial>();
  const named: Record<string, Material> = { silver: metal.trim, gold: metal.gold, screen: board.material };
  model.traverse((o) => {
    if (o.name.startsWith("n_")) nodes[o.name] = o;
    if (!(o instanceof Mesh)) return;
    const name = (o.material as Material).name.replace(/\.\d+$/, "");
    if (named[name]) { (o.material as Material).dispose(); o.material = named[name]; }
    else if (o.material instanceof MeshStandardMaterial) owned.add(o.material);
    o.castShadow = name !== "screen"; o.receiveShadow = true;
  });
  // крышка корпуса: в текстуре генератора на шлифовке остались белые пятна-засветы — срезаем самые светлые
  // места цвета и не даём металлу стать зеркальным, тогда пятна не бликуют
  const shell = (nodes.n_housing as Mesh).material as MeshStandardMaterial;
  shell.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader
      .replace("#include <map_fragment>", "#include <map_fragment>\n  diffuseColor.rgb = min(diffuseColor.rgb, vec3(0.46));")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = max(roughnessFactor, 0.34);");
  };
  shell.customProgramCacheKey = () => "gearsShell";
  const info = nodes.n_rig.userData as { teeth_big: number; teeth_small: number; belt_top: number; belt_x0: number; belt_x1: number; housing_top: number; housing_depth: number };
  const N1 = info.teeth_big, N2 = info.teeth_small;
  // колёса в зацеплении: малые крутятся навстречу большому и быстрее во столько раз, во сколько у них меньше зубьев;
  // левая малая развёрнута на пол-оборота — в её точке касания тоже должен стоять зуб
  const wheels = [
    { holder: nodes.n_gear_0, dir: 1, phase: 0 },
    { holder: nodes.n_gear_1, dir: -N1 / N2, phase: 0 },
    { holder: nodes.n_gear_2, dir: -N1 / N2, phase: Math.PI },
  ];
  // монеты: образцы размножаются по три на каждый отрезок каждой дорожки; слева сомы, справа крипта
  const protos: Record<string, Object3D> = { som: nodes.n_coin_som, btc: nodes.n_coin_btc };
  const X0 = info.belt_x0, X1 = info.belt_x1, Y = info.belt_top, SPAN = X1 - X0 - 0.5;
  const coins: { holder: Object3D; lane: number; side: number; slot: number }[] = [];
  for (const lane of [1, -1]) for (const side of [-1, 1]) for (let slot = 0; slot < 3; slot++) {
    const holder = protos[side === -1 ? "som" : "btc"].clone();
    group.add(holder);
    coins.push({ holder, lane, side, slot });
  }
  for (const p of Object.values(protos)) p.removeFromParent();

  const ptr = pointer(canvas);
  const D = info.housing_depth;
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5;
      yaw0 = narrow ? -0.9 : -0.12;
      const pts: Vector3[] = [];
      for (const x of [-X1 - 0.2, X1 + 0.2]) for (const z of [-D / 2, D / 2]) for (const y of [0, info.housing_top + 0.7]) pts.push(new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(narrow ? 0.6 : 0.66), Math.cos(narrow ? 0.6 : 0.66)), pts, [0.97, 0.94, 0.94]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    // сцена вырастает из точки; колёса раскручиваются и дальше идут ровно
    group.scale.setScalar(0.86 + 0.14 * ease(age / 0.8));
    const run = Math.max(0, age - 0.3), turn = (run - 1.2 * (1 - Math.exp(-run / 1.2))) * 0.45;
    for (const g of wheels) g.holder.rotation.y = turn * g.dir + g.phase;
    // монеты едут по дорожкам: ближняя вправо, дальняя влево; у корпуса и на краю ленты уходят в ноль
    for (const c of coins) {
      const p = (((age * 0.11 + c.slot / 3) % 1) + 1) % 1, along = c.lane > 0 ? p : 1 - p;
      const x = X0 + 0.25 + along * SPAN;
      c.holder.position.set(c.side < 0 ? -X1 + (x - X0) : x, Y + 0.004, c.lane * LANE);
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
    model.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
    for (const c of coins) c.holder.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
    for (const m of owned) { for (const tx of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap, m.emissiveMap]) tx?.dispose(); m.dispose(); }
    board.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    light.dispose(); metal.dispose();
  };
};
