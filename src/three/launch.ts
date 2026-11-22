import { CylinderGeometry, Group, Mesh, PerspectiveCamera, Scene, Vector3, type Material } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { beam, ease, fonts, FONT, frameCamera, headAt, HEX, pointer, ribbon, shared, tags } from "@/three/kit";
import { adopt, loadModel } from "@/three/models";
import { catcher, materials, rig, screen, solid } from "@/three/studio";

/**
 * «Запуск за четыре шага» — четыре остановки на одной площадке, слева направо:
 * договор (ASystem и клиент жмут руки, за ними планшет с договором), сервер (стойка с огоньками),
 * настройка (пульт с экраном) и открытие (здание обменника с колоннами и золотой монетой биткоина).
 * Модель сделана в Blender (scripts/blender/launch.py); здесь — материалы, свет и движение:
 * остановки вырастают по очереди, по кромке площадки ходит импульс, руки качаются, огоньки мигают.
 */
const W = 12.2, D = 3.3, T = 0.22, XS = [-4.6, -1.75, 1.15, 4.3], PATH_Z = 1.36, SPEED = 0.17, PAD = 0.07;
const SCALE = [1.5, 1.2, 1.25, 1.18];

/** экран пульта: ползунки, переключатели, цвета бренда, валюта */
const consoleScreen = () => screen(1430, 880, (c, w, h) => {
  c.fillStyle = "#07100a"; c.beginPath(); c.roundRect(0, 0, w, h, 34); c.fill();
  for (let i = 0; i < 3; i++) {
    const y = 190 + i * 170, at = [0.62, 0.34, 0.78][i];
    c.strokeStyle = "rgba(219,242,230,0.28)"; c.lineWidth = 16; c.beginPath(); c.moveTo(110, y); c.lineTo(690, y); c.stroke();
    c.strokeStyle = HEX.lime; c.beginPath(); c.moveTo(110, y); c.lineTo(110 + 580 * at, y); c.stroke();
    c.fillStyle = HEX.lime; c.beginPath(); c.arc(110 + 580 * at, y, 34, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#07100a"; c.beginPath(); c.arc(110 + 580 * at, y, 13, 0, Math.PI * 2); c.fill();
  }
  for (let i = 0; i < 3; i++) {
    const y = 150 + i * 170, on = i !== 1;
    c.fillStyle = on ? HEX.amber : "rgba(219,242,230,0.22)"; c.beginPath(); c.roundRect(850, y, 170, 82, 41); c.fill();
    c.fillStyle = on ? "#1a1203" : HEX.ice; c.beginPath(); c.arc(on ? 979 : 891, y + 41, 29, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(219,242,230,0.5)"; c.lineWidth = 15; c.beginPath(); c.moveTo(1070, y + 41); c.lineTo(i === 2 ? 1230 : 1310, y + 41); c.stroke();
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
  const mat = materials();
  const pad = mat.graphite.clone(); pad.color.set(0x2a3035);
  const stone = mat.ice.clone(); stone.color.set(0xdfe6e1);
  const ui = consoleScreen();
  const target = new Vector3(0, 1.2, 0), axis = new Vector3(0, 1, 0);
  const light = rig(scene, group, { target: new Vector3(0, 0.6, 0), span: 7.4, rim: new Vector3(7.5, 5, -7.5) });
  const floor = catcher(W * 1.7, D * 3.2, -T - 0.01, 0.5);
  group.add(floor);

  const { nodes, dispose: free } = adopt(model, { ...mat, pad, stone, screen: ui.material } as unknown as Record<string, Material>, ["screen"]);
  group.add(model);
  const st = [0, 1, 2, 3].map((i) => nodes[`n_station_${i}`]);
  const arms = [nodes.n_arm_a, nodes.n_arm_b], leds = [0, 1, 2].map((i) => nodes[`n_leds_${i}`]);
  const glow = beam(sh, new Vector3(0, 2.27, -0.14), 1.25, 1.3);
  glow.renderOrder = 3;
  st[3].add(glow);
  solid(group);

  // импульс по кромке площадки и отметки остановок на ней
  const X0 = -W / 2 + 0.35, SPAN = W - 0.7;
  const path = ribbon(sh, [{ pts: Array.from({ length: 41 }, (_, i) => new Vector3(X0 + (i / 40) * SPAN, 0.012, PATH_Z)), phase: 0, speed: SPEED }], 0.3);
  group.add(path);
  const dotGeo = new CylinderGeometry(0.1, 0.1, 0.03, 24);
  const dots = XS.map((x) => { const m = new Mesh(dotGeo, mat.glowLime); m.position.set(x, 0.015, PATH_Z); group.add(m); return m; });

  const TOPS = [1.28, 1.86, 1.86, 2.32];
  const tag = tags(labels, XS.map((x, i) => new Vector3(x, PAD + TOPS[i] * SCALE[i] + 0.14, -0.2)));

  const ptr = pointer(canvas);
  const back = (x: number) => { const c = Math.max(0, Math.min(1, x)); return 1 + 2.4 * Math.pow(c - 1, 3) + 1.4 * Math.pow(c - 1, 2); };   // лёгкий перелёт в конце
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0, ticks = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5, el = narrow ? 0.5 : 0.36;
      yaw0 = narrow ? -0.95 : -0.1;
      const pts: Vector3[] = [];
      for (const x of [-W / 2 - 0.15, W / 2 + 0.15]) for (const z of [-D / 2, D / 2]) for (const y of [-T, narrow ? 2.9 : 3.8]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(el), Math.cos(el)), pts, [0.97, 0.96, 0.95]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    path.material.uniforms.uRes.value.set(size.w, size.h);
    // остановки вырастают по одной; проходящий импульс слегка «подбрасывает» ту, мимо которой идёт
    const head = headAt(age, 0, SPEED);
    st.forEach((g, i) => {
      const k = back((age - 0.3 - i * 0.45) / 0.9), d = head - (XS[i] - X0) / SPAN;
      const hot = (d > 0 ? Math.exp(-d * 9) : 0) * ease((age - 2.6) / 0.5);
      g.visible = age > 0.3 + i * 0.45;
      g.scale.setScalar(SCALE[i] * Math.max(0.001, k) * (1 + hot * 0.03));
      dots[i].scale.setScalar(1 + hot * 0.9);
    });
    // рукопожатие: руки качаются короткими сериями; огоньки стойки мигают вразнобой
    const shake = Math.sin(age * 9) * 0.07 * Math.max(0, Math.sin(age * 0.9));
    for (const a of arms) a.rotation.x = shake;
    leds.forEach((m, i) => { m.visible = Math.sin(age * (1.7 + i * 1.3) + i * 2.1) > -0.6; });
    // тень: пока остановки вырастают — каждый кадр, дальше изредка (руки качаются едва заметно)
    if (age < 4.4 || ++ticks % 40 === 0) light.refresh();
    glow.material.uniforms.uGain.value = 1.3 * ease((age - 2.4) / 0.6);
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.035 + ptr.p.nx * 0.07 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.03 - pitch) * kk;
    group.rotation.set(pitch, yaw0 + yaw, 0);
    group.updateMatrixWorld();
    glow.rotation.y = -(yaw0 + yaw);
    tag.place(group, camera, size, ease((age - 2.2) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 2, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    free(); ui.dispose(); pad.dispose(); stone.dispose(); dotGeo.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    glow.geometry.dispose(); glow.material.dispose();
    path.geometry.dispose(); path.material.dispose();
    light.dispose(); mat.dispose();
  };
};
