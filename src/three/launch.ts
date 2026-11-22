import { CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Group, Mesh, PerspectiveCamera, PlaneGeometry, Scene, Shape, SphereGeometry, TorusGeometry, TubeGeometry, Vector3, type BufferGeometry, type Material } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { beam, ease, fonts, FONT, frameCamera, headAt, HEX, nap, pointer, ribbon, shared, tags } from "@/three/kit";
import { ICON } from "@/three/icons";
import { figure } from "@/three/figure";
import { box, catcher, iconSolid, many, materials, rig, screen, solid } from "@/three/studio";

/**
 * «Запуск за четыре шага» — четыре остановки на одной площадке, слева направо:
 * договор (ASystem и клиент жмут руки, за ними подписанный лист), сервер (стойка с огоньками),
 * настройка (пульт с экраном) и открытие (здание обменника с колоннами и золотой монетой
 * биткоина на фронтоне). Объёмные тела со светом и тенью. Остановки вырастают по очереди,
 * дальше по кромке площадки ходит импульс, и остановка, мимо которой он идёт, слегка оживает.
 */
const W = 12.2, D = 3.3, T = 0.22, XS = [-4.6, -1.75, 1.15, 4.3], PATH_Z = 1.36, SPEED = 0.17, PAD = 0.07;
const SCALE = [1.5, 1.2, 1.25, 1.18];

/** экран пульта: ползунки, переключатели, цвета бренда, валюта */
const consoleScreen = () => screen(1430, 880, (c, w, h) => {
  c.fillStyle = "#07100a"; c.beginPath(); c.roundRect(0, 0, w, h, 34); c.fill();
  // ползунки
  for (let i = 0; i < 3; i++) {
    const y = 190 + i * 170, at = [0.62, 0.34, 0.78][i];
    c.strokeStyle = "rgba(219,242,230,0.28)"; c.lineWidth = 16; c.beginPath(); c.moveTo(110, y); c.lineTo(690, y); c.stroke();
    c.strokeStyle = HEX.lime; c.beginPath(); c.moveTo(110, y); c.lineTo(110 + 580 * at, y); c.stroke();
    c.fillStyle = HEX.lime; c.beginPath(); c.arc(110 + 580 * at, y, 34, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#07100a"; c.beginPath(); c.arc(110 + 580 * at, y, 13, 0, Math.PI * 2); c.fill();
  }
  // переключатели
  for (let i = 0; i < 3; i++) {
    const y = 150 + i * 170, on = i !== 1;
    c.fillStyle = on ? HEX.amber : "rgba(219,242,230,0.22)"; c.beginPath(); c.roundRect(850, y, 170, 82, 41); c.fill();
    c.fillStyle = on ? "#1a1203" : HEX.ice; c.beginPath(); c.arc(on ? 979 : 891, y + 41, 29, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(219,242,230,0.5)"; c.lineWidth = 15; c.beginPath(); c.moveTo(1070, y + 41); c.lineTo(i === 2 ? 1230 : 1310, y + 41); c.stroke();
  }
  // цвета бренда и валюта
  [HEX.lime, HEX.amber, HEX.ice].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.roundRect(850 + i * 112, 680, 84, 84, 18); c.fill(); });
  c.fillStyle = HEX.ice; c.font = FONT(74, 500); c.textBaseline = "middle"; c.fillText("KGS", 110, 724);
});

export type LaunchOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[] };

export const mountLaunch = async ({ canvas, labels }: LaunchOptions): Promise<() => void> => {
  await fonts();
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 2.4, 0.1, 90);
  const mat = materials();
  const pad = mat.graphite.clone(); pad.color.set(0x272d32);
  const stone = mat.ice.clone(); stone.color.set(0xdfe6e1);
  const owned: { dispose: () => void }[] = [pad, stone];
  const keep = <G extends { dispose: () => void }>(g: G) => { owned.push(g); return g; };
  const st = XS.map((x, i) => { const g = new Group(); g.position.set(x, PAD, 0); g.scale.setScalar(SCALE[i]); group.add(g); return g; });
  const put = (parent: Group, geo: BufferGeometry, m: Material, x = 0, y = 0, z = 0) => { const mesh = new Mesh(keep(geo), m); mesh.position.set(x, y, z); parent.add(mesh); return mesh; };

  const target = new Vector3(0, 1.2, 0), axis = new Vector3(0, 1, 0);
  const light = rig(scene, group, { target: new Vector3(0, 0.6, 0), span: 7.4, rim: new Vector3(7.5, 5, -7.5) });
  const floor = catcher(W * 1.7, D * 3.2, -T - 0.01, 0.5);
  group.add(floor);

  // площадка и постаменты остановок
  put(group, box(W, T, D, 0.09), mat.graphite, 0, -T / 2, 0);
  XS.forEach((x, i) => put(group, box(i === 3 ? 3.6 : 2.6, PAD, 2.5, 0.03), pad, x, PAD / 2, -0.2));
  await nap();

  // 1 — договор: две фигуры жмут руки, за ними лист с подписями
  const dark = mat.dark;
  const a = figure({ suit: mat.lime, legs: mat.graphite, skin: mat.skin, shoe: dark });
  const b = figure({ suit: mat.ice, legs: mat.graphite, skin: mat.skin, shoe: dark });
  a.group.position.set(-0.42, 0, 0.32); a.group.rotation.y = Math.PI / 2;
  b.group.position.set(0.42, 0, 0.32); b.group.rotation.y = -Math.PI / 2;
  st[0].add(a.group, b.group);
  owned.push(a, b);
  const sheet = new Group();
  sheet.position.set(0, 0.64, -0.58); sheet.rotation.x = -0.1;
  st[0].add(sheet);
  put(sheet, box(0.88, 1.14, 0.035, 0.03), mat.ice);
  put(sheet, iconSolid(ICON.handshake, 0.3, 0.013), mat.lime, 0, 0.33, 0.022);
  for (let i = 0; i < 4; i++) put(sheet, box(i === 3 ? 0.36 : 0.64, 0.028, 0.012, 0.005), dark, i === 3 ? -0.14 : 0, 0.08 - i * 0.085, 0.02);
  for (const x of [-0.2, 0.2]) {
    const pts = Array.from({ length: 9 }, (_, i) => new Vector3(x - 0.12 + i * 0.03, -0.36 + (i % 2 ? 0.035 : -0.03) * (i === 0 || i === 8 ? 0.3 : 1), 0.022));
    put(sheet, new TubeGeometry(new CatmullRomCurve3(pts), 40, 0.009, 8), mat.gold);
  }
  await nap();

  // 2 — сервер: стойка с блоками и огоньками, рядом блок питания
  const RX = -0.12, RZ = -0.15, FRONT = RZ + 0.45;
  put(st[1], box(1.0, 1.76, 0.9, 0.05), mat.graphite, RX, 0.88, RZ);
  put(st[1], box(0.84, 1.56, 0.03, 0.02), dark, RX, 0.88, FRONT);
  // блоки, прорези и огоньки собраны в несколько тел: огоньки — тремя группами, каждая мигает сама
  const units: [number, number, number][] = [], slots: [number, number, number][] = [], lamps: [number, number, number][][] = [[], [], []];
  for (let u = 0; u < 7; u++) {
    const y = 0.26 + u * 0.207;
    units.push([RX, y, FRONT + 0.03]);
    for (let d = 0; d < 2; d++) lamps[(u * 2 + d) % 5 === 3 ? 2 : (u + d) % 2].push([RX - 0.3 + d * 0.075, y, FRONT + 0.058]);
    for (let v = 0; v < 7; v++) slots.push([RX - 0.06 + v * 0.055, y, FRONT + 0.056]);
  }
  put(st[1], many(box(0.76, 0.165, 0.05, 0.02), units), pad);
  put(st[1], many(box(0.022, 0.1, 0.012, 0.004), slots), dark);
  const leds = lamps.map((at, i) => put(st[1], many(new SphereGeometry(0.024, 14, 10), at), i === 2 ? mat.glowAmber : mat.glowLime));
  put(st[1], box(0.5, 0.56, 0.62, 0.05), mat.graphite, 0.74, 0.28, 0.1);
  put(st[1], box(0.3, 0.035, 0.02, 0.008), mat.glowAmber, 0.74, 0.42, 0.415);
  await nap();

  // 3 — настройка: пульт с экраном и клавиатурой
  put(st[2], box(1.2, 0.5, 0.72, 0.05), mat.graphite, 0, 0.25, -0.12);
  put(st[2], box(0.14, 0.32, 0.1, 0.03), mat.steel, 0, 0.64, -0.3);
  const monitor = new Group();
  monitor.position.set(0, 1.24, -0.26); monitor.rotation.x = -0.14;
  st[2].add(monitor);
  put(monitor, box(1.56, 1.0, 0.07, 0.05), mat.graphite);
  const ui = keep(consoleScreen());
  put(monitor, new PlaneGeometry(1.43, 0.88), ui.material, 0, 0, 0.037);
  put(st[2], box(0.74, 0.035, 0.26, 0.014), dark, 0, 0.515, 0.03);
  put(st[2], box(0.62, 0.012, 0.03, 0.005), mat.glowLime, 0, 0.535, 0.1);
  await nap();

  // 4 — открытие: здание с колоннами, на фронтоне золотая монета биткоина
  const BW = 2.1, BH = 1.05, Y0 = 0.2;
  put(st[3], box(2.8, 0.1, 2.05, 0.03), stone, 0, 0.05, -0.05);
  put(st[3], box(2.6, 0.1, 1.85, 0.03), stone, 0, 0.15, -0.1);
  put(st[3], box(BW, BH, 1.25, 0.03), mat.graphite, 0, Y0 + BH / 2, -0.3);
  const FZ = -0.3 + 0.625;
  put(st[3], box(0.44, 0.78, 0.03, 0.02), dark, 0, Y0 + 0.39, FZ + 0.005);
  put(st[3], box(0.02, 0.74, 0.012, 0.004), mat.glowAmber, 0, Y0 + 0.39, FZ + 0.024);
  for (const x of [-0.67, 0.67]) {
    put(st[3], box(0.3, 0.52, 0.02, 0.03), mat.glowAmber, x, Y0 + 0.56, FZ + 0.006);
    put(st[3], box(0.02, 0.52, 0.012, 0.004), dark, x, Y0 + 0.56, FZ + 0.018);
    put(st[3], box(0.3, 0.02, 0.012, 0.004), dark, x, Y0 + 0.6, FZ + 0.018);
  }
  const COLS = [-0.98, -0.36, 0.36, 0.98];
  put(st[3], many(new CylinderGeometry(0.075, 0.086, BH - 0.1, 28), COLS.map((x) => [x, Y0 + BH / 2, 0.55])), stone);
  put(st[3], many(box(0.23, 0.05, 0.23, 0.014), COLS.flatMap((x) => [[x, Y0 + 0.025, 0.55], [x, Y0 + BH - 0.025, 0.55]] as [number, number, number][])), stone);
  put(st[3], box(2.46, 0.14, 1.76, 0.03), stone, 0, Y0 + BH + 0.07, -0.14);
  const gable = new Shape();
  gable.moveTo(-1.27, 0); gable.lineTo(1.27, 0); gable.lineTo(0, 0.66); gable.closePath();
  const GY = Y0 + BH + 0.14, GZ = -0.14 + 0.88;
  put(st[3], new ExtrudeGeometry(gable, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelOffset: -0.03, bevelSegments: 4 }).translate(0, 0, -1.73), mat.lime, 0, GY, GZ);
  const coin = new Group();
  coin.position.set(0, GY + 0.25, GZ + 0.012);
  st[3].add(coin);
  put(coin, new CylinderGeometry(0.2, 0.2, 0.05, 48).rotateX(Math.PI / 2), mat.gold);
  put(coin, new TorusGeometry(0.19, 0.016, 12, 56), mat.gold, 0, 0, 0.025);
  put(coin, iconSolid(ICON.bitcoin, 0.27, 0.014), mat.ink, 0, 0, 0.028);
  const glow = beam(sh, new Vector3(0, GY + 0.66, -0.14), 1.25, 1.3);
  glow.renderOrder = 3;
  st[3].add(glow);
  solid(group);
  await nap();

  // импульс по кромке площадки и отметки остановок на ней
  const X0 = -W / 2 + 0.35, SPAN = W - 0.7;
  const path = ribbon(sh, [{ pts: Array.from({ length: 41 }, (_, i) => new Vector3(X0 + (i / 40) * SPAN, 0.012, PATH_Z)), phase: 0, speed: SPEED }], 0.3);
  group.add(path);
  const dotGeo = keep(new CylinderGeometry(0.1, 0.1, 0.03, 24));
  const dots = XS.map((x) => { const m = new Mesh(dotGeo, mat.glowLime); m.position.set(x, 0.015, PATH_Z); group.add(m); return m; });

  const TOPS = [1.26, 1.86, 1.84, 2.2];
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
      for (const x of [-W / 2 - 0.15, W / 2 + 0.15]) for (const z of [-D / 2, D / 2]) for (const y of [-T, narrow ? 2.9 : 3.7]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, yaw0));
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
    a.arm.rotation.x = shake; b.arm.rotation.x = shake;
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
    for (const k of owned) k.dispose();
    floor.geometry.dispose(); (floor.material as Material).dispose();
    glow.geometry.dispose(); glow.material.dispose();
    path.geometry.dispose(); path.material.dispose();
    light.dispose(); mat.dispose();
  };
};
