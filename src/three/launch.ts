import { CylinderGeometry, Group, Mesh, MeshPhysicalMaterial, PerspectiveCamera, PointLight, Scene, Vector3, type Material } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { ease, fonts, FONT, frameCamera, headAt, HEX, pointer, ribbon, shared, tags } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, HUE, metals, rig, screen, sheen, solid } from "@/three/studio";

/**
 * «Запуск за четыре шага» — в том же языке, что щит: тёмные точёные предметы, цвет приходит от света.
 * На общей плите четыре подиума со шкалой, слева направо: договор (две статуэтки жмут руки, над
 * ними парит табличка с подписью и печатью), сервер (стойка с огоньками и световой полосой), настройка
 * (пульт с ползунками, ручкой и экраном) и открытие (здание обменника со светящимися окнами
 * и золотой монетой биткоина). Модель сделана в Blender (scripts/blender/launch.py); здесь — металл,
 * свет и движение: предметы встают на подиумы по очереди, по пазу вдоль края ходит импульс,
 * руки качаются, огоньки мигают, ручка пульта подкручивается.
 */
const W = 12.2, D = 3.6, XS = [-4.28, -1.56, 1.06, 4.03], PZ = -0.15, PATH_Z = 1.5, PAD = 0.181, SPEED = 0.17;
/** высота предметов над подиумом — над ней стоят подписи шагов */
const TOPS = [2.26, 1.88, 1.7, 1.92];

/** экран пульта: ползунки, переключатели, цвета бренда, валюта */
const consoleScreen = () => screen(1430, 880, (c, w, h) => {
  c.fillStyle = "#050a07"; c.beginPath(); c.roundRect(0, 0, w, h, 34); c.fill();
  for (let i = 0; i < 3; i++) {
    const y = 190 + i * 170, at = [0.62, 0.34, 0.78][i];
    c.strokeStyle = "rgba(219,242,230,0.24)"; c.lineWidth = 14; c.beginPath(); c.moveTo(110, y); c.lineTo(690, y); c.stroke();
    c.strokeStyle = HEX.lime; c.beginPath(); c.moveTo(110, y); c.lineTo(110 + 580 * at, y); c.stroke();
    c.fillStyle = HEX.lime; c.beginPath(); c.arc(110 + 580 * at, y, 32, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#050a07"; c.beginPath(); c.arc(110 + 580 * at, y, 12, 0, Math.PI * 2); c.fill();
  }
  for (let i = 0; i < 3; i++) {
    const y = 150 + i * 170, on = i !== 1;
    c.fillStyle = on ? HEX.amber : "rgba(219,242,230,0.2)"; c.beginPath(); c.roundRect(850, y, 170, 82, 41); c.fill();
    c.fillStyle = on ? "#1a1203" : HEX.ice; c.beginPath(); c.arc(on ? 979 : 891, y + 41, 29, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(219,242,230,0.45)"; c.lineWidth = 14; c.beginPath(); c.moveTo(1070, y + 41); c.lineTo(i === 2 ? 1230 : 1310, y + 41); c.stroke();
  }
  [HEX.lime, HEX.amber, HEX.ice].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.roundRect(850 + i * 112, 680, 84, 84, 18); c.fill(); });
  c.fillStyle = HEX.ice; c.font = FONT(74, 500); c.textBaseline = "middle"; c.fillText("KGS", 110, 724);
}, false);

export type LaunchOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[] };

export const mountLaunch = async ({ canvas, labels }: LaunchOptions): Promise<() => void> => {
  const [model] = await Promise.all([loadModel("/models/launch.glb"), fonts()]);
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 2.4, 0.1, 90);
  const metal = metals();
  // статуэтки: ASystem — тёмная под лаком, клиент — светлая сталь
  const statueA = new MeshPhysicalMaterial({ color: 0x2c343a, roughness: 0.26, metalness: 1, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const statueB = new MeshPhysicalMaterial({ color: 0xbcc5c9, roughness: 0.3, metalness: 1 });
  sheen(metal.shell, 0.03);
  sheen(metal.plate, 0.035);
  const ui = consoleScreen();
  const target = new Vector3(0, 1.22, 0), axis = new Vector3(0, 1, 0);
  const light = rig(scene, group, { target: new Vector3(0, 0.6, 0), span: 7.4, rim: new Vector3(7.5, 5, -7.5) });
  scene.environmentIntensity = 1.25;
  light.rim.intensity *= 0.42;
  // холодный контровой слева отделяет тёмные предметы от фона; тёплый свет из двери и лаймовый от стойки ложатся на металл рядом
  const kicker = new PointLight(0xcfe4ff, 46, 40, 1.6);
  kicker.position.set(-9.5, 4.2, 5);
  const door = new PointLight(0xffb040, 0, 3.4, 1.7);
  door.position.set(XS[3], PAD + 0.5, PZ + 1.0);
  const strip = new PointLight(HUE.lime, 0, 2.6, 1.7);
  strip.position.set(XS[1] - 0.72, PAD + 1.0, PZ + 0.85);
  group.add(kicker, door, strip);
  const floor = catcher(W * 1.7, D * 3.2, -0.37, 0.5);
  group.add(floor);

  const { nodes, dispose: free } = adopt(model, { ...metal, statue_a: statueA, statue_b: statueB, screen: ui.material } as unknown as Record<string, Material>, ["screen"]);
  group.add(model);
  const st = [0, 1, 2, 3].map((i) => nodes[`n_station_${i}`]);
  const arms = [nodes.n_arm_a, nodes.n_arm_b], leds = [0, 1, 2].map((i) => nodes[`n_leds_${i}`]), knob = nodes.n_knob;
  const board = nodes.n_board, boardY = board.position.y;
  solid(group);
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
    // рукопожатие: руки качаются короткими сериями; огоньки стойки мигают вразнобой; ручку пульта подкручивают
    const shake = Math.sin(age * 9) * 0.07 * Math.max(0, Math.sin(age * 0.9));
    for (const a of arms) a.rotation.x = shake;
    leds.forEach((m, i) => { m.visible = Math.sin(age * (1.7 + i * 1.3) + i * 2.1) > -0.6; });
    knob.rotation.y = Math.sin(age * 0.7) * 1.1 + Math.sin(age * 0.23) * 0.5;
    // табличка договора парит над рукопожатием и едва покачивается
    board.position.y = boardY + Math.sin(age * 1.1) * 0.035;
    board.rotation.y = Math.sin(age * 0.6) * 0.1;
    // свет из двери и от стойки включается вместе со своим предметом
    door.intensity = 3.2 * ease((age - 2.0) / 0.8);
    strip.intensity = 1.5 * ease((age - 1.1) / 0.8);
    // тень: пока предметы встают — каждый кадр, дальше изредка (руки качаются едва заметно)
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
    free(); ui.dispose(); statueA.dispose(); statueB.dispose(); dotGeo.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    path.geometry.dispose(); path.material.dispose();
    kicker.dispose(); door.dispose(); strip.dispose();
    light.dispose(); metal.dispose();
  };
};
