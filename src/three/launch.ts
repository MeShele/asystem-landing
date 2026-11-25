import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Scene, Vector3, type Material, type Object3D } from "three";
import { isStill } from "@/three/gpu";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, frameCamera, headAt, pointer, ribbon, shared, tags } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, HUE, metals, rig, sheen, solid } from "@/three/studio";

/**
 * «Запуск за четыре шага»: на общей плите четыре подиума со шкалой, слева направо — договор
 * (статуэтки ASystem и клиента жмут руки, над ними парит табличка с подписью и печатью), сервер
 * (стойка с огоньками и световой полосой), настройка (пульт с ползунками, ручкой и экраном)
 * и открытие (здание обменника со светом в окнах и золотой монетой биткоина).
 * Плита, подиумы и табличка сделаны в Blender (scripts/blender/launch.py). Предметы на подиумах
 * сгенерированы в Higgsfield — эскиз GPT Image 2.6, объём Tripo H3.1 (статуэтки, здание)
 * и Hunyuan3D v3 (стойка, пульт) — и ужаты scripts/blender/optimize.py: металл, рельеф и мелкие
 * детали лежат в их текстурах. Здесь — свет и движение: предметы встают на подиумы по очереди,
 * по пазу вдоль края ходит импульс, табличка парит, из двери и от стойки падает свет.
 */
const W = 12.2, D = 3.6, XS = [-4.28, -1.56, 1.06, 4.03], PZ = -0.15, PATH_Z = 1.5, PAD = 0.181, SPEED = 0.17;
const ITEMS = ["contract", "server", "console", "bank"];
/** высота предметов над подиумом — над ней стоят подписи шагов */
const TOPS = [2.46, 1.62, 1.68, 1.78];

export type LaunchOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[] };

export const mountLaunch = async ({ canvas, labels }: LaunchOptions): Promise<() => void> => {
  // на телефоне и слабом видеочипе — текстуры вдвое меньше: каждый предмет там шириной в палец
  const sd = isStill() || window.matchMedia("(max-width: 820px)").matches ? "-sd" : "";
  const [model, ...items] = await Promise.all([loadModel("/models/launch.glb"), ...ITEMS.map((k) => loadModel(`/models/launch-${k}${sd}.glb`))]);
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 2.4, 0.1, 90);
  const metal = metals();
  sheen(metal.shell, 0.03);
  sheen(metal.plate, 0.035);
  const target = new Vector3(0, 1.22, 0), axis = new Vector3(0, 1, 0);
  const light = rig(scene, group, { target: new Vector3(0, 0.6, 0), span: 7.4, rim: new Vector3(7.5, 5, -7.5) });
  scene.environmentIntensity = 1.2;
  light.rim.intensity *= 0.42;
  light.key.shadow.normalBias = 0.03;
  // холодный контровой слева отделяет тёмные предметы от фона; тёплый свет из двери и лаймовый от стойки ложатся на металл рядом
  const kicker = new PointLight(0xcfe4ff, 46, 40, 1.6);
  kicker.position.set(-9.5, 4.2, 5);
  const door = new PointLight(0xffb040, 0, 3.4, 1.7);
  door.position.set(XS[3], PAD + 0.55, PZ + 1.15);
  const strip = new PointLight(HUE.lime, 0, 2.6, 1.7);
  strip.position.set(XS[1] - 0.8, PAD + 0.95, PZ + 0.95);
  group.add(kicker, door, strip);
  const floor = catcher(W * 1.7, D * 3.2, -0.37, 0.5);
  group.add(floor);

  const { nodes, dispose: free } = adopt(model, metal as unknown as Record<string, Material>);
  group.add(model);
  const st = [0, 1, 2, 3].map((i) => nodes[`n_station_${i}`]);
  const board = nodes.n_board, boardY = board.position.y;
  solid(group);
  // предметы Higgsfield: со своими материалами, отбрасывают и принимают тень
  const owned = new Set<MeshStandardMaterial>();
  items.forEach((it, i) => {
    it.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return;
      o.castShadow = true; o.receiveShadow = true;
      if (o.material instanceof MeshStandardMaterial) owned.add(o.material);
    });
    st[i].add(it);
  });
  // парящая табличка тени не отбрасывает: иначе её покачивание заставляло бы пересчитывать тень всей сцены
  board.traverse((o) => { if (o instanceof Mesh) o.castShadow = false; });

  // импульс по пазу вдоль края плиты и огоньки в гнёздах шагов
  const X0 = XS[0] - 0.65, SPAN = XS[3] - XS[0] + 1.3;
  const path = ribbon(sh, [{ pts: Array.from({ length: 41 }, (_, i) => new Vector3(X0 + (i / 40) * SPAN, 0.014, PATH_Z)), phase: 0, speed: SPEED }], 0.3);
  group.add(path);
  const dotGeo = new CylinderGeometry(0.078, 0.078, 0.014, 24);
  const dots = XS.map((x) => { const m = new Mesh(dotGeo, metal.glowLime); m.position.set(x, 0.016, PATH_Z); group.add(m); return m; });

  const tag = tags(labels, XS.map((x, i) => new Vector3(x, PAD + TOPS[i] + 0.14, PZ)));

  const ptr = pointer(canvas);
  const back = (x: number) => { const c = Math.max(0, Math.min(1, x)); return 1 + 2.4 * Math.pow(c - 1, 3) + 1.4 * Math.pow(c - 1, 2); };   // лёгкий перелёт в конце
  // На узком экране плита стоит по диагонали и целиком: ближний план с переездами от шага к шагу
  // резал её краем телефона, и это читалось как ошибка вёрстки.
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5, tagged = !!labels[0] && labels[0].offsetParent !== null;
      const el = narrow ? 0.5 : 0.33;
      yaw0 = narrow ? -0.95 : -0.1;
      target.y = narrow ? 0.9 : tagged ? 1.22 : 1.0;
      // широкий кадр — с запасом сверху под подписи шагов, если они показаны; узкий — с полями от краёв экрана
      const top = narrow ? 2.6 : tagged ? 3.05 : 2.55;
      const pts: Vector3[] = [];
      for (const x of [-W / 2 - 0.15, W / 2 + 0.15]) for (const z of [-D / 2, D / 2]) for (const y of [-0.37, top]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(el), Math.cos(el)), pts, narrow ? [0.9, 0.92, 0.92] : [0.97, 0.96, 0.95]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    path.material.uniforms.uRes.value.set(size.w, size.h);
    // предметы встают на подиумы по одному; проходящий импульс слегка «подбрасывает» тот, мимо которого идёт
    const head = headAt(age, 0, SPEED);
    st.forEach((g, i) => {
      const k = back((age - 0.3 - i * 0.45) / 0.9), d = head - (XS[i] - X0) / SPAN;
      const hot = (d > 0 ? Math.exp(-d * 9) : 0) * ease((age - 2.6) / 0.5);
      g.visible = age > 0.3 + i * 0.45;
      g.scale.setScalar(Math.max(0.001, k) * (1 + hot * 0.025));
      dots[i].scale.setScalar(1 + hot * 0.9);
    });
    // табличка договора парит над рукопожатием и едва покачивается; световая полоса стойки дышит
    board.position.y = boardY + Math.sin(age * 1.1) * 0.035;
    board.rotation.y = Math.sin(age * 0.6) * 0.1;
    door.intensity = 3.2 * ease((age - 2.0) / 0.8);
    strip.intensity = (1.3 + Math.sin(age * 2.2) * 0.35) * ease((age - 1.1) / 0.8);
    // тень: пока предметы встают — каждый кадр, дальше изредка
    if (age < 4.4 || ++ticks % 40 === 0) light.refresh();
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.035 + ptr.p.nx * 0.07 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.03 - pitch) * kk;
    group.rotation.set(pitch, yaw0 + yaw, 0);
    group.updateMatrixWorld();
    tag.place(group, camera, size, ease((age - 2.2) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    free(); dotGeo.dispose();
    for (const it of items) it.traverse((o) => { if (o instanceof Mesh) o.geometry.dispose(); });
    for (const m of owned) { for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap, m.emissiveMap]) t?.dispose(); m.dispose(); }
    floor.geometry.dispose(); (floor.material as Material).dispose();
    path.geometry.dispose(); path.material.dispose();
    kicker.dispose(); door.dispose(); strip.dispose();
    light.dispose(); metal.dispose();
  };
};
