import { BoxGeometry, Group, Mesh, PerspectiveCamera, Scene, Vector3, type BufferGeometry, type Material, type ShaderMaterial } from "three";
import { mountLive, type LiveSize } from "@/three/live";
import { art, beam, ease, engrave, frameCamera, nap, outline, pointer, shadow, shared, tags } from "@/three/kit";

/**
 * «Запуск за четыре шага» как сборка обменника: четыре модуля встают друг на друга по одному.
 * Договор — основание со ступенями, сервер — этаж со стойками, настройка — этаж с окном выдачи
 * и табло курсов, открытие — крыша с лаймовой вывеской и маяком. Собранное здание раз в несколько
 * секунд «проходит» светом снизу вверх, чтобы порядок шагов читался и после сборки.
 */
const W = 3.4, D = 2.4, FLOOR = 0.95, BASE = 0.3, ROOF = 0.16;

/** фасад основания: подпись и печать под договором */
const baseArt = () => art(1024, 80, (c, w, h) => {
  c.lineWidth = 4; c.globalAlpha = 0.5; c.strokeRect(8, 8, w - 16, h - 16);
  c.globalAlpha = 0.9; c.lineWidth = 5;
  c.beginPath(); c.moveTo(380, 50);
  for (let i = 0; i < 9; i++) c.quadraticCurveTo(395 + i * 22, i % 2 ? 62 : 22, 410 + i * 22, 46);
  c.stroke();
  c.beginPath(); c.arc(660, 40, 24, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(648, 40); c.lineTo(657, 49); c.lineTo(674, 30); c.stroke();
});

/** фасад серверного этажа: три стойки с рядами блоков и огоньками */
const serverArt = () => art(1024, 286, (c, w, h) => {
  c.lineWidth = 4; c.globalAlpha = 0.5; c.strokeRect(10, 10, w - 20, h - 20);
  for (let r = 0; r < 3; r++) {
    const x = 70 + r * 310;
    c.globalAlpha = 0.9; c.lineWidth = 5; c.beginPath(); c.roundRect(x, 34, 264, h - 68, 10); c.stroke();
    for (let u = 0; u < 5; u++) {
      const y = 52 + u * 38;
      c.globalAlpha = 0.75; c.lineWidth = 3; c.strokeRect(x + 16, y, 232, 26);
      c.globalAlpha = 1;
      for (let d = 0; d < 2; d++) { c.beginPath(); c.arc(x + 34 + d * 20, y + 13, 5, 0, Math.PI * 2); if ((u + d + r) % 3) c.fill(); else c.stroke(); }
      c.globalAlpha = 0.55;
      for (let v = 0; v < 9; v++) { c.beginPath(); c.moveTo(x + 110 + v * 14, y + 7); c.lineTo(x + 110 + v * 14, y + 19); c.stroke(); }
    }
  }
});

/** фасад этажа настройки: дверь, окно выдачи, табло курсов */
const deskArt = () => art(1024, 286, (c, w, h) => {
  c.lineWidth = 4; c.globalAlpha = 0.5; c.strokeRect(10, 10, w - 20, h - 20);
  c.globalAlpha = 0.9; c.lineWidth = 5;
  c.beginPath(); c.roundRect(64, 60, 150, h - 70, [12, 12, 0, 0]); c.stroke();
  c.beginPath(); c.arc(186, 170, 6, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.roundRect(270, 60, 400, 150, 14); c.stroke();
  c.beginPath(); c.moveTo(250, 226); c.lineTo(690, 226); c.stroke();
  c.globalAlpha = 0.6; c.lineWidth = 3;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(300 + i * 120, 76); c.lineTo(300 + i * 120, 196); c.stroke(); }
  c.globalAlpha = 0.9; c.lineWidth = 5;
  c.beginPath(); c.roundRect(726, 50, 240, 190, 12); c.stroke();
  for (let i = 0; i < 4; i++) {
    const y = 82 + i * 42;
    c.beginPath(); c.arc(756, y, 10, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(780, y); c.lineTo(850, y); c.stroke();
    c.fillRect(880, y - 8, 60, 16);
  }
});

/** вывеска: две встречные стрелки обмена */
const signArt = () => art(512, 140, (c, w, h) => {
  c.lineWidth = 12;
  for (const [y, dir] of [[48, 1], [92, -1]]) {
    const x0 = dir > 0 ? 150 : 362, x1 = dir > 0 ? 362 : 150;
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    c.beginPath(); c.moveTo(x1 - dir * 30, y - 22); c.lineTo(x1, y); c.lineTo(x1 - dir * 30, y + 22); c.stroke();
  }
  c.lineWidth = 6; c.globalAlpha = 0.6; c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 18); c.stroke();
});

export type BuildOptions = { canvas: HTMLCanvasElement; labels: (HTMLElement | null)[] };

export const mountBuild = async ({ canvas, labels }: BuildOptions): Promise<() => void> => {
  const sh = shared(), scene = new Scene(), group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(26, 1.5, 0.1, 80);
  const kept: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => { kept.push(g); return g; };
  const edges: { line: ReturnType<typeof outline>; base: number; part: number }[] = [];
  const mats: ShaderMaterial[][] = [[], [], [], []];
  const parts = [0, 1, 2, 3].map(() => { const g = new Group(); group.add(g); return g; });
  const body = (part: number, o: Parameters<typeof engrave>[1]) => { const m = keep(engrave(sh, o)); mats[part].push(m); return m; };
  const add = (part: number, geo: BufferGeometry, mat: Material | Material[], edge = 0.6) => {
    const line = outline(geo, 0);
    edges.push({ line, base: edge, part });
    parts[part].add(new Mesh(keep(geo), mat), line);
  };
  const ground = shadow(sh, 8, 6, -0.02, 0.6);
  group.add(ground);

  // 0 — договор: основание и две ступени
  const y1 = BASE, y2 = y1 + FLOOR, y3 = y2 + FLOOR;
  const basePlain = body(0, { strata: 30, top: 14, ink: 0.7 });
  add(0, new BoxGeometry(W + 0.5, BASE, D + 0.5).translate(0, BASE / 2, 0), [basePlain, basePlain, basePlain, basePlain, body(0, { art: keep(baseArt()), rect: [-(W + 0.5) / 2, 0, W + 0.5, BASE], face: "front", strata: 30 }), basePlain], 0.7);
  add(0, new BoxGeometry(1.3, 0.2, 0.3).translate(-0.95, 0.1, (D + 0.5) / 2 + 0.15), basePlain, 0.6);
  add(0, new BoxGeometry(1.3, 0.1, 0.3).translate(-0.95, 0.05, (D + 0.5) / 2 + 0.45), basePlain, 0.6);
  await nap();
  // 1 — сервер, 2 — настройка: этажи с рисунком на фасаде
  for (const [part, y, draw] of [[1, y1, serverArt], [2, y2, deskArt]] as [number, number, () => ReturnType<typeof art>][]) {
    const plain = body(part, { strata: 26, top: 14, ink: 0.8 });
    const face = body(part, { art: keep(draw()), rect: [-W / 2, y, W, FLOOR], face: "front", strata: 26 });
    add(part, new BoxGeometry(W, FLOOR, D).translate(0, y + FLOOR / 2, 0), [plain, plain, plain, plain, face, plain], 0.75);
    await nap();
  }
  // 3 — открытие: лаймовая крыша с вывеской
  const roof = body(3, { kind: 1, strata: 40, top: 12, hatch: 0.5, ink: 1 });
  add(3, new BoxGeometry(W + 0.36, ROOF, D + 0.36).translate(0, y3 + ROOF / 2, 0), roof, 0.95);
  const SIGN = { w: 1.9, h: 0.52 };
  add(3, new BoxGeometry(SIGN.w, SIGN.h, 0.12).translate(0, y3 + ROOF + SIGN.h / 2, D / 2 - 0.1),
    body(3, { kind: 1, art: keep(signArt()), rect: [-SIGN.w / 2, y3 + ROOF, SIGN.w, SIGN.h], face: "front", strata: 40 }), 0.95);
  const light = beam(sh, new Vector3(0, y3 + ROOF, -0.2), 1.3, 1.4);
  light.renderOrder = 3;
  parts[3].add(light);

  // подписи у правого края каждого модуля
  const mids = [BASE / 2, y1 + FLOOR / 2, y2 + FLOOR / 2, y3 + ROOF + 0.2];
  const tag = tags(labels, mids.map((y, i) => new Vector3((i === 0 ? W + 0.5 : W) / 2 + 0.06, y, D / 2)));

  const ptr = pointer(canvas);
  const YAW = -0.6, EL = 0.34, axis = new Vector3(0, 1, 0), target = new Vector3(0.25, 1.25, 0).applyAxisAngle(axis, YAW);
  let fitted = 0, t0 = -1, yaw = 0, pitch = 0;
  const frame = (t: number, dt: number, size: LiveSize) => {
    const aspect = size.cssW / size.cssH;
    if (Math.abs(aspect - fitted) > 0.001) {
      fitted = aspect;
      const pts: Vector3[] = [];
      for (const x of [-(W + 0.5) / 2, (W + 0.5) / 2 + (size.cssW >= 640 ? 0.9 : 0)]) for (const z of [-(D + 0.5) / 2, (D + 0.5) / 2 + 0.6]) for (const y of [0, y3 + 1.3]) pts.push(new Vector3(x, y, z).applyAxisAngle(axis, YAW));
      frameCamera(camera, aspect, target, new Vector3(0, Math.sin(EL), Math.cos(EL)), pts, [0.98, 0.97, 0.97]);
    }
    if (t0 < 0) t0 = t;
    const age = t - t0;
    sh.uTime.value = age;
    sh.uShow.value = ease(age / 0.5);
    // модули опускаются на место по одному; после сборки свет раз в шесть секунд проходит снизу вверх
    const wave = age > 3.4 ? ((age - 3.4) % 6) / 0.55 : -9;
    parts.forEach((g, i) => {
      const k = ease((age - 0.25 - i * 0.62) / 0.75);
      g.visible = age > 0.25 + i * 0.62;
      g.position.y = (1 - k) * 2.2;
      const hot = Math.exp(-Math.pow(wave - i, 2) * 2.2) * 0.9 + (k > 0.6 && k < 1 ? 0.6 : 0);
      for (const m of mats[i]) { m.uniforms.uHot.value = hot; m.uniforms.uReveal.value = ease((age - 0.7 - i * 0.62) / 0.6); }
    });
    for (const e of edges) e.line.material.opacity = e.base * sh.uShow.value;
    light.material.uniforms.uGain.value = 1.4 * ease((age - 2.9) / 0.6);
    const k = 1 - Math.exp(-dt * 3);
    yaw += (Math.sin(age * 0.2) * 0.06 + ptr.p.nx * 0.12 - yaw) * k;
    pitch += (-ptr.p.ny * 0.04 - pitch) * k;
    group.rotation.set(pitch, YAW + yaw, 0);
    group.updateMatrixWorld();
    light.rotation.y = -(YAW + yaw);
    tag.place(group, camera, size, ease((age - 2.9) / 0.6));
  };

  const unmount = mountLive({ canvas, scene, camera, maxDpr: 1.5, frame, post: tag.write });
  return () => {
    unmount(); ptr.off();
    for (const k of kept) k.dispose();
    for (const e of edges) { e.line.geometry.dispose(); e.line.material.dispose(); }
    ground.geometry.dispose(); ground.material.dispose();
    light.geometry.dispose(); light.material.dispose();
  };
};
