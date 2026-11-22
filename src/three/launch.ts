import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, PerspectiveCamera, Scene, Shape, SphereGeometry, Vector3, type BufferGeometry, type Material, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, beam, ease, engrave, fonts, FONT, frameCamera, headAt, HEX, INK, nap, outline, pointer, ribbon, shadow, shared, tags } from "@/three/kit";
import { drawIcon, ICON } from "@/three/icons";

/**
 * «Запуск за четыре шага» — четыре остановки на одной площадке, слева направо:
 * договор (ASystem и клиент жмут руки на фоне подписанного листа), сервер (стойка), настройка
 * (пульт с ползунками) и открытие (здание обменника с колоннами и знаком биткоина на фронтоне).
 * Остановки поднимаются по очереди, дальше по кромке площадки ходит импульс и подсвечивает их.
 */
const W = 12.2, D = 3.3, T = 0.16, XS = [-4.6, -1.75, 1.15, 4.3], PATH_Z = 1.34, SPEED = 0.17;
/** остановки крупнее своих чертёжных размеров: на длинной площадке мелкие объекты теряются */
const SCALE = [1.3, 1.25, 1.3, 1.2];

/** лист договора: значок рукопожатия, строки, две подписи и печать */
const sheetArt = () => art(512, 640, (c, w, h) => {
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.55; c.lineWidth = 6;
  c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 22); c.stroke();
  c.globalAlpha = 1; c.strokeStyle = HEX.lime;
  drawIcon(c, ICON.handshake, 176, 44, 160, 2);
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.75; c.lineWidth = 9;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(70, 268 + i * 46); c.lineTo(i === 3 ? 300 : w - 70, 268 + i * 46); c.stroke(); }
  // подписи сторон и печать
  c.globalAlpha = 1; c.strokeStyle = HEX.amber; c.lineWidth = 8;
  for (const x of [70, 300]) {
    c.beginPath(); c.moveTo(x, 520);
    for (let i = 0; i < 4; i++) c.quadraticCurveTo(x + 18 + i * 34, i % 2 ? 556 : 480, x + 34 + i * 34, 518);
    c.stroke();
  }
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.5; c.lineWidth = 5;
  for (const x of [70, 300]) { c.beginPath(); c.moveTo(x, 566); c.lineTo(x + 142, 566); c.stroke(); }
});

/** фасад стойки: блоки с огоньками и решётками */
const rackArt = () => art(420, 700, (c, w, h) => {
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.5; c.lineWidth = 6;
  c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 16); c.stroke();
  for (let u = 0; u < 7; u++) {
    const y = 44 + u * 90;
    c.globalAlpha = 0.7; c.strokeStyle = HEX.ice; c.lineWidth = 5;
    c.beginPath(); c.roundRect(40, y, w - 80, 66, 10); c.stroke();
    c.globalAlpha = 1;
    for (let d = 0; d < 2; d++) { c.fillStyle = (u * 2 + d) % 5 === 3 ? HEX.amber : HEX.lime; c.beginPath(); c.arc(72 + d * 34, y + 33, 10, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = HEX.lime; c.globalAlpha = 0.6; c.lineWidth = 5;
    for (let v = 0; v < 8; v++) { c.beginPath(); c.moveTo(170 + v * 24, y + 18); c.lineTo(170 + v * 24, y + 48); c.stroke(); }
  }
});

/** экран пульта: ползунки, переключатели, образцы цвета бренда, пара валют */
const consoleArt = () => art(720, 460, (c, w, h) => {
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.55; c.lineWidth = 6;
  c.beginPath(); c.roundRect(12, 12, w - 24, h - 24, 20); c.stroke();
  c.globalAlpha = 1; c.strokeStyle = HEX.lime;
  drawIcon(c, ICON.sliders, 56, 70, 270, 1.9);
  // переключатели
  for (let i = 0; i < 3; i++) {
    const y = 96 + i * 78, on = i !== 1;
    c.strokeStyle = on ? HEX.amber : HEX.ice; c.fillStyle = on ? HEX.amber : HEX.ice; c.globalAlpha = on ? 1 : 0.55; c.lineWidth = 6;
    c.beginPath(); c.roundRect(410, y, 96, 46, 23); c.stroke();
    c.beginPath(); c.arc(on ? 483 : 433, y + 23, 13, 0, Math.PI * 2); c.fill();
    c.strokeStyle = HEX.ice; c.globalAlpha = 0.6; c.lineWidth = 8;
    c.beginPath(); c.moveTo(536, y + 23); c.lineTo(i === 2 ? 620 : 660, y + 23); c.stroke();
  }
  // цвета бренда и пара
  c.globalAlpha = 1;
  [HEX.lime, HEX.amber, HEX.ice].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.roundRect(410 + i * 62, 338, 46, 46, 10); c.fill(); });
  c.fillStyle = HEX.ice; c.font = FONT(30, 500); c.textBaseline = "middle"; c.fillText("KGS", 60, 392);
});

/** фасад здания: дверь и светящиеся окна */
const facadeArt = () => art(800, 420, (c, w, h) => {
  c.strokeStyle = HEX.ice; c.globalAlpha = 0.45; c.lineWidth = 5; c.strokeRect(10, 10, w - 20, h - 20);
  c.globalAlpha = 0.9; c.lineWidth = 7;
  c.beginPath(); c.roundRect(w / 2 - 78, 120, 156, h - 120, [26, 26, 0, 0]); c.stroke();
  c.beginPath(); c.moveTo(w / 2, 136); c.lineTo(w / 2, h); c.stroke();
  for (const x of [84, 246, w - 246 - 100, w - 84 - 100]) {
    c.globalAlpha = 0.85; c.fillStyle = HEX.amber; c.beginPath(); c.roundRect(x, 110, 100, 180, 12); c.fill();
    c.globalAlpha = 0.9; c.strokeStyle = "#0b0c0a"; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 50, 110); c.lineTo(x + 50, 290); c.moveTo(x, 200); c.lineTo(x + 100, 200); c.stroke();
    c.strokeStyle = HEX.ice;
  }
});

/** фронтон: знак биткоина в медальоне (на залитой грани рисунок тёмный) */
const pedimentArt = () => art(768, 224, (c, w) => {
  c.lineWidth = 9; c.beginPath(); c.arc(w / 2, 128, 76, 0, Math.PI * 2); c.stroke();
  drawIcon(c, ICON.bitcoin, w / 2 - 62, 66, 124, 2.5);
});

export type LaunchOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[] };

export const mountLaunch = async ({ canvas, labels }: LaunchOptions): Promise<() => void> => {
  await fonts();
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(24, 2.4, 0.1, 90);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  type Part = { g: Group; mats: ShaderMaterial[]; lines: { line: ReturnType<typeof outline>; base: number }[] };
  const st: Part[] = XS.map((x, i) => { const g = new Group(); g.position.x = x; g.scale.setScalar(SCALE[i]); group.add(g); return { g, mats: [], lines: [] }; });
  const floor: Part = { g: group, mats: [], lines: [] };
  const mat = (p: Part, o: Parameters<typeof engrave>[1]) => { const m = keep(engrave(sh, o)); p.mats.push(m); return m; };
  const add = (p: Part, geo: BufferGeometry, m: Material | Material[], edge = 0.6, color: string = HEX.lime, parent: Group = p.g) => {
    const line = outline(geo, 0, 30, color);
    p.lines.push({ line, base: edge });
    parent.add(new Mesh(keep(geo), m), line);
  };
  const ground = shadow(sh, W * 1.2, D * 2.1, -T - 0.2, 0.6);
  group.add(ground);

  // площадка и четыре постамента
  add(floor, new BoxGeometry(W, T, D).translate(0, -T / 2, 0), mat(floor, { strata: 26, top: 7, ink: 0.6 }), 0.6);
  const pad = mat(floor, { strata: 40, top: 7, ink: 1.25 });
  XS.forEach((x, i) => add(floor, new BoxGeometry(i === 3 ? 3.5 : 2.5, 0.05, 2.5).translate(x, 0.025, -0.2), pad, 0.7));
  await nap();

  // 1 — договор: две фигуры жмут руки, за ними лист
  const paper = mat(st[0], { strata: 30, ink: 0.5 });
  add(st[0], new BoxGeometry(1.06, 1.32, 0.05).translate(0, 0.78, -0.62),
    [paper, paper, paper, paper, mat(st[0], { face: "front", rgb: true, art: keep(sheetArt()), rect: [-0.53, 0.12, 1.06, 1.32], strata: 30, hatch: 0.12 }), paper], 0.75, HEX.ice);
  const hands = new Group();
  st[0].g.add(hands);
  for (const [side, tint, color] of [[-1, INK.lime, HEX.lime], [1, INK.ice, HEX.ice]] as const) {
    const body = mat(st[0], { kind: 1, fill: true, tint, strata: 34, top: 40, hatch: 0.35 });
    add(st[0], new CylinderGeometry(0.1, 0.21, 0.66, 22).translate(side * 0.44, 0.39, 0.3), body, 0.85, color);
    add(st[0], new SphereGeometry(0.16, 22, 14).translate(side * 0.44, 0.9, 0.3), body, 0.5, color);
    // рука к середине
    add(st[0], new BoxGeometry(0.4, 0.075, 0.075).translate(side * 0.2, 0.5, 0.3), body, 0.7, color, hands);
  }
  add(st[0], new BoxGeometry(0.16, 0.13, 0.13).translate(0, 0.5, 0.3), mat(st[0], { kind: 1, fill: true, tint: INK.amber, strata: 60 }), 0.9, HEX.amber, hands);
  await nap();

  // 2 — сервер: стойка и блок питания рядом
  const dark = (p: Part) => mat(p, { strata: 20, top: 22, ink: 0.75 });
  const rackSide = dark(st[1]);
  add(st[1], new BoxGeometry(1.0, 1.72, 0.9).translate(-0.15, 0.92, -0.2),
    [rackSide, rackSide, rackSide, rackSide, mat(st[1], { face: "front", rgb: true, art: keep(rackArt()), rect: [-0.65, 0.06, 1.0, 1.72], strata: 20, hatch: 0.1 }), rackSide], 0.8);
  add(st[1], new BoxGeometry(0.5, 0.56, 0.62).translate(0.72, 0.34, 0.08), rackSide, 0.6);
  add(st[1], new BoxGeometry(0.3, 0.05, 0.4).translate(0.72, 0.645, 0.08), mat(st[1], { kind: 1, tint: INK.amber, strata: 60, top: 40, hatch: 0.5 }), 0.8, HEX.amber);
  await nap();

  // 3 — настройка: пульт с экраном
  const desk = dark(st[2]);
  add(st[2], new BoxGeometry(1.1, 0.5, 0.7).translate(0, 0.31, -0.15), desk, 0.65);
  add(st[2], new BoxGeometry(0.12, 0.34, 0.1).translate(0, 0.72, -0.25), desk, 0.5);
  const screen = new Group();
  screen.position.set(0, 1.24, -0.2); screen.rotation.x = -0.16;
  st[2].g.add(screen);
  add(st[2], new BoxGeometry(1.5, 0.96, 0.07),
    [desk, desk, desk, desk, mat(st[2], { face: "front", rgb: true, art: keep(consoleArt()), rect: [-0.75, -0.48, 1.5, 0.96], strata: 30, hatch: 0.1 }), desk], 0.8, HEX.lime, screen);
  await nap();

  // 4 — открытие: здание с колоннами, на фронтоне знак биткоина
  const wall = dark(st[3]), BW = 2.1, BH = 1.08, Y0 = 0.26;
  add(st[3], new BoxGeometry(2.7, 0.1, 2.0).translate(0, 0.11, -0.05), wall, 0.55);
  add(st[3], new BoxGeometry(2.5, 0.1, 1.8).translate(0, 0.21, -0.1), wall, 0.55);
  add(st[3], new BoxGeometry(BW, BH, 1.25).translate(0, Y0 + BH / 2, -0.3),
    [wall, wall, wall, wall, mat(st[3], { face: "front", rgb: true, art: keep(facadeArt()), rect: [-BW / 2, Y0, BW, BH], strata: 20, hatch: 0.08 }), wall], 0.7);
  const column = mat(st[3], { kind: 1, fill: true, tint: INK.ice, strata: 46, hatch: 0.5 });
  for (const x of [-0.98, -0.36, 0.36, 0.98]) add(st[3], new CylinderGeometry(0.075, 0.09, BH, 14).translate(x, Y0 + BH / 2, 0.55), column, 0.5, HEX.ice);
  add(st[3], new BoxGeometry(2.42, 0.13, 1.72).translate(0, Y0 + BH + 0.065, -0.14), wall, 0.75);
  const gable = new Shape();
  gable.moveTo(-1.27, 0); gable.lineTo(1.27, 0); gable.lineTo(0, 0.66); gable.closePath();
  const GY = Y0 + BH + 0.13;
  add(st[3], new ExtrudeGeometry(gable, { depth: 1.72, bevelEnabled: false }).translate(0, GY, -1.0),
    mat(st[3], { kind: 1, face: "front", art: keep(pedimentArt()), rect: [-1.27, GY, 2.54, 0.74], strata: 30, top: 30, hatch: 0.4 }), 0.95);
  const light = beam(sh, new Vector3(0, GY + 0.66, -0.14), 1.25, 1.3);
  light.renderOrder = 3;
  st[3].g.add(light);
  await nap();

  // импульс по кромке площадки и отметки остановок на ней
  const X0 = -W / 2 + 0.35, SPAN = W - 0.7;
  const path = ribbon(sh, [{ pts: Array.from({ length: 41 }, (_, i) => new Vector3(X0 + (i / 40) * SPAN, 0.02, PATH_Z)), phase: 0, speed: SPEED }], 0.22);
  group.add(path);
  const dot = keep(new CylinderGeometry(0.11, 0.11, 0.04, 20));
  const dots = XS.map((x) => { const m = keep(engrave(sh, { kind: 1, strata: 80, top: 60 })); const d = new Mesh(dot, m); d.position.set(x, 0.02, PATH_Z); group.add(d); return m; });

  const TOPS = [1.5, 1.86, 1.78, 2.14];
  const tag = tags(labels, XS.map((x, i) => new Vector3(x, TOPS[i] * SCALE[i] + 0.12, -0.2)));

  const ptr = pointer(canvas);
  const target = new Vector3(0, 1.2, 0), axis = new Vector3(0, 1, 0);
  let fitted = 0, yaw0 = 0, t0 = -1, yaw = 0, pitch = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const narrow = aspect < 1.5, el = narrow ? 0.5 : 0.36;
      yaw0 = narrow ? -0.95 : -0.1;
      const pts: Vector3[] = [];
      for (const x of [-W / 2 - 0.15, W / 2 + 0.15]) for (const z of [-D / 2, D / 2]) for (const y of [-T, narrow ? 2.7 : 3.5]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, yaw0));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(el), Math.cos(el)), pts, [0.97, 0.96, 0.95]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.6);
    path.material.uniforms.uRes.value.set(size.w, size.h);
    for (const l of floor.lines) l.line.material.opacity = l.base * sh.uShow.value;
    // остановки поднимаются по одной; проходящий импульс подсвечивает ту, мимо которой идёт
    const head = headAt(age, 0, SPEED);
    st.forEach((p, i) => {
      const k = ease((age - 0.4 - i * 0.5) / 0.8), at = (XS[i] - X0) / SPAN, d = head - at;
      const hot = (d > 0 ? Math.exp(-d * 9) : 0) * ease((age - 2.8) / 0.5);
      p.g.visible = age > 0.4 + i * 0.5;
      p.g.position.y = (1 - k) * -0.5;
      for (const m of p.mats) { m.uniforms.uAlpha.value = k; m.uniforms.uHot.value = hot * 0.55; m.uniforms.uReveal.value = ease((age - 0.8 - i * 0.5) / 0.7); }
      for (const l of p.lines) l.line.material.opacity = l.base * k * sh.uShow.value;
      dots[i].uniforms.uHot.value = hot * 2.2;
    });
    // рукопожатие: руки ходят вверх-вниз короткими сериями
    hands.position.y = Math.sin(age * 9) * 0.035 * Math.max(0, Math.sin(age * 0.9));
    light.material.uniforms.uGain.value = 1.3 * ease((age - 2.6) / 0.6);
    const kk = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.035 + ptr.p.nx * 0.07 - yaw) * kk;
    pitch += (-ptr.p.ny * 0.03 - pitch) * kk;
    group.rotation.set(pitch, yaw0 + yaw, 0);
    group.updateMatrixWorld();
    light.rotation.y = -(yaw0 + yaw);
    tag.place(group, camera, size, ease((age - 2.4) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    for (const k of kept) k.dispose();
    for (const p of [floor, ...st]) for (const l of p.lines) { l.line.geometry.dispose(); l.line.material.dispose(); }
    ground.geometry.dispose(); ground.material.dispose();
    light.geometry.dispose(); light.material.dispose();
    path.geometry.dispose(); path.material.dispose();
  };
};
